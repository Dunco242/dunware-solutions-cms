import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import Button from './components/ui/Button';
import { CalendarEvent } from './services/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<CalendarEvent>) => void;
  initialData?: CalendarEvent | null;
  selectedSlot?: { start: Date; end: Date } | null;
  isEditMode?: boolean;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  selectedSlot,
  isEditMode = false
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [eventType, setEventType] = useState(initialData?.type || 'meeting');
  const [startTime, setStartTime] = useState(
    selectedSlot?.start || initialData?.start || new Date()
  );
  const [endTime, setEndTime] = useState(
    selectedSlot?.end || initialData?.end || new Date()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type: eventType,
      start: startTime,
      end: endTime,
      ...(initialData && { id: initialData.id })
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="out_of_office">Out of Office</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime.toISOString().slice(0, 16)}
                  onChange={(e) => setStartTime(new Date(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime.toISOString().slice(0, 16)}
                  onChange={(e) => setEndTime(new Date(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default EventModal;