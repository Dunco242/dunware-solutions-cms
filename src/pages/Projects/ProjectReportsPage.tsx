import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Filter, Search, Download, FileText, CheckCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import { projectService } from '../../services/projects';
import { Report } from '../../types';

const ProjectReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [selectedProject]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const projectReports = await projectService.getProjectReports(selectedProject);
      setReports(projectReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-gray-600">Generate and view project reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {/* Project options will be populated here */}
          </select>
          <Button>
            <Plus size={20}className="mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Types */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Report Types</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <button className="w-full p-4 text-left border rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Status Report</h3>
                    <p className="text-sm text-gray-500">Overall project status and progress</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 text-left border rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Progress Report</h3>
                    <p className="text-sm text-gray-500">Detailed task and milestone progress</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 text-left border rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock size={24} className="text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Time Report</h3>
                    <p className="text-sm text-gray-500">Time tracking and resource utilization</p>
                  </div>
                </div>
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Report List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Generated Reports</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter size={20} className="mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileText size={20} className="text-gray-500 mr-2" />
                          <h3 className="text-lg font-medium">{report.title}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${getReportStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 font-medium">{report.report_type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Period:</span>
                          <span className="ml-2 font-medium">
                            {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-2 font-medium">{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Created by: {report.created_by}</span>
                          {report.approved_by && (
                            <span className="ml-4">Approved by: {report.approved_by}</span>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Download size={16} className="mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectReportsPage;