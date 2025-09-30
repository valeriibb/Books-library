import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../dto/auth.dto';

const authService = new AuthService();

// ------------------- РЕЄСТРАЦІЯ -------------------
export const register = async (req: Request, res: Response) => {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          success: false,
          error: error.details[0]?.message || 'Validation error' 
        });
      }

      // Используем правильный метод register вместо registerUser
      const result = await authService.register(value);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
  
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      console.error('Registration Error:', error);
      return res.status(500).json({ 
        success: false,
        error: message 
      });
    }
};

// ------------------- ЛОГІН -------------------
export const login = async (req: Request, res: Response) => {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          success: false,
          error: error.details[0]?.message || 'Validation error' 
        });
      }

      const result = await authService.login(value);
      
      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      console.error('Login Error:', error);
      return res.status(500).json({ 
        success: false,
        error: message 
      });
    }
};

// ------------------- ОНОВЛЕННЯ ТОКЕНІВ -------------------
export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body; 

        if (!refreshToken) {
            return res.status(400).json({ 
              success: false,
              error: 'Refresh Token is required' 
            });
        }

        const result = await authService.refreshTokens(refreshToken);

        if (!result.success) {
          return res.status(401).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Refresh failed';
        console.error('Refresh Error:', error);
        return res.status(500).json({ 
          success: false,
          error: message 
        });
    }
};

// ------------------- ЛОГАУТ -------------------
export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body; 

        if (!refreshToken) {
            return res.status(400).json({ 
              success: false,
              error: 'Refresh Token is required' 
            });
        }

        const result = await authService.logout(refreshToken);

        return res.status(200).json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Logout failed';
        console.error('Logout Error:', error);
        return res.status(500).json({ 
          success: false,
          error: message 
        });
    }
};