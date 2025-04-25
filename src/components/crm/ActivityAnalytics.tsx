import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Activity, CheckCircle2, Clock, Users } from 'lucide-react';

interface ActivityAnalyticsProps {
  data: {
    timeline: {
      date: string;
      total: number;
      completed: number;
      overdue: number;
    }[];
    byType: {
      type: string;
      count: number;
    }[];
    byUser: {
      user: string;
      completed: number;
      pending: number;
    }[];
    completion: {
      date: string;
      rate: number;
    }[];
  };
  timeframe: 'week' | 'month' | 'quarter' | 'year';
}

const ActivityAnalytics: React.FC<ActivityAnalyticsProps> = ({ data, timeframe }) => {
  const totalActivities = data.timeline.reduce((sum, day) => sum + day.total, 0);
  const completedActivities = data.timeline.reduce((sum, day) => sum + day.completed, 0);
  const overdueActivities = data.timeline.reduce((sum, day) => sum + day.overdue, 0);
  const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Activities</p>
                <p className="text-2xl font-semibold">{totalActivities}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold">{completedActivities}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-semibold">{overdueActivities}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-semibold">{completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Activity Timeline</h3>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.timeline}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="completed" name="Completed" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.3} />
                <Area type="monotone" dataKey="overdue" name="Overdue" stackId="1" stroke="#f44336" fill="#f44336" fillOpacity={0.3} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities by Type */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Activities by Type</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.byType}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" name="Count" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Activities by User */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Activities by User</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.byUser}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="user" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#4CAF50" />
                  <Line type="monotone" dataKey="pending" name="Pending" stroke="#f44336" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Completion Rate Trend */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Completion Rate Trend</h3>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.completion}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="rate" name="Completion Rate" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ActivityAnalytics;