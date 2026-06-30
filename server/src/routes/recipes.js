import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import {
  getRecipes,
  getRecipeById,
  getSubCategories,
  createRecipe,
  updateRecipe,
  updateIngredients,
  deleteRecipe,
} from '../controllers/recipesController.js'

const router = Router()

router.get('/sub-categories', getSubCategories)
router.get('/', optionalAuth, getRecipes)
router.get('/:id', optionalAuth, getRecipeById)
router.post('/', requireAuth, createRecipe)
router.put('/:id', requireAuth, updateRecipe)
router.put('/:id/ingredients', requireAuth, updateIngredients)
router.delete('/:id', requireAuth, deleteRecipe)

export default router
