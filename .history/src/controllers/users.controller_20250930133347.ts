// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { findUserById } from '../repositories/user.repository';

// Отримати дані про поточного користувача
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    // 💡 req.user.id доступний завдяки мідлверу authenticate
    const userId = req.user.id; 

    const user = await findUserById(userId);

    if (!user) {
      // Технічно це неможливо, якщо токен валідний, але краще перестрахуватися
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
};