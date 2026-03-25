import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../utils/validation.js';
import { sendContactFormEmail } from '../utils/email.js';

const router = Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const result = await sendContactFormEmail({
        fromName: name,
        fromEmail: email,
        subject,
        message,
      });
      if (!result.sent) {
        console.info('[contact]', { name, email, subject, preview: message.slice(0, 120) });
      }
      return res.status(201).json({
        message: result.sent
          ? 'Thanks — your message was sent.'
          : 'Thanks — we received your message.',
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Could not send message. Try again later.' });
    }
  }
);

export default router;
