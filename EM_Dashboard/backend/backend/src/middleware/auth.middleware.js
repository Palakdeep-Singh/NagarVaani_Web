import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export const protect = requireAuth;
// Export role middleware for convenience
export { requireRole } from './role.middleware.js';