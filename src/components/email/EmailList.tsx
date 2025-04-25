import React from 'react';
import { Star, Paperclip } from 'lucide-react';
import { Email } from '../../types';
import { format } from 'date-fns';

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  currentFolder: string;
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, currentFolder }) => {
  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
            !email.read ? 'bg-blue-50' : ''
          }`}
          onClick={() => onSelectEmail(email)}
        >
          <div className="flex items-center mr-4">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className={`ml-2 text-gray-400 hover:text-yellow-400 ${
                email.starred ? 'text-yellow-400' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                // Toggle star
              }}
            >
              <Star size={18} />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${email.read ? 'text-gray-900' : 'text-gray-900'}`}>
                {email.from}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(email.timestamp), 'MMM d, h:mm a')}
              </p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className={`text-sm ${email.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                {email.subject}
              </p>
              <div className="flex items-center">
                {email.attachments?.length > 0 && (
                  <span className="mr-2">
                    <Paperclip size={16} className="text-gray-400" />
                  </span>
                )}
                {email.labels?.map(label => (
                  <span
                    key={label}
                    className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {email.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailList;