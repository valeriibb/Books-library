import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
// Avoid direct Prisma imports for error class checks to remain version-agnostic

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
  details?: any;
}

export const errorHandler = (
  error: Error | ApiError | any,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let apiError: ApiError;

  // Log error for debugging
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query
  });

  // Handle known ApiError instances
  if (error instanceof ApiError) {
    apiError = error;
  }
  // Handle Prisma errors (by code string)
  else if (typeof error?.code === 'string') {
    apiError = handlePrismaErrorByCode(error.code);
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    apiError = new ApiError(401, 'Invalid token');
  }
  else if (error.name === 'TokenExpiredError') {
    apiError = new ApiError(401, 'Token expired');
  }
  // Handle other operational errors
  else {
    apiError = new ApiError(500, 'Internal server error');
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message: apiError.message
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = error.message;
    errorResponse.stack = error.stack;
    
    if (typeof (error as any)?.code === 'string') {
      errorResponse.details = { code: (error as any).code, meta: (error as any).meta };
    }
  }

  return res.status(apiError.statusCode).json(errorResponse);
};

// Handle specific Prisma errors by code
const handlePrismaErrorByCode = (code: string): ApiError => {
  switch (code) {
    case 'P2002':
      return new ApiError(409, 'Resource already exists');
    case 'P2003':
      return new ApiError(400, 'Invalid foreign key');
    case 'P2025':
      return new ApiError(404, 'Record not found');
    case 'P2014':
      return new ApiError(400, 'Invalid ID provided');
    case 'P2000':
      return new ApiError(400, 'Input value too long');
    case 'P2001':
      return new ApiError(404, 'Record not found');
    case 'P2004':
      return new ApiError(400, 'Constraint failed');
    default:
      return new ApiError(500, 'Database error occurred');
  }
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};