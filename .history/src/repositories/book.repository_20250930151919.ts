// src/repositories/book.repository.ts
import prisma from '../config/prisma';
import { Book, Prisma, UserRole } from '@prisma/client';
import { CreateBookDto, UpdateBookDto, BookWithDetails } from '../types/books';

// Стандартний об'єкт вибірки для відображення книги
const bookSelect = {
    id: true,
    isbn: true,
    title: true,
    description: true,
    coverImage: true,
    publicationYear: true,
    publisher: true,
    language: true,
    pages: true,
    totalCopies: true,
    availableCopies: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    author: {
        select: { id: true, firstName: true, lastName: true },
    },
    category: {
        select: { id: true, name: true },
    },
    bookGenres: {
        select: { genre: { select: { id: true, name: true } } },
    },
};

export class BookRepository {

    // ------------------- СТВОРЕННЯ (CREATE) -------------------

    public async create(data: CreateBookDto): Promise<BookWithDetails> {
        const { genreIds, authorId, categoryId, totalCopies, ...bookData } = data;

        const newBook = await prisma.book.create({
            data: {
                ...bookData,
                totalCopies: totalCopies,
                availableCopies: totalCopies, // Доступна кількість дорівнює загальній
                author: { connect: { id: authorId } },
                category: { connect: { id: categoryId } },
                bookGenres: {
                    create: genreIds.map(genreId => ({
                        genre: { connect: { id: genreId } }
                    }))
                },
            },
            select: bookSelect,
        }) as BookWithDetails;
        
        return newBook;
    }

    // ------------------- ОТРИМАННЯ ОДНОЇ (READ) -------------------

    public async findById(id: string): Promise<BookWithDetails | null> {
        return prisma.book.findUnique({
            where: { id },
            select: bookSelect,
        }) as Promise<BookWithDetails | null>;
    }

    // ------------------- ОТРИМАННЯ ВСІХ (READ) -------------------

    public async findAll(params: { skip?: number; take?: number; where?: Prisma.BookWhereInput }): Promise<BookWithDetails[]> {
        const { skip, take, where } = params;
        
        return prisma.book.findMany({
            skip,
            take,
            where,
            select: bookSelect,
            orderBy: { title: 'asc' },
        }) as Promise<BookWithDetails[]>;
    }

    // ------------------- ОНОВЛЕННЯ (UPDATE) -------------------

    public async update(id: string, data: UpdateBookDto): Promise<BookWithDetails> {
        const { genreIds, totalCopies, ...updateData } = data;

        // 1. Оновлення основних полів книги
        const bookUpdate: Prisma.BookUpdateInput = {
            ...updateData,
            author: updateData.authorId ? { connect: { id: updateData.authorId } } : undefined,
            category: updateData.categoryId ? { connect: { id: updateData.categoryId } } : undefined,
        };
        
        // 2. Логіка оновлення кількості копій
        if (totalCopies !== undefined) {
            // Отримуємо поточну книгу для розрахунку змін
            const currentBook = await prisma.book.findUniqueOrThrow({ where: { id } });
            const changeInTotal = totalCopies - currentBook.totalCopies;
            
            // Оновлюємо доступну кількість
            bookUpdate.availableCopies = currentBook.availableCopies + changeInTotal;
            bookUpdate.totalCopies = totalCopies;
        }

        // 3. Логіка оновлення жанрів
        if (genreIds) {
            // Видаляємо старі зв'язки
            await prisma.bookGenre.deleteMany({ where: { bookId: id } });
            
            // Створюємо нові зв'язки
            bookUpdate.bookGenres = {
                create: genreIds.map(genreId => ({
                    genre: { connect: { id: genreId } }
                }))
            };
        }

        const updatedBook = await prisma.book.update({
            where: { id },
            data: bookUpdate,
            select: bookSelect,
        }) as BookWithDetails;

        return updatedBook;
    }

    // ------------------- ВИДАЛЕННЯ (DELETE) -------------------

    public async delete(id: string): Promise<Book> {
        // Prisma видалить зв'язані BookGenre, BorrowedBook, Review, Reservation, FavoriteBook 
        // завдяки CASCADE (див. схему)
        return prisma.book.delete({
            where: { id },
        });
    }
}