import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => ({ message: d.message, path: d.path }))
      });
      return;
    }
    req.body = value;
    next();
  };
};
