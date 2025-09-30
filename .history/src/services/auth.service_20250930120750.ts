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

  // 1. Валидация email, пароля, имени + 2. Проверка уникальности email + 3. Хеширование пароля + 4. Создание пользователя
  async register(userData: RegisterInput): Promise<AuthResponse> {
    try {
      // 2. Проверка уникальности email
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'Пользователь с таким email уже существует'
        };
      }

      // 3. Хеширование пароля
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // 4. Создание пользователя с ролью READER
      const user = await userRepository.createUser({
        ...userData,
        password: hashedPassword
      });

      // 5. Генерация JWT токенов
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        message: 'Пользователь успешно зарегистрирован',
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
        message: 'Ошибка при регистрации пользователя'
      };
    }
  }

  async login(loginData: LoginInput): Promise<AuthResponse> {
    try {
      // Поиск пользователя по email
      const user = await userRepository.findByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'Неверный email или пароль'
        };
      }

      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Неверный email или пароль'
        };
      }

      // Проверка активности пользователя
      if (!user.isActive) {
        return {
          success: false,
          message: 'Аккаунт деактивирован'
        };
      }

      // Генерация токенов
      const tokens = await this.generateTokens(user);

      // Сохранение refresh token в базе
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        message: 'Вход выполнен успешно',
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
        message: 'Ошибка при входе в систему'
      };
    }
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    // Генерация access token
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });

    // Генерация refresh token
    const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Удаляем старые refresh tokens для этого пользователя
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });

    // Сохраняем новый refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
      }
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      // Проверка валидности refresh token
      const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as JwtPayload;

      // Поиск токена в базе
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
          message: 'Невалидный refresh token'
        };
      }

      // Генерация новых токенов
      const tokens = await this.generateTokens(storedToken.user);

      // Обновление refresh token в базе
      await this.saveRefreshToken(decoded.userId, tokens.refreshToken);

      return {
        success: true,
        message: 'Токены обновлены',
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
        message: 'Ошибка обновления токенов'
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
        message: 'Выход выполнен успешно'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Ошибка при выходе из системы'
      };
    }
  }
}