import app from './app';

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`👤 Users: http://localhost:${PORT}/api/users`);
  });