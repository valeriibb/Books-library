import prisma from '../config/prisma';
import { Prisma, User } from '@prisma/client';

// Інтерфейс для створення нового користувача (виключаємо ID, додаємо пароль)
export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role' | 'isActive' | 'borrowedBooks' | 'reviews' | 'reservations' | 'favorites' | 'notifications' | 'phone' | 'avatar'> & { password: string };

export const createUser = async (data: CreateUserDto): Promise<User> => {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password, // Пароль вже має бути хешованим
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      // 💡 Опціонально: тут ви можете вибрати, які поля повернути, 
      // щоб не показувати хеш пароля
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  };
