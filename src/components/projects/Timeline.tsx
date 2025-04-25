import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, eachDayOfInterval, isSameDay, isWithinInterval, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Task, Milestone } from '../../types';

interface TimelineProps {
  tasks: Task[];
  milestones: Milestone[];
  onTaskClick?: (task: Task) => void;
  onMilestoneClick?: (milestone: Milestone) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  tasks,
  milestones,
  onTaskClick,
  onMilestoneClick
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(30);
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline dates
  const dates = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, daysToShow - 1)
  });

  // Calculate the earliest start date and latest end date
  useEffect(() => {
    const allDates = [
      ...tasks.map(task => new Date(task.startDate)),
      ...tasks.map(task => new Date(task.dueDate)),
      ...milestones.map(milestone => new Date(milestone.dueDate))
    ];

    if (allDates.length > 0) {
      const earliest = new Date(Math.min(...allDates.map(d => d.getTime())));
      setStartDate(earliest);
    }
  }, [tasks, milestones]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      timelineRef.current.scrollLeft += scrollAmount;
      setScrollPosition(timelineRef.current.scrollLeft);
    }
  };

  const getTaskPosition = (task: Task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.dueDate);
    const startOffset = differenceInDays(start, startDate);
    const duration = differenceInDays(end, start) + 1;

    return {
      left: `${(startOffset / daysToShow) * 100}%`,
      width: `${(duration / daysToShow) * 100}%`
    };
  };

  const getMilestonePosition = (milestone: Milestone) => {
    const date = new Date(milestone.dueDate);
    const offset = differenceInDays(date, startDate);
    return {
      left: `${(offset / daysToShow) * 100}%`
    };
  };

  const getTaskColor = (task: Task) => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'review':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMilestoneColor = (milestone: Milestone) => {
    switch (milestone.status) {
      case 'completed':
        return 'bg-green-600';
      case 'delayed':
        return 'bg-red-600';
      default:
        return 'bg-purple-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleScroll('left')}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleScroll('right')}>
            <ChevronRight size={16} />
          </Button>
          <select
            value={daysToShow}
            onChange={(e) => setDaysToShow(Number(e.target.value))}
            className="ml-4 border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={14}>2 Weeks</option>
            <option value={30}>1 Month</option>
            <option value={90}>3 Months</option>
            <option value={180}>6 Months</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Milestone</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b">
          <div className="flex">
            <div className="w-48 p-4 border-r font-medium text-gray-700">
              Task / Milestone
            </div>
            <div
              ref={timelineRef}
              className="flex-1 overflow-x-auto"
              style={{ maxWidth: 'calc(100% - 12rem)' }}
            >
              <div className="flex min-w-max">
                {dates.map((date, index) => (
                  <div
                    key={date.toISOString()}
                    className={`w-32 p-2 text-center border-r text-sm ${
                      index === 0 ? 'border-l' : ''
                    }`}
                  >
                    <div className="font-medium">{format(date, 'MMM d')}</div>
                    <div className="text-gray-500">{format(date, 'EEE')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="divide-y">
          {/* Tasks */}
          {tasks.map(task => (
            <div key={task.id} className="flex hover:bg-gray-50">
              <div className="w-48 p-4 border-r">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getTaskColor(task)}`} />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </span>
                </div>
              </div>
              <div className="flex-1 relative p-2" style={{ minHeight: '4rem' }}>
                <div
                  className={`absolute h-6 rounded-full ${getTaskColor(task)} opacity-80 cursor-pointer hover:opacity-100`}
                  style={getTaskPosition(task)}
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className="px-2 py-1 text-xs text-white truncate">
                    {task.title}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Milestones */}
          {milestones.map(milestone => (
            <div key={milestone.id} className="flex hover:bg-gray-50">
              <div className="w-48 p-4 border-r">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getMilestoneColor(milestone)}`} />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {milestone.title}
                  </span>
                </div>
              </div>
              <div className="flex-1 relative p-2" style={{ minHeight: '4rem' }}>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 transform ${getMilestoneColor(milestone)} w-4 h-4 rounded-full cursor-pointer`}
                  style={getMilestonePosition(milestone)}
                  onClick={() => onMilestoneClick?.(milestone)}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                      {milestone.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;