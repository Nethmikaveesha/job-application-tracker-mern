import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safe}`);
  },
});

const allowed = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function fileFilter(_req, file, cb) {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF and Word documents are allowed'));
}

export const uploadApplicationFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export function uploadPaths(req) {
  return {
    resumePath: req.files?.resume?.[0]?.filename
      ? `/uploads/${req.files.resume[0].filename}`
      : '',
    coverLetterPath: req.files?.coverLetter?.[0]?.filename
      ? `/uploads/${req.files.coverLetter[0].filename}`
      : '',
  };
}
