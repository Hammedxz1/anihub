import 'express-async-errors'
import dotenv from 'dotenv'
dotenv.config()

import app from './config/app'
import { env } from './config/env'

const PORT = env.PORT

app.listen(PORT, () => {
  console.log(`[server] MangaVerse API running on http://localhost:${PORT}`)
})
