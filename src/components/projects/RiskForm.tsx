import React, { useState } from 'react';
import { Risk } from '../../types';
import Button from '../ui/Button';
import { AlertTriangle, Calendar, User, Target } from 'lucide-react';

interface RiskFormProps {
  onSubmit: (data: Partial<Risk>) => Promise<void>;
  initialData?: Risk;
  isLoading?: boolean;
  onClose: () => void;
  projectId?: string;
}

const RiskForm: React.FC<RiskFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  onClose,
  projectId
}) => {
  const [formData, setFormData] = useState<Partial<Risk>>(initialData || {
    title: '',
    description: '',
    riskType: '',
    probability: 'medium',
    impact: 'medium',
    status: 'identified',
    mitigationStrategy: '',
    contingencyPlan: '',
    estimatedCost: 0
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
            {initialData ? 'Edit Risk' : 'Create New Risk'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Risk Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Type</label>
              <select
                value={formData.riskType || ''}
                onChange={(e) => setFormData({ ...formData, riskType: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                <option value="technical">Technical</option>
                <option value="schedule">Schedule</option>
                <option value="cost">Cost</option>
                <option value="resource">Resource</option>
                <option value="scope">Scope</option>
                <option value="quality">Quality</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status || 'identified'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="identified">Identified</option>
                <option value="analyzing">Analyzing</option>
                <option value="mitigating">Mitigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Probability</label>
              <select
                value={formData.probability || 'medium'}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Impact</label>
              <select
                value={formData.impact || 'medium'}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Mitigation Strategy</label>
              <textarea
                value={formData.mitigationStrategy || ''}
                onChange={(e) => setFormData({ ...formData, mitigationStrategy: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Contingency Plan</label>
              <textarea
                value={formData.contingencyPlan || ''}
                onChange={(e) => setFormData({ ...formData, contingencyPlan: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
              <input
                type="number"
                value={formData.estimatedCost || ''}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Target Resolution Date</label>
              <input
                type="date"
                value={formData.targetResolutionDate || ''}
                onChange={(e) => setFormData({ ...formData, targetResolutionDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {initialData ? 'Update Risk' : 'Create Risk'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskForm;