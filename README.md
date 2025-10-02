# Book Library API

REST API для керування бібліотекою книг на Node.js + Express + TypeScript з Prisma (PostgreSQL) та Redis для кешу/сесій. Готова OpenAPI документація, health-checkи, Docker-компоуз оточення та юніт/інтеграційні тести на Jest.

## Технології
- **Node.js**, **TypeScript**, **Express**
- **Prisma** (PostgreSQL)
- **Redis** (кеш/перевірки доступності)
- **Jest**, **Supertest** (тести)
- **ESLint**, **Prettier** (якість коду)
- **Swagger UI** (документація)

## Швидкий старт (локально)
1. Встановіть залежності:
   ```bash
   npm install
   ```
2. Створіть файл `.env` в корені проєкту (див. приклад нижче).
3. Згенеруйте Prisma-клієнт та виконайте міграції:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. (Необов'язково) Засійте тестові дані:
   ```bash
   npm run prisma:seed
   ```
5. Запустіть dev-сервер:
   ```bash
   npm run dev
   ```
6. Відкрийте:
   - API: `http://localhost:5000`
   - Документація: `http://localhost:5000/docs`
   - Health: `http://localhost:5000/health`

## Запуск у Docker
Проєкт містить `docker-compose.yml` з сервісами: `app`, `db` (Postgres 15), `redis` (Redis 7-alpine).

1. Запустити:
   ```bash
   npm run docker:up
   ```
2. Зупинити:
   ```bash
   npm run docker:down
   ```

Порти за замовчуванням:
- App: `5000:5000`
- Postgres: `5432:5432`
- Redis: `6379:6379`

У `docker-compose.yml` змінні середовища для `app` включають:
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://postgres:password@host.docker.internal:5432/book_library`
- `REDIS_URL=redis://redis:6379`

За потреби змініть `DATABASE_URL` під свою локальну конфігурацію.

## Файл .env (приклад)
Змінні визначені у `src/config/environment.ts` через `envalid`:
```env
# Основні
NODE_ENV=development
PORT=5000

# База даних
DATABASE_URL=postgresql://postgres:password@localhost:5432/book_library

# Redis
REDIS_URL=redis://localhost:6379

# JWT секрети
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# CORS (кома-сепарований список або *)
CORS_ORIGINS=*
```

## Prisma: міграції та сид
- Згенерувати клієнт: `npm run prisma:generate`
- Створити/застосувати dev-міграції: `npm run prisma:migrate`
- Скинути схему (dev): `npm run prisma:reset`
- Відкрити Prisma Studio: `npm run prisma:studio`
- Засіяти дані: `npm run prisma:seed`

Схема знаходиться в `prisma/schema.prisma`. Основні моделі: `User`, `Author`, `Book`, `Category`, `Genre`, `BookGenre`, `BorrowedBook`, `Review`, `Reservation`, `FavoriteBook`, `Notification`, `RefreshToken`, `PasswordResetToken`.

## Скрипти npm
Див. `package.json`:
- `dev` – запуск у dev-режимі (`nodemon src/server.ts`)
- `build` – компіляція TypeScript у `dist/`
- `start` – запуск зібраної версії (`node dist/server.js`)
- `lint` / `lint:fix` – перевірка якості коду
- `format` – форматування Prettier
- `test`, `test:watch` – юніт/інтеграційні тести
- `prisma:*` – робота з Prisma
- `docker:up`, `docker:down`, `docker:logs` – керування Docker Compose

## Маршрути та документація API
Сервер ініціалізується у `src/server.ts`, застосунок – у `src/app.ts`.

- **Health**
  - `GET /health` – базова перевірка
  - `GET /health/db` – доступність Postgres
  - `GET /health/redis` – доступність Redis

- **Документація**
  - Swagger UI: `GET /docs`
  - OpenAPI JSON: `GET /docs/openapi.json`

- **Auth** (`src/routes/auth.routes.ts`)
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - Додаткові ендпоїнти для відновлення паролю: `src/routes/password.routes.ts` (підключено на `/api/auth`)

- **Books** (`src/routes/book.routes.ts`)
  - `GET /api/books`
  - `POST /api/books`
  - `GET /api/books/:id`
  - `PUT /api/books/:id`
  - `DELETE /api/books/:id`

- **Users** (`src/routes/users.routes.ts`)
  - Підключено на префіксі `/api/users`

Примітка: мінімальне OpenAPI визначене безпосередньо в `src/app.ts` (шлях `/docs`/`/docs/openapi.json`).

## Перевірка доступності
Після запуску ви побачите лог-підказки в консолі, наприклад:
```
Server running on port 5000
Health: http://localhost:5000/health
Auth: http://localhost:5000/api/auth
Books: http://localhost:5000/api/books
Redis: connected
```

## Тести
Запустити всі тести:
```bash
npm test
```
Запустити у вотч-режимі:
```bash
npm run test:watch
```
Інтеграційні та юніт тести знаходяться у `tests/`.

## Якість коду
```bash
npm run lint
npm run lint:fix
npm run format
```

## Корисні посилання
- `src/app.ts` – middleware, health, swagger та підключення маршрутів
- `src/server.ts` – точка входу сервера
- `src/config/environment.ts` – змінні середовища (envalid)
- `src/config/prisma.ts` – ініціалізація Prisma
- `src/config/redis.ts` – клієнт Redis
- `prisma/schema.prisma` – моделі БД
- `docker-compose.yml` – Docker сервіси

## Ліцензія
ISC (див. `package.json`).

