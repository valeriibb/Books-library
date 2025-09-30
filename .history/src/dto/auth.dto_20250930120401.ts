import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email ',
    'any.required': 'Email обязателен'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Пароль должен содержать минимум 6 символов',
    'any.required': 'Пароль обязателен'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Имя должно содержать минимум 2 символа',
    'string.max': 'Имя должно содержать максимум 50 символов',
    'any.required': 'Имя обязательно'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Фамилия должна содержать минимум 2 символа',
    'string.max': 'Фамилия должна содержать максимум 50 символов',
    'any.required': 'Фамилия обязательна'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});