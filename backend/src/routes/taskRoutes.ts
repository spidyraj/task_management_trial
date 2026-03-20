import { Router } from 'express';
import { body } from 'express-validator';
import { TaskController } from '../controllers/taskController';
import { authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const taskController = new TaskController();

// Apply auth middleware to all task routes
router.use(authMiddleware);

// Get tasks with filtering and pagination
router.get('/',
  asyncHandler(taskController.getTasks.bind(taskController))
);

// Get task statistics
router.get('/stats',
  asyncHandler(taskController.getTaskStats.bind(taskController))
);

// Create task with validation
router.post('/',
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('category').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Category must be 1-50 characters'),
    body('priority').optional().isString().isLength({ min: 1, max: 10 }).withMessage('Priority must be valid'),
    body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date'),
  ],
  asyncHandler(taskController.createTask.bind(taskController))
);

// Update task with validation
router.patch('/:id',
  [
    body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('category').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Category must be 1-50 characters'),
    body('priority').optional().isString().isLength({ min: 1, max: 10 }).withMessage('Priority must be valid'),
    body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date'),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  ],
  asyncHandler(taskController.updateTask.bind(taskController))
);

// Delete task
router.delete('/:id',
  asyncHandler(taskController.deleteTask.bind(taskController))
);

// Toggle task completion
router.patch('/:id/toggle',
  asyncHandler(taskController.toggleTask.bind(taskController))
);

export default router;
