// src/app.ts
import express, { Application } from 'express';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes'; // ✅ ПЕРЕВІРТЕ, що цей файл існує та експортує default!

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Маршрути
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter); 


export default app;