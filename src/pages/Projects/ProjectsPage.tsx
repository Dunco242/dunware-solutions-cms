import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Search, Filter, Calendar, Clock, Users, BarChart, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { Project, Task } from '../../types';

const ProjectsPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  // Mock data
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website',
      status: 'in-progress',
      progress: 65,
      startDate: '2025-03-01',
      endDate: '2025-05-30',
      budget: 50000,
      spent: 32500,
      team: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
          role: 'Project Manager',
          permissions: []
        },
        {
          id: '2',
          name: 'Sarah Miller',
          email: 'sarah@example.com',
          avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150',
          role: 'Developer',
          permissions: []
        }
      ],
      tasks: [
        {
          id: '1',
          title: 'Design System Implementation',
          description: 'Create and implement new design system',
          status: 'in-progress',
          priority: 'high',
          assignedTo: [],
          startDate: '2025-03-15',
          dueDate: '2025-04-15',
          dependencies: [],
          timeTracking: []
        }
      ],
      milestones: [
        {
          id: '1',
          title: 'Design Phase Complete',
          description: 'All design assets and guidelines finalized',
          dueDate: '2025-04-01',
          status: 'completed',
          tasks: []
        }
      ],
      analytics: {
        timeTracking: {
          planned: 480,
          actual: 320,
          remaining: 160
        },
        costs: {
          planned: 50000,
          actual: 32500,
          remaining: 17500
        },
        progress: {
          tasks: {
            total: 45,
            completed: 28,
            overdue: 3
          },
          milestones: {
            total: 5,
            completed: 2,
            overdue: 0
          }
        },
        team: {
          utilization: {
            'John Doe': 85,
            'Sarah Miller': 92
          },
          performance: {
            'John Doe': 95,
            'Sarah Miller': 88
          }
        }
      }
    }
  ];

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Projects</h1>
          <p className="mt-1 text-gray-600">Manage and track project progress</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus size={16} className="mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project List */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" fullWidth>
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>

            <div className="divide-y divide-gray-200">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedProject === project.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{project.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {project.team.length}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.team.map(member => (
                          <Avatar
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            size="sm"
                            className="border-2 border-white"
                          />
                        ))}
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-8">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Tasks</p>
                        <p className="text-2xl font-semibold">
                          {projects[0].analytics.progress.tasks.completed}/
                          {projects[0].analytics.progress.tasks.total}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <CheckCircle2 size={24} className="text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {projects[0].analytics.progress.tasks.overdue} overdue
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Time Tracked</p>
                        <p className="text-2xl font-semibold">
                          {Math.floor(projects[0].analytics.timeTracking.actual / 60)}h
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Clock size={24} className="text-green-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {Math.floor(projects[0].analytics.timeTracking.remaining / 60)}h remaining
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Budget Spent</p>
                        <p className="text-2xl font-semibold">
                          ${(projects[0].analytics.costs.actual / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BarChart size={24} className="text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      ${(projects[0].analytics.costs.remaining / 1000).toFixed(1)}k remaining
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Team Utilization</p>
                        <p className="text-2xl font-semibold">88%</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Users size={24} className="text-orange-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {Object.keys(projects[0].analytics.team.utilization).length} active members
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Tasks and Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                      <Button variant="outline" size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="p-4 space-y-4">
                    {projects[0].tasks.map(task => (
                      <div
                        key={task.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {task.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <CardHeader className="border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Milestones</h2>
                      <Button variant="outline" size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Milestone
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="p-4">
                    {projects[0].milestones.map(milestone => (
                      <div
                        key={milestone.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 mb-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{milestone.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                            milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No project selected</h3>
                <p className="mt-1 text-gray-500">
                  Select a project from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;