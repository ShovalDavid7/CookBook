import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bookmarkRecipe, unbookmarkRecipe } from '../controllers/bookmarksController.js'

const router = Router()

router.post('/:recipeId', requireAuth, bookmarkRecipe)
router.delete('/:recipeId', requireAuth, unbookmarkRecipe)

export default router
