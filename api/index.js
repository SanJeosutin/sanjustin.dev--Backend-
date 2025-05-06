import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import notesRoutes from '../routes/notes.js';
import currentProjRoutes from '../routes/currentProjects.js';
import projectsRoutes from '../routes/githubProjects.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notes', notesRoutes);
app.use('/api/current-projects', currentProjRoutes);
app.use('/api/projects', projectsRoutes);

export default app;
