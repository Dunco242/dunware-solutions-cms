import React, { useState } from 'react';
import { DatabaseProvider } from '../../config/database';
import Button from './Button';
import { Upload } from 'lucide-react';

interface DatabaseSelectorProps {
  currentProvider: DatabaseProvider;
  onSelect: (provider: DatabaseProvider, config?: any) => void;
}

const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({ currentProvider, onSelect }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<any>({});

  const handleProviderChange = (provider: DatabaseProvider) => {
    setConfig({});
    setShowConfig(true);
    onSelect(provider);
  };

  const handleConfigSubmit = () => {
    onSelect(currentProvider, config);
    setShowConfig(false);
  };

  const renderProviderConfig = () => {
    switch (currentProvider) {
      case 'spreadsheet':
        return (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={config.type || 'google'}
                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="google">Google Sheets</option>
                <option value="excel">Excel File</option>
              </select>
            </div>

            {config.type === 'google' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={config.spreadsheetId || ''}
                    onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
                    placeholder="Enter Google Spreadsheet ID"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sheet Name
                  </label>
                  <input
                    type="text"
                    value={config.sheetName || ''}
                    onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                    placeholder="Enter sheet name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Excel File
                </label>
                <div className="mt-1 flex items-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Upload size={16} className="mr-2" />
                      Choose file
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setConfig({ ...config, file });
                        }
                      }}
                    />
                  </label>
                  {config.file && (
                    <span className="ml-3 text-sm text-gray-500">
                      {config.file.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="pt-5">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfig(false)}
                  className="mr-3"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfigSubmit}
                  disabled={
                    config.type === 'google'
                      ? !config.spreadsheetId || !config.sheetName
                      : !config.file
                  }
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        );

      case 'local':
        return (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Storage Key Prefix
              </label>
              <input
                type="text"
                value={config.keyPrefix || ''}
                onChange={(e) => setConfig({ ...config, keyPrefix: e.target.value })}
                placeholder="Enter storage key prefix"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Storage Type
              </label>
              <select
                value={config.storageType || 'localStorage'}
                onChange={(e) => setConfig({ ...config, storageType: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="localStorage">Local Storage</option>
                <option value="indexedDB">IndexedDB</option>
              </select>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfig(false)}
                  className="mr-3"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfigSubmit}
                  disabled={!config.keyPrefix}
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Database Provider:</label>
        <select
          value={currentProvider}
          onChange={(e) => handleProviderChange(e.target.value as DatabaseProvider)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="supabase">Supabase (PostgreSQL)</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="local">Local Storage</option>
        </select>
      </div>

      {showConfig && renderProviderConfig()}

      {currentProvider === 'supabase' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Supabase configuration is managed through environment variables. Please ensure your .env file contains the necessary Supabase credentials.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseSelector;