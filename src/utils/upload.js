import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_DIR = path.join(__dirname, '../public/uploads/avatars');
mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer middleware: keeps the uploaded file in memory (we convert via sharp).
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('يجب أن يكون الملف صورة'), false);
    }
    cb(null, true);
  },
}).single('photo');

export const processAvatar = async (buffer, userId) => {
  const filename = `avatar-${userId}-${Date.now()}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .resize(200, 200, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(outputPath);

  // Public URL (served by express.static in app.js)
  return `/uploads/avatars/${filename}`;
};
