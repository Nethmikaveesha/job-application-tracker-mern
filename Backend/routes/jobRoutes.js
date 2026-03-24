import { Router } from 'express';
import { body, param, query } from 'express-validator';
import Job from '../models/Job.js';
import { handleValidation } from '../utils/validation.js';
import {
  authenticate,
  loadUser,
  requireRole,
} from '../middleware/authMiddleware.js';

const router = Router();

const listValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('location').optional().trim().isLength({ max: 120 }),
  query('employmentType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship']),
  query('search').optional().trim().isLength({ max: 200 }),
  query('sort').optional().isIn(['newest', 'oldest', 'company']),
];

router.get('/', listValidators, handleValidation, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const filter = {};
    if (req.query.location) {
      filter.location = new RegExp(req.query.location, 'i');
    }
    if (req.query.employmentType) {
      filter.employmentType = req.query.employmentType;
    }
    if (req.query.search) {
      const s = req.query.search;
      filter.$or = [
        { title: new RegExp(s, 'i') },
        { company: new RegExp(s, 'i') },
        { description: new RegExp(s, 'i') },
      ];
    }
    let sort = { createdAt: -1 };
    if (req.query.sort === 'oldest') sort = { createdAt: 1 };
    if (req.query.sort === 'company') sort = { company: 1, title: 1 };

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);
    return res.json({
      data: jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch {
    return res.status(500).json({ message: 'Failed to list jobs' });
  }
});

router.get('/:id', [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json({ data: job });
  } catch {
    return res.status(500).json({ message: 'Failed to load job' });
  }
});

router.post(
  '/',
  authenticate,
  loadUser,
  requireRole('admin'),
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('company').trim().notEmpty().isLength({ max: 120 }),
    body('location').optional().trim().isLength({ max: 120 }),
    body('employmentType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'internship']),
    body('description').optional().isLength({ max: 8000 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const job = await Job.create({
        ...req.body,
        createdBy: req.user._id,
      });
      return res.status(201).json({ message: 'Job created', data: job });
    } catch {
      return res.status(500).json({ message: 'Failed to create job' });
    }
  }
);

router.put(
  '/:id',
  authenticate,
  loadUser,
  requireRole('admin'),
  [
    param('id').isMongoId(),
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('company').optional().trim().notEmpty().isLength({ max: 120 }),
    body('location').optional().trim().isLength({ max: 120 }),
    body('employmentType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'internship']),
    body('description').optional().isLength({ max: 8000 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      Object.assign(job, req.body);
      await job.save();
      return res.json({ message: 'Job updated', data: job });
    } catch {
      return res.status(500).json({ message: 'Failed to update job' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  loadUser,
  requireRole('admin'),
  [param('id').isMongoId()],
  handleValidation,
  async (req, res) => {
    try {
      const job = await Job.findByIdAndDelete(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      return res.json({ message: 'Job deleted' });
    } catch {
      return res.status(500).json({ message: 'Failed to delete job' });
    }
  }
);

export default router;
