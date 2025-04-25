import { supabase } from '../config/database';
import CryptoJS from 'crypto-js';
import { Company, Contact, Deal, Activity, Note, Product } from '../types';

class CRMService {
  private encryptSensitiveData(data: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      import.meta.env.VITE_ENCRYPTION_KEY
    ).toString();
  }

  private decryptSensitiveData(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        import.meta.env.VITE_ENCRYPTION_KEY
      );
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  }

  // Companies
  async createCompany(company: Omit<Company, 'id'>): Promise<Company> {
    try {
      // Encrypt sensitive data
      const encryptedData = this.encryptSensitiveData({
        financials: company.revenue,
        internalNotes: company.internalNotes,
        customFields: company.customFields
      });

      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: company.name,
          industry: company.industry,
          size: company.size,
          website: company.website,
          encrypted_data: encryptedData,
          street: company.address?.street,
          city: company.address?.city,
          state: company.address?.state,
          postal_code: company.address?.postalCode,
          country: company.address?.country,
          coordinates: company.address?.coordinates,
          status: company.status,
          assigned_to: company.assignedTo,
          created_by: company.createdBy,
          data_processing_consent: company.dataProcessingConsent,
          consent_timestamp: company.consentTimestamp,
          security_level: company.securityLevel
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async getCompanies(filters?: {
    status?: string;
    industry?: string;
    assignedTo?: string;
    search?: string;
  }): Promise<Company[]> {
    try {
      let query = supabase
        .from('companies')
        .select(`
          *,
          contacts(*),
          deals(*)
        `);

      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.industry) {
          query = query.eq('industry', filters.industry);
        }
        if (filters.assignedTo) {
          query = query.eq('assigned_to', filters.assignedTo);
        }
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(company => ({
        ...company,
        encryptedData: company.encrypted_data ? 
          this.decryptSensitiveData(company.encrypted_data) : null
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  async getContacts(filters?: {
    status?: string;
    companyId?: string;
    assignedTo?: string;
    search?: string;
  }): Promise<Contact[]> {
    try {
      let query = supabase
        .from('contacts')
        .select(`
          *,
          company:companies(*)
        `);

      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.companyId) {
          query = query.eq('company_id', filters.companyId);
        }
        if (filters.assignedTo) {
          query = query.eq('assigned_to', filters.assignedTo);
        }
        if (filters.search) {
          query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(contact => ({
        ...contact,
        encryptedData: contact.encrypted_data ? 
          this.decryptSensitiveData(contact.encrypted_data) : null
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getDeals(filters?: {
    stage?: string;
    companyId?: string;
    assignedTo?: string;
    search?: string;
  }): Promise<Deal[]> {
    try {
      let query = supabase
        .from('deals')
        .select(`
          id,
          name,
          value,
          currency,
          stage,
          probability,
          expected_close_date,
          source,
          lost_reason,
          tags,
          created_at,
          updated_at,
          closed_at,
          company:companies(
            id,
            name,
            industry,
            size,
            website,
            status
          ),
          products:deal_products(
            id,
            quantity,
            price,
            discount,
            product:products(
              id,
              name,
              description,
              price,
              currency,
              category,
              status
            )
          )
        `);

      if (filters) {
        if (filters.stage) {
          query = query.eq('stage', filters.stage);
        }
        if (filters.companyId) {
          query = query.eq('company_id', filters.companyId);
        }
        if (filters.assignedTo) {
          query = query.eq('assigned_to', filters.assignedTo);
        }
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  async getActivities(filters?: {
    type?: string;
    status?: string;
    assignedTo?: string;
    relatedToType?: string;
    relatedToId?: string;
  }): Promise<Activity[]> {
    try {
      let query = supabase
        .from('activities')
        .select('*');

      if (filters) {
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.assignedTo) {
          query = query.eq('assigned_to', filters.assignedTo);
        }
        if (filters.relatedToType && filters.relatedToId) {
          query = query
            .eq('related_to_type', filters.relatedToType)
            .eq('related_to_id', filters.relatedToId);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(activity => ({
        ...activity,
        encryptedData: activity.encrypted_data ? 
          this.decryptSensitiveData(activity.encrypted_data) : null
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Contacts
  async createContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    try {
      const encryptedData = this.encryptSensitiveData({
        personalInfo: {
          dateOfBirth: contact.dateOfBirth,
          socialProfiles: contact.socialProfiles
        },
        customFields: contact.customFields
      });

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          first_name: contact.firstName,
          last_name: contact.lastName,
          company_id: contact.company?.id,
          title: contact.title,
          encrypted_data: encryptedData,
          status: contact.status,
          source: contact.source,
          assigned_to: contact.assignedTo,
          created_by: contact.createdBy,
          marketing_consent: contact.marketingConsent,
          consent_timestamp: contact.consentTimestamp,
          tags: contact.tags
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Deals
  async createDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          name: deal.name,
          company_id: deal.company?.id,
          value: deal.value,
          currency: deal.currency,
          stage: deal.stage,
          probability: deal.probability,
          expected_close_date: deal.expectedCloseDate,
          assigned_to: deal.assignedTo,
          created_by: deal.createdBy,
          source: deal.source,
          tags: deal.tags
        })
        .select()
        .single();

      if (error) throw error;

      // Create deal-product relationships
      if (deal.products?.length) {
        const dealProducts = deal.products.map(product => ({
          deal_id: data.id,
          product_id: product.id,
          quantity: product.quantity,
          price: product.price,
          discount: product.discount
        }));

        const { error: productsError } = await supabase
          .from('deal_products')
          .insert(dealProducts);

        if (productsError) throw productsError;
      }

      return data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  // Activities
  async createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    try {
      const encryptedData = activity.type === 'note' ? 
        this.encryptSensitiveData({ content: activity.description }) : null;

      const { data, error } = await supabase
        .from('activities')
        .insert({
          type: activity.type,
          subject: activity.subject,
          description: activity.description,
          status: activity.status,
          due_date: activity.dueDate,
          completed_at: activity.completedAt,
          related_to_type: activity.relatedTo.type,
          related_to_id: activity.relatedTo.id,
          assigned_to: activity.assignedTo,
          created_by: activity.createdBy,
          encrypted_data: encryptedData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Products
  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          category: product.category,
          status: product.status,
          created_by: product.createdBy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Notes
  async createNote(note: Omit<Note, 'id'>): Promise<Note> {
    try {
      const encryptedContent = this.encryptSensitiveData(note.content);

      const { data, error } = await supabase
        .from('notes')
        .insert({
          content: note.content,
          encrypted_content: encryptedContent,
          related_to_type: note.relatedTo.type,
          related_to_id: note.relatedTo.id,
          created_by: note.createdBy,
          security_level: note.securityLevel
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getDealsPipeline(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          stage,
          value,
          probability,
          currency,
          company:companies(name)
        `);

      if (error) throw error;

      // Group deals by stage and calculate metrics
      const pipeline = data.reduce((acc: any, deal) => {
        if (!acc[deal.stage]) {
          acc[deal.stage] = {
            count: 0,
            value: 0,
            weightedValue: 0,
            deals: []
          };
        }

        acc[deal.stage].count++;
        acc[deal.stage].value += deal.value;
        acc[deal.stage].weightedValue += (deal.value * deal.probability / 100);
        acc[deal.stage].deals.push(deal);

        return acc;
      }, {});

      return pipeline;
    } catch (error) {
      console.error('Error fetching deals pipeline:', error);
      throw error;
    }
  }

  async getActivityMetrics(timeframe: 'day' | 'week' | 'month'): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          type,
          status,
          created_at,
          completed_at,
          assigned_to
        `);

      if (error) throw error;

      // Calculate activity metrics
      const metrics = {
        totalActivities: data.length,
        completedActivities: data.filter(a => a.status === 'completed').length,
        byType: data.reduce((acc: any, activity) => {
          if (!acc[activity.type]) {
            acc[activity.type] = 0;
          }
          acc[activity.type]++;
          return acc;
        }, {}),
        completionRate: data.length ? 
          (data.filter(a => a.status === 'completed').length / data.length) * 100 : 0
      };

      return metrics;
    } catch (error) {
      console.error('Error fetching activity metrics:', error);
      throw error;
    }
  }

  // Custom Fields
  async createCustomField(field: {
    name: string;
    fieldType: string;
    entityType: string;
    options?: any;
    required?: boolean;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .insert({
          name: field.name,
          field_type: field.fieldType,
          entity_type: field.entityType,
          options: field.options,
          required: field.required
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating custom field:', error);
      throw error;
    }
  }

  // Data Import/Export
  async importData(type: 'companies' | 'contacts' | 'deals', data: any[]): Promise<void> {
    try {
      const { error } = await supabase
        .from(type)
        .insert(data);

      if (error) throw error;
    } catch (error) {
      console.error(`Error importing ${type}:`, error);
      throw error;
    }
  }

  async exportData(type: 'companies' | 'contacts' | 'deals'): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(type)
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      throw error;
    }
  }
}

export const crmService = new CRMService();