import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { Mail, Key, Server, Lock } from 'lucide-react';

interface EmailAccountSetupProps {
  onSetup: (config: any) => Promise<void>;
  onCancel: () => void;
}

const EmailAccountSetup: React.FC<EmailAccountSetupProps> = ({ onSetup, onCancel }) => {
  const [provider, setProvider] = useState('');
  const [config, setConfig] = useState({
    email: '',
    password: '',
    server: '',
    port: '',
    secure: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSetup({ provider, ...config });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Email Account Setup</h2>
          <p className="text-sm text-gray-500">Configure your email provider</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select Provider</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="yahoo">Yahoo</option>
                <option value="imap">Custom IMAP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {provider === 'imap' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IMAP Server
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Server className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={config.server}
                      onChange={(e) => setConfig({ ...config, server: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="imap.example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Port
                  </label>
                  <input
                    type="text"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="993"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.secure}
                    onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Use SSL/TLS
                  </label>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Connect Account
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default EmailAccountSetup;