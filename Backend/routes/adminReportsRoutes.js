import { Router } from 'express';
import { query } from 'express-validator';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { handleValidation } from '../utils/validation.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const router = Router();

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/["\n\r,]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function publicUserForAppList(user, viewerIsAdmin) {
  if (!user) return {};
  if (viewerIsAdmin && user.role === 'admin') {
    return { name: 'Admin account', email: '' };
  }
  return { name: user.name, email: user.email };
}

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
          .select('title company location employmentType description')
          .lean()
      : [],
    uniqueUser.length
      ? User.find({ _id: { $in: uniqueUser } })
          .select('name email role')
          .lean()
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

router.get(
  '/applications.csv',
  query('search').optional().trim().isLength({ max: 200 }),
  query('company').optional().trim().isLength({ max: 120 }),
  query('status').optional().isIn(['pending', 'accepted', 'rejected']).trim(),
  query('userId').optional().isMongoId(),
  query('scope').optional().isIn(['all', 'page']).trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('max').optional().isInt({ min: 1, max: 10000 }).toInt(),
  handleValidation,
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const viewerIsAdmin = true;

      const {
        search = '',
        company = '',
        status = '',
        userId = '',
        scope = 'all',
        page = 1,
        limit = 20,
        max = 5000,
      } = req.query;

      const match = {};
      if (userId) match.user = userId;
      if (status) match.status = status;

      const jobAnd = [];
      if (company) {
        jobAnd.push({ company: { $regex: escapeRegex(company), $options: 'i' } });
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

      const hasJobText = jobAnd.length > 0;
      if (hasJobText) {
        const jobQuery = jobAnd.length === 1 ? jobAnd[0] : { $and: jobAnd };
        const jobIds = await Job.distinct('_id', jobQuery);
        if (!jobIds || jobIds.length === 0) {
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Content-Disposition', 'attachment; filename="applications-report.csv"');
          res.send(['applicationId,status,appliedAt,applicantName,applicantEmail,jobTitle,jobCompany,notes'].join('\n'));
          return;
        }
        match.job = { $in: jobIds };
      }

      const skip = scope === 'page' ? (page - 1) * limit : 0;
      const exportLimit = scope === 'page' ? limit : max;

      const apps = await Application.find(match)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(exportLimit)
        .lean();

      const withRefs = await attachJobAndUser(apps);

      const headers = [
        'applicationId',
        'status',
        'appliedAt',
        'applicantName',
        'applicantEmail',
        'jobTitle',
        'jobCompany',
        'notes',
      ];

      const rows = withRefs.map((a) => {
        const applicant = publicUserForAppList(a.user, viewerIsAdmin);
        return [
          a._id ? String(a._id) : '',
          a.status,
          a.appliedAt ? new Date(a.appliedAt).toISOString() : '',
          applicant.name || '',
          applicant.email || '',
          a.job?.title || '',
          a.job?.company || '',
          a.notes || '',
        ];
      });

      const csv = [headers.map(csvEscape).join(',')]
        .concat(rows.map((r) => r.map(csvEscape).join(',')))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="applications-report.csv"'
      );
      return res.status(200).send(csv);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Admin applications report failed:', err);
      return res.status(500).json({ message: 'Failed to generate report' });
    }
  }
);

export default router;

