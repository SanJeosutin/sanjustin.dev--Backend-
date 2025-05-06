import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

/**
 * Return metadata for all notes, sorted by date descending.
 */
export function getAllNotes(notesDir) {
  const files = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));
  const notes = files.map(fileName => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(notesDir, fileName);
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
    return { slug, ...data };
  });

  return notes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Return full note data (frontmatter + contentHtml) for a given slug.
 */
export async function getNoteData(slug, notesDir) {
  const fullPath = path.join(notesDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Note "${slug}" not found`);
  }

  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

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
