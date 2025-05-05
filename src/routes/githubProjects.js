import { Router } from 'express'
import fetch from 'node-fetch'

const router = Router()

// GET /api/projects
router.get('/', async (req, res) => {
  const username = process.env.GITHUB_USERNAME
  if (!username) {
    return res.status(500).json({ error: 'GITHUB_USERNAME not set' })
  }
  const url = `https://api.github.com/users/${username}/repos?per_page=100`
  const headers = {}
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
  }
  const apiRes = await fetch(url, { headers })
  if (!apiRes.ok) {
    return res.status(apiRes.status).json({ error: 'GitHub error' })
  }
  let repos = await apiRes.json()
  repos = repos.filter(r => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count)
  res.json(repos)
})

export default router
