
export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must be at most 50 characters'
    }),
    lastName: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must be at most 50 characters'
    }),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
      'string.pattern.base': 'Phone number must be a valid international format'
    }),
    avatar: Joi.string().uri().optional().messages({
      'string.uri': 'Avatar must be a valid URL'
    })
  });