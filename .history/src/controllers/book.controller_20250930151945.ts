// src/controllers/book.controller.ts
import { Request, Response } from 'express';
import { BookRepository } from '../repositories/book.repository';
import { CreateBookDto, UpdateBookDto } from '../types/books';
import { Prisma } from '@prisma/client';
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

            const newBook = await bookRepository.create(data);
            return res.status(201).json(newBook);
        } catch (error) {
            console.error('Create book error:', error);
            // Обробка помилок унікальності (наприклад, ISBN)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                return res.status(409).json({ error: 'Book with this ISBN already exists.' });
            }
            return res.status(500).json({ error: 'Failed to create book.' });
        }
    }

    // GET /api/books/:id
    public async getBookById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const book = await bookRepository.findById(id);

            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }

            return res.status(200).json(book);
        } catch (error) {
            console.error('Get book error:', error);
            return res.status(500).json({ error: 'Failed to retrieve book.' });
        }
    }

    // GET /api/books
    public async getAllBooks(req: Request, res: Response): Promise<Response> {
        try {
            const { take, skip, search } = req.query;
            
            const where: Prisma.BookWhereInput = search
                ? {
                    OR: [
                        { title: { contains: search as string, mode: 'insensitive' } },
                        { author: { firstName: { contains: search as string, mode: 'insensitive' } } },
                        { author: { lastName: { contains: search as string, mode: 'insensitive' } } },
                        { isbn: { contains: search as string, mode: 'insensitive' } },
                    ],
                }
                : {};

            const books = await bookRepository.findAll({
                take: take ? Number(take) : undefined,
                skip: skip ? Number(skip) : undefined,
                where: where,
            });

            return res.status(200).json(books);
        } catch (error) {
            console.error('Get all books error:', error);
            return res.status(500).json({ error: 'Failed to retrieve books list.' });
        }
    }

    // PUT /api/books/:id
    public async updateBook(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const data: UpdateBookDto = req.body;

            const updatedBook = await bookRepository.update(id, data);
            
            return res.status(200).json(updatedBook);
        } catch (error) {
            console.error('Update book error:', error);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') return res.status(409).json({ error: 'Book with this ISBN already exists.' });
                if (error.code === 'P2025') return res.status(404).json({ error: 'Book or related record not found.' });
            }
            return res.status(500).json({ error: 'Failed to update book.' });
        }
    }

    // DELETE /api/books/:id
    public async deleteBook(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const deletedBook = await bookRepository.delete(id);
            
            return res.status(200).json({ 
                message: `Book "${deletedBook.title}" successfully deleted.`,
                id: deletedBook.id
            });
        } catch (error) {
            console.error('Delete book error:', error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                return res.status(404).json({ error: 'Book not found.' });
            }
            return res.status(500).json({ error: 'Failed to delete book.' });
        }
    }
}