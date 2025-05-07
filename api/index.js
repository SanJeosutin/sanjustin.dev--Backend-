import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';

import createNotesRoutes from '../routes/notes.js';
import createCurrentProjRoutes from '../routes/currentProjects.js';
import createProjectsRoutes from '../routes/githubProjects.js';

dotenv.config();

// Service Account Setup
const tmpSaPath = path.join(os.tmpdir(), 'service-account.json');
if (!fs.existsSync(tmpSaPath)) {
  const b64 = process.env.GOOGLE_CREDENTIALS_B64;
  if (!b64) {
    console.error('❌ Missing env var GOOGLE_CREDENTIALS_B64');
    process.exit(1);
  }
  try {
    const raw = Buffer.from(b64, 'base64').toString('utf8');
    JSON.parse(raw); // validate JSON
    fs.writeFileSync(tmpSaPath, raw, { mode: 0o600 });
    console.log(`✅ Service account key written to ${tmpSaPath}`);
  } catch (err) {
    console.error('❌ Could not decode/write service account JSON:', err);
    process.exit(1);
  }
} else {
  console.log(`ℹ️  Using existing service account at ${tmpSaPath}`);
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpSaPath;

//Start the API
const app = express();

app.use(cors());
app.use(express.json());

//Get usable routes
app.use('/api/notes',           createNotesRoutes());
app.use('/api/current-projects', createCurrentProjRoutes());
app.use('/api/projects',        createProjectsRoutes());

// Basic health check
app.get('/', (_req, res) => res.json({ message: 'API is running' }));

//LOCAL SERVER ONLY
/*
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
*/

export default app;
