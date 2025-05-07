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
 * Return metadata for all notes, sorted by date descending.
 */
export async function getAllNotes() {
  const client   = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_NOTES;
  const listRes  = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name contains '.md'`,
    fields: 'files(id,name)',
  });

  const notes = [];
  for (const file of listRes.data.files || []) {
    const fileRes = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'text' }
    );
    const { data, content } = matter(fileRes.data.toString());
    notes.push({
      slug: file.name.replace(/\.md$/, ''),
      ...data
    });
  }

  return notes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Return full note data (frontmatter + contentHtml) for a given slug.
 */
export async function getNoteData(slug) {
  const client   = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_NOTES;
  const fileName = `${slug}.md`;
  const listRes  = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name='${fileName}'`,
    fields: 'files(id,name)',
  });

  const files = listRes.data.files || [];
  if (!files.length) {
    throw new Error(`Note "${slug}" not found`);
  }
  const fileId  = files[0].id;
  const fileRes = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'text' }
  );

  const { data, content } = matter(fileRes.data.toString());
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);

  return {
    slug,
    ...data,
    contentHtml: processed.toString()
  };
}
