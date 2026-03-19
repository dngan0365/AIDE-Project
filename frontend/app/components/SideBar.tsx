'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { FaMapMarkerAlt, FaUser, FaSignOutAlt, FaCalendar } from 'react-icons/fa';
import { Table2, LayoutDashboard } from "lucide-react"

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      name: 'dashboard', 
      icon: <LayoutDashboard className="text-lg" /> 
    },
    { 
      path: '/admin/location', 
      name: 'locations', 
      icon: <FaMapMarkerAlt className="text-lg" /> 
    },
    { 
      path: '/admin/event', 
      name: 'events', 
      icon: <FaCalendar className="text-lg" /> 
    },
    { 
      path: '/admin/profile', 
      name: 'profile', 
      icon: <FaUser className="text-lg" /> 
    },
  ];
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} sticky h-100vh bg-gray-800 text-white transition-width duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!isCollapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button 
            title="Toggle Sidebar"
            onClick={toggleSidebar} 
            className={`${isCollapsed ? 'mx-auto' : ''} p-2 rounded-full hover:bg-gray-700`}
          >
            <Table2 className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-6">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg ${
                    pathname === item.path ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* User info & logout */}
        <div className="p-4 border-t border-gray-700">
          {user && (
            <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center'} mb-4`}>
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-lg">{(user.name || user.email || 'U').charAt(0)}</span>
              </div>
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-700 text-red-400 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <FaSignOutAlt />
            {!isCollapsed && <span className="ml-3">Log out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
