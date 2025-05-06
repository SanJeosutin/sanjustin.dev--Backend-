import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import notesRoutes from '../routes/notes.js';
import currentProjRoutes from '../routes/currentProjects.js';
import projectsRoutes from '../routes/githubProjects.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Sample usage if you want to read from /api/notes or /api/current-projects
const notesDirectory = path.join(__dirname, 'notes');
const currentProjectsDirectory = path.join(__dirname, 'current-projects');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notes', notesRoutes);
app.use('/api/current-projects', currentProjRoutes);
app.use('/api/projects', projectsRoutes);

export default app;
