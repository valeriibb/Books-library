import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/environment';
import dotenv from 'dotenv';
import passwordRoutes from './routes/password.routes';
import usersRoutes from './routes/users.routes'; // Ця строка має бути

import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/apiError';
// Routes
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/book.routes'; // Добавьте эту строку
import swaggerUi from 'swagger-ui-express';
import prisma from './config/prisma';
import redisClient from './config/redis';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const allowedOrigins = env.CORS_ORIGINS.split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Detailed healthchecks
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
});
app.get('/health/redis', async (req, res) => {
  try {
    const pong = await redisClient.ping();
    return res.status(200).json({ ok: pong === 'PONG' });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
});

// Minimal OpenAPI JSON
const openapi = {
  openapi: '3.0.0',
  info: { title: 'Book Library API', version: '1.0.0' },
  paths: {
    '/health': { get: { responses: { '200': { description: 'OK' } } } },
    '/health/db': { get: { responses: { '200': { description: 'DB OK' }, '500': { description: 'DB Error' } } } },
    '/health/redis': { get: { responses: { '200': { description: 'Redis OK' }, '500': { description: 'Redis Error' } } } },
    '/api/auth/register': {
      post: {
        requestBody: { required: true },
        responses: { '200': { description: 'Registered' }, '400': { description: 'Validation error' } }
      }
    },
    '/api/auth/login': {
      post: {
        requestBody: { required: true },
        responses: { '200': { description: 'Logged in' }, '400': { description: 'Validation error' } }
      }
    },
    '/api/books': {
      get: { responses: { '200': { description: 'List books' } } },
      post: { responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } } }
    },
    '/api/books/{id}': {
      get: { responses: { '200': { description: 'Get book' }, '404': { description: 'Not found' } } },
      put: { responses: { '200': { description: 'Updated' }, '404': { description: 'Not found' } } },
      delete: { responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } } }
    }
  },
};
app.get('/docs/openapi.json', (req, res) => res.json(openapi));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes); 
app.use('/api/auth', passwordRoutes);
app.use('/api/users', usersRoutes); // І ця строка має бути

// 404 handler for all HTTP methods

app.use((req, res, next) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
});
app.use(errorHandler);

export default app;