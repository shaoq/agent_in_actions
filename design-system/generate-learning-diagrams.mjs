import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  collectManagedDiagramSources,
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
const managedSources = collectManagedDiagramSources();
const manifestSources = new Set(manifest.diagrams.map((diagram) => diagram.source));

if (!fs.existsSync(mmdcPath)) {
  errors.push('未找到 Mermaid CLI。请先运行 npm ci。');
}

for (const sourcePath of managedSources) {
  const relativeSource = relativeFromRoot(sourcePath);
  if (!manifestSources.has(relativeSource)) errors.push(`源码未登记到迁移清单: ${relativeSource}`);
}
for (const relativeSource of manifestSources) {
  if (!fs.existsSync(path.join(projectRoot, relativeSource))) errors.push(`迁移清单源码不存在: ${relativeSource}`);
}

if (errors.length) {
  console.error(`图表生成准备失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

let generated = 0;
for (const sourcePath of managedSources) {
  const svgPath = sourcePath.replace(/\.mmd$/, '.svg');
  const temporaryPath = `${svgPath}.tmp.svg`;
  const result = spawnSync(mmdcPath, mermaidArgs(sourcePath, temporaryPath), {
    cwd: projectRoot,
    encoding: 'utf8',
    env: mermaidEnvironment(),
  });
  if (result.status !== 0) {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath);
    console.error(`图表生成失败: ${relativeFromRoot(sourcePath)}`);
    console.error((result.stderr || result.stdout || 'Mermaid CLI 未返回详细信息').trim());
    process.exit(result.status || 1);
  }

  const fingerprint = diagramFingerprint(sourcePath);
  const svg = fs.readFileSync(temporaryPath, 'utf8');
  const stamped = svg.replace(/(<svg\b)/, `<!-- ${fingerprintLabel}: ${fingerprint} -->\n$1`);
  fs.writeFileSync(temporaryPath, stamped);
  fs.renameSync(temporaryPath, svgPath);
  generated += 1;
  console.log(`已生成 ${relativeFromRoot(svgPath)}`);
}

console.log(`图表生成完成: ${generated} 张 SVG。`);
