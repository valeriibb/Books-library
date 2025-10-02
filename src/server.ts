import dotenv from 'dotenv';

// Завантажуємо змінні середовища НАЙПЕРШ
dotenv.config();

import app from './app';
import { connectRedis } from './config/redis';
import env from './config/environment';

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Підключити Redis
    await connectRedis();
    
    // Запустити сервер
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
        console.log(` Health: http://localhost:${PORT}/health`);
      console.log(` Auth: http://localhost:${PORT}/api/auth`);
      console.log(` Books: http://localhost:${PORT}/api/books`);
      console.log(` Redis: connected`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const shutdown = async () => {
  try {
    console.log('Shutting down gracefully...');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);