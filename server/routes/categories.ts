import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware.js';

const router = Router();

// GET /api/categories
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const categories = db.getCategories(req.user!.organizationId);
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// GET /api/categories/:id
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const category = db.findCategoryById(req.params.id, req.user!.organizationId);
    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// POST /api/categories (Admin only)
router.post('/', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }

    const trimmed = name.trim();
    const existing = db.findCategoryByName(trimmed, req.user!.organizationId);
    if (existing) {
      res.status(400).json({ message: 'A category with this name already exists.' });
      return;
    }

    const category = db.createCategory(trimmed, req.user!.organizationId);
    res.status(201).json({ message: 'Category created successfully.', category });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// PUT /api/categories/:id (Admin only)
router.put('/:id', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }

    const trimmed = name.trim();
    const existing = db.findCategoryByName(trimmed, req.user!.organizationId);
    if (existing && existing._id !== req.params.id) {
      res.status(400).json({ message: 'Another category with this name already exists.' });
      return;
    }

    const updated = db.updateCategory(req.params.id, trimmed, req.user!.organizationId);
    if (!updated) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    res.json({ message: 'Category updated successfully.', category: updated });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// DELETE /api/categories/:id (Admin only)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const orgId = req.user!.organizationId;
    const catId = req.params.id;

    // Check if category exists
    const category = db.findCategoryById(catId, orgId);
    if (!category) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    // Check if food items are linked to this category
    const linkedFoods = db.getFoods(orgId, { categoryId: catId });
    if (linkedFoods.length > 0) {
      res.status(400).json({
        message: `Cannot delete category. ${linkedFoods.length} food item(s) are currently assigned to it.`,
      });
      return;
    }

    const deleted = db.deleteCategory(catId, orgId);
    if (!deleted) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

export default router;
