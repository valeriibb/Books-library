import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';

const prisma = new PrismaClient();
const userRepository = new UserRepository();

export interface PasswordResponse {
  success: boolean;
  message: string;
}

export class PasswordService {
  async forgotPassword(email: string): Promise<PasswordResponse> {
    try {
      // Check if user exists
      const user = await userRepository.findByEmail(email);
      if (!user) {
        // For security, don't reveal if email exists
        return {
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email }
      });

      // Create new reset token (expires in 1 hour)
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          email: email,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      // In a real app, you would send an email here
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);

      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Error processing password reset request'
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<PasswordResponse> {
    try {
      // Find the reset token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token }
      });

      if (!resetToken) {
        return {
          success: false,
          message: 'Invalid or expired reset token'
        };
      }

      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        await prisma.passwordResetToken.delete({
          where: { token }
        });
        return {
          success: false,
          message: 'Reset token has expired'
        };
      }

      // Find user by email
      const user = await userRepository.findByEmail(resetToken.email);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // Delete the used token
      await prisma.passwordResetToken.delete({
        where: { token }
      });

      // Delete all refresh tokens for this user (optional security measure)
      await prisma.refreshToken.deleteMany({
        where: { userId: user.id }
      });

      return {
        success: true,
        message: 'Password has been reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Error resetting password'
      };
    }
  }

  async validateResetToken(token: string): Promise<PasswordResponse> {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token }
      });

      if (!resetToken) {
        return {
          success: false,
          message: 'Invalid reset token'
        };
      }

      if (resetToken.expiresAt < new Date()) {
        await prisma.passwordResetToken.delete({
          where: { token }
        });
        return {
          success: false,
          message: 'Reset token has expired'
        };
      }

      return {
        success: true,
        message: 'Valid reset token'
      };
    } catch (error) {
      console.error('Validate reset token error:', error);
      return {
        success: false,
        message: 'Error validating reset token'
      };
    }
  }
}