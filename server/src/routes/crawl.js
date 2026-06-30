import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { crawlSite } from '../controllers/crawlController.js'

const router = Router()
router.get('/stream', requireAuth, crawlSite)

export default router
