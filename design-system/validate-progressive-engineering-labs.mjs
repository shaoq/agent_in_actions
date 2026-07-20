import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { validateEngineeringLabs } from './engineering-lab-validation.mjs';

const require = createRequire(import.meta.url);
const { LEARNING_CATALOG } = require('./learning-navigation.js');
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'design-system/engineering-labs.json'), 'utf8'),
);
const target = (relative) => path.resolve(projectRoot, relative);

const errors = validateEngineeringLabs({
  manifest,
  catalog: LEARNING_CATALOG,
  exists: (relative) => fs.existsSync(target(relative)),
  readText: (relative) => fs.readFileSync(target(relative), 'utf8'),
});

if (errors.length) {
  console.error(`渐进工程案例校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`渐进工程案例校验通过: ${manifest.labs.length} 个案例形成 E0～E4 连续路径。`);
