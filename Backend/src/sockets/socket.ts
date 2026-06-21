import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

// In-memory map of role identity -> socket id
const activeUsers: Record<string, string> = {};

// Pending call_init signals for users who are offline or disconnected.
// Keyed by receiver.id, value is the most recent call_init payload.
const pendingCalls: Record<string, any> = {};

let ioInstance: SocketIOServer | null = null;

/** Remove any pending call aimed at `targetId` (called when call is answered/rejected/cancelled). */
const clearPendingCall = (targetId: string) => {
  if (pendingCalls[targetId]) {
    delete pendingCalls[targetId];
    console.log(`Cleared pending call for "${targetId}"`);
  }
};

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

      // Deliver any pending call_init that was waiting for this user to come online
      if (pendingCalls[userId]) {
        const pending = pendingCalls[userId];
        console.log(`Delivering pending call_init to "${userId}" from "${pending.sender?.id}"`);
        socket.emit('signal', pending);
        // Keep the pending call in case they refresh again — only remove on accept/reject/hangup
      }
    });

    // Client can explicitly request pending calls (e.g. after page refresh)
    socket.on('query_pending_call', (userId: string) => {
      if (!userId) return;
      if (pendingCalls[userId]) {
        socket.emit('signal', pendingCalls[userId]);
        console.log(`Re-delivered pending call to "${userId}" on query`);
      }
    });

    // Relay any WebRTC or calling signaling payload to its receiver
    socket.on('signal', (payload: any) => {
      const receiver = payload?.receiver;
      const sender = payload?.sender;
      if (!receiver || !receiver.id) return;

      const type: string = payload.type;

      // For call-ending events, remove the pending call regardless of who is online
      if (type === 'call_reject' || type === 'call_hangup' || type === 'call_busy') {
        // Clear pending call for the receiver (the original callee)
        clearPendingCall(receiver.id);
        // Also clear if the caller is hanging up on a pending outgoing call
        if (sender?.id) clearPendingCall(sender.id);
      }

      // If a call was accepted, remove the pending entry
      if (type === 'call_accept') {
        if (sender?.id) clearPendingCall(sender.id);
        if (receiver?.id) clearPendingCall(receiver.id);
      }

      const targetSocketId = activeUsers[receiver.id];
      if (targetSocketId) {
        io.to(targetSocketId).emit('signal', payload);
        console.log(`Relayed signal [${type}] -> "${receiver.id}"`);
      } else {
        // Receiver is offline — store call_init for later delivery
        if (type === 'call_init') {
          pendingCalls[receiver.id] = payload;
          console.log(`"${receiver.id}" offline — stored pending call_init from "${sender?.id}"`);
        } else {
          console.log(`Warning: "${receiver.id}" offline — signal [${type}] dropped`);
        }
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sid] of Object.entries(activeUsers)) {
        if (sid === socket.id) {
          delete activeUsers[userId];
          console.log(`"${userId}" disconnected`);
          // Note: we do NOT clear pendingCalls here so they can receive the call on reconnect
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
