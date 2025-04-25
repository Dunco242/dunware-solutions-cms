import React from 'react';
import { Activity } from '../../types';
import { Phone, Mail, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface ActivityTimelineProps {
  activities: Activity[];
  onAddActivity?: () => void;
  onViewActivity?: (activity: Activity) => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onAddActivity,
  onViewActivity
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="text-blue-500" />;
      case 'email':
        return <Mail className="text-purple-500" />;
      case 'meeting':
        return <Calendar className="text-green-500" />;
      case 'task':
        return <CheckCircle className="text-orange-500" />;
      case 'note':
        return <FileText className="text-gray-500" />;
      default:
        return <Clock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flow-root">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
        {onAddActivity && (
          <Button onClick={onAddActivity} size="sm">
            Add Activity
          </Button>
        )}
      </div>

      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`
                    h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                    ${activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}
                  `}>
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">
                        {activity.subject}
                      </span>
                      {activity.description && (
                        <span className="ml-2">{activity.description}</span>
                      )}
                    </p>

                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex items-center">
                        <Avatar
                          src={activity.assignedTo?.avatar}
                          alt={activity.assignedTo?.name}
                          size="sm"
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          {activity.assignedTo?.name}
                        </span>
                      </div>

                      <span className="text-gray-300">•</span>

                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${getStatusColor(activity.status)}
                      `}>
                        {activity.status}
                      </span>

                      {activity.relatedTo && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            Related to{' '}
                            <a
                              href="#"
                              className="font-medium text-gray-900 hover:text-gray-700"
                            >
                              {activity.relatedTo.type === 'contact' ? 'Contact' :
                               activity.relatedTo.type === 'company' ? 'Company' : 'Deal'}
                            </a>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={activity.dueDate}>
                      {new Date(activity.dueDate).toLocaleDateString()}
                    </time>
                    {activity.completedAt && (
                      <div className="text-xs text-gray-400">
                        Completed {new Date(activity.completedAt).toLocaleTimeString()}
                      </div>
                    )}
                    {onViewActivity && (
                      <button
                        onClick={() => onViewActivity(activity)}
                        className="mt-1 text-blue-600 hover:text-blue-800"
                      >
                        View details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTimeline;