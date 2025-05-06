import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

// Return metadata for all projects, sorted by date descending
export function getAllCurrentProjects(projectsDir) {
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));
  const projects = files.map(fname => {
    const slug = fname.replace(/\.md$/, '');
    const fullPath = path.join(projectsDir, fname);
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
    return { slug, ...data };
  });
  return projects.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Return full project data (metadata + HTML) for one slug
export async function getCurrentProjectData(slug, projectsDir) {
  const fullPath = path.join(projectsDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Project "${slug}" not found`);
  }
  const file = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(file);

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
