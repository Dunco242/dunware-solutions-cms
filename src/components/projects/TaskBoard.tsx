import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Clock, AlertCircle, CheckCircle, User, MoreVertical } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { Task } from '../../types';
import { format } from 'date-fns';

interface TaskBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, fromStatus: string, toStatus: string) => void;
  onTaskClick?: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskMove,
  onTaskClick
}) => {
  const tasksByStatus = tasks.reduce((acc: { [key: string]: Task[] }, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {});

  const columns = [
    { id: 'todo', name: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', name: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', name: 'Review', color: 'bg-yellow-100' },
    { id: 'done', name: 'Done', color: 'bg-green-100' }
  ];

  const handleDragEnd = (result: any) => {
    if (!result.destination || !onTaskMove) return;

    const { draggableId, source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      onTaskMove(draggableId, source.droppableId, destination.droppableId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
          >
            <div className={`rounded-lg ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{column.name}</h3>
                <span className="text-sm text-gray-600">
                  {tasksByStatus[column.id]?.length || 0}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3"
                  >
                    {tasksByStatus[column.id]?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              bg-white rounded-lg shadow-sm p-4 cursor-pointer
                              ${snapshot.isDragging ? 'shadow-lg' : ''}
                              hover:shadow-md transition-shadow duration-200
                            `}
                            onClick={() => onTaskClick?.(task)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`
                                px-2 py-1 text-xs font-medium rounded-full
                                ${getPriorityColor(task.priority)}
                              `}>
                                {task.priority}
                              </span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical size={16} />
                              </button>
                            </div>

                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {task.title}
                            </h4>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {task.description}
                            </p>

                            <div className="space-y-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar size={14} className="mr-2" />
                                <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                              </div>

                              {task.estimatedHours && (
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-2" />
                                  <span>{task.estimatedHours}h estimated</span>
                                </div>
                              )}

                              {task.dependencies.length > 0 && (
                                <div className="flex items-center">
                                  <AlertCircle size={14} className="mr-2" />
                                  <span>{task.dependencies.length} dependencies</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {task.assignedTo.map(user => (
                                  <Avatar
                                    key={user.id}
                                    src={user.avatar}
                                    alt={user.name}
                                    size="sm"
                                    className="border-2 border-white"
                                  />
                                ))}
                              </div>

                              {task.completedAt && (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle size={14} className="mr-1" />
                                  <span className="text-xs">
                                    Completed {format(new Date(task.completedAt), 'MMM d')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;