import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import recipesRouter from './routes/recipes.js'
import usersRouter from './routes/users.js'
import likesRouter from './routes/likes.js'
import bookmarksRouter from './routes/bookmarks.js'
import uploadRouter from './routes/upload.js'
import importRouter from './routes/import.js'
import crawlRouter from './routes/crawl.js'
import interactionsRouter from './routes/interactions.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api/recipes', recipesRouter)
app.use('/api/users', usersRouter)
app.use('/api/likes', likesRouter)
app.use('/api/bookmarks', bookmarksRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/import', importRouter)
app.use('/api/crawl', crawlRouter)
app.use('/api/interactions', interactionsRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`MealFeed server running on port ${PORT}`))
