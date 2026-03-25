import { Router } from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/stats', async (_req, res) => {
  try {
    const [totalUsers, totalJobs, appAgg] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.aggregate([
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            accepted: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);
    const a = appAgg[0] || {};
    return res.json({
      data: {
        totalUsers,
        totalJobs,
        totalApplications: a.totalApplications || 0,
        accepted: a.accepted || 0,
        rejected: a.rejected || 0,
        pending: a.pending || 0,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Failed to load stats' });
  }
});

router.get('/analytics', async (_req, res) => {
  try {
    const byCompany = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDoc',
        },
      },
      { $unwind: '$jobDoc' },
      {
        $group: {
          _id: '$jobDoc.company',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]);

    const statusBreakdown = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const topAppliedJobs = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDoc',
        },
      },
      { $unwind: '$jobDoc' },
      {
        $group: {
          _id: '$jobDoc._id',
          title: { $first: '$jobDoc.title' },
          company: { $first: '$jobDoc.company' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return res.json({
      data: {
        applicationsPerCompany: byCompany.map((x) => ({
          company: x._id,
          count: x.count,
        })),
        statusBreakdown: statusBreakdown.map((x) => ({
          status: x._id,
          count: x.count,
        })),
        topAppliedJobs: topAppliedJobs.map((x) => ({
          jobId: x._id,
          title: x.title,
          company: x.company,
          count: x.count,
        })),
      },
    });
  } catch {
    return res.status(500).json({ message: 'Failed to load analytics' });
  }
});

export default router;
