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

