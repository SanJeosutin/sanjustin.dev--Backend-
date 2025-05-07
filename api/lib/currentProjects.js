import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { google } from 'googleapis';

// Google Drive auth
const auth  = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

/**
 * Return metadata for all projects from Google Drive, sorted by date descending.
 */
export async function getAllCurrentProjects() {
  const client   = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_CURRENT_PROJECTS;

  // List with mimeType
  const { data: { files = [] } } = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name contains '.md'`,
    fields: 'files(id,name,mimeType)',
  });
  console.log('[getAllCurrentProjects] files:', files);

  // Download & parse each
  const projects = await Promise.all(files.map(async file => {
    let rawText;

    if (file.mimeType === 'application/vnd.google-apps.document') {
      // exported Google Doc
      const { data } = await drive.files.export(
        { fileId: file.id, mimeType: 'text/plain' },
        { responseType: 'text' }
      );
      rawText = data;
    } else {
      // true .md file
      const { data } = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'text' }
      );
      rawText = data;
    }

    const { data: frontmatter } = matter(rawText);
    return {
      slug: file.name.replace(/\.md$/, ''),
      ...frontmatter,
    };
  }));

  // 3) Sort descending by date
  return projects.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Return full project data (metadata + HTML) for one slug from Google Drive.
 */
export async function getCurrentProjectData(slug) {
  const client   = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_CURRENT_PROJECTS;
  const fileName = `${slug}.md`;

  // Find file
  const { data: { files = [] } } = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name='${fileName}'`,
    fields: 'files(id,name,mimeType)',
  });
  console.log(`[getCurrentProjectData] lookup for "${slug}":`, files);

  if (files.length === 0) {
    throw new Error(`Project "${slug}" not found`);
  }

  // Download raw text
  const file    = files[0];
  let rawText;
  if (file.mimeType === 'application/vnd.google-apps.document') {
    const { data } = await drive.files.export(
      { fileId: file.id, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    rawText = data;
  } else {
    const { data } = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'text' }
    );
    rawText = data;
  }

  // Parse frontmatter + markdown→HTML
  const { data: frontmatter, content } = matter(rawText);
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype,    { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);

  return {
    slug,
    ...frontmatter,
    contentHtml: processed.toString(),
  };
}
