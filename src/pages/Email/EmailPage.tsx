import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Mail, Star, Inbox, Send, Archive, Trash, Plus, Search, Filter, Download, Tag } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Email } from '../../types';

const EmailPage: React.FC = () => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  
  // Mock data
  const emails: Email[] = [
    {
      id: '1',
      subject: 'Project Update - Q1 2025',
      from: 'sarah.miller@example.com',
      to: ['john.doe@company.com'],
      body: 'Here\'s the latest update on our Q1 progress...',
      attachments: [],
      timestamp: '2025-04-22T10:30:00Z',
      read: false,
      starred: true,
      labels: ['important', 'work'],
      thread: 'thread-1',
      importance: 'high',
      category: 'primary',
      securityStatus: {
        encrypted: true,
        signed: true,
        spamScore: 0
      }
    },
    {
      id: '2',
      subject: 'Client Meeting Notes',
      from: 'mike.wilson@example.com',
      to: ['john.doe@company.com'],
      body: 'Following up on our discussion...',
      attachments: [
        {
          id: '1',
          name: 'meeting-notes.pdf',
          size: 2500000,
          type: 'application/pdf',
          url: '#',
          scanStatus: 'clean'
        }
      ],
      timestamp: '2025-04-22T09:15:00Z',
      read: true,
      starred: false,
      labels: ['client'],
      thread: 'thread-2',
      importance: 'normal',
      category: 'primary',
      securityStatus: {
        encrypted: true,
        signed: true,
        spamScore: 0
      }
    }
  ];

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 12 },
    { id: 'starred', name: 'Starred', icon: Star, count: 3 },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'archive', name: 'Archive', icon: Archive, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash, count: 0 },
  ];

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Email</h1>
          <p className="mt-1 text-gray-600">Manage your email communications</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
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
              <Button variant="primary" fullWidth>
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

            <div className="divide-y divide-gray-200">
              {emails.map(email => (
                <div
                  key={email.id}
                  className={`
                    flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer
                    ${email.read ? 'bg-white' : 'bg-blue-50'}
                  `}
                >
                  <div className="flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.id)}
                      onChange={() => handleSelectEmail(email.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <button 
                      className={`ml-2 text-gray-400 hover:text-yellow-400 ${
                        email.starred ? 'text-yellow-400' : ''
                      }`}
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
                        {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm ${email.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                        {email.subject}
                      </p>
                      <div className="flex items-center">
                        {email.attachments.length > 0 && (
                          <span className="mr-2">
                            <Mail size={16} className="text-gray-400" />
                          </span>
                        )}
                        {email.labels.map(label => (
                          <span
                            key={label}
                            className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailPage;