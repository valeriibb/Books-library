// src/app.ts
import express, { Application, Request, Response } from 'express';

const app: Application = express();
const PORT = 3000; // або інший порт

// Додайте тут ваші мідлвери та роути
app.get('/', (req: Request, res: Response) => {
    res.send('API is running!');
});

// 💡 КРИТИЧНО ВАЖЛИВО: Виклик .listen()
app.listen(PORT, () => {
    // Якщо цей console.log не з'являється, сервер не слухає
    console.log(`Server running on port ${PORT}`); 
});

// Якщо ви експортуєте додаток, переконайтеся, що ви його запускаєте в іншому файлі
// export default app;