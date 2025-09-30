import { Router } from 'express';
import { BooksController } from '../controllers/books.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const booksController = new BooksController();

// Public routes
router.get('/', booksController.getAllBooks.bind(booksController));
router.get('/:id', booksController.getBookById.bind(booksController));

// Protected routes (require authentication)
router.post('/', authenticate, booksController.createBook.bind(booksController));
router.put('/:id', authenticate, booksController.updateBook.bind(booksController));
router.patch('/:id', authenticate, booksController.updateBook.bind(booksController));
router.delete('/:id', authenticate, booksController.deleteBook.bind(booksController));

export default router;