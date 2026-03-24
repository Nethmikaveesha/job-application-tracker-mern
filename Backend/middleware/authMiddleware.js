import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfiguration' });
    }
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function loadUser(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load user' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
