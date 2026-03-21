import { prisma } from '../lib/prisma';

export interface TaskFilters {
  completed?: boolean;
  search?: string;
  category?: string;
  priority?: string;
  page?: number;
  limit?: number;
  sortBy?: 'deadline' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  deadline?: Date;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  completed?: boolean;
  deadline?: Date;
}

export class TaskService {
  async getTasks(userId: number, filters: TaskFilters = {}) {
    const {
      completed,
      search,
      category,
      priority,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = { userId };

    // Apply filters
    if (completed !== undefined) {
      where.completed = completed;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    // Apply sorting
    const orderBy: any = {};
    const sortField = sortBy === 'createdAt' ? 'created_at' : sortBy;
    orderBy[sortField] = sortOrder;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.task.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    };
  }

  async createTask(userId: number, taskData: CreateTaskData) {
    const { title, description, category = 'PERSONAL', priority = 'MEDIUM', deadline } = taskData;

    // Validate deadline is in the future
    if (deadline && new Date(deadline) <= new Date()) {
      throw new Error('Deadline must be in the future');
    }

    return await prisma.task.create({
      data: {
        title,
        description,
        category,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
        deadline,
        userId,
      },
    });
  }

  async updateTask(taskId: number, userId: number, taskData: UpdateTaskData) {
    const { title, description, category, priority, completed, deadline } = taskData;

    // Validate deadline is in the future
    if (deadline && new Date(deadline) <= new Date()) {
      throw new Error('Deadline must be in the future');
    }

    // First verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      throw new Error('Task not found');
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(priority && { priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' }),
        ...(completed !== undefined && { completed }),
        ...(deadline && { deadline }),
      },
    });
  }

  async deleteTask(taskId: number, userId: number) {
    // First verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      throw new Error('Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId }
    });
  }

  async toggleTask(taskId: number, userId: number) {
    // First verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      throw new Error('Task not found');
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: { completed: !existingTask.completed },
    });
  }

  async getTaskStats(userId: number) {
    const [total, completed, pending, overdue] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, completed: true } }),
      prisma.task.count({ where: { userId, completed: false } }),
      prisma.task.count({
        where: {
          userId,
          completed: false,
          deadline: { lt: new Date() }
        }
      })
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate
    };
  }
}
