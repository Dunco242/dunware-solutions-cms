import { User, NotificationItem } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
};

export const recentNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New Message',
    message: 'You have received a new message from Sarah',
    timestamp: '10 minutes ago',
    read: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Task Completed',
    message: 'Project X milestone has been completed',
    timestamp: '1 hour ago',
    read: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Meeting Reminder',
    message: 'Team meeting in 30 minutes',
    timestamp: '2 hours ago',
    read: true,
    type: 'warning'
  }
];