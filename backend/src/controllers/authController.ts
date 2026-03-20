import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { validationResult } from 'express-validator';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { name, username, email, password } = req.body;
      
      const response = await authService.register({ name, username, email, password });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: response,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { loginIdentifier, password } = req.body;
      
      const response = await authService.login(loginIdentifier, password);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: response,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      const response = await authService.refreshToken(refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: response,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      await authService.logout(refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  }
}
