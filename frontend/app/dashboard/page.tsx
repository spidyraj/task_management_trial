'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskService, Task, TaskFilters } from '../services/taskService';
import { authService } from '../services/authService';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<'deadline' | 'createdAt' | 'priority'>('createdAt');
  const [selectedOrder, setSelectedOrder] = useState<'asc' | 'desc'>('desc');

  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks(filters);
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      // Handle custom category
      const processedData = {
        ...taskData,
        category: taskData.category === 'CUSTOM' ? taskData.customCategory : taskData.category
      };
      
      const response = await taskService.createTask(processedData);
      if (response.success) {
        setTasks([response.data, ...tasks]);
        setShowTaskForm(false);
        toast.success('Task created successfully!');
      }
    } catch (error: any) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;
    
    try {
      // Handle custom category
      const processedData = {
        ...taskData,
        category: taskData.category === 'CUSTOM' ? taskData.customCategory : taskData.category
      };
      
      const response = await taskService.updateTask(editingTask.id, processedData);
      if (response.success) {
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? response.data : task
        ));
        setEditingTask(null);
        setShowTaskForm(false);
        toast.success('Task updated successfully!');
      }
    } catch (error: any) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const response = await taskService.toggleTask(taskId);
      
      if (response.success) {
        setTasks(tasks.map(task => 
          task.id === taskId ? response.data : task
        ));
        toast.success('Task status updated!');
        // Refresh tasks to get updated data
        fetchTasks();
      }
    } catch (error: any) {
      toast.error('Failed to update task status');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = () => {
    const newFilters: TaskFilters = {
      ...filters,
      search: searchTerm,
      page: 1,
    };

    // Always set category, even if empty (for ALL)
    newFilters.category = selectedCategory;
    if (selectedPriority) newFilters.priority = selectedPriority as 'LOW' | 'MEDIUM' | 'HIGH';
    if (selectedSort) newFilters.sortBy = selectedSort;
    if (selectedOrder) newFilters.sortOrder = selectedOrder;

    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  // Get unique categories from tasks, including standard ones
  const taskCategories = Array.from(new Set(tasks.map(task => task.category)));
  const standardCategories = ['WORK', 'PERSONAL', 'HOME', 'FINANCIAL'];
  const allCategories = ['ALL', ...standardCategories, ...taskCategories.filter(cat => !standardCategories.includes(cat))];
  const priorities = ['ALL', 'LOW', 'HIGH'];
  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'priority', label: 'Priority' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Task Dashboard</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your tasks efficiently</p>
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/20 text-sm sm:text-base"
          >
            ➕ Add Task
          </button>
        </div>

      {/* Search and Filters */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-800">
          <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-800 rounded-lg focus:ring-2 focus:ring-green-600 bg-black text-white placeholder-gray-600 transition-all duration-200 focus:border-green-600 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/20 text-sm sm:text-base"
              >
                🔍 Search
              </button>
            </div>
          </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center">
              <span className="mr-2">📁</span> Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-green-600 bg-black text-white transition-all duration-200 focus:border-green-600"
            >
              {allCategories.map((category: string) => (
                <option key={category} value={category === 'ALL' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center">
              <span className="mr-2">⚡</span> Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-green-600 bg-black text-white transition-all duration-200 focus:border-green-600"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority === 'ALL' ? '' : priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center">
              <span className="mr-2">🔄</span> Sort By
            </label>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value as 'deadline' | 'createdAt' | 'priority');
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-green-600 bg-black text-white transition-all duration-200 focus:border-green-600"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center">
              <span className="mr-2">⬆️</span> Order
            </label>
            <select
              value={selectedOrder}
              onChange={(e) => {
                setSelectedOrder(e.target.value as 'asc' | 'desc');
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-green-600 bg-black text-white transition-all duration-200 focus:border-green-600"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleFilterChange}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/20 font-medium"
        >
          ✨ Apply Filters
        </button>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black rounded-2xl shadow-2xl p-6 w-2/5 max-w-md mx-4 border border-gray-800">
            <TaskForm
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              initialData={editingTask || undefined}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-400">Loading tasks...</p>
        </div>
      ) : (
        <>
          {/* Tasks Grid */}
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-gray-400">
                {searchTerm || selectedCategory || selectedPriority 
                  ? 'Try adjusting your filters or search terms' 
                  : 'Start by adding your first task!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
