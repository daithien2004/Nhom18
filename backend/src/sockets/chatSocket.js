export function registerChatHandlers(io, socket) {
  try {
    console.log(`User ${socket.user.id} connected to chat`);

    // Join conversation
    socket.on('joinConversation', (conversationId) => {
      if (!conversationId) {
        socket.emit('error', { message: 'conversationId is required' });
        return;
      }
      socket.join(conversationId);
      console.log(
        `User ${socket.user.id} joined conversation ${conversationId}`
      );
    });

    // Leave conversation
    socket.on('leaveConversation', (conversationId) => {
      if (!conversationId) {
        socket.emit('error', { message: 'conversationId is required' });
        return;
      }
      socket.leave(conversationId);
      console.log(`User ${socket.user.id} left conversation ${conversationId}`);
    });

    // Handle errors
    socket.on('error', (err) => {
      console.error(`Socket error for user ${socket.user.id}:`, err);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.id} disconnected from chat`);
    });
  } catch (err) {
    console.error(
      `Error in registerChatHandlers for user ${socket.user.id}:`,
      err
    );
    socket.emit('error', { message: 'Internal server error' });
  }
}
