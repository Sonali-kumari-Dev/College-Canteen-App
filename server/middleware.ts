import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'canteenx_super_secret_jwt_key_2026';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'KITCHEN';
  organizationId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. Please log in.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authentication token missing.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    if (!decoded || !decoded.userId || !decoded.organizationId) {
      res.status(401).json({ message: 'Invalid token structure. Please log in again.' });
      return;
    }

    // Verify user still exists in database
    const user = db.findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User account not found. Please log in again.' });
      return;
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Session expired. Please log in again.' });
      return;
    }
    res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(...allowedRoles: Array<'STUDENT' | 'ADMIN' | 'KITCHEN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Forbidden: Access restricted to ${allowedRoles.join(' or ')} only.`,
      });
      return;
    }

    next();
  };
}
