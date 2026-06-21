// ⚠️  MUST be the very first thing — load env before any imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { attachCallSignaling } from './src/sockets/call.socket.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Only import app AFTER dotenv has populated process.env
import connectDB from './src/config/db.js';

await connectDB();
const { default: app } = await import('./src/app.js');

const PORT = process.env.PORT || 5000;

// Create a plain HTTP server from the Express app so Socket.IO can attach
// to the SAME port (calling signaling shares the API server — no separate
// process needed).
const server = createServer(app);
attachCallSignaling(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Socket.IO call signaling ready on the same port`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallback = +PORT + 1;
    console.warn(`⚠️  Port ${PORT} busy — retrying on ${fallback}...`);
    server.listen(fallback, () => {
      console.log(`🚀 Server running on port ${fallback}`);
    });
  } else {
    throw err;
  }
});
