// src/components/calendar/EventDetailsModal.tsx
import React from 'react';
import { CalendarEvent } from './services/calendar';
import Button from './components/ui/Button';import { X } from 'lucide-react';
import { format } from 'date-fns';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">{event.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <strong className="text-gray-700">Description:</strong>
            <p className="text-gray-600">{event.description || 'No description'}</p>
          </div>
          <div>
            <strong className="text-gray-700">Start Time:</strong>
            <p className="text-gray-600">{format(event.start, 'MMMM d, yyyy h:mm a')}</p>
          </div>
          <div>
            <strong className="text-gray-700">End Time:</strong>
            <p className="text-gray-600">{format(event.end, 'MMMM d, yyyy h:mm a')}</p>
          </div>
          <div>
            <strong className="text-gray-700">Type:</strong>
            <p className="text-gray-600">{event.type}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onEdit(event)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => onDelete(event.id)}>
            Delete
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
