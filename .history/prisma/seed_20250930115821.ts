import { PrismaClient, UserRole, BookStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for online library...');

  // Очищаем базу данных в правильном порядке (из-за foreign keys)
  await prisma.notification.deleteMany();
  await prisma.favoriteBook.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.borrowedBook.deleteMany();
  await prisma.bookGenre.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Database cleaned');

  // Создаем категории
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Художественная литература',
        description: 'Романы, рассказы, поэзия'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Научная литература',
        description: 'Научные работы и исследования'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Фэнтези и фантастика',
        description: 'Фантастические произведения'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Детективы и триллеры',
        description: 'Детективные истории и триллеры'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Биографии',
        description: 'Биографии известных людей'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Наука и техника',
        description: 'Техническая и научная литература'
      }
    })
  ]);

  console.log('📚 Categories created');

  // Создаем жанры
  const genres = await Promise.all([
    prisma.genre.create({
      data: {
        name: 'Роман',
        description: 'Художественное произведение большого объема'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Поэзия',
        description: 'Стихотворные произведения'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Драма',
        description: 'Драматические произведения'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Фэнтези',
        description: 'Произведения в жанре фэнтези'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Научная фантастика',
        description: 'Фантастика с научным уклоном'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Детектив',
        description: 'Детективные произведения'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Триллер',
        description: 'Триллеры и саспенс'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Исторический',
        description: 'Исторические произведения'
      }
    }),
    prisma.genre.create({
      data: {
        name: 'Приключения',
        description: 'Приключенческая литература'
      }
    })
  ]);

  console.log('🎭 Genres created');

  // Создаем авторов
  const authors = await Promise.all([
    prisma.author.create({
      data: {
        firstName: 'Джордж',
        lastName: 'Оруэлл',
        bio: 'Английский писатель и журналист',
        nationality: 'Британский',
        birthDate: new Date('1903-06-25'),
        deathDate: new Date('1950-01-21'),
      }
    }),
    prisma.author.create({
      data: {
        firstName: 'Джоан',
        lastName: 'Роулинг',
        bio: 'Британская писательница, автор серии романов о Гарри Поттере',
        nationality: 'Британский',
        birthDate: new Date('1965-07-31'),
      }
    }),
    prisma.author.create({
      data: {
        firstName: 'Стивен',
        lastName: 'Кинг',
        bio: 'Американский писатель, работающий в разнообразных жанрах',
        nationality: 'Американский',
        birthDate: new Date('1947-09-21'),
      }
    }),
    prisma.author.create({
      data: {
        firstName: 'Агата',
        lastName: 'Кристи',
        bio: 'Английская писательница, мастер детективного жанра',
        nationality: 'Британский',
        birthDate: new Date('1890-09-15'),
        deathDate: new Date('1976-01-12'),
      }
    }),
    prisma.author.create({
      data: {
        firstName: 'Джон',
        lastName: 'Толкин',
        bio: 'Английский писатель и филолог, автор "Властелина колец"',
        nationality: 'Британский',
        birthDate: new Date('1892-01-03'),
        deathDate: new Date('1973-09-02'),
      }
    })
  ]);

  console.log('✍️ Authors created');

  // Создаем книги
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: '1984',
        isbn: '978-5-699-41355-6',
        description: 'Роман-антиутопия, изображающий тоталитарное общество',
        publicationYear: 1949,
        publisher: 'Secker & Warburg',
        language: 'Русский',
        pages: 328,
        totalCopies: 5,
        availableCopies: 5,
        authorId: authors[0].id,
        categoryId: categories[0].id,
      }
    }),
    prisma.book.create({
      data: {
        title: 'Скотный двор',
        isbn: '978-5-389-06270-9',
        description: 'Сатирическая повесть-притча о революции',
        publicationYear: 1945,
        publisher: 'Secker & Warburg',
        language: 'Русский',
        pages: 144,
        totalCopies: 3,
        availableCopies: 3,
        authorId: authors[0].id,
        categoryId: categories[0].id,
      }
    }),
    prisma.book.create({
      data: {
        title: 'Гарри Поттер и философский камень',
        isbn: '978-5-389-07435-1',
        description: 'Первая книга серии о юном волшебнике Гарри Поттере',
        publicationYear: 1997,
        publisher: 'Bloomsbury',
        language: 'Русский',
        pages: 432,
        totalCopies: 8,
        availableCopies: 8,
        authorId: authors[1].id,
        categoryId: categories[2].id,
      }
    }),
    prisma.book.create({
      data: {
        title: 'Оно',
        isbn: '978-5-17-090765-4',
        description: 'Роман ужасов о древнем зле, терроризирующем город',
        publicationYear: 1986,
        publisher: 'Viking Press',
        language: 'Русский',
        pages: 1248,
        totalCopies: 4,
        availableCopies: 4,
        authorId: authors[2].id,
        categoryId: categories[3].id,
      }
    }),
    prisma.book.create({
      data: {
        title: 'Убийство в Восточном экспрессе',
        isbn: '978-5-699-80666-7',
        description: 'Детективный роман с Эркюлем Пуаро',
        publicationYear: 1934,
        publisher: 'Collins Crime Club',
        language: 'Русский',
        pages: 256,
        totalCopies: 6,
        availableCopies: 6,
        authorId: authors[3].id,
        categoryId: categories[3].id,
      }
    }),
    prisma.book.create({
      data: {
        title: 'Властелин колец: Братство кольца',
        isbn: '978-5-389-08345-2',
        description: 'Первая часть эпической трилогии о Средиземье',
        publicationYear: 1954,
        publisher: 'Allen & Unwin',
        language: 'Русский',
        pages: 576,
        totalCopies: 7,
        availableCopies: 7,
        authorId: authors[4].id,
        categoryId: categories[2].id,
      }
    })
  ]);

  console.log('📖 Books created');

  // Создаем связи книг с жанрами
  await prisma.bookGenre.createMany({
    data: [
      { bookId: books[0].id, genreId: genres[0].id }, // 1984 - Роман
      { bookId: books[0].id, genreId: genres[2].id }, // 1984 - Драма
      { bookId: books[1].id, genreId: genres[0].id }, // Скотный двор - Роман
      { bookId: books[1].id, genreId: genres[2].id }, // Скотный двор - Драма
      { bookId: books[2].id, genreId: genres[3].id }, // Гарри Поттер - Фэнтези
      { bookId: books[2].id, genreId: genres[8].id }, // Гарри Поттер - Приключения
      { bookId: books[3].id, genreId: genres[6].id }, // Оно - Триллер
      { bookId: books[4].id, genreId: genres[5].id }, // Убийство в Восточном экспрессе - Детектив
      { bookId: books[5].id, genreId: genres[3].id }, // Властелин колец - Фэнтези
      { bookId: books[5].id, genreId: genres[8].id }, // Властелин колец - Приключения
    ],
  });

  console.log('🔗 Book genres linked');

  // Хешируем пароли
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);
  const librarianPassword = await bcrypt.hash('lib123', 12);

  // Создаем пользователей
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@library.com',
        password: adminPassword,
        firstName: 'Администратор',
        lastName: 'Библиотеки',
        role: UserRole.ADMIN,
      }
    }),
    prisma.user.create({
      data: {
        email: 'user@library.com',
        password: userPassword,
        firstName: 'Тестовый',
        lastName: 'Пользователь',
        role: UserRole.READER,
      }
    }),
    prisma.user.create({
      data: {
        email: 'librarian@library.com',
        password: librarianPassword,
        firstName: 'Библиотекарь',
        lastName: 'Главный',
        role: UserRole.LIBRARIAN,
      }
    }),
    prisma.user.create({
      data: {
        email: 'reader@library.com',
        password: await bcrypt.hash('reader123', 12),
        firstName: 'Алексей',
        lastName: 'Читатель',
        role: UserRole.READER,
      }
    })
  ]);

  console.log('👥 Users created');

  // Создаем несколько отзывов
  await prisma.review.createMany({
    data: [
      {
        userId: users[1].id,
        bookId: books[0].id,
        rating: 5,
        comment: 'Великолепная антиутопия! Актуально и сегодня.',
        isApproved: true,
      },
      {
        userId: users[1].id,
        bookId: books[2].id,
        rating: 4,
        comment: 'Отличное начало серии, читается на одном дыхании.',
        isApproved: true,
      },
      {
        userId: users[3].id,
        bookId: books[4].id,
        rating: 5,
        comment: 'Классика детективного жанра. Неожиданная развязка!',
        isApproved: true,
      },
    ],
  });

  console.log('💬 Reviews created');

  // Создаем избранные книги
  await prisma.favoriteBook.createMany({
    data: [
      { userId: users[1].id, bookId: books[0].id },
      { userId: users[1].id, bookId: books[2].id },
      { userId: users[3].id, bookId: books[4].id },
      { userId: users[3].id, bookId: books[5].id },
    ],
  });

  console.log('⭐ Favorite books added');

  // Создаем уведомления
  await prisma.notification.createMany({
    data: [
      {
        userId: users[1].id,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Добро пожаловать в библиотеку!',
        message: 'Рады приветствовать вас в нашей онлайн библиотеке.',
        isRead: false,
      },
      {
        userId: users[1].id,
        type: 'DUE_DATE_REMINDER',
        title: 'Напоминание о возврате книги',
        message: 'Не забудьте вернуть книгу "1984" до 25 декабря.',
        isRead: true,
      },
    ],
  });

  console.log('🔔 Notifications created');

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📊 Created data summary:');
  console.log(`   📚 Categories: ${categories.length}`);
  console.log(`   🎭 Genres: ${genres.length}`);
  console.log(`   ✍️ Authors: ${authors.length}`);
  console.log(`   📖 Books: ${books.length}`);
  console.log(`   👥 Users: ${users.length}`);
  console.log('');
  console.log('🔑 Test users:');
  console.log('   Admin: admin@library.com / admin123');
  console.log('   Librarian: librarian@library.com / lib123');
  console.log('   User: user@library.com / user123');
  console.log('   Reader: reader@library.com / reader123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });