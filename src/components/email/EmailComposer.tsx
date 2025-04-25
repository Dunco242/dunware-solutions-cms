import React, { useState } from 'react';
import { X, Paperclip, Image } from 'lucide-react';
import Button from '../ui/Button';
import { Email } from '../../types';
import Editor from '../documents/Editor';

interface EmailComposerProps {
  onSend: (email: Partial<Email>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<Email>;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  onSend,
  onClose,
  initialData = {}
}) => {
  const [email, setEmail] = useState({
    to: initialData.to || [],
    cc: initialData.cc || [],
    bcc: initialData.bcc || [],
    subject: initialData.subject || '',
    body: initialData.body || '',
    attachments: initialData.attachments || [],
    html: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSend(email);
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Handle file attachments
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">New Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="sr-only">To</label>
              <input
                type="text"
                placeholder="To"
                value={email.to.join(', ')}
                onChange={(e) => setEmail({ ...email, to: e.target.value.split(',').map(s => s.trim()) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="sr-only">Cc</label>
              <input
                type="text"
                placeholder="Cc"
                value={email.cc.join(', ')}
                onChange={(e) => setEmail({ ...email, cc: e.target.value.split(',').map(s => s.trim()) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="sr-only">Subject</label>
              <input
                type="text"
                placeholder="Subject"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="min-h-[300px]">
              <Editor
                content={email.body}
                onChange={(content) => setEmail({ ...email, body: content })}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAttachFile}
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip size={16} className="mr-2" />
                  Attach
                </Button>
                <Button type="button" variant="outline">
                  <Image size={16} className="mr-2" />
                  Insert Image
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Discard
                </Button>
                <Button type="submit">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailComposer;