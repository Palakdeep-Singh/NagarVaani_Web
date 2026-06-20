/**
 * Standalone Call Signaling Server
 * Relays Socket.IO signaling messages between clients for WebRTC connection setup.
 */
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'calling-signaling-server' });
});

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Allow all origins for easier integration, restrict this in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Map of user identity/role to socket ID
const activeUsers = {};

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Register user identity (e.g. role name or user ID)
  socket.on('register', (userId) => {
    if (!userId) return;
    activeUsers[userId] = socket.id;
    console.log(`👤 Registered "${userId}" -> Socket ${socket.id}`);
  });

  // Relay WebRTC signaling and call state signals
  socket.on('signal', (payload) => {
    const receiver = payload?.receiver;
    if (!receiver || !receiver.id) return;

    const targetSocketId = activeUsers[receiver.id];
    if (targetSocketId) {
      io.to(targetSocketId).emit('signal', payload);
      console.log(`📨 [${payload.type}] Relay to "${receiver.id}"`);
    } else {
      console.log(`⚠️  "${receiver.id}" offline. Dropped [${payload.type}]`);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of Object.entries(activeUsers)) {
      if (sid === socket.id) {
        delete activeUsers[userId];
        console.log(`❌ "${userId}" disconnected`);
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Call Signaling Server running on port ${PORT}`);
  console.log(`📡 Socket.IO relay endpoint ready`);
});
