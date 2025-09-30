// server.ts
import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Express Server in TypeScript!');
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    version: '1.0.0' 
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});