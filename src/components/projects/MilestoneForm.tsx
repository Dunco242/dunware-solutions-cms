import React, { useState } from 'react';
import { Milestone } from '../../types';
import Button from '../ui/Button';
import { Calendar, Target, Link as LinkIcon } from 'lucide-react';

interface MilestoneFormProps {
  onSubmit: (data: Partial<Milestone>) => Promise<void>;
  initialData?: Milestone;
  isLoading?: boolean;
  onClose: () => void;
  projectId?: string;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  onClose,
  projectId
}) => {
  const [formData, setFormData] = useState<Partial<Milestone>>(initialData || {
    title: '',
    description: '',
    dueDate: '',
    status: 'upcoming',
    tasks: []
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
            {initialData ? 'Edit Milestone' : 'Create New Milestone'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Milestone Title</label>
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
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status || 'upcoming'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Associated Tasks</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Task IDs (comma separated)"
                  value={formData.tasks?.map(t => t.id).join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    tasks: e.target.value.split(',').map(id => ({ id: id.trim() }))
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {initialData ? 'Update Milestone' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneForm;