let io;

function initSocket(server) {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on('join_room', userId => socket.join(`user_${userId}`));

    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

module.exports = { initSocket, getIO };
