export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;
  
    constructor(statusCode: number, message: string, isOperational: boolean = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad Request') {
      super(400, message);
    }
  }
  
  export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized') {
      super(401, message);
    }
  }
  
  export class ForbiddenError extends ApiError {
    constructor(message: string = 'Forbidden') {
      super(403, message);
    }
  }
  
  export class NotFoundError extends ApiError {
    constructor(message: string = 'Not Found') {
      super(404, message);
    }
  }
  
  export class ConflictError extends ApiError {
    constructor(message: string = 'Conflict') {
      super(409, message);
    }
  }
  
  export class ValidationError extends ApiError {
    constructor(message: string = 'Validation Failed') {
      super(422, message);
    }
  }
  
  export class InternalServerError extends ApiError {
    constructor(message: string = 'Internal Server Error') {
      super(500, message);
    }
  }