import { Router } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { verify as totpVerify } from 'otplib';
import User from '../models/User.js';
import { handleValidation } from '../utils/validation.js';
import { authenticate, loadUser } from '../middleware/authMiddleware.js';
import { sendPasswordResetEmail } from '../utils/email.js';

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
    body('token')
      .optional()
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA token must be 6 digits')
      .isNumeric()
      .withMessage('2FA token must be numeric'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password, token } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      if (user.isActive === false) {
        return res.status(403).json({ message: 'Account deactivated' });
      }
      if (user.twoFactorEnabled) {
        if (!token) {
          return res.status(401).json({ message: '2FA required' });
        }
        const result = await totpVerify({
          secret: user.twoFactorSecret,
          token: String(token),
        });
        if (!result?.valid) {
          return res.status(401).json({ message: 'Invalid 2FA code' });
        }
      }

      const authToken = signToken(user);
      return res.json({
        message: 'Logged in',
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      });
    } catch {
      return res.status(500).json({ message: 'Login failed' });
    }
  }
);

router.post(
  '/password-reset/request',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  handleValidation,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      // Avoid account enumeration.
      if (!user) {
        return res.json({
          message: 'If your account exists, a reset email has been sent.',
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetToken = tokenHash;
      user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
      await user.save();

      await sendPasswordResetEmail({
        to: user.email,
        applicantName: user.name,
        token: resetToken,
      });

      return res.json({
        message: 'If your account exists, a reset email has been sent.',
      });
    } catch {
      return res.status(500).json({ message: 'Password reset request failed' });
    }
  }
);

router.post(
  '/password-reset/confirm',
  [
    body('token').trim().notEmpty().withMessage('Reset token is required'),
    body('password')
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
      const { token, password } = req.body;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: tokenHash,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      user.password = password;
      user.passwordResetToken = '';
      user.passwordResetExpires = null;
      await user.save();

      const authToken = signToken(user);
      return res.json({
        message: 'Password reset successful',
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch {
      return res.status(500).json({ message: 'Password reset failed' });
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
      twoFactorEnabled: req.user.twoFactorEnabled,
    },
  });
});

export default router;
