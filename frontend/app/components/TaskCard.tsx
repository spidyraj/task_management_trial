'use client';

import { useState, useEffect } from 'react';
import { Task } from '../services/taskService';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progressColor, setProgressColor] = useState<string>('green');

  useEffect(() => {
    if (!task.deadline) {
      setTimeLeft('No deadline');
      setProgressColor('gray');
      return;
    }

    const now = new Date();
    const deadline = new Date(task.deadline);
    const diff = deadline.getTime() - now.getTime();

    if (diff < 0) {
      setTimeLeft('Overdue');
      setProgressColor('red');
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }

      // Calculate progress color based on time remaining
      const totalHours = diff / (1000 * 60 * 60);
      if (totalHours > 72) { // More than 3 days
        setProgressColor('green');
      } else if (totalHours > 24) { // 1-3 days
        setProgressColor('yellow');
      } else { // Less than 1 day
        setProgressColor('red');
      }
    }
  }, [task.deadline]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'WORK': return '💼';
      case 'PERSONAL': return '👤';
      case 'HOME': return '🏠';
      case 'FINANCIAL': return '💰';
      default: return '📝';
    }
  };

  const calculateProgress = () => {
    if (!task.deadline) return 0;
    
    const now = new Date();
    const created = new Date(task.created_at);
    const deadline = new Date(task.deadline);
    const total = deadline.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    
    return Math.min((elapsed / total) * 100, 100);
  };

  return (
    <div className="bg-black rounded-lg shadow-lg p-3 sm:p-4 hover:shadow-xl transition-all duration-200 border border-gray-800">
      {/* Mobile Layout - Vertical */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
        {/* Left Section - Status and Title */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onToggle(task.id)}
            className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="text-xs sm:text-sm">{task.completed ? '✓' : ''}</span>
          </button>
        </div>
        
        {/* Middle Section - Content */}
        <div className="flex-1 min-w-0 sm:ml-3">
          <h3 className={`text-sm sm:text-base font-medium text-white truncate ${task.completed ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-500 truncate">
              {task.description}
            </p>
          )}
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <span className={`inline-flex items-center px-1 sm:px-2 py-1 rounded text-xs font-medium border ${
              task.category === 'WORK' ? 'bg-blue-900 text-blue-300 border-blue-800' :
              task.category === 'PERSONAL' ? 'bg-green-900 text-green-300 border-green-800' :
              task.category === 'HOME' ? 'bg-purple-900 text-purple-300 border-purple-800' :
              task.category === 'FINANCIAL' ? 'bg-yellow-900 text-yellow-300 border-yellow-800' :
              'bg-gray-900 text-gray-300 border-gray-800'
            }`}>
              {task.category}
            </span>
            <span className={`inline-flex items-center px-1 sm:px-2 py-1 rounded text-xs font-medium border ${
              task.priority === 'HIGH' ? 'bg-red-900 text-red-300 border-red-800' :
              task.priority === 'LOW' ? 'bg-blue-900 text-blue-300 border-blue-800' :
              'bg-gray-900 text-gray-300 border-gray-800'
            }`}>
              {task.priority}
            </span>
            {task.deadline && (
              <span className="text-xs text-gray-400">
                {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-auto">
            <button
              onClick={() => onEdit(task)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="w-full sm:w-auto px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
            >
              🗑️ Delete
            </button>
          </div>

          {/* Completion Progress Bar */}
          {task.deadline && (
            <div className="mt-2">
              <div className="w-full bg-gray-900 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    progressColor === 'green' ? 'bg-green-600' :
                    progressColor === 'yellow' ? 'bg-yellow-600' :
                    progressColor === 'red' ? 'bg-red-600' :
                    'bg-gray-700'
                  }`}
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Right Section - Actions */}
        <div className="flex-shrink-0 flex items-center space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-900 rounded transition-colors"
          >
            <span className="text-xs">✏️</span>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-900 rounded transition-colors"
          >
            <span className="text-xs">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
