import { Router } from 'express';
import { body, param, query } from 'express-validator';
import User from '../models/User.js';
import { handleValidation } from '../utils/validation.js';
import {
  authenticate,
  loadUser,
  requireRole,
} from '../middleware/authMiddleware.js';

const router = Router();

router.patch(
  '/me',
  authenticate,
  loadUser,
  [
    body('name').optional().trim().notEmpty().isLength({ max: 120 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (email && email !== req.user.email) {
        const taken = await User.findOne({ email });
        if (taken) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        req.user.email = email;
      }
      if (name) req.user.name = name;
      if (password) req.user.password = password;
      await req.user.save();
      return res.json({
        message: 'Profile updated',
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(500).json({ message: 'Update failed' });
    }
  }
);

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim().isLength({ max: 100 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const filter = {};
      if (req.query.search) {
        const q = req.query.search;
        filter.$or = [
          { name: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') },
        ];
      }
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);
      return res.json({
        data: users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      });
    } catch {
      return res.status(500).json({ message: 'Failed to list users' });
    }
  }
);

router.patch(
  '/:id/role',
  authenticate,
  requireRole('admin'),
  [
    param('id').isMongoId(),
    body('role').isIn(['admin', 'job_seeker']),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.role = req.body.role;
      await user.save();
      return res.json({
        message: 'Role updated',
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch {
      return res.status(500).json({ message: 'Role update failed' });
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').isMongoId(),
    body('name').optional().trim().notEmpty().isLength({ max: 120 }),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (req.body.email && req.body.email !== user.email) {
        const taken = await User.findOne({ email: req.body.email });
        if (taken) return res.status(400).json({ message: 'Email already in use' });
        user.email = req.body.email;
      }
      if (req.body.name) user.name = req.body.name;
      await user.save();
      return res.json({
        message: 'User updated',
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(500).json({ message: 'Update failed' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  [param('id').isMongoId()],
  handleValidation,
  async (req, res) => {
    try {
      if (req.params.id === req.userId) {
        return res.status(400).json({ message: 'Cannot delete your own account here' });
      }
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ message: 'User deleted' });
    } catch {
      return res.status(500).json({ message: 'Delete failed' });
    }
  }
);

export default router;
