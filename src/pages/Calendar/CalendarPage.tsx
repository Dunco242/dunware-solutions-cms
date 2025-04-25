import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { enUS } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Upload } from 'lucide-react';
import { calendarService, CalendarEvent } from '../../services/calendar';
import { useAuthContext } from '../../components/auth/AuthProvider';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventModal from '../../EventModal';
import EventDetailsModal from '../../EventDetailsModal';
import ImportCalendarModal from '../../components/calendar/ImportCalendarModal';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarPageProps {}

const CalendarPage: React.FC<CalendarPageProps> = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEventData, setEditEventData] = useState<CalendarEvent | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    loadEvents();
  }, [date, view]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const fetchedEvents = await calendarService.getEvents(start, end);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setShowEventModal(true);
    setIsEditMode(false);
    setEditEventData(null);
  };

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!user) return;

    try {
      const newEvent = await calendarService.createEvent({
        ...eventData,
        createdBy: user.id
      } as CalendarEvent);

      setEvents(prev => [...prev, newEvent]);
      setShowEventModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleSelectEvent = async (event: CalendarEvent) => {
    try {
      const eventDetails = await calendarService.getEventById(event.id);
      setSelectedEvent(eventDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEvent(null);
    setIsEditMode(false);
    setEditEventData(null);
  };

  const handleEditEvent = (eventToEdit: CalendarEvent) => {
    setEditEventData(eventToEdit);
    setSelectedSlot({ start: eventToEdit.start, end: eventToEdit.end });
    setShowEventModal(true);
    setShowDetailsModal(false);
    setIsEditMode(true);
  };

  const handleUpdateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!editEventData?.id || !user) return;
    try {
      const updatedEvent = await calendarService.updateEvent(editEventData.id, eventData);
      setEvents(prevEvents =>
        prevEvents.map(ev => (ev.id === updatedEvent.id ? updatedEvent : ev))
      );
      setShowEventModal(false);
      setSelectedEvent(null);
      setIsEditMode(false);
      setEditEventData(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await calendarService.deleteEvent(eventId);
      setEvents(prevEvents => prevEvents.filter(ev => ev.id !== eventId));
      setShowDetailsModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleImportComplete = () => {
    loadEvents();
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
          <p className="mt-1 text-gray-600">Manage your schedule and meetings</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload size={16} className="mr-2" />
            Import Calendar
          </Button>
          <Button onClick={() => setShowEventModal(true)}>
            <Plus size={16} className="mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <h2 className="text-lg font-medium">
                {format(date, 'MMMM')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={view === Views.MONTH ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleViewChange(Views.MONTH)}
              >
                <CalendarIcon size={16} className="mr-2" />
                Month
              </Button>
              <Button
                variant={view === Views.WEEK ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleViewChange(Views.WEEK)}
              >
                <CalendarIcon size={16} className="mr-2" />
                Week
              </Button>
              <Button
                variant={view === Views.DAY ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleViewChange(Views.DAY)}
              >
                <CalendarIcon size={16} className="mr-2" />
                Day
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4" style={{ height: 'calc(100vh - 300px)' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              className: `bg-blue-600 text-white rounded-lg border-none
                ${event.status === 'cancelled' ? 'opacity-50' : ''}
                ${event.type === 'out_of_office' ? 'bg-red-600' : ''}
                ${event.type === 'reminder' ? 'bg-yellow-600' : ''}
              `
            })}
            dayPropGetter={(date) => ({
              className: 'font-medium'
            })}
          />
        </div>
      </Card>

      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedSlot(null);
            setIsEditMode(false);
            setEditEventData(null);
          }}
          onSubmit={isEditMode ? handleUpdateEvent : handleCreateEvent}
          initialData={editEventData}
          selectedSlot={selectedSlot}
          isEditMode={isEditMode}
        />
      )}

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          isOpen={showDetailsModal}
          onClose={handleCloseDetailsModal}
          event={selectedEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {showImportModal && (
        <ImportCalendarModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default CalendarPage;