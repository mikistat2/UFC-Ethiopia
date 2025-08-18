// Socket.io server setup for UFC live comments
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './index.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('new-comment', (comment) => {
    // Broadcast the new comment to all clients
    io.emit('new-comment', comment);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export { httpServer, io };
