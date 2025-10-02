import {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from '../../src/utils/apiError';

describe('ApiError hierarchy', () => {
  it('creates ApiError with provided status and message', () => {
    const err = new ApiError(418, 'I am a teapot');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe('I am a teapot');
    expect(err.isOperational).toBe(true);
  });

  it('BadRequestError has status 400', () => {
    expect(new BadRequestError().statusCode).toBe(400);
  });

  it('UnauthorizedError has status 401', () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
  });

  it('ForbiddenError has status 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it('NotFoundError has status 404', () => {
    expect(new NotFoundError().statusCode).toBe(404);
  });

  it('ConflictError has status 409', () => {
    expect(new ConflictError().statusCode).toBe(409);
  });

  it('ValidationError has status 422', () => {
    expect(new ValidationError().statusCode).toBe(422);
  });

  it('InternalServerError has status 500', () => {
    expect(new InternalServerError().statusCode).toBe(500);
  });
});

