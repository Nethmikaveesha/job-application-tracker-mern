const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const User = require('../models/User');

// Create job
router.post('/', protect, async (req, res) => {
  const { company, position, status, notes } = req.body;
  const job = await Job.create({ user: req.user._id, company, position, status, notes });
  res.json(job);
});

// Get all jobs for user
router.get('/', protect, async (req, res) => {
  const jobs = await Job.find({ user: req.user._id });
  res.json(jobs);
});

// Admin: get all jobs
router.get('/all', protect, admin, async (req, res) => {
  const jobs = await Job.find().populate('user', 'name email');
  res.json(jobs);
});

// Update job
router.put('/:id', protect, async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });

  Object.assign(job, req.body);
  await job.save();
  res.json(job);
});

// Delete job
router.delete('/:id', protect, async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });

  await job.remove();
  res.json({ message: 'Job deleted' });
});

module.exports = router;