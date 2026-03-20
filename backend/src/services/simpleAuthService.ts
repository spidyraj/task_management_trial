// Temporary bypass for Prisma client issues
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export class SimpleAuthService {
  async register(userData: RegisterData) {
    const { name, username, email, password } = userData;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      throw new Error('User already exists');
    }
    
    // Hash password (simplified - in production use bcrypt)
    const hashedPassword = password; // Temporarily plain text for testing
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, username, email, created_at',
      [name, username, email, hashedPassword]
    );
    
    const user = result.rows[0];
    
    // Generate tokens (simplified)
    const accessToken = 'mock_access_token_' + user.id;
    const refreshToken = 'mock_refresh_token_' + user.id;
    
    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(loginIdentifier: string, password: string) {
    // Check if loginIdentifier is email or username
    const isEmail = loginIdentifier.includes('@');
    
    const result = await pool.query(
      isEmail 
        ? 'SELECT * FROM users WHERE email = $1'
        : 'SELECT * FROM users WHERE username = $1',
      [loginIdentifier]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    
    // Verify password (simplified - in production use bcrypt)
    if (user.password !== password) {
      throw new Error('Invalid credentials');
    }
    
    // Generate tokens (simplified)
    const accessToken = 'mock_access_token_' + user.id;
    const refreshToken = 'mock_refresh_token_' + user.id;
    
    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // Simplified token refresh
    const userId = refreshToken.replace('mock_refresh_token_', '');
    
    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    return {
      accessToken: 'mock_access_token_' + user.id,
      refreshToken: 'mock_refresh_token_' + user.id,
    };
  }

  async logout(refreshToken?: string) {
    // Simplified logout - just return success
    return;
  }
}
