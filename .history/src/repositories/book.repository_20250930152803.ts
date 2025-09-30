import { PrismaClient, BookStatus, Prisma } from '@prisma/client';

type BookStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'MAINTENANCE' | 'LOST';

const prisma = new PrismaClient();

export class BookRepository {
  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    author?: string;
    category?: string;
    genre?: string;
    status?: BookStatus;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      search,
      author,
      category,
      genre,
      status,
      sortBy,
      sortOrder
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.BookWhereInput = {};

    // Search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by author
    if (author) {
      where.author = {
        OR: [
          { firstName: { contains: author, mode: 'insensitive' } },
          { lastName: { contains: author, mode: 'insensitive' } }
        ]
      };
    }

    // Filter by category
    if (category) {
      where.category = {
        name: { contains: category, mode: 'insensitive' }
      };
    }

    // Filter by genre
    if (genre) {
      where.bookGenres = {
        some: {
          genre: {
            name: { contains: genre, mode: 'insensitive' }
          }
        }
      };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          bookGenres: {
            include: {
              genre: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              reviews: true,
              borrowed: {
                where: {
                  status: 'BORROWED'
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.book.count({ where })
    ]);

    return {
      books,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            nationality: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        bookGenres: {
          include: {
            genre: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          where: {
            isApproved: true
          }
        },
        _count: {
          select: {
            borrowed: {
              where: {
                status: 'BORROWED'
              }
            },
            favorites: true
          }
        }
      }
    });
  }

  async create(data: {
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
    authorId: string;
    categoryId: string;
    genreIds?: string[];
  }) {
    const { genreIds, ...bookData } = data;

    return prisma.book.create({
      data: {
        ...bookData,
        bookGenres: genreIds ? {
          create: genreIds.map(genreId => ({
            genre: { connect: { id: genreId } }
          }))
        } : undefined
      },
      include: {
        author: true,
        category: true,
        bookGenres: {
          include: {
            genre: true
          }
        }
      }
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    isbn?: string;
    coverImage?: string;
    publicationYear?: number;
    publisher?: string;
    language?: string;
    pages?: number;
    totalCopies?: number;
    availableCopies?: number;
    authorId?: string;
    categoryId?: string;
    genreIds?: string[];
  }) {
    const { genreIds, ...bookData } = data;

    // If updating genres, replace all existing ones
    const genreOperations = genreIds ? {
      deleteMany: {},
      create: genreIds.map(genreId => ({
        genre: { connect: { id: genreId } }
      }))
    } : undefined;

    return prisma.book.update({
      where: { id },
      data: {
        ...bookData,
        bookGenres: genreOperations
      },
      include: {
        author: true,
        category: true,
        bookGenres: {
          include: {
            genre: true
          }
        }
      }
    });
  }

  async delete(id: string) {
    // Delete related records first
    await prisma.bookGenre.deleteMany({
      where: { bookId: id }
    });

    await prisma.review.deleteMany({
      where: { bookId: id }
    });

    await prisma.favoriteBook.deleteMany({
      where: { bookId: id }
    });

    await prisma.borrowedBook.deleteMany({
      where: { bookId: id }
    });

    await prisma.reservation.deleteMany({
      where: { bookId: id }
    });

    return prisma.book.delete({
      where: { id }
    });
  }

  async updateAvailableCopies(bookId: string, change: number) {
    return prisma.book.update({
      where: { id: bookId },
      data: {
        availableCopies: {
          increment: change
        },
        status: {
          // Update status based on available copies
          set: change > 0 ? 'AVAILABLE' : 'BORROWED'
        }
      }
    });
  }
}