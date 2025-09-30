// src/app.ts
import express, { Application, Request, Response } from 'express';
import authRouter from './routes/auth.routes';

const app: Application = express();
const PORT = 3000; 

app.get('/', (req: Request, res: Response) => {
    res.send('API is running!');
});

app.use('/api/auth', authRouter); // ✅ Додаємо маршрути авторизації

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); 
});

