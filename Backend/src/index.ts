import { createServer } from 'http';
import app from './app';
import { connectDB } from './config/db';
import { seedDatabase } from './utils/seed';
import { initSocket } from './sockets/socket';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Auto-seed if database is empty
    await seedDatabase();

    // 3. Create HTTP Server
    const server = createServer(app);

    // 4. Initialize Socket.IO
    initSocket(server);

    // 5. Start listening
    server.listen(PORT, () => {
      console.log(`NagarVaani API Server listening on port ${PORT}`);
      console.log(`Socket.IO signaling & notifications active on the same port`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        const fallback = +PORT + 1;
        console.warn(`Port ${PORT} busy — retrying on fallback port ${fallback}...`);
        server.listen(fallback, () => {
          console.log(`Server running on port ${fallback}`);
        });
      } else {
        throw err;
      }
    });


  } catch (error) {
    console.error('Fatal: Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
