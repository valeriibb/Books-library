// src/types/book.ts
import { 
    Book, 
    BookStatus, 
    UserRole 
} from '@prisma/client'; 
// ---------------- DTOs для Вхідних Даних ----------------

// Базовий DTO для створення нової книги
export interface CreateBookDto {
    isbn?: string; // Optional
    title: string;
    description?: string;
    coverImage?: string;
    publicationYear?: number;
    publisher?: string;
    language: string;
    pages?: number;
    totalCopies: number;
    // authorId та categoryId будуть оброблятися окремо
    authorId: string;
    categoryId: string;
    // Genres будуть масивом ID
    genreIds: string[]; 
}

// DTO для оновлення книги (усі поля необов'язкові)
export interface UpdateBookDto {
    isbn?: string;
    title?: string;
    description?: string;
    coverImage?: string;
    publicationYear?: number;
    publisher?: string;
    language?: string;
    pages?: number;
    totalCopies?: number;
    status?: BookStatus;
    authorId?: string;
    categoryId?: string;
    genreIds?: string[];
}

// ---------------- DTOs для Вихідних Даних ----------------

// Інтерфейс для книги з розширеними зв'язками
export interface BookWithDetails extends Book {
    author: {
        id: string;
        firstName: string;
        lastName: string;
    };
    category: {
        id: string;
        name: string;
    };
    bookGenres: {
        genre: {
            id: string;
            name: string;
        };
    }[];
}