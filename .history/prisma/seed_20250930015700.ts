import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Создаем категории
  const categories = await prisma.category.createManyAndReturn({
    data: [
      { name: 'Художественная литература', description: 'Романы, рассказы, поэзия' },
      { name: 'Научная литература', description: 'Научные работы и исследования' },
      { name: 'Фэнтези и фантастика', description: 'Фантастические произведения' },
      { name: 'Детективы и триллеры', description: 'Детективные истории и триллеры' },
      { name: 'Биографии', description: 'Биографии известных людей' },
      { name: 'Наука и техника', description: 'Техническая и научная литература' },
    ],
  });

  // Создаем жанры
  const genres = await prisma.genre.createManyAndReturn({
    data: [
      { name: 'Роман', description: 'Художественное произведение большого объема' },
      { name: 'Поэзия', description: 'Стихотворные произведения' },
      { name: 'Драма', description: 'Драматические произведения' },
      { name: 'Фэнтези', description: 'Произведения в жанре фэнтези' },
      { name: 'Научная фантастика', description: 'Фантастика с научным уклоном' },
      { name: 'Детектив', description: 'Детективные произведения' },
      { name: 'Триллер', description: 'Триллеры и саспенс' },
      { name: 'Исторический', description: 'Исторические произведения' },
      { name: 'Приключения', description: 'Приключенческая литература' },
    ],
  });

  // Создаем авторов
  const authors = await prisma.author.createManyAndReturn({
    data: [
      {
        firstName: 'Джордж',
        lastName: 'Оруэлл',
        bio: 'Английский писатель и журналист',
        nationality: 'Британский',
        birthDate: new Date('1903-06-25'),
        deathDate: new Date('1950-01-21'),
      },
      {
        firstName: 'Джоан',
        lastName: 'Роулинг',
        bio: 'Британская писательница, автор серии романов о Гарри Поттере',
        nationality: 'Британский',
        birthDate: new Date('1965-07-31'),
      },
      {
        firstName: 'Стивен',
        lastName: 'Кинг',
        bio: 'Американский писатель, работающий в разнообразных жанрах',
        nationality: 'Американский',
        birthDate: new Date('1947-09-21'),
      },
      {
        firstName: 'Агата',
        lastName: 'Кристи',
        bio: 'Английская писательница, мастер детективного жанра',
        nationality: 'Британский',
        birthDate: new Date('1890-09-15'),
        deathDate: new Date('1976-01-12'),
      },
    ],
  });

  // Создаем книги
  const books = await prisma.book.createManyAndReturn({
    data: [
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
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
      },
    ],
  });

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
    ],
  });

  // Создаем администратора
  await prisma.user.create({
    data: {
      email: 'admin@library.com',
      password: '$2b$10$ExampleHashedPassword123', // В реальности нужно хешировать
      firstName: 'Администратор',
      lastName: 'Библиотеки',
      role: 'ADMIN',
    },
  });

  console.log(' Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });