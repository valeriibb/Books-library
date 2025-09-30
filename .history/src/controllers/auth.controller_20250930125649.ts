// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

// ------------------- РЕЄСТРАЦІЯ -------------------
// src/controllers/auth.controller.ts
export const register = async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // 💡 Виправлення 1: Додаємо return
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const result = await registerUser({ email, password, firstName, lastName });
      
      const { password: _, ...userWithoutPass } = result.user;
  
      // 💡 Виправлення 2: Додаємо return
      return res.status(201).json({ // <-- return тут
        user: userWithoutPass, 
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
  
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      if (message.includes('already exists')) {
        // 💡 Виправлення 3: Додаємо return
        return res.status(409).json({ error: 'User with this email already exists' }); // <-- return тут
      }
      console.error('Registration Error:', error);
      // 💡 Виправлення 4: Додаємо return
      return res.status(500).json({ error: message }); // <-- return тут
    }
};
  
// ------------------- ВХІД -------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    
    const { password: _, ...userWithoutPass } = result.user;

    res.status(200).json({ 
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
    res.status(500).json({ error: message });
  }
};