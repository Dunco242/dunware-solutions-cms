import React, { useState } from 'react';
import { Report } from '../../types';
import Button from '../ui/Button';
import { FileText, Calendar, Users } from 'lucide-react';

interface ReportFormProps {
  onSubmit: (data: Partial<Report>) => Promise<void>;
  initialData?: Report;
  isLoading?: boolean;
  onClose: () => void;
  projectId?: string;
}

const ReportForm: React.FC<ReportFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  onClose,
  projectId
}) => {
  const [formData, setFormData] = useState<Partial<Report>>(initialData || {
    title: '',
    reportType: '',
    content: {},
    metrics: {},
    periodStart: '',
    periodEnd: '',
    status: 'draft',
    distributionList: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, projectId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Report' : 'Create New Report'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Type</label>
              <select
                value={formData.reportType || ''}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                <option value="status">Status Report</option>
                <option value="progress">Progress Report</option>
                <option value="financial">Financial Report</option>
                <option value="risk">Risk Report</option>
                <option value="resource">Resource Report</option>
                <option value="quality">Quality Report</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status || 'draft'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Period Start</label>
              <input
                type="date"
                value={formData.periodStart || ''}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Period End</label>
              <input
                type="date"
                value={formData.periodEnd || ''}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Distribution List</label>
              <input
                type="text"
                placeholder="Email addresses (comma separated)"
                value={formData.distributionList?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  distributionList: e.target.value.split(',').map(email => email.trim())
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Report Content</label>
              <textarea
                value={formData.content ? JSON.stringify(formData.content, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const content = JSON.parse(e.target.value);
                    setFormData({ ...formData, content });
                  } catch (error) {
                    // Handle invalid JSON
                  }
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 font-mono"
                rows={6}
                placeholder="Enter report content in JSON format"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Metrics</label>
              <textarea
                value={formData.metrics ? JSON.stringify(formData.metrics, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const metrics = JSON.parse(e.target.value);
                    setFormData({ ...formData, metrics });
                  } catch (error) {
                    // Handle invalid JSON
                  }
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 font-mono"
                rows={4}
                placeholder="Enter metrics in JSON format"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {initialData ? 'Update Report' : 'Create Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;