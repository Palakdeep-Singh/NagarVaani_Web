
/**
 * Middleware to enforce that the authenticated user has one of the allowed roles.
 * Usage: `app.get('/admin', requireAuth, requireRole(['CEO', 'DEO']), handler)`
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({ error: 'User role missing from token' });
    }
    if (!Array.isArray(allowedRoles)) {
      allowedRoles = [allowedRoles];
    }
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};
