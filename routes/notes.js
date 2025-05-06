import { Router } from 'express';
import { getAllNotes, getNoteData } from '../api/lib/notes.js';

export default function createNotesRouter(notesDir) {
  const router = Router();

  // GET /api/notes
  router.get('/', (req, res) => {
    try {
      const notes = getAllNotes(notesDir); // Pass directory explicitly
      res.json(notes);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/notes/:slug
  router.get('/:slug', async (req, res) => {
    try {
      const note = await getNoteData(req.params.slug, notesDir); // Pass directory explicitly
      res.json(note);
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });

  return router;
}
