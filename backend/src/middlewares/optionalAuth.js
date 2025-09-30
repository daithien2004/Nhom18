import { verifyToken } from '../utils/verifyToken.js';

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      try {
        req.user = verifyToken(token);
      } catch (err) {
        req.user = null; // token sai thì vẫn cho qua
      }
    } else {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

export default optionalAuth;
