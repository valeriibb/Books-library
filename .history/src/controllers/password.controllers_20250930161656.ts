import { Request, Response } from 'express';
import { PasswordService } from '../services/password.service';
import { forgotPasswordSchema, resetPasswordSchema } from '../dto/auth.dto';

const passwordService = new PasswordService();

export class PasswordController {
  async forgotPassword(req: Request, res: Response) {
    try {
      const { error, value } = forgotPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0]?.message || 'Validation error'
        });
      }

      const { email } = value;

      const result = await passwordService.forgotPassword(email);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Forgot password controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { error, value } = resetPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0]?.message || 'Validation error'
        });
      }

      const { token, newPassword } = value;

      const result = await passwordService.resetPassword(token, newPassword);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Reset password controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async validateResetToken(req: Request, res: Response) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const result = await passwordService.validateResetToken(token);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Validate reset token controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}