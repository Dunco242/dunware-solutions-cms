import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

interface EmailConfig {
  provider: string;
  email: string;
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    password?: string;
    server?: string;
    port?: number;
    secure?: boolean;
  };
}

interface EmailMessage {
  id?: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  html?: boolean;
  attachments?: File[];
  scheduledFor?: Date;
  threadId?: string;
  parentMessageId?: string;
  metadata?: Record<string, any>;
}

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  content: string;
  category?: string;
  isShared?: boolean;
}

class EmailService {
  private supabase;
  private emailConfigs: Map<string, EmailConfig> = new Map();

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  // Account Management
  async addEmailAccount(config: EmailConfig) {
    try {
      // Encrypt sensitive data
      const encryptedCredentials = CryptoJS.AES.encrypt(
        JSON.stringify(config.credentials),
        import.meta.env.VITE_ENCRYPTION_KEY
      ).toString();

      // Store in Supabase
      const { data, error } = await this.supabase
        .from('email_accounts')
        .insert({
          provider: config.provider,
          email_address: config.email,
          encrypted_credentials: encryptedCredentials,
        })
        .select()
        .single();

      if (error) throw error;

      this.emailConfigs.set(config.email, config);
      return data;
    } catch (error) {
      console.error('Error adding email account:', error);
      throw error;
    }
  }

  // Provider Connections
  async connectProvider(provider: string, email: string, authCode?: string) {
    try {
      let credentials;
      
      switch (provider.toLowerCase()) {
        case 'gmail':
          credentials = await this.connectGmail(email, authCode);
          break;
        case 'outlook':
          credentials = await this.connectOutlook(email, authCode);
          break;
        case 'yahoo':
          credentials = await this.connectYahoo(email, authCode);
          break;
        case 'imap':
          credentials = await this.connectImap(email);
          break;
        default:
          throw new Error('Unsupported email provider');
      }

      return this.addEmailAccount({
        provider,
        email,
        credentials
      });
    } catch (error) {
      console.error('Error connecting to provider:', error);
      throw error;
    }
  }

  private async connectGmail(email: string, authCode?: string) {
    if (!authCode) {
      throw new Error('Auth code required for Gmail');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: authCode,
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await response.json();

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      };
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      throw error;
    }
  }

  private async connectOutlook(email: string, authCode?: string) {
    if (!authCode) {
      throw new Error('Auth code required for Outlook');
    }

    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: authCode,
          client_id: import.meta.env.VITE_OUTLOOK_CLIENT_ID,
          client_secret: import.meta.env.VITE_OUTLOOK_CLIENT_SECRET,
          redirect_uri: import.meta.env.VITE_OUTLOOK_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await response.json();

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      };
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      throw error;
    }
  }

  private async connectYahoo(email: string, authCode?: string) {
    // Yahoo OAuth implementation
    throw new Error('Yahoo integration not implemented');
  }

  private async connectImap(email: string) {
    // IMAP connection implementation
    throw new Error('IMAP integration not implemented');
  }

  // Email Operations
  async sendEmail(message: EmailMessage) {
    const config = this.emailConfigs.get(message.from);
    if (!config) throw new Error('Email account not configured');

    try {
      // Encrypt content
      const encryptedContent = CryptoJS.AES.encrypt(
        message.body,
        import.meta.env.VITE_ENCRYPTION_KEY
      ).toString();

      // Store in Supabase
      const { data, error } = await this.supabase
        .from('email_messages')
        .insert({
          subject: message.subject,
          from_address: message.from,
          to_addresses: message.to,
          cc_addresses: message.cc,
          bcc_addresses: message.bcc,
          encrypted_content: encryptedContent,
          html_content: message.html,
          status: message.scheduledFor ? 'scheduled' : 'draft',
          scheduled_for: message.scheduledFor,
          thread_id: message.threadId,
          parent_message_id: message.parentMessageId,
          metadata: message.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      // Send via provider
      await this.sendViaProvider(config, message);

      // Update status to sent
      await this.supabase
        .from('email_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private async sendViaProvider(config: EmailConfig, message: EmailMessage) {
    switch (config.provider.toLowerCase()) {
      case 'gmail':
        return this.sendViaGmail(config, message);
      case 'outlook':
        return this.sendViaOutlook(config, message);
      case 'yahoo':
        return this.sendViaYahoo(config, message);
      case 'imap':
        return this.sendViaImap(config, message);
      default:
        throw new Error('Unsupported provider');
    }
  }

  private async sendViaGmail(config: EmailConfig, message: EmailMessage) {
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: this.createMimeMessage(message),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send via Gmail');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending via Gmail:', error);
      throw error;
    }
  }

  private async sendViaOutlook(config: EmailConfig, message: EmailMessage) {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: message.subject,
            body: {
              contentType: message.html ? 'HTML' : 'Text',
              content: message.body,
            },
            toRecipients: message.to.map(email => ({
              emailAddress: { address: email },
            })),
            ccRecipients: message.cc?.map(email => ({
              emailAddress: { address: email },
            })),
            bccRecipients: message.bcc?.map(email => ({
              emailAddress: { address: email },
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send via Outlook');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending via Outlook:', error);
      throw error;
    }
  }

  private async sendViaYahoo(config: EmailConfig, message: EmailMessage) {
    // Yahoo sending implementation
    throw new Error('Yahoo sending not implemented');
  }

  private async sendViaImap(config: EmailConfig, message: EmailMessage) {
    // IMAP sending implementation
    throw new Error('IMAP sending not implemented');
  }

  private createMimeMessage(message: EmailMessage): string {
    // Create MIME message implementation
    throw new Error('MIME message creation not implemented');
  }

  // Template Management
  async createTemplate(template: EmailTemplate) {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .insert({
          name: template.name,
          subject: template.subject,
          content: template.content,
          category: template.category,
          is_shared: template.isShared,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async getTemplates(category?: string) {
    try {
      let query = this.supabase
        .from('email_templates')
        .select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Email Management
  async getEmails(folder: string = 'inbox', options: any = {}) {
    try {
      let query = this.supabase
        .from('email_messages')
        .select('*');

      // Add filters based on folder and options
      if (folder === 'sent') {
        query = query.eq('status', 'sent');
      } else if (folder === 'drafts') {
        query = query.eq('status', 'draft');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Decrypt content
      return data.map(email => ({
        ...email,
        content: CryptoJS.AES.decrypt(
          email.encrypted_content,
          import.meta.env.VITE_ENCRYPTION_KEY
        ).toString(CryptoJS.enc.Utf8),
      }));
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async syncEmails(email: string) {
    const config = this.emailConfigs.get(email);
    if (!config) throw new Error('Email account not configured');

    try {
      // Fetch emails from provider
      const providerEmails = await this.fetchEmailsFromProvider(config);

      // Update local database
      await this.updateLocalEmails(email, providerEmails);

      return true;
    } catch (error) {
      console.error('Error syncing emails:', error);
      throw error;
    }
  }

  private async fetchEmailsFromProvider(config: EmailConfig) {
    switch (config.provider.toLowerCase()) {
      case 'gmail':
        return this.fetchGmailEmails(config);
      case 'outlook':
        return this.fetchOutlookEmails(config);
      default:
        throw new Error('Unsupported provider');
    }
  }

  private async fetchGmailEmails(config: EmailConfig) {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      {
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
        },
      }
    );
    return response.json();
  }

  private async fetchOutlookEmails(config: EmailConfig) {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/messages',
      {
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
        },
      }
    );
    return response.json();
  }

  private async updateLocalEmails(email: string, providerEmails: any[]) {
    // Implement local database update logic
    for (const email of providerEmails) {
      const encryptedContent = CryptoJS.AES.encrypt(
        email.body,
        import.meta.env.VITE_ENCRYPTION_KEY
      ).toString();

      await this.supabase
        .from('email_messages')
        .upsert({
          id: email.id,
          subject: email.subject,
          from_address: email.from,
          to_addresses: email.to,
          encrypted_content: encryptedContent,
          thread_id: email.threadId,
          status: 'sent',
          sent_at: email.sentAt,
        });
    }
  }
}

export const emailService = new EmailService();