import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import modules from '../../data/modules';
import { BarChart3, Users, MessageCircle, Briefcase as BriefcaseBusiness, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const getModuleIcon = (iconName: string) => {
    const icons = {
      'layout-dashboard': BarChart3,
      'users': Users,
      'message-square': MessageCircle,
      'briefcase': BriefcaseBusiness,
      'bar-chart': BarChart3,
    };
    
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent size={24} /> : null;
  };
  
  const stats = [
    { name: 'Total Customers', value: '2,543', change: '+12.5%', changeType: 'increase' },
    { name: 'Active Deals', value: '37', change: '+3.2%', changeType: 'increase' },
    { name: 'Unread Messages', value: '12', change: '-5%', changeType: 'decrease' },
    { name: 'Projects', value: '8', change: '+2', changeType: 'increase' },
  ];

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back! Here's an overview of your workspace.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
            Add New Module
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardBody>
              <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`ml-2 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      
      {/* Modules Grid */}
      <h2 className="text-lg font-medium text-gray-800 mb-4">Available Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} hoverable className={`transition-all duration-200 ${!module.enabled ? 'opacity-60' : ''}`}>
            <CardBody>
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  {getModuleIcon(module.icon)}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-800">{module.name}</h3>
                  {!module.enabled && (
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Not Enabled
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <div className="flex justify-end">
                {module.enabled ? (
                  <Link 
                    to={module.route}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Go to module <ArrowRight size={16} className="ml-1" />
                  </Link>
                ) : (
                  <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800">
                    Enable module <ArrowRight size={16} className="ml-1" />
                  </button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;