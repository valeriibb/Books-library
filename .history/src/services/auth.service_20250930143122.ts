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

  async register(userData: RegisterInput): Promise<AuthResponse> {
    try {
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await userRepository.createUser({
        ...userData,
        password: hashedPassword
      });

      const tokens = await this.generateTokens(user);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

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
      const user = await userRepository.findByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      const tokens = await this.generateTokens(user);
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

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as JwtPayload;

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

      const tokens = await this.generateTokens(storedToken.user);
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

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET,  { expiresIn: this.JWT_EXPIRES_IN }  );
      
      const refreshToken = jwt.sign(payload, 
        this.REFRESH_TOKEN_SECRET, 
        { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
      );

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
  }
}