import React, { useState } from 'react';
import { Plus, Search, Filter, Mail, Phone, Building } from 'lucide-react';
import { useCRM } from '../../contexts/CRMContext';
import { useCRMActions } from '../../hooks/useCRMActions';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import ContactForm from '../../components/crm/ContactForm';

const ContactsPage: React.FC = () => {
  const { state } = useCRM();
  const { createContact } = useCRMActions();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = state.contacts.filter(contact => 
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContact = async (data: any) => {
    try {
      await createContact(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your contacts and relationships
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button variant="outline">
            <Filter size={20} className="mr-2" />
            Filter
          </Button>

          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} className="mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      src={contact.avatar}
                      alt={`${contact.firstName} ${contact.lastName}`}
                      size="md"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{contact.company?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{contact.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{contact.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    contact.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contact.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ContactForm
          onSubmit={handleCreateContact}
          onClose={() => setShowForm(false)}
          companies={state.companies}
        />
      )}
    </div>
  );
};

export default ContactsPage;