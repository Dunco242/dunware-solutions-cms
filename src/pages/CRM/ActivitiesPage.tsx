import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar } from 'lucide-react';
import { useCRM } from '../../contexts/CRMContext';
import { useCRMActions } from '../../hooks/useCRMActions';
import Button from '../../components/ui/Button';
import ActivityTimeline from '../../components/crm/ActivityTimeline';
import ActivityAnalytics from '../../components/crm/ActivityAnalytics';

const ActivitiesPage: React.FC = () => {
  const { state } = useCRM();
  const { createActivity } = useCRMActions();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  const analytics = {
    timeline: state.activities.map(activity => ({
      date: activity.dueDate,
      total: 1,
      completed: activity.status === 'completed' ? 1 : 0,
      overdue: new Date(activity.dueDate) < new Date() && activity.status !== 'completed' ? 1 : 0
    })),
    byType: Object.entries(
      state.activities.reduce((acc: any, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({ type, count })),
    byUser: Object.entries(
      state.activities.reduce((acc: any, activity) => {
        if (!acc[activity.assignedTo]) {
          acc[activity.assignedTo] = { completed: 0, pending: 0 };
        }
        if (activity.status === 'completed') {
          acc[activity.assignedTo].completed++;
        } else {
          acc[activity.assignedTo].pending++;
        }
        return acc;
      }, {})
    ).map(([user, stats]) => ({ user, ...stats })),
    completion: state.activities.map(activity => ({
      date: activity.dueDate,
      rate: activity.status === 'completed' ? 100 : 0
    }))
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Activities</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all activities
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          <Button variant="outline">
            <Filter size={20} className="mr-2" />
            Filter
          </Button>

          <Button>
            <Plus size={20} className="mr-2" />
            New Activity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityTimeline
            activities={state.activities}
            onAddActivity={() => {}}
            onViewActivity={() => {}}
          />
        </div>

        <div>
          <ActivityAnalytics
            data={analytics}
            timeframe={timeframe}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;