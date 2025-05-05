import { Router } from 'express'
import { getAllNotes, getNoteData } from '../lib/notes.js'


const router = Router()

// GET /api/notes
router.get('/', (req, res) => {
  try {
    const notes = getAllNotes()
    res.json(notes)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
// GET /api/notes/:slug
router.get('/:slug', async (req, res) => {
  try {
    const note = await getNoteData(req.params.slug)
    res.json(note)
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
})
export default router