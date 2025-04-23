import { Module } from '../types';

const modules: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'layout-dashboard',
    description: 'Overview of your workspace and quick access to modules',
    route: '/dashboard',
    enabled: true,
  },
  {
    id: 'crm',
    name: 'CRM',
    icon: 'users',
    description: 'Comprehensive customer relationship management',
    route: '/crm',
    enabled: true,
  },
  {
    id: 'chat',
    name: 'Chat',
    icon: 'message-square',
    description: 'Real-time communication with team members and clients',
    route: '/chat',
    enabled: true,
  },
  {
    id: 'email',
    name: 'Email',
    icon: 'mail',
    description: 'Manage your email communications',
    route: '/email',
    enabled: true,
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'file-text',
    description: 'Comprehensive document management system',
    route: '/documents',
    enabled: true,
  },
  {
    id: 'routes',
    name: 'Route Management',
    icon: 'map',
    description: 'Plan and manage service routes efficiently',
    route: '/routes',
    enabled: true,
  },
  {
    id: 'video',
    name: 'Video Conferencing',
    icon: 'video',
    description: 'Host and join video meetings',
    route: '/video',
    enabled: true,
  },
  {
    id: 'projects',
    name: 'Project Management',
    icon: 'briefcase',
    description: 'Track and manage projects with detailed analytics',
    route: '/projects',
    enabled: true,
  }
];

export default modules;