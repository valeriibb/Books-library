// Avoid importing Prisma model types directly here to prevent coupling
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
    status?: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'MAINTENANCE' | 'LOST';
    authorId?: string;
    categoryId?: string;
    genreIds?: string[];
}

// ---------------- DTOs для Вихідних Даних ----------------

export interface BookWithDetails {
    id: string;
    title: string;
    description?: string;
    isbn?: string;
    coverImage?: string;
    publicationYear?: number;
    publisher?: string;
    language: string;
    pages?: number;
    totalCopies: number;
    availableCopies: number;
    status?: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'MAINTENANCE' | 'LOST';
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