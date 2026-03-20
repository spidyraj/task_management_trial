import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import path from 'path';

// Configure dotenv to load .env from different paths
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set environment variables temporarily to test Prisma
process.env.DATABASE_URL = "postgresql://postgres:mypassword@localhost:5432/task_manager_db?schema=public";
process.env.JWT_SECRET = "abc123secure";
process.env.REFRESH_SECRET = "xyz456secure";
process.env.PORT = "5000";

// Debug: Check if environment variables are loaded
console.log('Environment variables:', {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  PORT: process.env.PORT,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
