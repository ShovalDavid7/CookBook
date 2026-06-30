import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { uploadRecipeImage, uploadAvatar } from '../controllers/uploadController.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()

router.post('/recipe-image', requireAuth, upload.single('image'), uploadRecipeImage)
router.post('/avatar', requireAuth, upload.single('image'), uploadAvatar)

export default router
