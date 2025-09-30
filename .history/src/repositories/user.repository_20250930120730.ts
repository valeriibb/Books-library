import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

  // перевірка валідності email

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  // створення користувача READER
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        ...userData,
        role: 'READER'
      }
    });
  }
  // пошук 
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }
}