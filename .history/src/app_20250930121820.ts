import authRoutes from './routes/auth.routes';

// ... после инициализации express
app.use('/api/auth', authRoutes);