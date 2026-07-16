import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { LEARNING_CATALOG } = require('./learning-navigation.js');
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const learningDirectories = ['docs', 'roadmap', 'assessment', 'interview'];
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

const groups = [...LEARNING_CATALOG].sort((a, b) => a.order - b.order);
const items = groups.flatMap((group) => group.items.map((item) => ({ ...item, groupId: group.id })));
const availableItems = items.filter((item) => item.status === 'available');
const ids = new Set();
const paths = new Set();

for (const group of groups) {
  const orders = new Set();
  for (const item of group.items) {
    if (ids.has(item.id)) errors.push(`重复条目 ID: ${item.id}`);
    ids.add(item.id);

    if (orders.has(item.order)) errors.push(`分组 ${group.id} 中重复顺序: ${item.order}`);
    orders.add(item.order);

    if (item.status === 'available' && !item.path) errors.push(`可用条目缺少路径: ${item.id}`);
    if (item.status === 'planned' && item.path) errors.push(`待建设条目不应指向已发布路径: ${item.id}`);

    if (item.path) {
      const normalized = item.path.replaceAll('\\', '/');
      if (paths.has(normalized)) errors.push(`重复目标路径: ${normalized}`);
      paths.add(normalized);
    }
  }
}

for (const item of availableItems) {
  const target = path.resolve(projectRoot, item.path);
  if (!fs.existsSync(target)) errors.push(`目标不存在: ${item.id} -> ${item.path}`);
}

const htmlFiles = learningDirectories.flatMap((directory) => collectHtml(path.resolve(projectRoot, directory)));
const registeredHtml = new Set(
  availableItems
    .filter((item) => item.path.endsWith('.html'))
    .map((item) => path.resolve(projectRoot, item.path)),
);

for (const htmlFile of htmlFiles) {
  const relative = path.relative(projectRoot, htmlFile).replaceAll(path.sep, '/');
  const source = fs.readFileSync(htmlFile, 'utf8');
  if (!source.includes('learning-navigation.js')) errors.push(`页面未加载统一导航: ${relative}`);
  if (!source.includes('class="learning-nav"')) errors.push(`页面缺少无脚本顶部导航: ${relative}`);
  if (!registeredHtml.has(htmlFile)) errors.push(`已发布页面未注册: ${relative}`);
}

for (const registered of registeredHtml) {
  if (!htmlFiles.includes(registered)) {
    errors.push(`注册 HTML 不在学习目录中: ${path.relative(projectRoot, registered).replaceAll(path.sep, '/')}`);
  }
}

if (errors.length) {
  console.error(`导航校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`导航校验通过: ${groups.length} 个分组, ${items.length} 个条目, ${htmlFiles.length} 个学习页面。`);
