import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate, loadUser, requireRole } from '../middleware/authMiddleware.js';
import { handleValidation } from '../utils/validation.js';
import Notification from '../models/Notification.js';

const router = Router();

router.get(
  '/',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  [
    // Optional pagination, primarily used for the dashboard preview.
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const limit = req.query.limit || 10;

      const [unreadCount, items] = await Promise.all([
        Notification.countDocuments({ user: req.userId, read: false }),
        Notification.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
      ]);

      return res.json({ unreadCount, items });
    } catch {
      return res.status(500).json({ message: 'Failed to load notifications' });
    }
  }
);

router.patch(
  '/:id/read',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  [param('id').isMongoId()],
  handleValidation,
  async (req, res) => {
    try {
      const updated = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { $set: { read: true } },
        { new: true }
      ).lean();

      if (!updated) return res.status(404).json({ message: 'Notification not found' });
      return res.json({ message: 'Notification marked as read', data: updated });
    } catch {
      return res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  }
);

export default router;

