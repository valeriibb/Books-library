// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { createUser, findUserByEmail, CreateUserDto } from '../repositories/user.repository';
import prisma from '../config/prisma'; // Для роботи з RefreshToken

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_UNSAFE_DEFAULT'; 
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'ANOTHER_UNSAFE_DEFAULT';

// Налаштуйте ці значення у вашому .env!

// Генерація токенів доступу та оновлення
export const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: '15m' } // Короткий термін дії
  );

  const refreshToken = jwt.sign(
    { id: user.id }, 
    REFRESH_SECRET, 
    { expiresIn: '7d' } // Довгий термін дії
  );

  return { accessToken, refreshToken };
};

// ------------------- РЕЄСТРАЦІЯ -------------------

export const registerUser = async (data: CreateUserDto) => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const newUser = await createUser({
    ...data,
    password: hashedPassword,
  });

  // Логіка створення токенів після реєстрації
  const tokens = generateTokens(newUser);

  // Зберігаємо Refresh Token у БД
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
    },
  });

  return { user: newUser, ...tokens };
};

// ------------------- ВХІД -------------------

export const loginUser = async (email: string, password_plain: string) => {
  const user = await findUserByEmail(email);
  if (!user || !user.isActive) {
    throw new Error('Invalid credentials or user inactive');
  }

  const passwordMatch = await bcrypt.compare(password_plain, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  const tokens = generateTokens(user);

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, ...tokens };
};



export const refreshAuthTokens = async (refreshToken: string) => {
    try {
        // 1. Верифікація Refresh Token
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
        const userId = decoded.id;

        // 2. Перевірка наявності токена в БД (що він не був відкликаний)
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new Error('Refresh Token is invalid or expired.');
        }

        if (!storedToken.user) {
            throw new Error('User associated with token not found.');
        }

        // 3. Генерація нових токенів
        const newTokens = generateTokens(storedToken.user);

        // 4. Оновлення Refresh Token у БД (Опціонально: видалення старого та створення нового)
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        
        await prisma.refreshToken.create({
            data: {
                token: newTokens.refreshToken,
                userId: storedToken.user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
            },
        });

        return { 
            accessToken: newTokens.accessToken, 
            refreshToken: newTokens.refreshToken 
        };

    } catch (error) {
        throw new Error('Token refresh failed. Please log in again.');
    }
};