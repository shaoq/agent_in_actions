import {
  RAG_REFERENCE_INTERVIEW_IDS,
  RAG_REFERENCE_TARGETS,
  validateRagReferenceAssets,
  validateRagReferencePage,
} from './rag-reference-integration-validation.mjs';

const target = RAG_REFERENCE_TARGETS[1];
const longText = '稳定身份、版本、内容寻址、恢复、约束和验证证据共同构成生产链路。'.repeat(300);
const validPage = `<link href="../../design-system/blueprint.css"><script src="../../design-system/learning-navigation.js"></script>
<section data-rag-core-concepts>
${target.modules.map((module) => `<section data-rag-reference-module="${module}">${longText}</section>`).join('')}
${target.details.map((detail) => `<section data-rag-reference-detail="${detail}">${longText}</section>`).join('')}
</section><h2>工程要点</h2>
<div data-rag-practice-keypoints>${target.terms.join(' ')}<section data-practice-part="evidence"><div data-rag-reference-practice="fixture">${longText}</div><table data-rag-reference-practice-map>${target.practiceIds.map((id, index) => `<tr data-rag-reference-practice-id="${id}" data-rag-reference-interview-id="${target.interviewIds[index % target.interviewIds.length]}"></tr>`).join('')}</table></section></div>`;

function expect(label, html, expected) {
  const errors = validateRagReferencePage({ target, html });
  if (!errors.some((error) => error.includes(expected))) {
    throw new Error(`RAG 参考知识负向测试失败：${label}\n实际错误：${errors.join('\n')}`);
  }
}

if (validateRagReferencePage({ target, html: validPage }).length) {
  throw new Error(`合法 fixture 未通过：${validateRagReferencePage({ target, html: validPage }).join('\n')}`);
}
expect('缺深化模块', validPage.replace('data-rag-reference-module="identity-model"', 'data-missing-module="identity-model"'), '模块 identity-model');
expect('缺身份术语', validPage.replaceAll('content_id = namespace + content_hash', 'content object'), 'content_id = namespace + content_hash');
expect('实践回扣跑到核心前', validPage.replace(
  '<section data-rag-core-concepts>',
  '<div data-rag-reference-practice="bad"></div><section data-rag-core-concepts>',
), '必须有且仅有一个');
expect('泄露本地路径', `${validPage}/Users/jie.hua/Documents/Developments/Projects/agents_glm`, '不得暴露');

const files = new Map();
for (const item of RAG_REFERENCE_TARGETS) files.set(item.path, item === target ? validPage : validPage
  .replaceAll(target.modules.map((module) => `data-rag-reference-module="${module}"`).join('|'), ''));

const downstreamFixtures = {
  'docs/04-knowledge-rag.html': '<div data-rag-reference-overview="identity-and-control">namespace + content_hash document_id version_id</div>',
  'docs/knowledge-rag/index.html': '<div data-rag-reference-index="learning-thread">Query Transformation Semantic Support Pareto</div>',
  'assessment/04-knowledge-rag-theory-checkpoint.html': '<div data-rag-reference-checkpoint="deep-contract">namespace+hash HITL Context Budget semantic support oracle/ablation</div>',
  'assessment/answers/04-knowledge-rag.html': `<div data-rag-reference-answer="integrated-model">source_system_id source_object_id content_id = namespace + content_hash staging Pareto</div>${['task-a', 'task-b', 'task-c', 'task-d', 'task-e'].map((id) => `<div data-rag-reference-task-artifact="${id}"></div>`).join('')}`,
};
for (const [path, html] of Object.entries(downstreamFixtures)) files.set(path, html);
files.set('interview/04-knowledge-rag-questions.html', RAG_REFERENCE_INTERVIEW_IDS.map((id) => `<article class="question-card" data-question-id="${id}"><ol><li>a</li><li>b</li><li>c</li><li>d</li></ol></article>`).join(''));
files.set('interview/suggested-answers.html', RAG_REFERENCE_INTERVIEW_IDS.map((id) => `<p data-rag-reference-interview="${id}">深化</p>`).join(''));

const missingDownstream = new Map(files);
missingDownstream.set('docs/04-knowledge-rag.html', '<div>identity only</div>');
const errors = validateRagReferenceAssets({
  exists: (path) => missingDownstream.has(path),
  readText: (path) => missingDownstream.get(path),
});
if (!errors.some((error) => error.includes('data-rag-reference-overview'))) {
  throw new Error(`未检出下游同步退化：${errors.join('\n')}`);
}

console.log('RAG 参考知识整合负向测试通过：核心模块、身份语义、实践回扣、路径安全与下游同步退化均可检出。');
