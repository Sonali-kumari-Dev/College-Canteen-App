import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware.js';

const router = Router();

// GET /api/feedback (Admin only)
router.get('/', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const feedbacks = db.getFeedbacks(orgId);
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// POST /api/feedback (Student submits feedback)
router.post('/', authMiddleware, requireRole('STUDENT'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const { orderId, rating, comment } = req.body;

    if (!orderId) {
      res.status(400).json({ message: 'Order reference is required.' });
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ message: 'Rating must be a whole number between 1 and 5.' });
      return;
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      res.status(400).json({ message: 'Please provide a feedback comment.' });
      return;
    }

    // Check order belongs to user and exists
    const order = db.findOrderById(orderId, orgId);
    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (order.userId !== req.user!.userId) {
      res.status(403).json({ message: 'You can only leave feedback on your own orders.' });
      return;
    }

    // Check if feedback already submitted for this order
    const existing = db.findFeedbackByOrderId(orderId, orgId);
    if (existing) {
      res.status(400).json({ message: 'Feedback has already been submitted for this order.' });
      return;
    }

    const user = db.findUserById(req.user!.userId);
    const feedback = db.createFeedback({
      orderId,
      userId: req.user!.userId,
      userName: user ? user.name : 'Student',
      rating: Math.round(numRating),
      comment: comment.trim(),
      organizationId: orgId,
    });

    res.status(201).json({ message: 'Thank you! Your feedback has been submitted.', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

export default router;
