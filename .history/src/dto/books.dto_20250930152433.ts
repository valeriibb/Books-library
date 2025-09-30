import Joi from 'joi';

export const createBookSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must be less than 255 characters'
  }),
  description: Joi.string().max(1000).optional(),
  isbn: Joi.string().optional(),
  coverImage: Joi.string().uri().optional(),
  publicationYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
  publisher: Joi.string().max(255).optional(),
  language: Joi.string().default('English'),
  pages: Joi.number().integer().min(1).optional(),
  totalCopies: Joi.number().integer().min(1).default(1),
  authorId: Joi.string().required().messages({
    'string.empty': 'Author ID is required'
  }),
  categoryId: Joi.string().required().messages({
    'string.empty': 'Category ID is required'
  }),
  genreIds: Joi.array().items(Joi.string()).optional()
});

export const updateBookSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  isbn: Joi.string().optional(),
  coverImage: Joi.string().uri().optional(),
  publicationYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
  publisher: Joi.string().max(255).optional(),
  language: Joi.string().optional(),
  pages: Joi.number().integer().min(1).optional(),
  totalCopies: Joi.number().integer().min(0).optional(),
  authorId: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  genreIds: Joi.array().items(Joi.string()).optional()
});

export const bookQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),
  author: Joi.string().optional(),
  category: Joi.string().optional(),
  genre: Joi.string().optional(),
  status: Joi.string().valid('AVAILABLE', 'BORROWED', 'RESERVED').optional(),
  sortBy: Joi.string().valid('title', 'publicationYear', 'createdAt').default('title'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});