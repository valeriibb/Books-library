import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createBookSchema, updateBookSchema } from '../dto/books.dto';

const router = Router();
const booksController = new BookController();

// Public routes
router.get('/', booksController.getAllBooks.bind(booksController));
router.get('/:id', booksController.getBookById.bind(booksController));

// Protected routes (require authentication)
router.post('/', authenticate, validate(createBookSchema), booksController.createBook.bind(booksController));
router.put('/:id', authenticate, validate(updateBookSchema), booksController.updateBook.bind(booksController));
router.patch('/:id', authenticate, validate(updateBookSchema), booksController.updateBook.bind(booksController));
router.delete('/:id', authenticate, booksController.deleteBook.bind(booksController));

export default router;