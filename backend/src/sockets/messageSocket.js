export const registerMessageHandlers = (io, socket) => {
  // Khi client join vào conversation
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });
};
