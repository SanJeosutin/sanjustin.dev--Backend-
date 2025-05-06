import { Router } from 'express';
import {
  getAllCurrentProjects,
  getCurrentProjectData,
} from '../api/lib/currentProjects.js';

export default function createCurrentProjectsRouter(projectsDir) {
  const router = Router();

  // GET /api/current-projects
  router.get('/', (req, res) => {
    try {
      const projects = getAllCurrentProjects(projectsDir); // Pass directory explicitly
      res.json(projects);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/current-projects/:slug
  router.get('/:slug', async (req, res) => {
    try {
      const project = await getCurrentProjectData(req.params.slug, projectsDir); // Pass directory explicitly
      res.json(project);
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });

  return router;
}
