export const registerMessageHandlers = (io, socket) => {
  // Khi client join vào conversation
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
  });

  // Khi client rời conversation
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.user.id} left conversation ${conversationId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.id} disconnected`);
  });
};
