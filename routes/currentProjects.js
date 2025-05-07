import express from 'express';
import {
  getAllCurrentProjects,
  getCurrentProjectData
} from '../api/lib/currentProjects.js';

export default function createCurrentProjRoutes() {
  const router = express.Router();

  // GET /api/current-projects
  router.get('/', async (_req, res) => {
    try {
      const projects = await getAllCurrentProjects();
      return res.json(projects);
    } catch (err) {
      console.error('[GET /api/current-projects] error:', err);
      return res
        .status(500)
        .json({ error: 'Failed to load current projects' });
    }
  });

  // GET /api/current-projects/:slug
  router.get('/:slug', async (req, res) => {
    try {
      const project = await getCurrentProjectData(req.params.slug);
      return res.json(project);
    } catch (err) {
      console.error(
        `[GET /api/current-projects/${req.params.slug}] error:`,
        err
      );
      return res.status(404).json({ error: err.message });
    }
  });

  return router;
}
