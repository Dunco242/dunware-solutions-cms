import React, { useState } from 'react';
import { Menu, X, ChevronDown, ChevronRight, Users, Calendar, Mail, Briefcase, Map, MessageSquare, FileText, Settings, User, DollarSign, LayoutDashboard, Building, Phone, ClipboardList, Clock, Target, AlertTriangle, LineChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarItem } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'layout-dashboard',
      route: '/dashboard',
    },
    {
      id: 'crm',
      name: 'CRM',
      icon: 'users',
      route: '/crm',
      children: [
        {
          id: 'companies',
          name: 'Companies',
          icon: 'building',
          route: '/crm/companies',
        },
        {
          id: 'contacts',
          name: 'Contacts',
          icon: 'user',
          route: '/crm/contacts',
        },
        {
          id: 'deals',
          name: 'Deals',
          icon: 'dollar-sign',
          route: '/crm/deals',
        },
        {
          id: 'activities',
          name: 'Activities',
          icon: 'phone',
          route: '/crm/activities',
        },
      ],
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: 'briefcase',
      route: '/projects',
      children: [
        {
          id: 'project-list',
          name: 'All Projects',
          icon: 'clipboard-list',
          route: '/projects',
        },
        {
          id: 'tasks',
          name: 'Tasks & Kanban',
          icon: 'clipboard-list',
          route: '/projects/tasks',
        },
        {
          id: 'timeline',
          name: 'Timeline',
          icon: 'clock',
          route: '/projects/timeline',
        },
        {
          id: 'milestones',
          name: 'Milestones',
          icon: 'target',
          route: '/projects/milestones',
        },
        {
          id: 'risks',
          name: 'Risk Management',
          icon: 'alert-triangle',
          route: '/projects/risks',
        },
        {
          id: 'reports',
          name: 'Reports & Analytics',
          icon: 'line-chart',
          route: '/projects/reports',
        },
      ],
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: 'calendar',
      route: '/calendar',
    },
    {
      id: 'email',
      name: 'Email',
      icon: 'mail',
      route: '/email',
    },
    {
      id: 'routes',
      name: 'Routes',
      icon: 'map',
      route: '/routes',
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: 'message-square',
      route: '/chat',
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: 'file-text',
      route: '/documents',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: 'settings',
      route: '/settings',
    },
  ];

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    crm: location.pathname.startsWith('/crm'),
    projects: location.pathname.startsWith('/projects'),
  });

  const toggleExpand = (id: string) => {
    setExpandedItems({
      ...expandedItems,
      [id]: !expandedItems[id],
    });
  };

  const renderIcon = (iconName: string) => {
    const icons: Record<string, React.FC> = {
      'layout-dashboard': () => <LayoutDashboard size={20} />,
      'users': () => <Users size={20} />,
      'calendar': () => <Calendar size={20} />,
      'mail': () => <Mail size={20} />,
      'briefcase': () => <Briefcase size={20} />,
      'map': () => <Map size={20} />,
      'message-square': () => <MessageSquare size={20} />,
      'file-text': () => <FileText size={20} />,
      'settings': () => <Settings size={20} />,
      'user': () => <User size={20} />,
      'dollar-sign': () => <DollarSign size={20} />,
      'building': () => <Building size={20} />,
      'phone': () => <Phone size={20} />,
      'clipboard-list': () => <ClipboardList size={20} />,
      'clock': () => <Clock size={20} />,
      'target': () => <Target size={20} />,
      'alert-triangle': () => <AlertTriangle size={20} />,
      'line-chart': () => <LineChart size={20} />,
    };
    
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive = location.pathname === item.route;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    
    return (
      <div key={item.id}>
        <Link
          to={hasChildren ? '#' : item.route}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpand(item.id);
            }
          }}
          className={`
            flex items-center px-4 py-3 cursor-pointer
            ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}
            ${level > 0 ? 'pl-8' : ''}
            transition-colors duration-150 rounded-md my-1
          `}
        >
          <span className="mr-3">{renderIcon(item.icon)}</span>
          <span className="font-medium">{item.name}</span>
          {hasChildren && (
            <span className="ml-auto">
              {isExpanded ? 
                <ChevronDown size={18} /> : 
                <ChevronRight size={18} />
              }
            </span>
          )}
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 pl-4 border-l border-gray-200">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white z-30 w-64 shadow-lg transform 
          transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b bg-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src="/logo.svg"
                  alt="DunWare Solutions CMS"
                  className="h-8 w-auto"
                />
                <h1 className="ml-2 text-lg font-semibold text-white">
                  DunWare Solutions
                </h1>
              </div>
              <button 
                className="p-1 rounded-full text-white lg:hidden"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-blue-100 mt-1">CMS</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {sidebarItems.map(item => renderSidebarItem(item))}
            </div>
          </div>
          
          <div className="p-4 border-t text-sm text-gray-500">
            <p>&copy; 2025 DunWare Solutions</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;