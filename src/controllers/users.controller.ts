import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { updateProfileSchema } from '../dto/users.dto';
import { UnauthorizedError, ValidationError, BadRequestError } from '../utils/apiError';
import { asyncHandler } from '../middleware/errorHandler';

const usersService = new UsersService();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class UsersController {
  getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const result = await usersService.getCurrentUser(userId);

    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    res.json(result);
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Validate input data
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0]?.message || 'Validation error');
    }

    // Check if at least one field is provided
    if (Object.keys(value).length === 0) {
      throw new BadRequestError('At least one field must be provided for update');
    }

    const result = await usersService.updateUserProfile(userId, value);

    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    res.json(result);
  });

  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current password and new password are required');
    }

    const result = await usersService.changePassword(userId, currentPassword, newPassword);

    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    res.json(result);
  });
}