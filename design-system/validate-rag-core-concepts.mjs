import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAG_CORE_TARGETS, validateRagCorePages } from './rag-core-concepts-validation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = validateRagCorePages({
  targets: RAG_CORE_TARGETS,
  exists: (relativePath) => fs.existsSync(path.join(root, relativePath)),
  readText: (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8'),
});

if (errors.length) {
  console.error(`RAG 深度核心概念校验失败，共 ${errors.length} 项：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const stageCount = RAG_CORE_TARGETS.reduce((total, target) => total + target.stages.length, 0);
const practiceCount = RAG_CORE_TARGETS.reduce((total, target) => total + target.practices.length, 0);
console.log(`RAG 深度核心概念校验通过：5 个理论单元、${stageCount} 个核心环节与 ${practiceCount} 个实践条目形成双向学习闭环。`);
