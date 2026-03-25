import { Router } from 'express';
import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
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
import { escapeRegex } from '../utils/escapeRegex.js';
import { recordAudit } from '../utils/audit.js';

const router = Router();

function firstQuery(val) {
  if (val === undefined || val === null) return undefined;
  return Array.isArray(val) ? val[0] : val;
}

function safePageLimit(req) {
  const page = Math.max(
    1,
    parseInt(String(firstQuery(req.query.page) ?? '1'), 10) || 1
  );
  const limitRaw = parseInt(String(firstQuery(req.query.limit) ?? '10'), 10);
  const limit = Math.min(100, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 10));
  return { page, limit };
}

/** When an admin views the global list, do not expose other admins’ name/email. */
function publicUserForAppList(user, viewerIsAdmin) {
  if (!user) return null;
  if (viewerIsAdmin && user.role === 'admin') {
    return { _id: user._id, role: 'admin' };
  }
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
}

function mapApplicationListRow(d, viewerIsAdmin) {
  return {
    _id: d._id,
    status: d.status,
    appliedAt: d.appliedAt,
    notes: d.notes,
    resumePath: d.resumePath,
    coverLetterPath: d.coverLetterPath,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    job: d.job
      ? {
          _id: d.job._id,
          title: d.job.title,
          company: d.job.company,
          location: d.job.location,
          employmentType: d.job.employmentType,
        }
      : null,
    user: publicUserForAppList(d.user, viewerIsAdmin),
  };
}

/** Attach job + user docs without populate (avoids CastError / strictPopulate on bad refs). */
async function attachJobAndUser(appsLean) {
  const jobIds = [];
  const userIds = [];
  for (const a of appsLean) {
    if (a.job && mongoose.isValidObjectId(a.job)) jobIds.push(a.job);
    if (a.user && mongoose.isValidObjectId(a.user)) userIds.push(a.user);
  }
  const uniqueJob = [...new Set(jobIds.map((id) => String(id)))];
  const uniqueUser = [...new Set(userIds.map((id) => String(id)))];
  const [jobDocs, userDocs] = await Promise.all([
    uniqueJob.length
      ? Job.find({ _id: { $in: uniqueJob } })
          .select('title company location employmentType')
          .lean()
      : [],
    uniqueUser.length
      ? User.find({ _id: { $in: uniqueUser } }).select('name email role').lean()
      : [],
  ]);
  const jobById = new Map(jobDocs.map((j) => [String(j._id), j]));
  const userById = new Map(userDocs.map((u) => [String(u._id), u]));
  return appsLean.map((a) => {
    const jobKey = a.job && mongoose.isValidObjectId(a.job) ? String(a.job) : '';
    const userKey = a.user && mongoose.isValidObjectId(a.user) ? String(a.user) : '';
    return {
      ...a,
      job: jobKey ? jobById.get(jobKey) || null : null,
      user: userKey ? userById.get(userKey) || null : null,
    };
  });
}

function parseListQueryParams(req, res) {
  const { page, limit } = safePageLimit(req);

  const statusRaw = firstQuery(req.query.status);
  const status =
    typeof statusRaw === 'string' && statusRaw.trim()
      ? String(statusRaw).trim()
      : '';
  if (status && !['pending', 'accepted', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'Invalid status filter' });
    return null;
  }

  const companyRaw = firstQuery(req.query.company);
  const company =
    typeof companyRaw === 'string' ? companyRaw.trim().slice(0, 120) : '';

  const searchRaw = firstQuery(req.query.search);
  const search =
    typeof searchRaw === 'string' ? searchRaw.trim().slice(0, 200) : '';

  const userIdRaw = firstQuery(req.query.userId);
  const userId =
    userIdRaw !== undefined && userIdRaw !== null && String(userIdRaw).trim()
      ? String(userIdRaw).trim()
      : '';
  if (userId && !mongoose.isValidObjectId(userId)) {
    res.status(400).json({ message: 'Invalid userId filter' });
    return null;
  }

  return { page, limit, status, company, search, userId };
}

router.get('/', authenticate, loadUser, async (req, res) => {
  try {
    const parsed = parseListQueryParams(req, res);
    if (!parsed) return;

    const { page, limit, status, company, search, userId } = parsed;
    const match = {};

    if (req.userRole === 'job_seeker') {
      if (!mongoose.isValidObjectId(req.userId)) {
        return res.status(401).json({ message: 'Invalid session. Please log in again.' });
      }
      match.user = req.userId;
    } else if (req.userRole === 'admin') {
      if (userId) match.user = userId;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (status) match.status = status;

    const needsTextFilter = Boolean(company || search);

    /** Raw aggregation $match does not cast strings to ObjectId like Mongoose find() does. */
    function matchForAggregate(src) {
      const m = { ...src };
      if (m.user != null) {
        const u = String(m.user);
        if (!mongoose.isValidObjectId(u)) {
          throw new Error('Invalid user id in filter');
        }
        m.user = new mongoose.Types.ObjectId(u);
      }
      return m;
    }

    if (!needsTextFilter) {
      const skip = (page - 1) * limit;
      const [total, apps] = await Promise.all([
        Application.countDocuments(match),
        Application.find(match)
          .sort({ appliedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);
      const withRefs = await attachJobAndUser(apps);
      const pages = Math.ceil(total / limit) || 1;
      const viewerIsAdmin = req.userRole === 'admin';
      return res.json({
        data: withRefs.map((row) => mapApplicationListRow(row, viewerIsAdmin)),
        pagination: { page, limit, total, pages },
      });
    }

    /* Company / search filters: query matching Job ids first, then Application.find().
       This avoids fragile aggregation pipelines while keeping correct pagination totals. */
    const jobAnd = [];

    if (company) {
      jobAnd.push({
        company: { $regex: escapeRegex(company), $options: 'i' },
      });
    }

    if (search) {
      const safe = escapeRegex(search);
      jobAnd.push({
        $or: [
          { company: { $regex: safe, $options: 'i' } },
          { title: { $regex: safe, $options: 'i' } },
        ],
      });
    }

    const jobQuery = jobAnd.length === 1 ? jobAnd[0] : { $and: jobAnd };
    const jobIds = await Job.distinct('_id', jobQuery);

    if (!jobIds || jobIds.length === 0) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, pages: 1 },
      });
    }

    match.job = { $in: jobIds };

    const skip = (page - 1) * limit;
    const [total, apps] = await Promise.all([
      Application.countDocuments(match),
      Application.find(match)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const withRefs = await attachJobAndUser(apps);
    const pages = Math.ceil(total / limit) || 1;
    const viewerIsAdmin = req.userRole === 'admin';

    return res.json({
      data: withRefs.map((row) =>
        mapApplicationListRow(row, viewerIsAdmin)
      ),
      pagination: { page, limit, total, pages },
    });
  } catch (err) {
    console.error('GET /api/applications list failed:', err);
    return res
      .status(500)
      .json({ message: err?.message || 'Failed to list applications' });
  }
});

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
      const phone = String(req.body.phone || '').trim();
      if (phone && phone.length > 30) {
        return res.status(400).json({ message: 'Phone must be 30 characters or less' });
      }
      const website = String(req.body.website || '').trim();
      if (website && website.length > 200) {
        return res
          .status(400)
          .json({ message: 'Website must be 200 characters or less' });
      }
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
        phone,
        website,
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
      const prevNotes = appDoc.notes;

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

      if (isAdmin) {
        await recordAudit({
          req,
          adminId: req.user?._id || req.userId,
          action: 'update',
          entityType: 'application',
          entityId: String(appDoc._id),
          changes: {
            before: { status: prevStatus, notes: prevNotes },
            after: { status: appDoc.status, notes: appDoc.notes },
          },
        });
      }

      if (
        isAdmin &&
        req.body.status &&
        req.body.status !== prevStatus
      ) {
        const applicant = await User.findById(appDoc.user).select('name email role');
        const jobTitle = appDoc.job?.title || 'Position';
        const company = appDoc.job?.company || 'Company';

        // In-app notification for the job seeker (best-effort).
        try {
          await Notification.create({
            user: appDoc.user,
            type: 'application_status_change',
            message: `Your application for "${jobTitle}" at "${company}" is now ${appDoc.status}.`,
            data: {
              applicationId: String(appDoc._id),
              jobTitle,
              company,
              status: appDoc.status,
            },
            read: false,
          });
        } catch {
          // notification failure should not fail the request
        }

        // Email notification for the job seeker (optional if SMTP not configured).
        if (applicant?.email) {
          try {
            await sendApplicationStatusEmail({
              to: applicant.email,
              applicantName: applicant.name,
              jobTitle,
              company,
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

router.patch(
  '/:id/cover-letter',
  authenticate,
  loadUser,
  requireRole('job_seeker'),
  [param('id').isMongoId()],
  uploadApplicationFiles.fields([{ name: 'coverLetter', maxCount: 1 }]),
  handleValidation,
  async (req, res) => {
    try {
      const appDoc = await Application.findById(req.params.id).populate('job');
      if (!appDoc) return res.status(404).json({ message: 'Application not found' });
      if (appDoc.user.toString() !== req.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const paths = uploadPaths(req);
      if (!paths.coverLetterPath) {
        return res.status(400).json({ message: 'Cover letter file is required' });
      }

      appDoc.coverLetterPath = paths.coverLetterPath;
      await appDoc.save();

      const populated = await Application.findById(appDoc._id)
        .populate('job')
        .populate('user', 'name email')
        .lean();

      return res.json({ message: 'Cover letter updated', data: populated });
    } catch {
      return res.status(500).json({ message: 'Cover letter update failed' });
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

      if (req.userRole === 'admin') {
        await recordAudit({
          req,
          adminId: req.user?._id || req.userId,
          action: 'delete',
          entityType: 'application',
          entityId: String(req.params.id),
          changes: {},
        });
      }
      return res.json({ message: 'Application deleted' });
    } catch {
      return res.status(500).json({ message: 'Delete failed' });
    }
  }
);

export default router;
