/**
 * call.socket.js
 * Place: server/src/sockets/call.socket.js
 *
 * Attaches Socket.IO to the existing HTTP server and relays calling
 * signals (register / call_init / call_accept / call_reject / call_hangup /
 * call_busy / webrtc_offer / webrtc_answer / webrtc_ice) between connected
 * clients. No audio/video ever passes through this server — only small
 * JSON signaling messages. WebRTC media is peer-to-peer between browsers.
 *
 * Identities are the calling-side "id" the client registers with (in the
 * dashboard this is the user's role label, e.g. "Chief Minister",
 * "New Delhi DM" — see client src/utils/helper.ts getRoleLabel()).
 */
import { Server as SocketIOServer } from 'socket.io';

// In-memory map of identity -> socket id. A user can only be connected from
// one tab/device at a time; the latest registration wins.
const activeUsers = {};

export function attachCallSignaling(httpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [call] socket connected: ${socket.id}`);

    socket.on('register', (userId) => {
      if (!userId) return;
      activeUsers[userId] = socket.id;
      console.log(`👤 [call] registered "${userId}" → socket ${socket.id}`);
    });

    // Relay any signaling payload to its intended receiver only.
    socket.on('signal', (payload) => {
      const receiver = payload?.receiver;
      if (!receiver || !receiver.id) return;

      const targetSocketId = activeUsers[receiver.id];
      if (targetSocketId) {
        io.to(targetSocketId).emit('signal', payload);
        console.log(`📨 [call] [${payload.type}] → "${receiver.id}" (socket ${targetSocketId})`);
      } else {
        console.log(`⚠️  [call] "${receiver.id}" not online — dropped [${payload.type}]`);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sid] of Object.entries(activeUsers)) {
        if (sid === socket.id) {
          delete activeUsers[userId];
          console.log(`❌ [call] "${userId}" disconnected`);
          break;
        }
      }
    });
  });

  return io;
}
