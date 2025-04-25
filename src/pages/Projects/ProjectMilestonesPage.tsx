import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Filter, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { projectService } from '../../services/projects';
import { Milestone } from '../../types';

const ProjectMilestonesPage: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, [selectedProject]);

  const loadMilestones = async () => {
    try {
      setIsLoading(true);
      const projectMilestones = await projectService.getProjectMilestones(selectedProject);
      setMilestones(projectMilestones);
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'delayed':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Milestones</h1>
          <p className="mt-1 text-gray-600">Track major project achievements and deadlines</p>
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
            <Plus size={20} className="mr-2" />
            New Milestone
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestone Statistics */}
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Overview</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle size={24} className="text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {milestones.filter(m => m.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock size={24} className="text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {milestones.filter(m => m.status === 'in-progress').length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock size={24} className="text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Upcoming</span>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {milestones.filter(m => m.status === 'upcoming').length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle size={24} className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Delayed</span>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {milestones.filter(m => m.status === 'delayed').length}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Milestone List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Milestones</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search milestones..."
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
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{milestone.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${getMilestoneStatusColor(milestone.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getMilestoneIcon(milestone.status)}
                            <span>{milestone.status}</span>
                          </div>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{milestone.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm">
                            {milestone.tasks.length} tasks
                          </span>
                        </div>
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

export default ProjectMilestonesPage;