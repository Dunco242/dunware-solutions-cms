import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

interface DealAnalyticsProps {
  data: {
    pipeline: {
      stage: string;
      count: number;
      value: number;
      weightedValue: number;
    }[];
    performance: {
      period: string;
      won: number;
      lost: number;
      total: number;
    }[];
    conversion: {
      stage: string;
      rate: number;
    }[];
    sources: {
      name: string;
      value: number;
    }[];
  };
  timeframe: 'week' | 'month' | 'quarter' | 'year';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const DealAnalytics: React.FC<DealAnalyticsProps> = ({ data, timeframe }) => {
  const totalDeals = data.pipeline.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = data.pipeline.reduce((sum, stage) => sum + stage.value, 0);
  const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
  const weightedPipeline = data.pipeline.reduce((sum, stage) => sum + stage.weightedValue, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pipeline</p>
                <p className="text-2xl font-semibold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Weighted Pipeline</p>
                <p className="text-2xl font-semibold">${weightedPipeline.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-500">Total Deals</p>
                <p className="text-2xl font-semibold">{totalDeals}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Deal Size</p>
                <p className="text-2xl font-semibold">${avgDealSize.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pipeline Stage Distribution */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Pipeline Stage Distribution</h3>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.pipeline}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Number of Deals" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="value" name="Value ($)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win/Loss Analysis */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Win/Loss Analysis</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.performance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="won" name="Won" fill="#4CAF50" />
                  <Bar dataKey="lost" name="Lost" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Deal Sources */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Deal Sources</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.sources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Pipeline Conversion Rates</h3>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.conversion}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="rate" name="Conversion Rate" fill="#8884d8">
                  {data.conversion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DealAnalytics;