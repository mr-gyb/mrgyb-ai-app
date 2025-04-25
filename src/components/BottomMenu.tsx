import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Plus, LayoutDashboard, Map } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const BottomMenu: React.FC = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const menuItems = [
    { path: '/new-chat', icon: Home, label: 'Culture' },
    { path: '/new-post', icon: Plus, label: 'Content' },
    { path: '/gyb-live-network', icon: Users, label: 'Community' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Commerce' },
    { path: '/road-map', icon: Map, label: 'Roadmap' }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-navy-blue border-t border-gray-200 dark:border-gray-700 z-50 transition-colors duration-200`}>
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path === '/new-post' ? '/gyb-studio' : item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              location.pathname === item.path 
                ? 'text-navy-blue dark:text-gold' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomMenu;