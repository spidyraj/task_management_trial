'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Get user info from localStorage or auth service
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.name || user.username || 'User');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/analytics', label: 'Task Analytics', icon: '📈' },
  ];

  return (
    <div className="w-64 bg-black border-r border-gray-800 h-screen flex flex-col">
      {/* Logo and User Info */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col space-y-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/image__1_-removebg-preview.png" 
              alt="App Logo" 
              className="w-16 h-16 object-contain"
            />
            <span className="text-xl font-bold text-white">TaskMaster</span>
          </div>
          
          {/* Username */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-white">
              {username || 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-gray-900 text-white border border-gray-700 shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <Link
          href="/login"
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </div>
  );
}
