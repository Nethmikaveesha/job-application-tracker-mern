import { Router } from 'express';
import { body, param, query } from 'express-validator';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { generateSecret, generateURI, verify as totpVerify } from 'otplib';
import { handleValidation } from '../utils/validation.js';
import {
  authenticate,
  loadUser,
  requireRole,
} from '../middleware/authMiddleware.js';
import { recordAudit } from '../utils/audit.js';

const router = Router();

// Job seeker favorites (end-to-end: model + endpoints + UI)
router.get(
  '/me/favorites',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  async (req, res) => {
    return res.json({
      data: (req.user?.favorites || []).map((id) => String(id)),
    });
  }
);

router.post(
  '/me/favorites',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  [body('jobId').isMongoId()],
  handleValidation,
  async (req, res) => {
    try {
      const { jobId } = req.body;
      const job = await Job.findById(jobId).select('_id').lean();
      if (!job) return res.status(404).json({ message: 'Job not found' });

      const updated = await User.findByIdAndUpdate(
        req.userId,
        { $addToSet: { favorites: jobId } },
        { new: true }
      ).select('favorites');

      return res.json({
        message: 'Favorite added',
        data: (updated?.favorites || []).map((id) => String(id)),
      });
    } catch {
      return res.status(500).json({ message: 'Failed to add favorite' });
    }
  }
);

router.delete(
  '/me/favorites/:jobId',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  [param('jobId').isMongoId()],
  handleValidation,
  async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(
        req.userId,
        { $pull: { favorites: req.params.jobId } },
        { new: true }
      ).select('favorites');

      return res.json({
        message: 'Favorite removed',
        data: (updated?.favorites || []).map((id) => String(id)),
      });
    } catch {
      return res.status(500).json({ message: 'Failed to remove favorite' });
    }
  }
);

// TOTP 2FA setup/enable/disable (optional)
router.post(
  '/me/2fa/setup',
  authenticate,
  loadUser,
  requireRole('job_seeker', 'admin'),
  async (req, res) => {
    try {
      const user = req.user;
      const secret = generateSecret();
      user.twoFactorSecret = secret;
      user.twoFactorEnabled = false;
      await user.save();

      const otpauthUrl = generateURI({
        issuer: 'Job Application Tracker',
        label: user.email,
        secret,
      });

      return res.json({
        message: '2FA secret generated',
        twoFactorEnabled: false,
        twoFactorSecret: secret,
        otpauthUrl,
      });
    } catch {
      return res.status(500).json({ message: '2FA setup failed' });
    }
  }
);

router.post(
  '/me/2fa/enable',
  authenticate,
  loadUser,
  requireRole('job_seeker', 'admin'),
  [body('token').trim().notEmpty().isNumeric().isLength({ min: 6, max: 6 })],
  handleValidation,
  async (req, res) => {
    try {
      const user = req.user;
      if (!user.twoFactorSecret) {
        return res.status(400).json({ message: '2FA secret is missing. Please set up 2FA first.' });
      }
      const token = String(req.body.token);
      const result = await totpVerify({ secret: user.twoFactorSecret, token });
      if (!result?.valid) return res.status(400).json({ message: 'Invalid 2FA code' });

      user.twoFactorEnabled = true;
      await user.save();

      return res.json({ message: '2FA enabled', twoFactorEnabled: true });
    } catch {
      return res.status(500).json({ message: '2FA enable failed' });
    }
  }
);

router.post(
  '/me/2fa/disable',
  authenticate,
  loadUser,
  requireRole('job_seeker', 'admin'),
  async (req, res) => {
    try {
      const user = req.user;
      user.twoFactorEnabled = false;
      user.twoFactorSecret = '';
      await user.save();
      return res.json({ message: '2FA disabled', twoFactorEnabled: false });
    } catch {
      return res.status(500).json({ message: '2FA disable failed' });
    }
  }
);

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
      .withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/)
      .withMessage('Password must include at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must include at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must include at least one number'),
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
      const prevRole = user.role;
      user.role = req.body.role;
      await user.save();
      await recordAudit({
        req,
        adminId: req.user?._id,
        action: 'update',
        entityType: 'user',
        entityId: String(user._id),
        changes: { before: { role: prevRole }, after: { role: user.role } },
      });
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
  '/:id/active',
  authenticate,
  requireRole('admin'),
  [
    param('id').isMongoId(),
    body('isActive').isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const prev = user.isActive;
      user.isActive = req.body.isActive;
      await user.save();

      await recordAudit({
        req,
        adminId: req.user?._id,
        action: 'update',
        entityType: 'user',
        entityId: String(user._id),
        changes: { before: { isActive: prev }, after: { isActive: user.isActive } },
      });

      return res.json({
        message: 'Account status updated',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch {
      return res.status(500).json({ message: 'Status update failed' });
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
      const after = { name: user.name, email: user.email, role: user.role };
      await user.save();
      await recordAudit({
        req,
        adminId: req.user?._id,
        action: 'update',
        entityType: 'user',
        entityId: String(user._id),
        changes: { after },
      });
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
      await recordAudit({
        req,
        adminId: req.user?._id,
        action: 'delete',
        entityType: 'user',
        entityId: String(req.params.id),
        changes: {},
      });
      return res.json({ message: 'User deleted' });
    } catch {
      return res.status(500).json({ message: 'Delete failed' });
    }
  }
);

export default router;
