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

// Base64 decode service account JSON and write to OS temp directory
const b64 = process.env.GOOGLE_CREDENTIALS_B64;
if (b64) {
  try {
    const raw = Buffer.from(b64, 'base64').toString('utf8');
    const sa = JSON.parse(raw);
    const tmpDir = os.tmpdir();
    const saPath = path.join(tmpDir, 'service-account.json');
    fs.writeFileSync(saPath, JSON.stringify(sa));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = saPath;
    console.log(`Service account credentials written to ${saPath}`);
  } catch (err) {
    console.error('Failed to parse or write service account JSON:', err);
    process.exit(1);
  }
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
