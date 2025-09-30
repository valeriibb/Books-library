const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello Express Server!');
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', code: 200 });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});