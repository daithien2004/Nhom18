export function registerNotificationHandlers(io, socket) {
  try {
    console.log(`User ${socket.user.id} connected to notifications`);

    socket.join(socket.user.id);
    console.log(`User ${socket.user.id} joined notifications room`);

    // Handle errors
    socket.on('error', (err) => {
      console.error(`Socket error for user ${socket.user.id}:`, err);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.id} disconnected from notifications`);
    });
  } catch (err) {
    console.error(
      `Error in registerNotificationHandlers for user ${socket.user.id}:`,
      err
    );
    socket.emit('error', { message: 'Internal server error' });
  }
}
