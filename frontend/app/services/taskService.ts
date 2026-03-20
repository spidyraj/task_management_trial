import api from './api';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  completed?: boolean;
  search?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  sortBy?: 'deadline' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams();
    
    if (filters.completed !== undefined) {
      params.append('completed', filters.completed.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.priority) {
      params.append('priority', filters.priority);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  async createTask(taskData: Partial<Task>): Promise<{ success: boolean; data: Task }> {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(id: number, taskData: Partial<Task>): Promise<{ success: boolean; data: Task }> {
    const response = await api.patch(`/tasks/${id}`, taskData);
    return response.data;
  },

  async deleteTask(id: number): Promise<{ success: boolean; data: { message: string } }> {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async toggleTask(id: number): Promise<{ success: boolean; data: Task }> {
    const response = await api.patch(`/tasks/${id}/toggle`);
    return response.data;
  },

  async getTaskStats(): Promise<{ success: boolean; data: TaskStats; }> {
    const response = await api.get('/tasks/stats');
    return response.data;
  },
};
