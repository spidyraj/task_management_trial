import { Request, Response } from 'express';
import { TaskService, TaskFilters, CreateTaskData, UpdateTaskData } from '../services/taskService';
import { validationResult } from 'express-validator';

const taskService = new TaskService();

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const filters: TaskFilters = {
        completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
        search: req.query.search as string,
        category: req.query.category as string,
        priority: req.query.priority as 'LOW' | 'MEDIUM' | 'HIGH',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as 'deadline' | 'createdAt' | 'priority',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await taskService.getTasks(userId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch tasks',
      });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = (req as any).user.userId;
      const taskData: CreateTaskData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        priority: req.body.priority,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      };

      const task = await taskService.createTask(userId, taskData);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create task',
      });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = (req as any).user.userId;
      const taskId = parseInt(req.params.id);
      const taskData: UpdateTaskData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        priority: req.body.priority,
        completed: req.body.completed,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      };

      const task = await taskService.updateTask(taskId, userId, taskData);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update task',
      });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const taskId = parseInt(req.params.id);

      await taskService.deleteTask(taskId, userId);

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete task',
      });
    }
  }

  async toggleTask(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const taskId = parseInt(id);

      const task = await taskService.toggleTask(taskId, userId);

      res.json({
        success: true,
        message: 'Task status toggled successfully',
        data: task,
      });
    } catch (error: any) {
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to toggle task',
      });
    }
  }

  async getTaskStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const stats = await taskService.getTaskStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch task statistics',
      });
    }
  }
}
