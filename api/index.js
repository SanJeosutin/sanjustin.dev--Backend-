import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import createNotesRoutes from '../routes/notes.js';
import createCurrentProjRoutes from '../routes/currentProjects.js';
import createProjectsRoutes from '../routes/githubProjects.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory paths to markdown content
const notesDirectory = path.join(__dirname, 'notes');
const currentProjectsDirectory = path.join(__dirname, 'current-projects');

const app = express();

app.use(cors());
app.use(express.json());

// Inject directories or settings into routes
app.use('/api/notes', createNotesRoutes(notesDirectory));
app.use('/api/current-projects', createCurrentProjRoutes(currentProjectsDirectory));
app.use('/api/projects', createProjectsRoutes());

export default app;
