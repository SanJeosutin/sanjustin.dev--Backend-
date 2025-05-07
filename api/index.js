import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import createNotesRoutes from '../routes/notes.js';
import createCurrentProjRoutes from '../routes/currentProjects.js';
import createProjectsRoutes from '../routes/githubProjects.js';

dotenv.config();

// Decode Base64 service account JSON once and write to temp file
const tmpSaPath = path.join(os.tmpdir(), 'sa.json');
if (!fs.existsSync(tmpSaPath)) {
  const rawBase64 = process.env.GOOGLE_CREDENTIALS_B64;
  if (!rawBase64) {
    console.error('Environment variable GOOGLE_CREDENTIALS_B64 is not set');
    process.exit(1);
  }

  try {
    const saJson = Buffer.from(rawBase64, 'base64').toString('utf8');
    fs.writeFileSync(tmpSaPath, saJson);
  } catch (err) {
    console.error('Failed to decode/write service account JSON:', err);
    process.exit(1);
  }
}
// Point Google client libs to the temp file
process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpSaPath;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory paths to markdown content (if using local fallback)
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
