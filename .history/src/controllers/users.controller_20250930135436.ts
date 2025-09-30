import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export class UsersController {
  async getCurrentUser(req: Request, res: Response) {
    try {
      // Теперь TypeScript знает о req.user
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await userRepository.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Не возвращаем пароль
      const { password, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { firstName, lastName, phone } = req.body;

      // Валидация данных
      if (!firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'First name and last name are required'
        });
      }

      const updatedUser = await userRepository.updateUser(userId, {
        firstName,
        lastName,
        phone
      });

      const { password, ...userWithoutPassword } = updatedUser;

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}