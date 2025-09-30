// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
// 💡 Імпортуємо клас, а не функції
import { AuthService } from '../services/auth.service'; 
// Ми також не імпортуємо refreshAuthTokens, оскільки він тепер є методом класу

// Створюємо єдиний екземпляр сервісу для використання в усіх контролерах
const authService = new AuthService();

// ------------------- РЕЄСТРАЦІЯ -------------------

export const register = async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Перевірка обов'язкових полів
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // 💡 ВИКОРИСТАННЯ: Викликаємо метод registerUser з екземпляра класу
      const result = await authService.registerUser({ email, password, firstName, lastName });
      
      // Вилучення пароля з відповіді
      const { password: _, ...userWithoutPass } = result.user;
  
      return res.status(201).json({
        user: userWithoutPass, 
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
  
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      if (message.includes('already exists')) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      console.error('Registration Error:', error);
      return res.status(500).json({ error: message });
    }
};

// ------------------- ВХІД -------------------

export const login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      // 💡 ВИКОРИСТАННЯ: Викликаємо метод loginUser з екземпляра класу
      const result = await authService.loginUser(email, password);
      
      const { password: _, ...userWithoutPass } = result.user;
  
      return res.status(200).json({
        user: userWithoutPass, 
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      if (message.includes('Invalid credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      console.error('Login Error:', error);
      return res.status(500).json({ error: message });
    }
};

// ------------------- ОНОВЛЕННЯ ТОКЕНІВ -------------------

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body; 

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh Token is required' });
        }

        // 💡 ВИКОРИСТАННЯ: Викликаємо метод refreshAuthTokens з екземпляра класу
        const tokens = await authService.refreshAuthTokens(refreshToken);

        return res.status(200).json(tokens);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Refresh failed';
        return res.status(401).json({ error: message });
    }
};