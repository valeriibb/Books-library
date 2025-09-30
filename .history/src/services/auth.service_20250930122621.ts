import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput, AuthResponse, JwtPayload } from '../types/auth';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userRepository = new UserRepository();

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  // 1. Email, password, name validation + 2. Email uniqueness check + 3. Password hashing + 4. User creation
  async register(userData: RegisterInput): Promise<AuthResponse> {
    try {
      // 2. Email uniqueness check
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // 3. Password hashing
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // 4. User creation with READER role
      const user = await userRepository.createUser({
        ...userData,
        password: hashedPassword
      });

      // 5. JWT tokens generation
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Error during user registration'
      };
    }
  }

  async login(loginData: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await userRepository.findByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Password verification
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // User activity check
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      // Token generation
      const tokens = await this.generateTokens(user);

      // Save refresh token in database
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Error during login'
      };
    }
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    // Access token generation
    const accessToken = jwt.sign(
      payload, 
      this.JWT_SECRET, 
      { expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Refresh token generation
    const refreshToken = jwt.sign(
      payload, 
      this.REFRESH_TOKEN_SECRET, 
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Remove old refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });

    // Save new refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      // Refresh token validation
      const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as JwtPayload;

      // Find token in database
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.userId
        },
        include: { user: true }
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);

      // Update refresh token in database
      await this.saveRefreshToken(decoded.userId, tokens.refreshToken);

      return {
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          user: {
            id: storedToken.user.id,
            email: storedToken.user.email,
            firstName: storedToken.user.firstName,
            lastName: storedToken.user.lastName,
            role: storedToken.user.role
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: 'Error refreshing tokens'
      };
    }
  }

  async logout(refreshToken: string): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Error during logout'
      };
    }
  }
}