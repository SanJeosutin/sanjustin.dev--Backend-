import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import createNotesRoutes from '../routes/notes.js';
import createCurrentProjRoutes from '../routes/currentProjects.js';
import createProjectsRoutes from '../routes/githubProjects.js';

dotenv.config();

// Decode service account JSON from environment variable
if (process.env.GOOGLE_CREDENTIALS) {
  try {
    const sa = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    // Write to temporary file for libraries expecting a file path
    const tmpPath = '/tmp/service-account.json';
    fs.writeFileSync(tmpPath, JSON.stringify(sa));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    console.log('Loaded Google service account credentials from env');
  } catch (err) {
    console.error('Failed to parse GOOGLE_CREDENTIALS:', err);
  }
} else {
  console.warn('GOOGLE_CREDENTIALS env var not set. Google Drive API will not be authenticated.');
}

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
