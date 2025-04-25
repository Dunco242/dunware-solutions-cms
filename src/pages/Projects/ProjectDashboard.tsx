import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Filter, Search, Calendar, Clock, Users, BarChart, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import ProjectMetrics from '../../components/projects/ProjectMetrics';
import TaskBoard from '../../components/projects/TaskBoard';
import Timeline from '../../components/projects/Timeline';
import TeamMembers from '../../components/projects/TeamMembers';
import RiskMatrix from '../../components/projects/RiskMatrix';
import BudgetOverview from '../../components/projects/BudgetOverview';
import { Project } from '../../types';

const ProjectDashboard: React.FC<{ project: Project }> = ({ project }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            className="border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <Button>
            <Plus size={20} className="mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Project Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle2 size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Tasks Completed</p>
                <p className="text-2xl font-semibold">
                  {project.analytics.progress.tasks.completed}/{project.analytics.progress.tasks.total}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Team Members</p>
                <p className="text-2xl font-semibold">{project.team.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Hours Tracked</p>
                <p className="text-2xl font-semibold">
                  {Math.round(project.analytics.timeTracking.actual)}h
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Open Issues</p>
                <p className="text-2xl font-semibold">
                  {project.analytics.progress.tasks.overdue}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Board */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Task Board</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <TaskBoard tasks={project.tasks} />
            </CardBody>
          </Card>
        </div>

        {/* Team Members */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Team Members</h2>
            </CardHeader>
            <CardBody>
              <TeamMembers members={project.team} />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Project Timeline</h2>
        </CardHeader>
        <CardBody>
          <Timeline
            tasks={project.tasks}
            milestones={project.milestones}
          />
        </CardBody>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Risk Matrix</h2>
          </CardHeader>
          <CardBody>
            <RiskMatrix project={project} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Budget Overview</h2>
          </CardHeader>
          <CardBody>
            <BudgetOverview project={project} />
          </CardBody>
        </Card>
      </div>

      {/* Project Metrics */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Project Metrics</h2>
        </CardHeader>
        <CardBody>
          <ProjectMetrics project={project} timeframe={timeframe} />
        </CardBody>
      </Card>
    </div>
  );
};

export default ProjectDashboard;