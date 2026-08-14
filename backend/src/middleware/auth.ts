import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import db from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

export const generateToken = (userId: number, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, email, full_name, role, kyc_status FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
