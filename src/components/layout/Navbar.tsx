import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, Settings, LogOut, User } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { currentUser, recentNotifications } from '../../data/mockData';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <nav className="bg-white border-b border-gray-200 fixed z-10 w-full">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search..."
            />
          </div>
        </div>
        
        {/* Right navigation */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none relative"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {recentNotifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
            
            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 transform origin-top-right transition-all duration-200 ease-in-out">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Mark all as read</button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex">
                        <div className={`h-2 w-2 mt-1.5 rounded-full mr-3 flex-shrink-0 ${
                          notification.type === 'info' ? 'bg-blue-500' :
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-2 border-t border-gray-200">
                  <button className="w-full py-2 text-sm text-center text-blue-600 hover:text-blue-800">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="Open user menu"
            >
              <Avatar 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                size="sm" 
              />
            </button>
            
            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
                </div>
                
                <div className="py-1">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <User size={16} className="mr-2 text-gray-500" />
                    <span>Profile</span>
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <Settings size={16} className="mr-2 text-gray-500" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-1" />
                  <button className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                    <LogOut size={16} className="mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;