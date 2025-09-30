// server/src/server.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import bookRouter from './routes/book.routes'; // Припускаємо, що роутер буде тут

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware для обробки JSON-запитів

// Підключення роутів
app.use('/api/books', bookRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Book Library API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});