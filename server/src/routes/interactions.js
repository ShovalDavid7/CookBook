import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { getInteractions, addComment, deleteComment, upsertInteraction, updateTips } from '../controllers/interactionsController.js'

const router = Router()

router.get('/:recipeId', optionalAuth, getInteractions)
router.post('/:recipeId/comment', requireAuth, addComment)
router.delete('/comment/:commentId', requireAuth, deleteComment)
router.put('/:recipeId', requireAuth, upsertInteraction)
router.put('/tips/:id', requireAuth, updateTips)

export default router
