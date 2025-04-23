import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

interface CalendarConfig {
  provider: string;
  email: string;
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    calendarId?: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  recurrence?: string;
  reminders?: number[];
}

class CalendarService {
  private supabase;
  private calendarConfigs: Map<string, CalendarConfig> = new Map();

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  // Add calendar account
  async addCalendarAccount(config: CalendarConfig) {
    try {
      // Encrypt sensitive data
      const encryptedCredentials = CryptoJS.AES.encrypt(
        JSON.stringify(config.credentials),
        import.meta.env.VITE_ENCRYPTION_KEY
      ).toString();

      // Store in Supabase
      const { data, error } = await this.supabase
        .from('calendar_settings')
        .insert({
          provider: config.provider,
          email: config.email,
          encrypted_credentials: encryptedCredentials,
        })
        .select()
        .single();

      if (error) throw error;

      this.calendarConfigs.set(config.email, config);
      return data;
    } catch (error) {
      console.error('Error adding calendar account:', error);
      throw error;
    }
  }

  // Connect to calendar provider
  async connectProvider(provider: string, email: string, authCode?: string) {
    try {
      let credentials;
      
      switch (provider.toLowerCase()) {
        case 'google':
          credentials = await this.connectGoogleCalendar(email, authCode);
          break;
        case 'outlook':
          credentials = await this.connectOutlookCalendar(email, authCode);
          break;
        case 'icloud':
          credentials = await this.connectIcloudCalendar(email, authCode);
          break;
        case 'caldav':
          credentials = await this.connectCalDAV(email);
          break;
        default:
          throw new Error('Unsupported calendar provider');
      }

      return this.addCalendarAccount({
        provider,
        email,
        credentials
      });
    } catch (error) {
      console.error('Error connecting to provider:', error);
      throw error;
    }
  }

  // Provider-specific connections
  private async connectGoogleCalendar(email: string, authCode?: string) {
    if (!authCode) {
      throw new Error('Auth code required for Google Calendar');
    }

    try {
      // Exchange auth code for tokens
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
      console.error('Error connecting to Google Calendar:', error);
      throw error;
    }
  }

  private async connectOutlookCalendar(email: string, authCode?: string) {
    if (!authCode) {
      throw new Error('Auth code required for Outlook Calendar');
    }

    try {
      // Exchange auth code for tokens
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
      console.error('Error connecting to Outlook Calendar:', error);
      throw error;
    }
  }

  private async connectIcloudCalendar(email: string, authCode?: string) {
    // iCloud calendar integration would go here
    throw new Error('iCloud Calendar integration not implemented');
  }

  private async connectCalDAV(email: string) {
    // CalDAV calendar integration would go here
    throw new Error('CalDAV integration not implemented');
  }

  // Calendar operations
  async getEvents(email: string, start: Date, end: Date) {
    const config = this.calendarConfigs.get(email);
    if (!config) throw new Error('Calendar account not configured');

    try {
      const { data, error } = await this.supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString());

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async createEvent(email: string, event: CalendarEvent) {
    const config = this.calendarConfigs.get(email);
    if (!config) throw new Error('Calendar account not configured');

    try {
      // Create event in Supabase
      const { data, error } = await this.supabase
        .from('calendar_events')
        .insert({
          title: event.title,
          description: event.description,
          start_time: event.startTime,
          end_time: event.endTime,
          location: event.location,
          attendees: event.attendees,
          recurrence_rule: event.recurrence,
        })
        .select()
        .single();

      if (error) throw error;

      // Sync with provider
      await this.syncEventWithProvider(config, data);

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  private async syncEventWithProvider(config: CalendarConfig, event: any) {
    switch (config.provider.toLowerCase()) {
      case 'google':
        await this.syncWithGoogle(config, event);
        break;
      case 'outlook':
        await this.syncWithOutlook(config, event);
        break;
      // Add other providers
    }
  }

  private async syncWithGoogle(config: CalendarConfig, event: any) {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start_time,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.end_time,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: event.location,
          attendees: event.attendees?.map((email: string) => ({ email })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Google Calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      throw error;
    }
  }

  private async syncWithOutlook(config: CalendarConfig, event: any) {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: event.title,
          body: {
            contentType: 'text',
            content: event.description,
          },
          start: {
            dateTime: event.start_time,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.end_time,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: {
            displayName: event.location,
          },
          attendees: event.attendees?.map((email: string) => ({
            emailAddress: { address: email },
            type: 'required',
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Outlook Calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing with Outlook Calendar:', error);
      throw error;
    }
  }

  async updateEvent(email: string, eventId: string, event: Partial<CalendarEvent>) {
    const config = this.calendarConfigs.get(email);
    if (!config) throw new Error('Calendar account not configured');

    try {
      const { data, error } = await this.supabase
        .from('calendar_events')
        .update(event)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // Sync with provider
      await this.syncEventWithProvider(config, data);

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(email: string, eventId: string) {
    const config = this.calendarConfigs.get(email);
    if (!config) throw new Error('Calendar account not configured');

    try {
      const { error } = await this.supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Delete from provider
      await this.deleteEventFromProvider(config, eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  private async deleteEventFromProvider(config: CalendarConfig, eventId: string) {
    switch (config.provider.toLowerCase()) {
      case 'google':
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${config.credentials.accessToken}`,
          },
        });
        break;
      case 'outlook':
        await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${config.credentials.accessToken}`,
          },
        });
        break;
      // Add other providers
    }
  }

  async importCalendar(email: string, file: File) {
    // Implement ICS file import
    throw new Error('Calendar import not implemented');
  }

  async exportCalendar(email: string, start: Date, end: Date) {
    // Implement calendar export to ICS
    throw new Error('Calendar export not implemented');
  }

  async syncCalendar(email: string) {
    const config = this.calendarConfigs.get(email);
    if (!config) throw new Error('Calendar account not configured');

    try {
      // Fetch events from provider
      const providerEvents = await this.fetchEventsFromProvider(config);

      // Update local database
      await this.updateLocalEvents(email, providerEvents);

      return true;
    } catch (error) {
      console.error('Error syncing calendar:', error);
      throw error;
    }
  }

  private async fetchEventsFromProvider(config: CalendarConfig) {
    switch (config.provider.toLowerCase()) {
      case 'google':
        return this.fetchGoogleEvents(config);
      case 'outlook':
        return this.fetchOutlookEvents(config);
      default:
        throw new Error('Unsupported provider');
    }
  }

  private async fetchGoogleEvents(config: CalendarConfig) {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
        },
      }
    );
    return response.json();
  }

  private async fetchOutlookEvents(config: CalendarConfig) {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/events',
      {
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
        },
      }
    );
    return response.json();
  }

  private async updateLocalEvents(email: string, providerEvents: any[]) {
    // Implement local database update logic
    for (const event of providerEvents) {
      await this.supabase
        .from('calendar_events')
        .upsert({
          id: event.id,
          title: event.summary || event.subject,
          description: event.description,
          start_time: event.start.dateTime,
          end_time: event.end.dateTime,
          location: event.location,
          attendees: event.attendees,
        });
    }
  }
}

export const calendarService = new CalendarService();