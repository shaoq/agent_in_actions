import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  collectFiles,
  diagramFingerprint,
  fingerprintLabel,
  mmdcPath,
  mermaidArgs,
  mermaidEnvironment,
  projectRoot,
  readManifest,
  relativeFromRoot,
} from './diagram-tooling.mjs';

const errors = [];
const manifest = readManifest();
const ids = new Set();
const pages = new Set(manifest.diagrams.map((diagram) => diagram.page));
const managedSources = collectFiles(path.join(projectRoot, 'docs'), '.mmd');
const manifestSources = new Set(manifest.diagrams.map((diagram) => diagram.source));

function fail(message) {
  errors.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (!fs.existsSync(mmdcPath)) fail('未找到 Mermaid CLI。请先运行 npm ci。');

for (const sourcePath of managedSources) {
  const source = relativeFromRoot(sourcePath);
  if (!manifestSources.has(source)) fail(`源码未登记到迁移清单: ${source}`);
}

for (const diagram of manifest.diagrams) {
  if (ids.has(diagram.id)) fail(`重复图表 ID: ${diagram.id}`);
  ids.add(diagram.id);

  if (!['flowchart', 'sequence', 'state'].includes(diagram.type)) fail(`未知图表类型: ${diagram.id} -> ${diagram.type}`);
  if (!diagram.alt?.trim()) fail(`图表缺少 alt: ${diagram.id}`);
  if (!diagram.caption?.trim()) fail(`图表缺少 caption: ${diagram.id}`);

  const pagePath = path.join(projectRoot, diagram.page);
  const sourcePath = path.join(projectRoot, diagram.source);
  const svgPath = path.join(projectRoot, diagram.svg);
  if (!fs.existsSync(pagePath)) fail(`页面不存在: ${diagram.page}`);
  if (!fs.existsSync(sourcePath)) fail(`Mermaid 源码不存在: ${diagram.source}`);
  if (!fs.existsSync(svgPath)) fail(`SVG 生成物不存在: ${diagram.svg}`);
  if (!fs.existsSync(sourcePath) || !fs.existsSync(mmdcPath)) continue;

  const syntaxOutput = path.join(os.tmpdir(), `agent-in-actions-${process.pid}-${diagram.id}.svg`);
  const syntaxResult = spawnSync(mmdcPath, mermaidArgs(sourcePath, syntaxOutput), {
    cwd: projectRoot,
    encoding: 'utf8',
    env: mermaidEnvironment(),
  });
  if (fs.existsSync(syntaxOutput)) fs.rmSync(syntaxOutput);
  if (syntaxResult.status !== 0) {
    fail(`Mermaid 语法无效: ${diagram.source} -> ${(syntaxResult.stderr || syntaxResult.stdout || '未知错误').trim()}`);
  }

  if (fs.existsSync(svgPath)) {
    const svg = fs.readFileSync(svgPath, 'utf8');
    const expected = diagramFingerprint(sourcePath);
    const match = svg.match(new RegExp(`<!--\\s*${fingerprintLabel}:\\s*([a-f0-9]{64})\\s*-->`));
    if (!match) fail(`SVG 缺少输入指纹: ${diagram.svg}`);
    else if (match[1] !== expected) fail(`SVG 与源码或主题不同步: ${diagram.svg}`);
  }

  if (fs.existsSync(pagePath)) {
    const html = fs.readFileSync(pagePath, 'utf8');
    const sourceRef = path.posix.relative(path.posix.dirname(diagram.page), diagram.source);
    const svgRef = path.posix.relative(path.posix.dirname(diagram.page), diagram.svg);
    const figurePattern = new RegExp(
      `<figure\\s+class="[^"]*learning-diagram[^"]*"\\s+data-diagram-source="${escapeRegExp(sourceRef)}"[\\s\\S]*?<\\/figure>`,
    );
    const figure = html.match(figurePattern)?.[0];
    if (!figure) {
      fail(`页面缺少受管 figure: ${diagram.page} -> ${sourceRef}`);
    } else {
      if (!figure.includes(`src="${svgRef}"`)) fail(`figure 未引用对应 SVG: ${diagram.page} -> ${svgRef}`);
      if (!figure.includes(`alt="${diagram.alt}"`)) fail(`figure alt 与迁移清单不一致: ${diagram.id}`);
      if (!figure.includes(`<figcaption>`)) fail(`figure 缺少 figcaption: ${diagram.id}`);
      if (!figure.includes(diagram.caption)) fail(`figure caption 与迁移清单不一致: ${diagram.id}`);
      if (!figure.includes(`href="${sourceRef}"`)) fail(`figure 缺少 Mermaid 源码入口: ${diagram.id}`);
      if (!figure.includes(`href="${svgRef}"`)) fail(`figure 缺少 SVG 原图入口: ${diagram.id}`);
    }
  }
}

for (const page of pages) {
  const pagePath = path.join(projectRoot, page);
  if (!fs.existsSync(pagePath)) continue;
  const html = fs.readFileSync(pagePath, 'utf8');
  if (/class="[^"]*language-mermaid/.test(html)) fail(`页面残留 language-mermaid 代码块: ${page}`);
  if (/<pre[^>]*>[\s\S]*?(flowchart|sequenceDiagram|stateDiagram-v2)/.test(html)) fail(`页面仍默认展示 Mermaid DSL: ${page}`);
}

if (errors.length) {
  console.error(`图表完整性校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`图表完整性校验通过: ${manifest.diagrams.length} 张图, ${pages.size} 个页面。`);
