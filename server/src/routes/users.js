import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getMyProfile, updateMyProfile, getMyRecipes, getMyBookmarks } from '../controllers/usersController.js'

const router = Router()

router.get('/me', requireAuth, getMyProfile)
router.put('/me', requireAuth, updateMyProfile)
router.get('/me/recipes', requireAuth, getMyRecipes)
router.get('/me/bookmarks', requireAuth, getMyBookmarks)

export default router
