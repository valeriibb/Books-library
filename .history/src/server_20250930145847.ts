// server.ts
import express, { Request, Response } from 'express';

const app = express();
const port = 5000;
require('dotenv').config();

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