import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

// In-memory map of role identity -> socket id
const activeUsers: Record<string, string> = {};
let ioInstance: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('register', (userId: string) => {
      if (!userId) return;
      activeUsers[userId] = socket.id;
      console.log(`Registered "${userId}" -> socket ${socket.id}`);
    });

    // Relay any WebRTC or calling signaling payload to its receiver
    socket.on('signal', (payload: any) => {
      const receiver = payload?.receiver;
      if (!receiver || !receiver.id) return;

      const targetSocketId = activeUsers[receiver.id];
      if (targetSocketId) {
        io.to(targetSocketId).emit('signal', payload);
        console.log(`Relayed signal [${payload.type}] -> "${receiver.id}"`);
      } else {
        console.log(`Warning: "${receiver.id}" offline — signal [${payload.type}] dropped`);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sid] of Object.entries(activeUsers)) {
        if (sid === socket.id) {
          delete activeUsers[userId];
          console.log(`"${userId}" disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

// Helper to notify a specific user of a real-time event (e.g. new chat message)
export const sendEventToUser = (userId: string, event: string, payload: any): boolean => {
  if (!ioInstance) return false;
  const socketId = activeUsers[userId];
  if (socketId) {
    ioInstance.to(socketId).emit(event, payload);
    console.log(`Event "${event}" sent to "${userId}"`);
    return true;
  }
  return false;
};

