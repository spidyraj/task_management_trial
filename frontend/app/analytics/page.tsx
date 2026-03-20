'use client';

import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Task Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Tasks Card */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-600 bg-opacity-20 text-blue-400">
            📊
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-600 bg-opacity-20 text-green-400">
            ✅
          </div>
          <div>
            <p className="text-sm text-gray-400">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-yellow-600 bg-opacity-20 text-yellow-400">
            ⏳
          </div>
          <div>
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
        </div>

        {/* Overdue Tasks Card */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-600 bg-opacity-20 text-red-400">
            ⚠️
          </div>
          <div>
            <p className="text-sm text-gray-400">Overdue</p>
            <p className="text-2xl font-bold">{stats.overdue}</p>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-600 bg-opacity-20 text-purple-400">
            📈
          </div>
          <div>
            <p className="text-sm text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold">{stats.completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Completion Progress Section */}
      <div className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Completion Progress</h2>
        <div className="relative">
          <div className="w-full bg-gray-800 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-600 to-emerald-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          {/* Progress Markers */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center h-4 -mt-1">
            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">0%</span>
            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">50%</span>
            <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">100%</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-3xl font-bold text-green-400">{stats.completionRate}%</p>
          <p className="text-sm text-gray-400">Overall Completion Rate</p>
        </div>
      </div>
    </div>
  );
}
