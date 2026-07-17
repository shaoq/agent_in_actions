import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const interviewRoot = path.join(projectRoot, 'interview');
const answerPath = path.join(interviewRoot, 'suggested-answers.html');
const questionFiles = {
  ORC: ['01-orchestration-questions.html', 8],
  REA: ['02-reasoning-core-questions.html', 8],
  TOOL: ['03-tools-actions-questions.html', 8],
  RAG: ['04-knowledge-rag-questions.html', 8],
  MEM: ['05-memory-system-questions.html', 8],
  GOV: ['06-governance-observability-questions.html', 8],
  EVAL: ['07-evaluation-questions.html', 8],
  GW: ['08-model-gateway-infrastructure-questions.html', 8],
  INT: ['09-interaction-access-questions.html', 8],
  SYS: ['10-system-design-debugging-questions.html', 6],
  DBG: ['10-system-design-debugging-questions.html', 6],
  PRJ: ['11-project-experience-questions.html', 8],
};
const requiredAnswerLabels = ['考察点', '30 秒回答', '3 分钟框架', '关键术语', '工程证据', '方案取舍', '常见错误', '追问提示'];
const errors = [];
const questions = new Map();
let followUpTotal = 0;

for (const [prefix, [filename, expectedCount]] of Object.entries(questionFiles)) {
  const html = fs.readFileSync(path.join(interviewRoot, filename), 'utf8');
  const matches = [...html.matchAll(/<article class="question-card" id="question-([a-z]+)-(\d{2})" data-question-id="([A-Z]+-\d{2})">([\s\S]*?)<\/article>/g)]
    .filter((match) => match[3].startsWith(`${prefix}-`));
  if (matches.length !== expectedCount) errors.push(`${filename}: ${prefix} 应有 ${expectedCount} 题，实际 ${matches.length} 题`);
  for (const [, idPrefix, number, questionId, block] of matches) {
    const expectedAnchor = `question-${questionId.toLowerCase()}`;
    if (`question-${idPrefix}-${number}` !== expectedAnchor) errors.push(`${filename}: ${questionId} 的题目锚点不匹配`);
    if (questions.has(questionId)) errors.push(`${filename}: 题号 ${questionId} 重复`);
    questions.set(questionId, { filename, anchor: expectedAnchor });
    for (const label of ['考察目标', '主问题', '连续追问', '练习要求']) {
      if (!block.includes(`<strong>${label}：</strong>`)) errors.push(`${filename}: ${questionId} 缺少“${label}”`);
    }
    if (!block.includes('<strong>对应课程：</strong>') && !block.includes('<strong>对应能力：</strong>')) {
      errors.push(`${filename}: ${questionId} 缺少“对应课程”或“对应能力”`);
    }
    const followUpBlock = block.match(/<ol class="follow-ups">([\s\S]*?)<\/ol>/)?.[1] ?? '';
    const followUpCount = (followUpBlock.match(/<li>/g) ?? []).length;
    if (followUpCount < 3) errors.push(`${filename}: ${questionId} 只有 ${followUpCount} 个追问`);
    followUpTotal += followUpCount;
    if (!block.includes(`suggested-answers.html#answer-${questionId.toLowerCase()}`)) errors.push(`${filename}: ${questionId} 缺少正确答案链接`);
  }
}

const answerHtml = fs.readFileSync(answerPath, 'utf8');
const answers = new Map();
for (const match of answerHtml.matchAll(/<article class="answer-card" id="answer-([a-z]+)-(\d{2})" data-answer-id="([A-Z]+-\d{2})">([\s\S]*?)<\/article>/g)) {
  const [, idPrefix, number, answerId, block] = match;
  const expectedAnchor = `answer-${answerId.toLowerCase()}`;
  if (`answer-${idPrefix}-${number}` !== expectedAnchor) errors.push(`suggested-answers.html: ${answerId} 的答案锚点不匹配`);
  if (answers.has(answerId)) errors.push(`suggested-answers.html: 答案 ${answerId} 重复`);
  answers.set(answerId, expectedAnchor);
  for (const label of requiredAnswerLabels) {
    if (!block.includes(`<strong>${label}：</strong>`)) errors.push(`suggested-answers.html: ${answerId} 缺少“${label}”`);
  }
  const question = questions.get(answerId);
  if (!question) errors.push(`suggested-answers.html: ${answerId} 没有对应题目`);
  else if (!block.includes(`${question.filename}#${question.anchor}`)) errors.push(`suggested-answers.html: ${answerId} 缺少正确原题链接`);
}

for (const questionId of questions.keys()) {
  if (!answers.has(questionId)) errors.push(`${questionId}: 缺少建议答案`);
}
if (questions.size !== 92) errors.push(`核心题应为 92 道，实际 ${questions.size} 道`);
if (answers.size !== 92) errors.push(`建议答案应为 92 份，实际 ${answers.size} 份`);
if (followUpTotal < 276) errors.push(`追问应不少于 276 个，实际 ${followUpTotal} 个`);

if (errors.length) {
  console.error(`面试题库一致性校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`面试题库一致性校验通过：${questions.size} 道核心题、${followUpTotal} 个追问、${answers.size} 份建议答案。`);
