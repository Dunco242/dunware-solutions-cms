import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Users, DollarSign, Building, Phone, Mail, MapPin, Plus, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const CRMPage: React.FC = () => {
  // Mock data
  const customers = [
    {
      id: 1,
      name: 'Jane Cooper',
      company: 'Acme Inc',
      email: 'jane.cooper@example.com',
      phone: '(555) 123-4567',
      location: 'New York, NY',
      status: 'Active',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 2,
      name: 'Michael Foster',
      company: 'Globex Corp',
      email: 'michael.foster@example.com',
      phone: '(555) 234-5678',
      location: 'San Francisco, CA',
      status: 'Active',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 3,
      name: 'Emily Wilson',
      company: 'Tech Innovations',
      email: 'emily.wilson@example.com',
      phone: '(555) 345-6789',
      location: 'Austin, TX',
      status: 'Inactive',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 4,
      name: 'Robert Johnson',
      company: 'Johnson & Co',
      email: 'robert.johnson@example.com',
      phone: '(555) 456-7890',
      location: 'Chicago, IL',
      status: 'Active',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
  ];
  
  const deals = [
    { id: 1, name: 'Enterprise Plan Upgrade', value: '$25,000', stage: 'Negotiation', company: 'Acme Inc', probability: 70 },
    { id: 2, name: 'Software Integration', value: '$15,000', stage: 'Proposal', company: 'Globex Corp', probability: 50 },
    { id: 3, name: 'Annual Subscription', value: '$12,000', stage: 'Qualified', company: 'Tech Innovations', probability: 30 },
  ];
  
  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">CRM Module</h1>
          <p className="mt-1 text-gray-600">Manage your customers, deals, and sales activities</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-4">
          <Button>
            <Phone size={16} className="mr-2" />
            Log Call
          </Button>
          <Button variant="primary">
            <Plus size={16} className="mr-2" />
            Add Customer
          </Button>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <Users size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-100">Total Customers</p>
                <p className="text-2xl font-semibold">257</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-100">
              <span className="font-medium text-white">↑ 12%</span> from last month
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-teal-100">Total Pipeline</p>
                <p className="text-2xl font-semibold">$125,400</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-teal-100">
              <span className="font-medium text-white">↑ 5%</span> from last month
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg">
                <Building size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-100">Active Deals</p>
                <p className="text-2xl font-semibold">37</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-purple-100">
              <span className="font-medium text-white">↑ 3%</span> from last month
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Customers Table */}
      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">Recent Customers</h2>
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search customers..."
              />
            </div>
            <Button variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar src={customer.avatar} alt={customer.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail size={14} className="mr-1 text-gray-400" /> {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone size={14} className="mr-1 text-gray-400" /> {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={14} className="mr-1 text-gray-400" /> {customer.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Active Deals */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">Active Deals</h2>
          <Button variant="outline" size="sm">
            <Plus size={16} className="mr-2" />
            Add Deal
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{deal.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{deal.value}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          deal.probability >= 70 ? 'bg-green-600' :
                          deal.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${deal.probability}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{deal.probability}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CRMPage;