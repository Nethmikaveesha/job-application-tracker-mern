import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { handleValidation } from '../utils/validation.js';
import { authenticate, loadUser } from '../middleware/authMiddleware.js';

const router = Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const user = await User.create({ name, email, password, role: 'job_seeker' });
      const token = signToken(user);
      return res.status(201).json({
        message: 'Account created',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(500).json({ message: 'Signup failed' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = signToken(user);
      return res.json({
        message: 'Logged in',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch {
      return res.status(500).json({ message: 'Login failed' });
    }
  }
);

router.get('/me', authenticate, loadUser, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
