// src/controllers/book.controller.ts
import { Request, Response } from 'express';
import { BookRepository } from '../repositories/book.repository';
import { CreateBookDto, UpdateBookDto } from '../types/books';
// Note: Avoid direct Prisma error class references for compatibility

const bookRepository = new BookRepository();

export class BookController {

    // POST /api/books
    public async createBook(req: Request, res: Response): Promise<Response> {
        try {
            const data: CreateBookDto = req.body;
            
            // Базова валідація
            if (!data.title || !data.authorId || !data.categoryId || !data.totalCopies) {
                return res.status(400).json({ error: 'Missing required fields: title, authorId, categoryId, totalCopies' });
            }

            const newBook = await bookRepository.create({
                title: data.title,
                description: data.description,
                isbn: data.isbn,
                coverImage: data.coverImage,
                publicationYear: data.publicationYear,
                publisher: data.publisher,
                language: data.language,
                pages: data.pages,
                totalCopies: data.totalCopies,
                availableCopies: data.totalCopies,
                authorId: data.authorId,
                categoryId: data.categoryId,
                genreIds: data.genreIds,
            });
            return res.status(201).json(newBook);
        } catch (error: unknown) {
            console.error('Create book error:', error);
            // Обробка помилок унікальності (наприклад, ISBN)
            if (typeof (error as any)?.code === 'string' && (error as any).code === 'P2002') {
                return res.status(409).json({ error: 'Book with this ISBN already exists.' });
            }
            return res.status(500).json({ error: 'Failed to create book.' });
        }
    }

    // GET /api/books/:id
    public async getBookById(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as string;
            const book = await bookRepository.findById(id);

            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }

            return res.status(200).json(book);
        } catch (error: unknown) {
            console.error('Get book error:', error);
            return res.status(500).json({ error: 'Failed to retrieve book.' });
        }
    }

    // GET /api/books
    public async getAllBooks(req: Request, res: Response): Promise<Response> {
        try {
            const {
                page = '1',
                limit = '10',
                search,
                author,
                category,
                genre,
                status,
                sortBy = 'title',
                sortOrder = 'asc',
            } = req.query as Record<string, string | undefined>;

            const books = await bookRepository.findAll({
                page: Number(page),
                limit: Number(limit),
                search,
                author,
                category,
                genre,
                status: status as any,
                sortBy,
                sortOrder: (sortOrder === 'desc' ? 'desc' : 'asc'),
            });

            return res.status(200).json(books);
        } catch (error: unknown) {
            console.error('Get all books error:', error);
            return res.status(500).json({ error: 'Failed to retrieve books list.' });
        }
    }

    // PUT /api/books/:id
    public async updateBook(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as string;
            const data: UpdateBookDto = req.body;

            const updatedBook = await bookRepository.update(id, data);
            
            return res.status(200).json(updatedBook);
        } catch (error: unknown) {
            console.error('Update book error:', error);
            if (typeof (error as any)?.code === 'string') {
                const code = (error as any).code as string;
                if (code === 'P2002') return res.status(409).json({ error: 'Book with this ISBN already exists.' });
                if (code === 'P2025') return res.status(404).json({ error: 'Book or related record not found.' });
            }
            return res.status(500).json({ error: 'Failed to update book.' });
        }
    }

    // DELETE /api/books/:id
    public async deleteBook(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id as string;
            const deletedBook = await bookRepository.delete(id);
            
            return res.status(200).json({ 
                message: `Book "${deletedBook.title}" successfully deleted.`,
                id: deletedBook.id
            });
        } catch (error: unknown) {
            console.error('Delete book error:', error);
            if (typeof (error as any)?.code === 'string' && (error as any).code === 'P2025') {
                return res.status(404).json({ error: 'Book not found.' });
            }
            return res.status(500).json({ error: 'Failed to delete book.' });
        }
    }
}

