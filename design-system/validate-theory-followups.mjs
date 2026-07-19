import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { LEARNING_CATALOG } = require('./learning-navigation.js');
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

const theoryItems = LEARNING_CATALOG
  .flatMap((group) => group.items)
  .filter((item) => item.type === 'theory' && item.status === 'available');

function stripMarkup(value) {
  return value.replace(/<[^>]+>/g, '').replace(/&(?:nbsp|ensp|emsp);/g, ' ').trim();
}

for (const item of theoryItems) {
  const target = path.resolve(projectRoot, item.path);
  if (!fs.existsSync(target)) {
    errors.push(`${item.path}: 理论页面不存在`);
    continue;
  }

  const html = fs.readFileSync(target, 'utf8');
  const sections = [...html.matchAll(/<section class="theory-followups"(?:\s[^>]*)?>([\s\S]*?)<\/section>/g)];
  if (sections.length !== 1) {
    errors.push(`${item.path}: 应有且仅有一个 theory-followups 区域，实际 ${sections.length} 个`);
    continue;
  }

  const section = sections[0][1];
  const questionItems = [...section.matchAll(/<li class="theory-followups__item">([\s\S]*?)<\/li>/g)];
  if (questionItems.length < 5) {
    errors.push(`${item.path}: 理论追问至少 5 题，实际 ${questionItems.length} 题`);
  }

  questionItems.forEach((match, index) => {
    const block = match[1];
    const label = `${item.path}: 第 ${index + 1} 题`;
    const questionMatches = [...block.matchAll(/<p class="theory-followups__question">([\s\S]*?)<\/p>/g)];
    if (questionMatches.length !== 1 || !stripMarkup(questionMatches[0]?.[1] ?? '')) {
      errors.push(`${label} 缺少唯一且非空的问题文本`);
    }

    const answers = [...block.matchAll(/<details class="theory-answer"([^>]*)>([\s\S]*?)<\/details>/g)];
    if (answers.length !== 1) {
      errors.push(`${label} 应有且仅有一个折叠答案，实际 ${answers.length} 个`);
      return;
    }

    const [, attributes, answerBlock] = answers[0];
    if (/(?:^|\s)open(?:\s|=|$)/.test(attributes)) {
      errors.push(`${label} 的参考答案不得默认展开`);
    }

    const summary = answerBlock.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] ?? '';
    if (!stripMarkup(summary)) errors.push(`${label} 的 summary 为空`);

    const body = answerBlock.match(/<div class="theory-answer__body">([\s\S]*?)<\/div>/)?.[1] ?? '';
    if (!stripMarkup(body)) errors.push(`${label} 的参考答案为空`);
  });
}

if (errors.length) {
  console.error(`理论追问校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const questionTotal = theoryItems.reduce((total, item) => {
  const html = fs.readFileSync(path.resolve(projectRoot, item.path), 'utf8');
  return total + (html.match(/class="theory-followups__item"/g) ?? []).length;
}, 0);

console.log(`理论追问校验通过：${theoryItems.length} 个 available 理论页面，${questionTotal} 道追问及对应折叠答案。`);
