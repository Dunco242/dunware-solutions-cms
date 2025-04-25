import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Mail, Star, Inbox, Send, Archive, Trash, Plus, Search, Filter, Download, Tag, Settings, Loader } from 'lucide-react';
import Button from '../../components/ui/Button';
import { emailService } from '../../services/email';
import { Email } from '../../types';
import EmailComposer from '../../components/email/EmailComposer';
import EmailList from '../../components/email/EmailList';
import EmailThread from '../../components/email/EmailThread';
import EmailAccountSetup from '../../components/email/EmailAccountSetup';

const EmailPage: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [hasEmailAccount, setHasEmailAccount] = useState(false);
  
  useEffect(() => {
    checkEmailAccount();
    if (hasEmailAccount) {
      loadEmails();
    }
  }, [currentFolder, hasEmailAccount]);

  const checkEmailAccount = async () => {
    try {
      const accounts = await emailService.getEmailAccounts();
      setHasEmailAccount(accounts.length > 0);
      setShowAccountSetup(accounts.length === 0);
    } catch (error) {
      console.error('Error checking email accounts:', error);
    }
  };

  const loadEmails = async () => {
    try {
      setIsLoading(true);
      const fetchedEmails = await emailService.getEmails(currentFolder);
      setEmails(fetchedEmails);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (emailData: Partial<Email>) => {
    try {
      await emailService.sendEmail(emailData);
      setShowComposer(false);
      loadEmails();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleAccountSetup = async (config: any) => {
    try {
      await emailService.addEmailAccount(config);
      setShowAccountSetup(false);
      setHasEmailAccount(true);
    } catch (error) {
      console.error('Error setting up email account:', error);
    }
  };

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 12 },
    { id: 'starred', name: 'Starred', icon: Star, count: 3 },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'archive', name: 'Archive', icon: Archive, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash, count: 0 },
  ];

  if (showAccountSetup) {
    return (
      <EmailAccountSetup
        onSetup={handleAccountSetup}
        onCancel={() => setShowAccountSetup(false)}
      />
    );
  }

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Email</h1>
          <p className="mt-1 text-gray-600">Manage your email communications</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setShowComposer(true)}>
            <Plus size={16} className="mr-2" />
            Compose
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <Card>
            <CardBody className="p-4">
              <Button variant="primary" fullWidth onClick={() => setShowComposer(true)}>
                <Plus size={16} className="mr-2" />
                Compose
              </Button>

              <nav className="mt-6 space-y-1">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setCurrentFolder(folder.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm rounded-md
                      ${currentFolder === folder.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <folder.icon size={18} className="mr-3" />
                    <span className="flex-1 text-left">{folder.name}</span>
                    {folder.count > 0 && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                        {folder.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Labels
                </h3>
                <div className="space-y-2">
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Tag size={16} className="mr-2" />
                    Important
                  </button>
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Tag size={16} className="mr-2" />
                    Work
                  </button>
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Tag size={16} className="mr-2" />
                    Personal
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowAccountSetup(true)}
                >
                  <Settings size={16} className="mr-2" />
                  Email Settings
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader className="border-b border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search emails..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : selectedEmail ? (
              <EmailThread
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
                onReply={handleSendEmail}
              />
            ) : (
              <EmailList
                emails={emails}
                onSelectEmail={setSelectedEmail}
                currentFolder={currentFolder}
              />
            )}
          </Card>
        </div>
      </div>

      {showComposer && (
        <EmailComposer
          onSend={handleSendEmail}
          onClose={() => setShowComposer(false)}
        />
      )}
    </div>
  );
};

export default EmailPage;