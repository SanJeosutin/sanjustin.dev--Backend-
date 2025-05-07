import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { google } from 'googleapis';

// Google Drive authentication setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

/**
 * Return metadata for all projects from Google Drive, sorted by date descending.
 */
export async function getAllCurrentProjects() {
  const client = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_CURRENT_PROJECTS;

  // List all markdown files in the Drive folder
  const listRes = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name contains '.md'`,
    fields: 'files(id,name)',
  });

  const projects = [];
  for (const file of listRes.data.files || []) {
    // Download file content
    const fileRes = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'text' }
    );
    // Parse frontmatter
    const { data: frontmatter } = matter(fileRes.data.toString());
    projects.push({
      slug: file.name.replace(/\.md$/, ''),
      ...frontmatter,
    });
  }

  // Sort by date descending
  return projects.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Return full project data (metadata + HTML) for one slug from Google Drive.
 */
export async function getCurrentProjectData(slug) {
  const client = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_CURRENT_PROJECTS;
  const fileName = `${slug}.md`;

  // Find the file by name
  const listRes = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name='${fileName}'`,
    fields: 'files(id,name)',
  });
  const files = listRes.data.files || [];
  if (files.length === 0) {
    throw new Error(`Project "${slug}" not found`);
  }

  // Download file content
  const fileRes = await drive.files.get(
    { fileId: files[0].id, alt: 'media' },
    { responseType: 'text' }
  );
  const { data: frontmatter, content } = matter(fileRes.data.toString());

  // Convert markdown to HTML
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);

  return {
    slug,
    ...frontmatter,
    contentHtml: processed.toString(),
  };
}
