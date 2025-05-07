import express from 'express';
import { getAllNotes, getNoteData } from '../api/lib/notes.js';

export default function createNotesRoutes() {
  const router = express.Router();

  // GET /api/notes
  router.get('/', async (_req, res) => {
    try {
      const notes = await getAllNotes();
      return res.json(notes);
    } catch (err) {
      console.error('[GET /api/notes] error:', err);
      return res.status(500).json({ error: 'Failed to load notes' });
    }
  });

  // GET /api/notes/:slug
  router.get('/:slug', async (req, res) => {
    try {
      const note = await getNoteData(req.params.slug);
      return res.json(note);
    } catch (err) {
      console.error(`[GET /api/notes/${req.params.slug}] error:`, err);
      return res.status(404).json({ error: err.message });
    }
  });

  return router;
}
