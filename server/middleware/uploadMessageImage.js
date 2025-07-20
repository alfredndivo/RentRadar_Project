// middleware/uploadMessageImage.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join('uploads/messages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/messages/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }  // ✅ Optional: 3MB max size
});

