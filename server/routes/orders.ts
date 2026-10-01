import { Router, Response } from 'express';
import { db, OrderStatus, IOrderItem } from '../db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware.js';

const router = Router();

// GET /api/orders
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const { status } = req.query;

    let orders;
    if (req.user!.role === 'STUDENT') {
      // Students only see their own orders
      orders = db.getOrders(orgId, {
        userId: req.user!.userId,
        status: status as OrderStatus | undefined,
      });
    } else {
      // Admin and Kitchen see all organization orders
      orders = db.getOrders(orgId, {
        status: status as OrderStatus | undefined,
      });
    }

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const order = db.findOrderById(req.params.id, orgId);

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    // If student, check if they own the order
    if (req.user!.role === 'STUDENT' && order.userId !== req.user!.userId) {
      res.status(403).json({ message: 'Access denied to this order.' });
      return;
    }

    const feedback = db.findFeedbackByOrderId(order._id, orgId);

    res.json({ order, feedback: feedback || null });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// POST /api/orders (Student places order)
router.post('/', authMiddleware, requireRole('STUDENT'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const { items, customerPhone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Order must contain at least one item.' });
      return;
    }

    const user = db.findUserById(req.user!.userId);
    if (!user) {
      res.status(401).json({ message: 'User account not found.' });
      return;
    }

    // Verify all items and calculate totals strictly using database prices
    const validatedItems: IOrderItem[] = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const foodId = item.foodId || item._id;
      const quantity = Math.floor(Number(item.quantity));

      if (!foodId || isNaN(quantity) || quantity <= 0) {
        res.status(400).json({ message: 'Invalid food item or quantity.' });
        return;
      }

      const food = db.findFoodById(foodId, orgId);
      if (!food) {
        res.status(400).json({ message: `One of the selected items is not found in this canteen.` });
        return;
      }

      if (!food.isAvailable) {
        res.status(400).json({ message: `"${food.name}" is currently unavailable.` });
        return;
      }

      const subtotal = Math.round(food.price * quantity * 100) / 100;
      calculatedTotal += subtotal;

      validatedItems.push({
        foodId: food._id,
        foodName: food.name,
        quantity,
        price: food.price,
        subtotal,
      });
    }

    calculatedTotal = Math.round(calculatedTotal * 100) / 100;

    const newOrder = db.createOrder({
      userId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: customerPhone || user.phone,
      organizationId: orgId,
      items: validatedItems,
      totalAmount: calculatedTotal,
    });

    res.status(201).json({
      message: 'Order placed successfully.',
      order: newOrder,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// PATCH /api/orders/:id/status (Kitchen or Admin)
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('ADMIN', 'KITCHEN'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const orgId = req.user!.organizationId;
      const { status } = req.body;

      const validStatuses: OrderStatus[] = [
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'COMPLETED',
        'CANCELLED',
      ];

      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid order status transition.' });
        return;
      }

      const updated = db.updateOrderStatus(req.params.id, status, orgId);
      if (!updated) {
        res.status(404).json({ message: 'Order not found.' });
        return;
      }

      res.json({ message: `Order status updated to ${status}.`, order: updated });
    } catch (err) {
      res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
    }
  }
);

// POST /api/orders/:id/cancel (Student cancels eligible order)
router.post(
  '/:id/cancel',
  authMiddleware,
  requireRole('STUDENT'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const orgId = req.user!.organizationId;
      const order = db.findOrderById(req.params.id, orgId);

      if (!order) {
        res.status(404).json({ message: 'Order not found.' });
        return;
      }

      if (order.userId !== req.user!.userId) {
        res.status(403).json({ message: 'You can only cancel your own orders.' });
        return;
      }

      if (order.status !== 'PLACED') {
        res.status(400).json({
          message: `Cannot cancel order. The kitchen has already started processing it (${order.status}).`,
        });
        return;
      }

      const updated = db.updateOrderStatus(req.params.id, 'CANCELLED', orgId);
      res.json({ message: 'Order cancelled successfully.', order: updated });
    } catch (err) {
      res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
    }
  }
);

export default router;
