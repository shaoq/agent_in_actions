import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L2_CORE_TARGETS } from './l2-core-concepts-manifest.mjs';
import { validateL2CorePages } from './l2-core-concepts-validation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = validateL2CorePages({
  exists: (relative) => fs.existsSync(path.join(root, relative)),
  readText: (relative) => fs.readFileSync(path.join(root, relative), 'utf8'),
});
if (errors.length) {
  console.error(`L2 非 RAG 深度核心概念校验失败，共 ${errors.length} 项:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`L2 非 RAG 深度核心概念校验通过：${L2_CORE_TARGETS.length} 页、${L2_CORE_TARGETS.reduce((sum, target) => sum + target.stages.length, 0)} 个 stage 与实践形成双向闭环。`);
