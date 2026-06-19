// ⚠️  MUST be the very first thing — load env before any imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Only import app AFTER dotenv has populated process.env
const { default: app } = await import('./src/app.js');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 EM Dashboard Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallback = +PORT + 1;
    console.warn(`⚠️  Port ${PORT} busy — retrying on ${fallback}...`);
    app.listen(fallback, () => {
      console.log(`🚀 Server running on port ${fallback}`);
    });
  } else {
    throw err;
  }
});