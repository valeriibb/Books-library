import { Request, Response } from 'express';
import { BooksService } from '../services/books.service';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../dto/books.dto';

const booksService = new BooksService();

export class BooksController {
  async getAllBooks(req: Request, res: Response) {
    try {
      // Валидация query параметров
      const { error, value } = bookQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0]?.message || 'Invalid query parameters'
        });
      }

      const result = await booksService.getAllBooks(value);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Get all books controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getBookById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Проверка что ID существует
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
      }

      const result = await booksService.getBookById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Get book by ID controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async createBook(req: Request, res: Response) {
    try {
      // Валидация тела запроса
      const { error, value } = createBookSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0]?.message || 'Validation error'
        });
      }

      const result = await booksService.createBook(value);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create book controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateBook(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Проверка что ID существует
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
      }

      // Валидация тела запроса
      const { error, value } = updateBookSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0]?.message || 'Validation error'
        });
      }

      const result = await booksService.updateBook(id, value);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Update book controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async deleteBook(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Проверка что ID существует
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
      }

      const result = await booksService.deleteBook(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Delete book controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}