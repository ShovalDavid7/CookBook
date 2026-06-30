import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { likeRecipe, unlikeRecipe } from '../controllers/likesController.js'

const router = Router()

router.post('/:recipeId', requireAuth, likeRecipe)
router.delete('/:recipeId', requireAuth, unlikeRecipe)

export default router
