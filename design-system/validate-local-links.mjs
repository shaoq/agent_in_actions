import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['docs', 'roadmap', 'assessment', 'interview'];
const errors = [];

function collectHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(target));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}

for (const htmlPath of roots.flatMap((root) => collectHtml(path.join(projectRoot, root)))) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (!reference || reference.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/.test(reference)) continue;
    const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    const target = path.resolve(path.dirname(htmlPath), pathname);
    if (!fs.existsSync(target)) {
      const source = path.relative(projectRoot, htmlPath).split(path.sep).join('/');
      errors.push(`${source} -> ${reference}`);
    }
  }
}

if (errors.length) {
  console.error(`本地链接校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('本地链接校验通过。');
