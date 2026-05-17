import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_ROOT = path.join(__dirname, '../../../uploads')
const AVATAR_DIR = path.join(UPLOAD_ROOT, 'avatars')
const DOWNLOAD_DIR = path.join(UPLOAD_ROOT, 'downloads')

// Ensure upload directories exist on startup
for (const dir of [AVATAR_DIR, DOWNLOAD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const userId = req.user?.id ?? 'unknown'
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${userId}-${Date.now()}${ext}`)
  },
})

function avatarFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'))
  }
}

export const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

export { UPLOAD_ROOT, AVATAR_DIR, DOWNLOAD_DIR }
