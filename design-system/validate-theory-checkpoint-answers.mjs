import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  ANSWER_DIAGRAM_TARGETS,
  validateAnswerDiagramTargets,
} from './theory-checkpoint-answer-diagrams.mjs';

const require = createRequire(import.meta.url);
const { LEARNING_CATALOG } = require('./learning-navigation.js');
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const requiredParts = [
  'checkpoint-answer__model',
  'checkpoint-answer__evidence',
  'checkpoint-answer__bands',
  'checkpoint-answer__variants',
  'checkpoint-answer__deductions',
  'checkpoint-answer__remediation',
];
const diagramManifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'design-system/learning-diagrams.json'), 'utf8'));

if (ANSWER_DIAGRAM_TARGETS.length !== 14) errors.push(`图形化答案目标应为 14 项，实际为 ${ANSWER_DIAGRAM_TARGETS.length}`);
const targetDiagramCount = ANSWER_DIAGRAM_TARGETS.reduce((total, target) => total + target.diagramIds.length, 0);
if (targetDiagramCount !== 16) errors.push(`图形化答案图表实例应为 16 个，实际为 ${targetDiagramCount}`);

function read(relativePath) {
  const target = path.resolve(projectRoot, relativePath);
  if (!fs.existsSync(target)) return null;
  return fs.readFileSync(target, 'utf8');
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

const targetGroups = LEARNING_CATALOG.filter((group) => ['L0', 'L1', 'L2'].includes(group.stage));
const checkpoints = targetGroups.flatMap((group) => group.items
  .filter((item) => item.type === 'checkpoint' && item.status === 'available')
  .map((item) => ({ ...item, group })));
const answers = targetGroups.flatMap((group) => group.items
  .filter((item) => item.type === 'suggested-answer' && item.status === 'available')
  .map((item) => ({ ...item, group })));

if (checkpoints.length !== 11) errors.push(`理论检查点数量应为 11，实际为 ${checkpoints.length}`);
if (answers.length !== 11) errors.push(`建议答案数量应为 11，实际为 ${answers.length}`);

for (const checkpoint of checkpoints) {
  const matches = answers.filter((answer) => answer.answerFor === checkpoint.id);
  if (matches.length !== 1) {
    errors.push(`${checkpoint.id} 应恰有一个建议答案，实际为 ${matches.length}`);
    continue;
  }

  const answer = matches[0];
  if (answer.group.id !== checkpoint.group.id) errors.push(`${answer.id} 与 ${checkpoint.id} 不在同一学习分组`);
  if (answer.order !== checkpoint.order + 1) errors.push(`${answer.id} 未紧邻 ${checkpoint.id}`);

  const checkpointSource = read(checkpoint.path);
  const answerSource = read(answer.path);
  if (!checkpointSource) {
    errors.push(`检查点文件不存在: ${checkpoint.path}`);
    continue;
  }
  if (!answerSource) {
    errors.push(`答案文件不存在: ${answer.path}`);
    continue;
  }

  const answerFromCheckpoint = path.relative(path.dirname(path.resolve(projectRoot, checkpoint.path)), path.resolve(projectRoot, answer.path)).replaceAll(path.sep, '/');
  const checkpointFromAnswer = path.relative(path.dirname(path.resolve(projectRoot, answer.path)), path.resolve(projectRoot, checkpoint.path)).replaceAll(path.sep, '/');
  if (!checkpointSource.includes(`href="${answerFromCheckpoint}"`)) errors.push(`${checkpoint.path} 未链接答案 ${answerFromCheckpoint}`);
  if (!answerSource.includes(`href="${checkpointFromAnswer}"`)) errors.push(`${answer.path} 未链接检查点 ${checkpointFromAnswer}`);
  if (checkpointSource.includes('参考答案要点') || checkpointSource.includes('data-task-answer') || checkpointSource.includes('class="checkpoint-answers"')) {
    errors.push(`${checkpoint.path} 仍包含内嵌答案内容`);
  }
  if (!answerSource.includes('learning-navigation.js')) errors.push(`${answer.path} 未加载统一导航`);
  if (!answerSource.includes('class="learning-nav"')) errors.push(`${answer.path} 缺少顶部学习导航`);
  if (!answerSource.includes(`data-checkpoint-answer-for="${checkpoint.id}"`)) errors.push(`${answer.path} 缺少对应 checkpoint ID`);

  const tasks = [...answerSource.matchAll(/<article class="answer-block checkpoint-answer-task" data-task-id="([^"]+)">([\s\S]*?)<\/article>/g)];
  if (tasks.length !== 5) errors.push(`${answer.path} 应包含 5 项任务校准，实际为 ${tasks.length}`);
  const taskIds = new Set();
  const taskBodies = new Map();
  for (const [, taskId, body] of tasks) {
    if (taskIds.has(taskId)) errors.push(`${answer.path} 重复任务 ID: ${taskId}`);
    taskIds.add(taskId);
    taskBodies.set(taskId, body);
    for (const part of requiredParts) {
      const matches = [...body.matchAll(new RegExp(`<section class="[^"]*${part}[^"]*"[^>]*>([\\s\\S]*?)<\\/section>`, 'g'))];
      if (matches.length !== 1) {
        errors.push(`${answer.path} 的 ${taskId} 应恰有一个 ${part}，实际为 ${matches.length}`);
        continue;
      }
      const match = matches[0];
      const content = match?.[1].replace(/<h3[^>]*>[\s\S]*?<\/h3>/, ' ');
      const text = content?.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
      if (!text || text.length < 20) errors.push(`${answer.path} 的 ${taskId} 缺少实质性 ${part}`);
      if (part === 'checkpoint-answer__model') {
        const contentBlocks = count(content ?? '', /<(?:p|ol|ul|pre|table|div)\b/g);
        if ((text?.length ?? 0) < 180) errors.push(`${answer.path} 的 ${taskId} 完整示范答案过短（${text?.length ?? 0} 字符，至少 180）`);
        if (contentBlocks < 2) errors.push(`${answer.path} 的 ${taskId} 完整示范答案至少需要两个实质内容块，实际为 ${contentBlocks}`);
        if (!match[1].includes('<h3>完整示范答案</h3>')) errors.push(`${answer.path} 的 ${taskId} 未使用“完整示范答案”标题`);
      }
    }
  }
  errors.push(...validateAnswerDiagramTargets({
    answerPath: answer.path,
    taskBodies,
    manifest: diagramManifest,
  }));

  const checkpointTaskIds = [...checkpointSource.matchAll(/data-task-id="([^"]+)"/g)].map((match) => match[1]);
  const checkpointTaskIdSet = new Set(checkpointTaskIds);
  if (checkpointTaskIds.length !== 5 || checkpointTaskIdSet.size !== 5) {
    errors.push(`${checkpoint.path} 应包含 5 个唯一任务 ID，实际为 ${checkpointTaskIds.length} 个声明、${checkpointTaskIdSet.size} 个唯一值`);
  }
  for (const taskId of checkpointTaskIdSet) {
    if (!taskIds.has(taskId)) errors.push(`${answer.path} 缺少检查点任务 ${taskId} 的校准内容`);
  }
  for (const taskId of taskIds) {
    if (!checkpointTaskIdSet.has(taskId)) errors.push(`${answer.path} 包含检查点中不存在的任务 ID: ${taskId}`);
  }
}

for (const answer of answers) {
  if (!checkpoints.some((checkpoint) => checkpoint.id === answer.answerFor)) errors.push(`${answer.id} 指向不存在的检查点 ${answer.answerFor}`);
}

if (errors.length) {
  console.error(`检查点答案校验失败，共 ${errors.length} 项:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`检查点答案校验通过: ${checkpoints.length} 个检查点、${answers.length} 个独立建议答案与 ${targetDiagramCount} 个图表实例满足契约。`);
