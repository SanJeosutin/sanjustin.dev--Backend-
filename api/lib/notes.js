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
 * Return metadata for all notes, sorted by date descending.
 */
export async function getAllNotes() {
  const client   = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_NOTES;

  // List with mimeType
  const { data: { files = [] } } = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name contains '.md'`,
    fields: 'files(id,name,mimeType)',
  });
  console.log('[getAllNotes] files:', files);

  // Download & parse each
  const notes = await Promise.all(files.map(async file => {
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

    const { data: frontmatter } = matter(rawText);
    return {
      slug: file.name.replace(/\.md$/, ''),
      ...frontmatter,
    };
  }));

  return notes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Return full note data (frontmatter + contentHtml) for a given slug.
 */
export async function getNoteData(slug) {
  const client   = await auth.getClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID_NOTES;
  const fileName = `${slug}.md`;

  // Find file
  const { data: { files = [] } } = await drive.files.list({
    auth: client,
    q: `'${folderId}' in parents and name='${fileName}'`,
    fields: 'files(id,name,mimeType)',
  });
  console.log(`[getNoteData] lookup for "${slug}":`, files);

  if (!files.length) {
    throw new Error(`Note "${slug}" not found`);
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

  // Parse + markdown→HTML
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
