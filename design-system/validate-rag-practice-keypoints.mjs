import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RAG_PRACTICE_TARGETS,
  validateRagPracticePages,
} from './rag-practice-keypoints-validation.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = (relative) => path.resolve(projectRoot, relative);
const errors = validateRagPracticePages({
  exists: (relative) => fs.existsSync(target(relative)),
  readText: (relative) => fs.readFileSync(target(relative), 'utf8'),
});

if (errors.length) {
  console.error(`RAG 日常实践关键点校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`RAG 日常实践关键点校验通过: ${RAG_PRACTICE_TARGETS.length} 个理论单元满足结构与内容契约。`);
