import React, { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import { calendarService } from '../../services/calendar';

interface ImportCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const ImportCalendarModal: React.FC<ImportCalendarModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [importMethod, setImportMethod] = useState<'file' | 'google' | 'outlook'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      setIsLoading(true);
      setError('');
      const file = acceptedFiles[0];
      await calendarService.importFromICS(file);
      onImportComplete();
      onClose();
    } catch (err) {
      setError('Failed to import calendar file. Please try again.');
      console.error('Import error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onImportComplete, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/calendar': ['.ics'],
    },
    maxFiles: 1,
  });

  const handleGoogleImport = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Redirect to Google OAuth
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'https://www.googleapis.com/auth/calendar.readonly';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
      
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to connect to Google Calendar. Please try again.');
      console.error('Google import error:', err);
      setIsLoading(false);
    }
  };

  const handleOutlookImport = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Redirect to Microsoft OAuth
      const clientId = import.meta.env.VITE_OUTLOOK_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/outlook/callback`;
      const scope = 'Calendars.Read';
      
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
      
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to connect to Outlook Calendar. Please try again.');
      console.error('Outlook import error:', err);
      setIsLoading(false);
    }
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
              Import Calendar
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={importMethod === 'file' ? 'primary' : 'outline'}
                onClick={() => setImportMethod('file')}
                fullWidth
              >
                <Upload size={16} className="mr-2" />
                Upload ICS
              </Button>
              <Button
                variant={importMethod === 'google' ? 'primary' : 'outline'}
                onClick={() => setImportMethod('google')}
                fullWidth
              >
                <Calendar size={16} className="mr-2" />
                Google Calendar
              </Button>
              <Button
                variant={importMethod === 'outlook' ? 'primary' : 'outline'}
                onClick={() => setImportMethod('outlook')}
                fullWidth
              >
                <Calendar size={16} className="mr-2" />
                Outlook
              </Button>
            </div>

            {importMethod === 'file' && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input {...getInputProps()} />
                <Upload
                  size={24}
                  className={`mx-auto mb-2 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
                />
                {isDragActive ? (
                  <p className="text-blue-500">Drop the file here</p>
                ) : (
                  <>
                    <p className="text-gray-600">
                      Drag and drop your ICS file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Only .ics files are supported
                    </p>
                  </>
                )}
              </div>
            )}

            {importMethod === 'google' && (
              <div className="text-center p-6 space-y-4">
                <Calendar size={48} className="mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium">Connect Google Calendar</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Import your events from Google Calendar
                  </p>
                </div>
                <Button
                  onClick={handleGoogleImport}
                  isLoading={isLoading}
                  fullWidth
                >
                  Connect with Google
                </Button>
              </div>
            )}

            {importMethod === 'outlook' && (
              <div className="text-center p-6 space-y-4">
                <Calendar size={48} className="mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium">Connect Outlook Calendar</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Import your events from Outlook Calendar
                  </p>
                </div>
                <Button
                  onClick={handleOutlookImport}
                  isLoading={isLoading}
                  fullWidth
                >
                  Connect with Outlook
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ImportCalendarModal;