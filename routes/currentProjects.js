import { Router } from 'express'

import {
    getAllCurrentProjects,
    getCurrentProjectData,
} from '../api/lib/currentProjects.js'

const router = Router()

// GET /api/current-projects
router.get('/', (req, res) => {
    try {
        const projects = getAllCurrentProjects()
        res.json(projects)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// GET /api/current-projects/:slug
router.get('/:slug', async (req, res) => {
    try {
        const project = await getCurrentProjectData(req.params.slug)
        res.json(project)
    } catch (e) {
        res.status(404).json({ error: e.message })
    }
})

export default router
