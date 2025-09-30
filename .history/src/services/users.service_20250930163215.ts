import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export interface UserResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class UsersService {
  async getCurrentUser(userId: string): Promise<UserResponse> {
    try {
      const user = await userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: user
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Error retrieving user profile'
      };
    }
  }

  async updateUserProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }): Promise<UserResponse> {
    try {
      // Check if user exists
      const existingUser = await userRepository.findById(userId);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user profile
      const updatedUser = await userRepository.updateUserProfile(userId, updateData);

      return {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        message: 'Error updating profile'
      };
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<UserResponse> {
    try {
      // This would require additional logic to verify current password
      // For now, we'll return a placeholder response
      return {
        success: false,
        message: 'Password change functionality not implemented yet'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Error changing password'
      };
    }
  }
}