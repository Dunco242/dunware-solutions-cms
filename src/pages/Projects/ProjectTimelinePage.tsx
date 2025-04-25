import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Filter, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Timeline from '../../components/projects/Timeline';
import { projectService } from '../../services/projects';
import { Project, Task, Milestone } from '../../types';

const ProjectTimelinePage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimelineData();
  }, [selectedProject]);

  const loadTimelineData = async () => {
    try {
      setIsLoading(true);
      const [projectTasks, projectMilestones] = await Promise.all([
        projectService.getProjectTasks(selectedProject),
        projectService.getProjectMilestones(selectedProject)
      ]);
      setTasks(projectTasks);
      setMilestones(projectMilestones);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Timeline</h1>
          <p className="mt-1 text-gray-600">View and manage project schedules</p>
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
            Add Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Timeline View</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
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
            <Timeline
              tasks={tasks}
              milestones={milestones}
              onTaskClick={() => {}}
              onMilestoneClick={() => {}}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ProjectTimelinePage;