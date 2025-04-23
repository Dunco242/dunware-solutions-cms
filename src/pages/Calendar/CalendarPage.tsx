import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, Grid, List } from 'lucide-react';
import Button from '../../components/ui/Button';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { supabase } from '../../services/supabase';

interface EventType {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
  attendees: string[];
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [events, setEvents] = useState<EventType[]>([]);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (!error && data) {
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const handlePrevious = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
  };

  const getDateRange = () => {
    if (view === 'month') {
      const start = startOfMonth(currentDate);
      return `${format(start, 'MMMM yyyy')}`;
    }
    if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM d, yyyy');
  };

  const getDays = () => {
    if (view === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const monthStart = startOfWeek(start);
      const monthEnd = endOfWeek(end);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
    if (view === 'week') {
      return eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
      });
    }
    return [currentDate];
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => format(new Date(event.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  const getEventColor = (type: string) => {
    const map: Record<string, string> = {
      meeting: 'bg-blue-100 text-blue-700 border-blue-200',
      call: 'bg-green-100 text-green-700 border-green-200',
      deadline: 'bg-red-100 text-red-700 border-red-200',
    };
    return map[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleEventClick = (event: EventType) => {
    alert(`Event: ${event.title}\nAttendees: ${event.attendees.join(', ')}`);
  };

  const renderMonthView = () => {
    const days = getDays();
    const weeks: Date[][] = [];
    let week: Date[] = [];

    days.forEach((day, index) => {
      week.push(day);
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        weeks.push(week);
        week = [];
      }
    });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const dayEvents = getEventsForDay(day);

              return (
                <div key={dayIndex} className={`min-h-[120px] bg-white p-2 ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                  <div className={`flex justify-between items-center ${isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    <span className={isToday ? 'mx-auto' : ''}>{format(day, 'd')}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs rounded p-1 truncate border cursor-pointer ${getEventColor(event.type)}`}
                        onClick={() => handleEventClick(event)}
                      >
                        {format(new Date(event.start), 'h:mm a')} - {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getDays();

    return (
      <div className="flex">
        <div className="w-20 border-r border-gray-200">
          <div className="h-12"></div>
          {timeSlots.map(hour => (
            <div key={hour} className="h-12 border-b border-gray-100 text-xs text-gray-500 text-right pr-2">
              {format(new Date().setHours(hour), 'ha')}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex">
            {days.map(day => (
              <div key={day.toString()} className="flex-1 min-w-[120px] border-r border-gray-200 last:border-r-0">
                <div className="h-12 border-b border-gray-200 p-2 text-center">
                  <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                  <div className={`text-sm ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                {timeSlots.map(hour => (
                  <div key={hour} className="h-12 border-b border-gray-100 relative">
                    {getEventsForDay(day).map(event => {
                      const eventStart = new Date(event.start).getHours();
                      const eventEnd = new Date(event.end).getHours();
                      if (eventStart === hour) {
                        const duration = eventEnd - eventStart;
                        return (
                          <div
                            key={event.id}
                            className={`absolute left-1 right-1 rounded p-1 overflow-hidden border cursor-pointer ${getEventColor(event.type)}`}
                            style={{ top: '0', height: `${duration * 48}px` }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="text-xs font-medium truncate">{event.title}</div>
                            <div className="text-xs">{format(new Date(event.start), 'h:mm a')}</div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return renderWeekView(); // same as week, but with one column; reuse if needed
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
          <p className="mt-1 text-gray-600">Manage your schedule and meetings</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handlePrevious} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold">{getDateRange()}</h2>
              <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant={view === 'month' ? 'primary' : 'outline'} size="sm" onClick={() => setView('month')}>
                <Grid size={16} className="mr-2" /> Month
              </Button>
              <Button variant={view === 'week' ? 'primary' : 'outline'} size="sm" onClick={() => setView('week')}>
                <CalendarIcon size={16} className="mr-2" /> Week
              </Button>
              <Button variant={view === 'day' ? 'primary' : 'outline'} size="sm" onClick={() => setView('day')}>
                <List size={16} className="mr-2" /> Day
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>
      </Card>
    </div>
  );
};

export default CalendarPage;
