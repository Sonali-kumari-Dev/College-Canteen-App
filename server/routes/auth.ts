import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from '../middleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, collegeName, phone } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Name is required.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ message: 'A valid email address is required.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    if (!collegeName || typeof collegeName !== 'string' || collegeName.trim().length === 0) {
      res.status(400).json({ message: 'Please enter your college or canteen name.' });
      return;
    }

    const validRoles = ['STUDENT', 'ADMIN', 'KITCHEN'];
    const assignedRole = validRoles.includes(role) ? role : 'STUDENT';

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = db.findUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists.' });
      return;
    }

    // Find or create organization based on manually entered college/canteen name
    const trimmedCollegeName = collegeName.trim();
    let organization = db.findOrganizationByName(trimmedCollegeName);
    if (!organization) {
      organization = db.createOrganization(trimmedCollegeName);
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = db.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      organizationId: organization._id,
      phone: phone ? String(phone).trim() : undefined,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
        organizationId: organization._id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        organizationId: organization._id,
        organizationName: organization.name,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.findUserByEmail(normalizedEmail);

    if (!user) {
      // Must return standard message
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const organization = db.findOrganizationById(user.organizationId);
    const orgName = organization ? organization.name : 'College Canteen';

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organizationId: user.organizationId,
        organizationName: orgName,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = db.findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const organization = db.findOrganizationById(user.organizationId);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organizationId: user.organizationId,
        organizationName: organization ? organization.name : 'College Canteen',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, phone } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json({ message: 'Name cannot be empty.' });
      return;
    }

    const updated = db.updateUser(req.user!.userId, { name, phone });
    if (!updated) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const organization = db.findOrganizationById(updated.organizationId);

    res.json({
      message: 'Profile updated successfully.',
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        organizationId: updated.organizationId,
        organizationName: organization ? organization.name : 'College Canteen',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to connect to the server. Please try again.' });
  }
});

export default router;
