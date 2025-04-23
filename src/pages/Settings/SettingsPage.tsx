import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DatabaseSelector from '../../components/ui/DatabaseSelector';
import { DatabaseProvider, getDatabaseType, initializeDatabase } from '../../config/database';
import { Settings, Database, Shield, Bell } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<DatabaseProvider>('supabase');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('database');

  useEffect(() => {
    setCurrentProvider(getDatabaseType());
  }, []);

  const handleDatabaseChange = async (provider: DatabaseProvider, config?: any) => {
    try {
      setIsLoading(true);
      await initializeDatabase(provider, config);
      setCurrentProvider(provider);
    } catch (error) {
      console.error('Error changing database provider:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'database':
        return (
          <div className="space-y-6">
            <DatabaseSelector
              currentProvider={currentProvider}
              onSelect={handleDatabaseChange}
            />
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure security and privacy settings for your application.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable two-factor authentication
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Encrypt all stored data
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose how you want to receive notifications.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Email notifications
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Push notifications
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="mt-1 text-gray-600">Configure your application settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardBody>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('database')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'database'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Database size={16} className="mr-3" />
                  Database
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield size={16} className="mr-3" />
                  Security
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell size={16} className="mr-3" />
                  Notifications
                </button>
              </nav>
            </CardBody>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                {activeTab === 'database' && 'Database Configuration'}
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'notifications' && 'Notification Preferences'}
              </h2>
            </CardHeader>
            <CardBody>
              {renderTabContent()}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;