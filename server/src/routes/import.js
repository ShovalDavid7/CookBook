import { Router } from 'express'
import { importFromUrl, batchImport } from '../controllers/importController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', importFromUrl)
router.post('/batch', requireAuth, batchImport)

export default router
