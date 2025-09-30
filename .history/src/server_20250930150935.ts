import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Auth API: http://localhost:${PORT}/api/auth`);
});