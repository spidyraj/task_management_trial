import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JWTPayload } from '../utils/jwt';

const prisma = new PrismaClient();

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  async register(userData: RegisterData) {
    const { name, username, email, password } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        created_at: true,
      }
    });

    // Generate tokens
    const tokenPayload: JWTPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(loginIdentifier: string, password: string) {
    // Check if loginIdentifier is email or username
    const isEmail = loginIdentifier.includes('@');
    
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: loginIdentifier } : { username: loginIdentifier }
    });

    if (!user) {
      throw new Error(isEmail ? 'Invalid email or password' : 'Invalid username or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error(isEmail ? 'Invalid email or password' : 'Invalid username or password');
    }

    // Generate tokens
    const tokenPayload: JWTPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

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
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const tokenPayload: JWTPayload = { userId: user.id, email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded) {
          // In a real app, you might want to blacklist the token
          // For now, we'll just let it expire naturally
        }
      } catch (error) {
        // Token was invalid, but that's okay for logout
      }
    }
  }
}
