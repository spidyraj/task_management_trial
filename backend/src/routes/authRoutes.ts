import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const authController = new AuthController();

// Register validation
router.post('/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  asyncHandler(authController.register.bind(authController))
);

// Login validation
router.post('/login',
  [
    body('loginIdentifier').trim().isLength({ min: 3 }).withMessage('Please provide email or username'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
  ],
  asyncHandler(authController.login.bind(authController))
);

// Refresh token validation
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  asyncHandler(authController.refreshToken.bind(authController))
);

// Logout validation
router.post('/logout',
  [
    body('refreshToken').optional().notEmpty().withMessage('Refresh token is required'),
  ],
  asyncHandler(authController.logout.bind(authController))
);

export default router;
