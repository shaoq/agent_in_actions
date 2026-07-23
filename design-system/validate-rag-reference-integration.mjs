import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAG_REFERENCE_TARGETS, validateRagReferenceAssets } from './rag-reference-integration-validation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = validateRagReferenceAssets({
  exists: (relativePath) => fs.existsSync(path.join(root, relativePath)),
  readText: (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8'),
});

if (errors.length) {
  console.error(`RAG 参考知识整合校验失败，共 ${errors.length} 项：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const moduleCount = RAG_REFERENCE_TARGETS.reduce((sum, target) => sum + target.modules.length, 0);
console.log(`RAG 参考知识整合校验通过：5 个单元、${moduleCount} 个深化模块、5 个实践回扣及 8 组面试问答已形成一致链路。`);
