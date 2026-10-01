import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware.js';

const router = Router();

// GET /api/food
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const { categoryId, q, search, availableOnly } = req.query;

    const searchTerm = (search || q) as string | undefined;
    const foods = db.getFoods(orgId, {
      categoryId: categoryId as string | undefined,
      search: searchTerm,
      availableOnly: availableOnly === 'true',
    });

    res.json({ foods });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// GET /api/food/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const food = db.findFoodById(req.params.id, orgId);
    if (!food) {
      res.status(404).json({ message: 'Food item not found.' });
      return;
    }

    res.json({ food });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// POST /api/food (Admin only)
router.post('/', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const { name, description, price, categoryId, isAvailable, imageUrl } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Food name is required.' });
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      res.status(400).json({ message: 'Valid positive price in ₹ is required.' });
      return;
    }

    if (!categoryId) {
      res.status(400).json({ message: 'Please select a valid category.' });
      return;
    }

    // Verify category exists within this organization
    const category = db.findCategoryById(categoryId, orgId);
    if (!category) {
      res.status(400).json({ message: 'Selected category does not exist in your canteen.' });
      return;
    }

    const food = db.createFood({
      name: name.trim(),
      description: description ? String(description).trim() : '',
      price: numericPrice,
      categoryId,
      isAvailable: isAvailable !== false,
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      organizationId: orgId,
    });

    res.status(201).json({ message: 'Food item created successfully.', food });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// PUT /api/food/:id (Admin only)
router.put('/:id', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const { name, description, price, categoryId, isAvailable, imageUrl } = req.body;

    const existing = db.findFoodById(req.params.id, orgId);
    if (!existing) {
      res.status(404).json({ message: 'Food item not found.' });
      return;
    }

    if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      res.status(400).json({ message: 'Food name cannot be empty.' });
      return;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        res.status(400).json({ message: 'Valid positive price in ₹ is required.' });
        return;
      }
    }

    if (categoryId !== undefined) {
      const category = db.findCategoryById(categoryId, orgId);
      if (!category) {
        res.status(400).json({ message: 'Selected category does not exist.' });
        return;
      }
    }

    const updated = db.updateFood(
      req.params.id,
      {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        categoryId,
        isAvailable,
        imageUrl,
      },
      orgId
    );

    res.json({ message: 'Food item updated successfully.', food: updated });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// DELETE /api/food/:id (Admin only)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const deleted = db.deleteFood(req.params.id, orgId);
    if (!deleted) {
      res.status(404).json({ message: 'Food item not found.' });
      return;
    }
    res.json({ message: 'Food item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

export default router;
