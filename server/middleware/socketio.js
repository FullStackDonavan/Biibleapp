// server/middleware/socketio.js
import { Server } from 'socket.io';

let io;

export default eventHandler(async (event) => {
  if (!event.node.res.socket?.server) return;

  if (!io) {
    io = new Server(event.node.res.socket.server, {
      transports: ['websocket', 'polling'],
    });

    const apiNamespace = io.of('/api/socket.io');

    apiNamespace.on('connection', (socket) => {
      console.log(`[Socket.IO] New connection: ${socket.id}`);

      socket.on('join', (data) => {
        console.log(`[Socket.IO] User joined: ${socket.id}`);
        // You can optionally add rooms or stream ID logic here
        socket.broadcast.emit('join', data);
      });

      socket.on('offer', (offer) => {
        console.log(`[Socket.IO] Offer from ${socket.id}:`, JSON.stringify(offer, null, 2));
        socket.broadcast.emit('offer', offer);
      });

      socket.on('answer', (answer) => {
        console.log(`[Socket.IO] Answer from ${socket.id}:`, JSON.stringify(answer, null, 2));
        socket.broadcast.emit('answer', answer);
      });

      socket.on('ice-candidate', (candidate) => {
        console.log(`[Socket.IO] ICE candidate from ${socket.id}:`, JSON.stringify(candidate, null, 2));
        socket.broadcast.emit('ice-candidate', candidate);
      });

      socket.on('disconnect', (reason) => {
        console.log(`[Socket.IO] User disconnected: ${socket.id} (${reason})`);
      });

      socket.on('error', (err) => {
        console.error(`[Socket.IO] Error from ${socket.id}:`, err);
      });
    });

    console.log('[Socket.IO] Server initialized');
  }
});
