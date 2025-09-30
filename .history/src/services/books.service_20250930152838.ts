import { BookRepository } from '../repositories/book.repository';

const bookRepository = new BookRepository();

export interface BookResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class BooksService {
  async getAllBooks(queryParams: any): Promise<BookResponse> {
    try {
      const result = await bookRepository.findAll(queryParams);

      return {
        success: true,
        message: 'Books retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get all books error:', error);
      return {
        success: false,
        message: 'Error retrieving books'
      };
    }
  }

  async getBookById(id: string): Promise<BookResponse> {
    try {
      const book = await bookRepository.findById(id);

      if (!book) {
        return {
          success: false,
          message: 'Book not found'
        };
      }

      return {
        success: true,
        message: 'Book retrieved successfully',
        data: book
      };
    } catch (error) {
      console.error('Get book by ID error:', error);
      return {
        success: false,
        message: 'Error retrieving book'
      };
    }
  }

  async createBook(bookData: any): Promise<BookResponse> {
    try {
      // Set available copies equal to total copies for new books
      const dataWithAvailableCopies = {
        ...bookData,
        availableCopies: bookData.totalCopies || 1
      };

      const book = await bookRepository.create(dataWithAvailableCopies);

      return {
        success: true,
        message: 'Book created successfully',
        data: book
      };
    } catch (error) {
      console.error('Create book error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint')) {
          return {
            success: false,
            message: 'Book with this ISBN already exists'
          };
        }
      }

      return {
        success: false,
        message: 'Error creating book'
      };
    }
  }

  async updateBook(id: string, bookData: any): Promise<BookResponse> {
    try {
      const existingBook = await bookRepository.findById(id);
      
      if (!existingBook) {
        return {
          success: false,
          message: 'Book not found'
        };
      }

      // If totalCopies is updated, adjust availableCopies accordingly
      if (bookData.totalCopies !== undefined) {
        const difference = bookData.totalCopies - (existingBook as any).totalCopies;
        bookData.availableCopies = (existingBook as any).availableCopies + difference;
        
        // Ensure availableCopies doesn't go negative
        if (bookData.availableCopies < 0) {
          bookData.availableCopies = 0;
        }
      }

      const book = await bookRepository.update(id, bookData);

      return {
        success: true,
        message: 'Book updated successfully',
        data: book
      };
    } catch (error) {
      console.error('Update book error:', error);
      return {
        success: false,
        message: 'Error updating book'
      };
    }
  }

  async deleteBook(id: string): Promise<BookResponse> {
    try {
      const existingBook = await bookRepository.findById(id);
      
      if (!existingBook) {
        return {
          success: false,
          message: 'Book not found'
        };
      }

      // Check if book has active borrows
      if ((existingBook as any).availableCopies < (existingBook as any).totalCopies) {
        return {
          success: false,
          message: 'Cannot delete book with active borrows'
        };
      }

      await bookRepository.delete(id);

      return {
        success: true,
        message: 'Book deleted successfully'
      };
    } catch (error) {
      console.error('Delete book error:', error);
      return {
        success: false,
        message: 'Error deleting book'
      };
    }
  }
}