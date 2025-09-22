import { verifyToken } from '../utils/verifyToken.js';

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Token không được cung cấp'));
  }

  try {
    socket.user = verifyToken(token); // gắn user vào socket
    next();
  } catch (err) {
    next(new Error(err.message));
  }
};

export default socketAuth;
