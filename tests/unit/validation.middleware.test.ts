import { validate } from '../../src/middleware/validation';
import Joi from 'joi';

describe('validation middleware', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  const middleware = validate(schema);

  const createMock = () => {
    const req: any = { body: {} };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    return { req, res, next };
  };

  it('calls next when validation succeeds', () => {
    const { req, res, next } = createMock();
    req.body = { name: 'John' };

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 when validation fails', () => {
    const { req, res, next } = createMock();
    req.body = {};

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

