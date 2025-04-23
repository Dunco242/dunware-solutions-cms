import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import localforage from 'localforage';
import Dexie from 'dexie';
import CryptoJS from 'crypto-js';

export type DatabaseProvider = 'supabase' | 'spreadsheet' | 'local';

interface DatabaseConfig {
  type: DatabaseProvider;
  config: any;
}

// Initialize database configurations
const dbConfig: DatabaseConfig = {
  type: 'supabase', // Default to Supabase
  config: {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    spreadsheet: {
      type: 'google', // or 'excel'
      encryptionKey: import.meta.env.VITE_SPREADSHEET_ENCRYPTION_KEY,
    },
    local: {
      storageKey: 'app_data',
      encryptionKey: import.meta.env.VITE_LOCAL_ENCRYPTION_KEY,
    },
  },
};

// Create and export the Supabase client instance
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Local database using Dexie
const db = new Dexie('AppDatabase');
db.version(1).stores({
  companies: '++id,name,industry',
  contacts: '++id,firstName,lastName,companyId',
  deals: '++id,name,companyId,value',
  activities: '++id,type,relatedToId,dueDate',
  products: '++id,name,price',
  notes: '++id,content,relatedToId',
  calendar_events: '++id,title,startTime,endTime',
  email_messages: '++id,subject,fromAddress,status',
  projects: '++id,name,status,progress',
  routes: '++id,name,date,status',
  documents: '++id,title,version,status',
});

// Initialize the database connection based on provider
export const initializeDatabase = async (provider: DatabaseProvider, config?: any) => {
  dbConfig.type = provider;
  if (config) {
    dbConfig.config[provider] = { ...dbConfig.config[provider], ...config };
  }

  switch (provider) {
    case 'supabase':
      return supabase;

    case 'spreadsheet':
      return initializeSpreadsheetDB();

    case 'local':
      return initializeLocalDB();

    default:
      throw new Error('Unsupported database provider');
  }
};

// Spreadsheet database implementation
const initializeSpreadsheetDB = async () => {
  const spreadsheetDB = {
    async read(sheetName: string) {
      const data = await localforage.getItem(`sheet_${sheetName}`);
      if (data) {
        const decrypted = CryptoJS.AES.decrypt(
          data as string,
          dbConfig.config.spreadsheet.encryptionKey
        );
        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      }
      return null;
    },

    async write(sheetName: string, data: any) {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        dbConfig.config.spreadsheet.encryptionKey
      ).toString();
      await localforage.setItem(`sheet_${sheetName}`, encrypted);
    },

    async import(file: File) {
      return new Promise((resolve, reject) => {
        if (file.type.includes('spreadsheet')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheets: Record<string, any[]> = {};
            
            workbook.SheetNames.forEach(sheetName => {
              sheets[sheetName] = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheetName]
              );
            });
            
            resolve(sheets);
          };
          reader.onerror = reject;
          reader.readAsBinaryString(file);
        } else if (file.type === 'text/csv') {
          Papa.parse(file, {
            complete: (results) => resolve({ data: results.data }),
            error: reject,
            header: true,
          });
        } else {
          reject(new Error('Unsupported file format'));
        }
      });
    },

    async export(data: any, format: 'xlsx' | 'csv' = 'xlsx') {
      if (format === 'xlsx') {
        const wb = XLSX.utils.book_new();
        Object.entries(data).forEach(([sheetName, sheetData]) => {
          const ws = XLSX.utils.json_to_sheet(sheetData as any[]);
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        XLSX.writeFile(wb, 'export.xlsx');
      } else {
        Object.entries(data).forEach(([name, sheetData]) => {
          const csv = Papa.unparse(sheetData as any[]);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${name}.csv`;
          link.click();
        });
      }
    },
  };

  return spreadsheetDB;
};

// Local database implementation
const initializeLocalDB = async () => {
  return {
    async get(table: string, id: string) {
      return db[table].get(id);
    },

    async getAll(table: string) {
      return db[table].toArray();
    },

    async add(table: string, data: any) {
      return db[table].add(data);
    },

    async update(table: string, id: string, data: any) {
      return db[table].update(id, data);
    },

    async delete(table: string, id: string) {
      return db[table].delete(id);
    },

    async query(table: string, query: any) {
      return db[table].where(query).toArray();
    },
  };
};

// Export the database interface
export const getDatabase = () => {
  switch (dbConfig.type) {
    case 'supabase':
      return supabase;
    case 'spreadsheet':
      return initializeSpreadsheetDB();
    case 'local':
      return initializeLocalDB();
    default:
      throw new Error('Database not initialized');
  }
};

// Export current database type
export const getDatabaseType = () => dbConfig.type;