import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware.js';

const router = Router();

// GET /api/admin/dashboard
router.get('/dashboard', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const stats = db.getDashboardStats(orgId);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// GET /api/admin/reports
router.get('/reports', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const reports = db.getReports(orgId);
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// GET /api/admin/users
router.get('/users', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const users = db.getUsersByOrganization(orgId).map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt,
    }));
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

export default router;
