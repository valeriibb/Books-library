// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, PrismaClient, UserRole } from '@prisma/client';
import prisma from '../config/prisma'; // Используем экземпляр Prisma
import * as UserRepository from '../repositories/user.repository'; // Используем импорты репозитория

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_UNSAFE_DEFAULT'; 
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'ANOTHER_UNSAFE_DEFAULT';

// Типизация для возвращаемого объекта
interface AuthResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    // В реальном приложении сюда можно инжектировать UserRepository
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma; 
    }

    // Приватный метод для генерации токенов
    private generateTokens(user: User) {
        const accessToken = jwt.sign(
            { id: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '15m' } 
        );

        const refreshToken = jwt.sign(
            { id: user.id }, 
            REFRESH_SECRET, 
            { expiresIn: '7d' } 
        );

        return { accessToken, refreshToken };
    }

    // Приватный метод для сохранения Refresh Token
    private async saveRefreshToken(userId: string, token: string) {
        // Удаляем старые токены при необходимости (для обеспечения одной активной сессии)
        await this.prisma.refreshToken.deleteMany({ where: { userId: userId } });

        await this.prisma.refreshToken.create({
            data: {
                token: token,
                userId: userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }

    // ------------------- РЕЄСТРАЦІЯ -------------------

    public async registerUser(data: UserRepository.CreateUserDto): Promise<AuthResult> {
        const existingUser = await UserRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const newUser = await UserRepository.createUser({
            ...data,
            password: hashedPassword,
        });

        const tokens = this.generateTokens(newUser);

        await this.saveRefreshToken(newUser.id, tokens.refreshToken);

        return { user: newUser, ...tokens };
    }

    // ------------------- ВХІД -------------------

    public async loginUser(email: string, password_plain: string): Promise<AuthResult> {
        const user = await UserRepository.findUserByEmail(email);
        if (!user || !user.isActive) {
            throw new Error('Invalid credentials or user inactive');
        }

        const passwordMatch = await bcrypt.compare(password_plain, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }

        const tokens = this.generateTokens(user);

        // Обновление токенов при успешном входе
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return { user, ...tokens };
    }

    // ------------------- ОНОВЛЕННЯ ТОКЕНІВ (для повноти класу) -------------------
    
    public async refreshAuthTokens(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
            const userId = decoded.id;

            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new Error('Refresh Token is invalid or expired.');
            }

            if (!storedToken.user) {
                throw new Error('User associated with token not found.');
            }

            // Генерация новых токенов
            const newTokens = this.generateTokens(storedToken.user);

            // Обновление токена в БД (удаляем старый, сохраняем новый)
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            await this.saveRefreshToken(storedToken.user.id, newTokens.refreshToken);

            return { 
                accessToken: newTokens.accessToken, 
                refreshToken: newTokens.refreshToken 
            };

        } catch (error) {
            // Если токен недействителен или просрочен, удаляем его из БД, если он там есть
            await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
            throw new Error('Token refresh failed. Please log in again.');
        }
    }
}