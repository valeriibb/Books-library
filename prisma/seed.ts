// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Спочатку створюємо автора
  const author = await prisma.author.upsert({
    where: { id: '1' },
    update: {},
    create: {
      firstName: 'Джоан',
      lastName: 'Роулінг',
      bio: 'Британська письменниця, автор серії книг про Гаррі Поттера'
    }
  })

  // Створюємо категорію
  const category = await prisma.category.upsert({
    where: { id: '1' },
    update: {},
    create: {
      name: 'Фентезі',
      description: 'Книги у жанрі фентезі'
    }
  })

  // Створюємо книги
  const books = await prisma.book.createMany({
    data: [
      {
        title: 'Гаррі Поттер і філософський камінь',
        authorId: author.id,
        categoryId: category.id,
        totalCopies: 10,
        availableCopies: 8,
        description: 'Перша книга про Гаррі Поттера',
        isbn: '978-966-10-0128-4',
        publicationYear: 1997,
        publisher: 'А-БА-БА-ГА-ЛА-МА-ГА',
        language: 'Ukrainian',
        pages: 320
      },
      {
        title: 'Гаррі Поттер і тайна кімната', 
        authorId: author.id,
        categoryId: category.id,
        totalCopies: 8,
        availableCopies: 6,
        description: 'Друга книга серії',
        isbn: '978-966-10-0129-1',
        publicationYear: 1998,
        publisher: 'А-БА-БА-ГА-ЛА-МА-ГА',
        language: 'Ukrainian',
        pages: 352
      },
      {
        title: 'Володар перснів: Братство персня',
        authorId: '2',
        categoryId: category.id,
        totalCopies: 5,
        availableCopies: 3,
        description: 'Перша частина епопеї Толкіна',
        isbn: '978-617-12-1234-5',
        publicationYear: 1954,
        publisher: 'Видавництво Старого Лева',
        language: 'Ukrainian', 
        pages: 480
      }
    ]
  })

  console.log('✅ Books seeded successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })