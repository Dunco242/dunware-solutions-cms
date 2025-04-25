import React, { useState } from 'react';
import { Deal, Company, Product } from '../../types';
import Button from '../ui/Button';
import { Building, DollarSign, Calendar, Tag, Percent } from 'lucide-react';

interface DealFormProps {
  onSubmit: (data: Partial<Deal>) => void;
  companies: Company[];
  products: Product[];
  initialData?: Deal;
  isLoading?: boolean;
}

const DealForm: React.FC<DealFormProps> = ({
  onSubmit,
  companies,
  products,
  initialData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<Deal>>(initialData || {});
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    id: string;
    quantity: number;
    price: number;
    discount: number;
  }>>(initialData?.products || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, products: selectedProducts });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (productId: string, field: string, value: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === productId);
      if (existing) {
        return prev.map(p => 
          p.id === productId ? { ...p, [field]: value } : p
        );
      }
      return [...prev, { id: productId, [field]: value, quantity: 1, price: 0, discount: 0 }];
    });
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const productDetails = products.find(p => p.id === product.id);
      if (!productDetails) return total;
      const subtotal = product.price * product.quantity;
      const discount = (subtotal * product.discount) / 100;
      return total + (subtotal - discount);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Deal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deal Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="companyId"
                value={formData.company?.id || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Value
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="value"
                value={formData.value || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency || 'USD'}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stage
            </label>
            <select
              name="stage"
              value={formData.stage || ''}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select Stage</option>
              <option value="prospecting">Prospecting</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Probability (%)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Percent className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="probability"
                min="0"
                max="100"
                value={formData.probability || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expected Close Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="expectedCloseDate"
                value={formData.expectedCloseDate || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Products</h3>
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={selectedProducts.find(p => p.id === product.id)?.quantity || 0}
                      onChange={(e) => handleProductChange(product.id, 'quantity', parseInt(e.target.value))}
                      className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={selectedProducts.find(p => p.id === product.id)?.price || product.price}
                      onChange={(e) => handleProductChange(product.id, 'price', parseFloat(e.target.value))}
                      className="mt-1 block w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedProducts.find(p => p.id === product.id)?.discount || 0}
                      onChange={(e) => handleProductChange(product.id, 'discount', parseFloat(e.target.value))}
                      className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500">Total:</span>
              <span className="ml-2 text-lg font-bold">{formData.currency} {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Source
            </label>
            <select
              name="source"
              value={formData.source || ''}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select Source</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="cold-call">Cold Call</option>
              <option value="trade-show">Trade Show</option>
              <option value="social-media">Social Media</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {initialData ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;