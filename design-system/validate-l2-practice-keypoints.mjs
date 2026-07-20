import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L2_PRACTICE_TARGETS } from './l2-practice-manifest.mjs';
import { validateL2PracticePages } from './l2-practice-keypoints-validation.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = (relative) => path.resolve(projectRoot, relative);
const errors = validateL2PracticePages({
  exists: (relative) => fs.existsSync(target(relative)),
  readText: (relative) => fs.readFileSync(target(relative), 'utf8'),
});

if (errors.length) {
  console.error(`L2 非 RAG 日常实践关键点校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`L2 非 RAG 日常实践关键点校验通过: ${L2_PRACTICE_TARGETS.length} 个理论单元满足结构与内容契约。`);
