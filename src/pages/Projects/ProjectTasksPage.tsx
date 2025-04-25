import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Plus, Filter, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import TaskBoard from '../../components/projects/TaskBoard';
import { projectService } from '../../services/projects';
import { Task } from '../../types';

const ProjectTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [selectedProject]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const projectTasks = await projectService.getProjectTasks(selectedProject);
      setTasks(projectTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, fromStatus: string, toStatus: string) => {
    try {
      await projectService.updateTask(taskId, { status: toStatus });
      await loadTasks();
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks & Kanban Board</h1>
          <p className="mt-1 text-gray-600">Manage and track project tasks</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline">
            <Filter size={20} className="mr-2" />
            Filter
          </Button>
          <Button>
            <Plus size={20} className="mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Task Board</h2>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {/* Project options will be populated here */}
            </select>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <TaskBoard
              tasks={tasks}
              onTaskMove={handleTaskMove}
              onTaskClick={() => {}}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ProjectTasksPage;