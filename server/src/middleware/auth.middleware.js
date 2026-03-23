/**
 * auth.middleware.js
 * Place: server/src/middleware/auth.middleware.js
 *
 * Verifies JWT and attaches decoded payload to req.user:
 *   req.user.userId    — set for citizens
 *   req.user.adminId   — set for admins
 *   req.user.role      — 'citizen' | 'district' | 'state' | 'central'
 *   req.user.state     — admin's state (null for citizen/central)
 *   req.user.district  — admin's district (null for citizen/central/state)
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nagarikconnect_dev_secret';

export const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token — include Authorization: Bearer <token>' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // Normalise: both citizen and admin have req.user.role
    if (!req.user.role) req.user.role = 'citizen';
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Token expired — please login again'
      : 'Invalid token';
    return res.status(401).json({ error: msg });
  }
};

// Convenience: require specific roles
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ error: `Access denied. Required: ${roles.join(' | ')}` });
  next();
};