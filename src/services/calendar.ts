import { supabase } from '../config/database';
import { format } from 'date-fns';
import CryptoJS from 'crypto-js';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  status: 'scheduled' | 'cancelled' | 'completed';
  type: 'meeting' | 'task' | 'reminder' | 'out_of_office';
  createdBy: string;
}

interface ExternalCalendarConfig {
  provider: 'google' | 'outlook' | 'ical';
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  };
}

export const calendarService = {
  async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', format(start, 'yyyy-MM-dd'))
        .lte('end_time', format(end, 'yyyy-MM-dd'));

      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        allDay: event.all_day,
        location: event.location,
        attendees: event.attendees,
        status: event.status,
        type: event.event_type,
        createdBy: event.created_by
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: event.title,
          description: event.description,
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
          all_day: event.allDay,
          location: event.location,
          attendees: event.attendees,
          status: event.status,
          event_type: event.type,
          created_by: event.createdBy
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        allDay: data.all_day,
        location: data.location,
        attendees: data.attendees,
        status: data.status,
        type: data.event_type,
        createdBy: data.created_by
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: updates.title,
          description: updates.description,
          start_time: updates.start?.toISOString(),
          end_time: updates.end?.toISOString(),
          all_day: updates.allDay,
          location: updates.location,
          attendees: updates.attendees,
          status: updates.status,
          event_type: updates.type
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        allDay: data.all_day,
        location: data.location,
        attendees: data.attendees,
        status: data.status,
        type: data.event_type,
        createdBy: data.created_by
      };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },

  async getEventById(id: string): Promise<CalendarEvent> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        allDay: data.all_day,
        location: data.location,
        attendees: data.attendees,
        status: data.status,
        type: data.event_type,
        createdBy: data.created_by
      };
    } catch (error) {
      console.error('Error fetching calendar event:', error);
      throw error;
    }
  },

  async importFromICS(file: File): Promise<CalendarEvent[]> {
    try {
      const content = await file.text();
      const events: CalendarEvent[] = [];
      
      // Parse ICS content
      const lines = content.split('\n');
      let currentEvent: Partial<CalendarEvent> = {};
      let inEvent = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine === 'BEGIN:VEVENT') {
          inEvent = true;
          currentEvent = {};
          continue;
        }
        
        if (trimmedLine === 'END:VEVENT') {
          inEvent = false;
          if (currentEvent.title && currentEvent.start && currentEvent.end) {
            events.push(currentEvent as CalendarEvent);
          }
          continue;
        }
        
        if (inEvent) {
          const [key, ...valueParts] = trimmedLine.split(':');
          const value = valueParts.join(':');
          
          switch (key) {
            case 'SUMMARY':
              currentEvent.title = value;
              break;
            case 'DESCRIPTION':
              currentEvent.description = value;
              break;
            case 'DTSTART':
              currentEvent.start = new Date(value);
              break;
            case 'DTEND':
              currentEvent.end = new Date(value);
              break;
            case 'LOCATION':
              currentEvent.location = value;
              break;
          }
        }
      }

      // Import events to database
      const importPromises = events.map(event => this.createEvent(event));
      const importedEvents = await Promise.all(importPromises);

      return importedEvents;
    } catch (error) {
      console.error('Error importing ICS file:', error);
      throw error;
    }
  },

  async importFromProvider(config: ExternalCalendarConfig): Promise<CalendarEvent[]> {
    try {
      let events: CalendarEvent[] = [];

      switch (config.provider) {
        case 'google':
          events = await this.importFromGoogle(config.credentials);
          break;
        case 'outlook':
          events = await this.importFromOutlook(config.credentials);
          break;
        default:
          throw new Error('Unsupported calendar provider');
      }

      // Import events to database
      const importPromises = events.map(event => this.createEvent(event));
      const importedEvents = await Promise.all(importPromises);

      return importedEvents;
    } catch (error) {
      console.error('Error importing from provider:', error);
      throw error;
    }
  },

  async importFromGoogle(credentials?: { accessToken?: string }): Promise<CalendarEvent[]> {
    if (!credentials?.accessToken) {
      throw new Error('Google Calendar access token required');
    }

    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Google Calendar events');
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        title: item.summary,
        description: item.description,
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        location: item.location,
        attendees: item.attendees?.map((a: any) => a.email),
        status: 'scheduled',
        type: 'meeting',
        allDay: !item.start.dateTime,
      }));
    } catch (error) {
      console.error('Error importing from Google Calendar:', error);
      throw error;
    }
  },

  async importFromOutlook(credentials?: { accessToken?: string }): Promise<CalendarEvent[]> {
    if (!credentials?.accessToken) {
      throw new Error('Outlook Calendar access token required');
    }

    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/calendar/events',
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Outlook Calendar events');
      }

      const data = await response.json();
      
      return data.value.map((item: any) => ({
        title: item.subject,
        description: item.bodyPreview,
        start: new Date(item.start.dateTime + 'Z'),
        end: new Date(item.end.dateTime + 'Z'),
        location: item.location?.displayName,
        attendees: item.attendees?.map((a: any) => a.emailAddress.address),
        status: 'scheduled',
        type: 'meeting',
        allDay: item.isAllDay,
      }));
    } catch (error) {
      console.error('Error importing from Outlook Calendar:', error);
      throw error;
    }
  },

  async saveCalendarSettings(userId: string, provider: string, credentials: any) {
    try {
      // Encrypt sensitive credentials
      const encryptedCredentials = CryptoJS.AES.encrypt(
        JSON.stringify(credentials),
        import.meta.env.VITE_ENCRYPTION_KEY
      ).toString();

      const { data, error } = await supabase
        .from('calendar_settings')
        .upsert({
          user_id: userId,
          provider,
          encrypted_credentials: encryptedCredentials,
          sync_enabled: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      throw error;
    }
  },

  async getCalendarSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('calendar_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Decrypt credentials if they exist
      return data.map(setting => ({
        ...setting,
        credentials: setting.encrypted_credentials
          ? JSON.parse(
              CryptoJS.AES.decrypt(
                setting.encrypted_credentials,
                import.meta.env.VITE_ENCRYPTION_KEY
              ).toString(CryptoJS.enc.Utf8)
            )
          : null
      }));
    } catch (error) {
      console.error('Error getting calendar settings:', error);
      throw error;
    }
  }
};