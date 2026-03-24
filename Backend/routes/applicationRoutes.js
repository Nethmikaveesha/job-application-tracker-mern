import { Router } from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { handleValidation } from '../utils/validation.js';
import {
  authenticate,
  loadUser,
  requireRole,
} from '../middleware/authMiddleware.js';
import {
  uploadApplicationFiles,
  uploadPaths,
} from '../utils/multerUpload.js';
import { sendApplicationStatusEmail } from '../utils/email.js';

const router = Router();

router.get(
  '/',
  authenticate,
  loadUser,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['pending', 'accepted', 'rejected']),
    query('company').optional().trim().isLength({ max: 120 }),
    query('search').optional().trim().isLength({ max: 200 }),
    query('userId').optional().isMongoId(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const match = {};

      if (req.userRole === 'job_seeker') {
        match.user = new mongoose.Types.ObjectId(req.userId);
      } else if (req.userRole === 'admin' && req.query.userId) {
        match.user = new mongoose.Types.ObjectId(req.query.userId);
      }

      if (req.query.status) match.status = req.query.status;

      const pipeline = [
        { $match: match },
        {
          $lookup: {
            from: 'jobs',
            localField: 'job',
            foreignField: '_id',
            as: 'jobDoc',
          },
        },
        { $unwind: '$jobDoc' },
      ];

      if (req.query.company) {
        pipeline.push({
          $match: {
            'jobDoc.company': new RegExp(req.query.company, 'i'),
          },
        });
      }
      if (req.query.search) {
        const s = req.query.search;
        pipeline.push({
          $match: {
            $or: [
              { 'jobDoc.company': new RegExp(s, 'i') },
              { 'jobDoc.title': new RegExp(s, 'i') },
            ],
          },
        });
      }

      pipeline.push(
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDoc',
          },
        },
        { $unwind: '$userDoc' },
        {
          $project: {
            status: 1,
            appliedAt: 1,
            notes: 1,
            resumePath: 1,
            coverLetterPath: 1,
            createdAt: 1,
            updatedAt: 1,
            job: {
              _id: '$jobDoc._id',
              title: '$jobDoc.title',
              company: '$jobDoc.company',
              location: '$jobDoc.location',
              employmentType: '$jobDoc.employmentType',
            },
            user: {
              _id: '$userDoc._id',
              name: '$userDoc.name',
              email: '$userDoc.email',
            },
          },
        },
        { $sort: { appliedAt: -1 } }
      );

      const countPipeline = [...pipeline, { $count: 'total' }];
      const dataPipeline = [
        ...pipeline,
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ];

      const [countResult, rows] = await Promise.all([
        Application.aggregate(countPipeline),
        Application.aggregate(dataPipeline),
      ]);

      const total = countResult[0]?.total ?? 0;
      const pages = Math.ceil(total / limit) || 1;

      return res.json({
        data: rows.map((r) => ({
          _id: r._id,
          status: r.status,
          appliedAt: r.appliedAt,
          notes: r.notes,
          resumePath: r.resumePath,
          coverLetterPath: r.coverLetterPath,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          job: r.job,
          user: r.user,
        })),
        pagination: { page, limit, total, pages },
      });
    } catch {
      return res.status(500).json({ message: 'Failed to list applications' });
    }
  }
);

router.get(
  '/stats/me',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  async (req, res) => {
    try {
      const uid = new mongoose.Types.ObjectId(req.userId);
      const [totals] = await Application.aggregate([
        { $match: { user: uid } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            accepted: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
            },
          },
        },
      ]);
      const s = totals || { total: 0, pending: 0, accepted: 0, rejected: 0 };
      return res.json({
        data: {
          total: s.total || 0,
          pending: s.pending || 0,
          accepted: s.accepted || 0,
          rejected: s.rejected || 0,
        },
      });
    } catch {
      return res.status(500).json({ message: 'Failed to load stats' });
    }
  }
);

router.get(
  '/:id',
  authenticate,
  loadUser,
  [param('id').isMongoId()],
  handleValidation,
  async (req, res) => {
    try {
      const appDoc = await Application.findById(req.params.id)
        .populate('job')
        .populate('user', 'name email');
      if (!appDoc) return res.status(404).json({ message: 'Application not found' });
      if (
        req.userRole === 'job_seeker' &&
        appDoc.user._id.toString() !== req.userId
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const plain = appDoc.toObject();
      return res.json({ data: plain });
    } catch {
      return res.status(500).json({ message: 'Failed to load application' });
    }
  }
);

router.post(
  '/',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  uploadApplicationFiles.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const jobId = req.body.jobId;
      if (!jobId || !mongoose.isValidObjectId(jobId)) {
        return res.status(400).json({ message: 'Valid jobId is required' });
      }
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      const notes = (req.body.notes || '').slice(0, 2000);
      const paths = uploadPaths(req);
      const existing = await Application.findOne({
        user: req.userId,
        job: jobId,
      });
      if (existing) {
        return res.status(400).json({ message: 'You already applied to this job' });
      }
      const created = await Application.create({
        user: req.userId,
        job: jobId,
        notes,
        resumePath: paths.resumePath,
        coverLetterPath: paths.coverLetterPath,
      });
      const populated = await Application.findById(created._id)
        .populate('job')
        .lean();
      return res.status(201).json({ message: 'Application submitted', data: populated });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'You already applied to this job' });
      }
      return res.status(500).json({ message: 'Failed to submit application' });
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  loadUser,
  [
    param('id').isMongoId(),
    body('status').optional().isIn(['pending', 'accepted', 'rejected']),
    body('notes').optional().isLength({ max: 2000 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const appDoc = await Application.findById(req.params.id).populate('job');
      if (!appDoc) return res.status(404).json({ message: 'Application not found' });

      const isOwner =
        req.userRole === 'job_seeker' &&
        appDoc.user.toString() === req.userId;
      const isAdmin = req.userRole === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const prevStatus = appDoc.status;

      if (isAdmin && req.body.status) {
        appDoc.status = req.body.status;
      }
      if (isOwner && req.body.notes !== undefined) {
        appDoc.notes = req.body.notes;
      }
      if (isAdmin && req.body.notes !== undefined) {
        appDoc.notes = req.body.notes;
      }

      await appDoc.save();
      const populated = await Application.findById(appDoc._id)
        .populate('job')
        .populate('user', 'name email')
        .lean();

      if (
        isAdmin &&
        req.body.status &&
        req.body.status !== prevStatus
      ) {
        const applicant = await User.findById(appDoc.user);
        if (applicant?.email) {
          try {
            await sendApplicationStatusEmail({
              to: applicant.email,
              applicantName: applicant.name,
              jobTitle: appDoc.job?.title || 'Position',
              company: appDoc.job?.company || 'Company',
              status: appDoc.status,
            });
          } catch {
            // email failure should not fail the request
          }
        }
      }

      return res.json({ message: 'Application updated', data: populated });
    } catch {
      return res.status(500).json({ message: 'Update failed' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  loadUser,
  [param('id').isMongoId()],
  handleValidation,
  async (req, res) => {
    try {
      const appDoc = await Application.findById(req.params.id);
      if (!appDoc) return res.status(404).json({ message: 'Application not found' });
      if (
        req.userRole !== 'admin' &&
        appDoc.user.toString() !== req.userId
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      await Application.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Application deleted' });
    } catch {
      return res.status(500).json({ message: 'Delete failed' });
    }
  }
);

export default router;
