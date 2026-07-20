import { RAG_CORE_TARGETS } from './rag-core-concepts-validation.mjs';

export const RAG_PRACTICE_TARGETS = RAG_CORE_TARGETS.map((target) => target.path);
export const RAG_PRACTICE_PARTS = ['core', 'checklist', 'troubleshooting', 'evidence', 'interview'];
export const RAG_PRACTICE_DETAILS = ['trigger', 'diagnosis', 'action', 'validation', 'rollback-tradeoff', 'interview-hook'];
export const RAG_INTERVIEW_DETAILS = ['question', 'answer-outline', 'evidence', 'followups', 'boundary'];

const interview = (id, practices, concepts) => ({ id, practices, concepts });
export const RAG_PRACTICE_INTERVIEWS = {
  '01': [
    interview('interview-01-when-rag', ['practice-01-rag-routing', 'practice-01-typed-result'], ['offline-supply', 'orchestration-routing', 'request-contract', 'typed-outcome-trace']),
    interview('interview-01-budget-owner', ['practice-01-stage-deadline', 'practice-01-failure-owner'], ['orchestration-routing', 'typed-outcome-trace', 'authorization', 'generation-verification']),
    interview('interview-01-production-gate', ['practice-01-request-evidence-contract', 'practice-01-version-pinning', 'practice-01-production-acceptance'], ['request-contract', 'retrieval-evidence', 'offline-supply', 'typed-outcome-trace', 'generation-verification']),
  ],
  '02': [
    interview('interview-02-chunking-quality', ['practice-02-parse-sampling', 'practice-02-query-driven-chunking'], ['source-snapshot', 'parse-normalize', 'chunking']),
    interview('interview-02-idempotency-delete', ['practice-02-stable-lineage', 'practice-02-idempotent-ingestion', 'practice-02-deletion-revocation'], ['metadata-acl', 'stable-id-idempotency', 'lineage-delete']),
    interview('interview-02-index-upgrade', ['practice-02-index-health', 'practice-02-embedding-upgrade'], ['feature-index', 'quality-publish']),
  ],
  '03': [
    interview('interview-03-hybrid-fusion', ['practice-03-protect-query-constraints', 'practice-03-choose-retrieval-signals', 'practice-03-explainable-fusion'], ['query-understanding', 'rewrite-decompose', 'multi-retrieval', 'fusion']),
    interview('interview-03-threshold-budget', ['practice-03-calibrate-thresholds', 'practice-03-funnel-budget'], ['threshold-fallback', 'rerank', 'context-pack']),
    interview('interview-03-first-loss', ['practice-03-dedup-diversity', 'practice-03-candidate-trace'], ['dedup', 'context-pack', 'fusion', 'rerank']),
  ],
  '04': [
    interview('interview-04-authorization', ['practice-04-pre-retrieval-auth', 'practice-04-permission-cache', 'practice-04-reauth-use-point'], ['policy-enforcement', 'post-verification-revocation']),
    interview('interview-04-grounding-citations', ['practice-04-system-citations', 'practice-04-claim-evidence'], ['citation', 'claim-decomposition', 'support-grounding']),
    interview('interview-04-injection-conflict', ['practice-04-injection-isolation', 'practice-04-conflict-negative-tests'], ['untrusted-evidence', 'conflict-freshness']),
  ],
  '05': [
    interview('interview-05-gold-versions', ['practice-05-gold-evidence', 'practice-05-version-snapshot'], ['evaluation-unit-gold', 'version-snapshot']),
    interview('interview-05-first-divergence', ['practice-05-first-divergence', 'practice-05-oracle-ablation'], ['corpus-ingestion-metrics', 'retrieval-ranking-metrics', 'first-divergence', 'oracle-ablation']),
    interview('interview-05-release-feedback', ['practice-05-traffic-slices', 'practice-05-hard-fail', 'practice-05-online-feedback'], ['generation-citation-policy-metrics', 'slicing-release-feedback']),
  ],
};

const MIN_PART_LENGTH = { core: 50, checklist: 1400, troubleshooting: 120, evidence: 220, interview: 700 };
const MIN_CARD_LENGTH = 200;
const MIN_PRACTICE_DETAIL_LENGTH = 16;
const MIN_INTERVIEW_DETAIL_LENGTH = 28;
const MIN_ARTIFACT_LENGTH = 100;
const MIN_EXPERIENCE_NOTE_LENGTH = 70;

function stripMarkup(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|ensp|emsp);/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|apos);/g, 'x')
    .replace(/&#(?:x[\da-f]+|\d+);/gi, 'x')
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(startTag, name) {
  const assigned = startTag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  if (assigned) return assigned[1];
  return new RegExp(`\\b${name}(?=\\s|/?>)`, 'i').test(startTag) ? '' : null;
}

function findElementsByAttribute(html, attribute, expectedValue = null) {
  const starts = [];
  const tagPattern = /<([a-z][\w:-]*)\b[^>]*>/gi;
  for (const match of html.matchAll(tagPattern)) {
    const startTag = match[0];
    const value = attr(startTag, attribute);
    if (value === null || (expectedValue !== null && value !== expectedValue)) continue;
    starts.push({ tag: match[1].toLowerCase(), index: match.index, startTag, value });
  }
  return starts.map((start) => {
    const tokenPattern = new RegExp(`<\\/?${start.tag}\\b[^>]*>`, 'gi');
    tokenPattern.lastIndex = start.index;
    let depth = 0;
    let token;
    while ((token = tokenPattern.exec(html))) {
      depth += /^<\//.test(token[0]) ? -1 : 1;
      if (depth === 0) return { ...start, body: html.slice(start.index, tokenPattern.lastIndex), end: tokenPattern.lastIndex };
    }
    return { ...start, body: '', end: -1 };
  });
}

function valuesInOrder(html, attribute) {
  return [...html.matchAll(new RegExp(`<[^>]+\\b${attribute}="([^"]+)"[^>]*>`, 'gi'))].map((match) => match[1]);
}

function list(value) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function sameList(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function findTarget(relativePath, suppliedTarget) {
  return suppliedTarget ?? RAG_CORE_TARGETS.find((target) => target.path === relativePath);
}

export function validateRagPracticePage({ relativePath, html, target: suppliedTarget }) {
  const errors = [];
  const label = relativePath || '(unknown page)';
  const target = findTarget(relativePath, suppliedTarget);
  if (!target) return [`${label}: 未配置实践内容契约`];

  if (!html.includes('design-system/blueprint.css')) errors.push(`${label}: 未加载 Blueprint 样式`);
  if (!html.includes('design-system/learning-navigation.js') || !html.includes('class="learning-nav"')) {
    errors.push(`${label}: 未完整接入统一学习导航`);
  }

  const blocks = findElementsByAttribute(html, 'data-rag-practice-keypoints');
  if (blocks.length !== 1) {
    errors.push(`${label}: 应有且仅有一个日常实践关键点块，实际 ${blocks.length} 个`);
    return errors;
  }
  const block = blocks[0];
  if (!block.body) return [`${label}: 日常实践关键点块未正确闭合`];
  const interviewHeading = html.indexOf('<h2>面试表达</h2>');
  const nextHeading = html.indexOf('<h2>下一步</h2>');
  if (interviewHeading < 0 || nextHeading < 0 || !(interviewHeading < block.index && block.end <= nextHeading)) {
    errors.push(`${label}: 日常实践关键点块必须位于“面试表达”之后、“下一步”之前`);
  }
  const titles = [...block.body.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)];
  if (titles.length !== 1 || stripMarkup(titles[0]?.[1] ?? '') !== '日常实践关键点') {
    errors.push(`${label}: 实践块必须包含唯一标题“日常实践关键点”`);
  }

  const partNames = valuesInOrder(block.body, 'data-practice-part');
  if (!sameList(partNames, RAG_PRACTICE_PARTS)) {
    errors.push(`${label}: 五部分必须按 ${RAG_PRACTICE_PARTS.join(' → ')} 排列`);
  }
  const parts = new Map();
  for (const name of RAG_PRACTICE_PARTS) {
    const matches = findElementsByAttribute(block.body, 'data-practice-part', name);
    if (matches.length !== 1) errors.push(`${label}: data-practice-part="${name}" 应出现一次，实际 ${matches.length} 次`);
    else {
      parts.set(name, matches[0]);
      const length = stripMarkup(matches[0].body).length;
      if (length < MIN_PART_LENGTH[name]) errors.push(`${label}: ${name} 内容过短，至少 ${MIN_PART_LENGTH[name]} 字符，实际 ${length}`);
    }
  }

  const checklist = parts.get('checklist')?.body ?? '';
  const cards = findElementsByAttribute(checklist, 'data-practice-id');
  const expectedIds = target.practices.map((item) => item.id);
  const actualIds = cards.map((card) => card.value);
  if (!sameList(actualIds, expectedIds)) errors.push(`${label}: 7 张实践卡的稳定 ID、数量或顺序与契约不一致`);
  const duplicates = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${label}: 实践 ID 重复：${[...new Set(duplicates)].join('、')}`);
  const expectedById = new Map(target.practices.map((item) => [item.id, item.refs]));
  for (const card of cards) {
    if (card.tag !== 'li') errors.push(`${label}: ${card.value} 必须使用顶层 li 实践卡`);
    if (attr(card.startTag, 'id') !== card.value) errors.push(`${label}: ${card.value} 缺少同名页面锚点`);
    const refs = list(attr(card.startTag, 'data-concept-ref') ?? '');
    const expectedRefs = expectedById.get(card.value) ?? [];
    if (!sameList(refs, expectedRefs)) errors.push(`${label}: ${card.value} 的 concept ref 与稳定映射不一致`);
    if (stripMarkup(card.body).length < MIN_CARD_LENGTH) errors.push(`${label}: ${card.value} 内容过短，至少 ${MIN_CARD_LENGTH} 字符`);
    const detailOrder = valuesInOrder(card.body, 'data-practice-detail');
    if (!sameList(detailOrder, RAG_PRACTICE_DETAILS)) errors.push(`${label}: ${card.value} 六维内容必须按 ${RAG_PRACTICE_DETAILS.join(' → ')} 排列`);
    for (const detail of RAG_PRACTICE_DETAILS) {
      const matches = findElementsByAttribute(card.body, 'data-practice-detail', detail);
      if (matches.length !== 1) errors.push(`${label}: ${card.value} 的 ${detail} 应出现一次`);
      else if (stripMarkup(matches[0].body).length < MIN_PRACTICE_DETAIL_LENGTH) errors.push(`${label}: ${card.value} 的 ${detail} 内容过短`);
    }
  }

  const evidence = parts.get('evidence')?.body ?? '';
  const artifacts = findElementsByAttribute(evidence, 'data-practice-artifact');
  if (artifacts.length !== 1) errors.push(`${label}: evidence 必须包含唯一代表性工程产物`);
  else {
    if (stripMarkup(artifacts[0].body).length < MIN_ARTIFACT_LENGTH) errors.push(`${label}: 代表性工程产物内容过短`);
    if (!/<(?:pre|table|dl)\b/i.test(artifacts[0].body)) errors.push(`${label}: 代表性工程产物必须使用 pre、table 或 dl 展示数据形状`);
  }

  const interviewPart = parts.get('interview')?.body ?? '';
  const notes = findElementsByAttribute(interviewPart, 'data-practice-experience-note');
  if (notes.length !== 1) errors.push(`${label}: interview 必须包含唯一经验真实性提示`);
  else if (stripMarkup(notes[0].body).length < MIN_EXPERIENCE_NOTE_LENGTH) errors.push(`${label}: 经验真实性提示内容过短`);

  const expectedInterviews = RAG_PRACTICE_INTERVIEWS[target.unit];
  const interviewItems = findElementsByAttribute(interviewPart, 'data-practice-interview');
  const interviewIds = interviewItems.map((item) => item.value);
  if (!sameList(interviewIds, expectedInterviews.map((item) => item.id))) {
    errors.push(`${label}: 实践型面试项 ID、数量或顺序与契约不一致`);
  }
  const validPracticeIds = new Set(expectedIds);
  const validConcepts = new Set(target.stages);
  for (const item of interviewItems) {
    if (attr(item.startTag, 'id') !== item.value) errors.push(`${label}: ${item.value} 缺少同名页面锚点`);
    const expected = expectedInterviews.find((candidate) => candidate.id === item.value);
    const practiceRefs = list(attr(item.startTag, 'data-practice-ref') ?? '');
    const conceptRefs = list(attr(item.startTag, 'data-concept-ref') ?? '');
    if (practiceRefs.some((ref) => !validPracticeIds.has(ref))) errors.push(`${label}: ${item.value} 引用了未知实践`);
    if (conceptRefs.some((ref) => !validConcepts.has(ref))) errors.push(`${label}: ${item.value} 引用了未知概念`);
    if (expected && !sameList(practiceRefs, expected.practices)) errors.push(`${label}: ${item.value} 的 practice ref 与契约不一致`);
    if (expected && !sameList(conceptRefs, expected.concepts)) errors.push(`${label}: ${item.value} 的 concept ref 与契约不一致`);
    for (const ref of practiceRefs) {
      if (!item.body.includes(`href="#${ref}"`)) errors.push(`${label}: ${item.value} 缺少指向 ${ref} 的页面内链接`);
    }
    const detailOrder = valuesInOrder(item.body, 'data-interview-detail');
    if (!sameList(detailOrder, RAG_INTERVIEW_DETAILS)) errors.push(`${label}: ${item.value} 面试五维必须按 ${RAG_INTERVIEW_DETAILS.join(' → ')} 排列`);
    for (const detail of RAG_INTERVIEW_DETAILS) {
      const matches = findElementsByAttribute(item.body, 'data-interview-detail', detail);
      if (matches.length !== 1) errors.push(`${label}: ${item.value} 的 ${detail} 应出现一次`);
      else if (stripMarkup(matches[0].body).length < MIN_INTERVIEW_DETAIL_LENGTH) errors.push(`${label}: ${item.value} 的 ${detail} 内容过短`);
    }
  }

  return errors;
}

export function validateRagPracticePages({ targets = RAG_PRACTICE_TARGETS, exists, readText }) {
  const errors = [];
  for (const relativePath of targets) {
    if (!exists(relativePath)) {
      errors.push(`${relativePath}: 目标页面不存在`);
      continue;
    }
    errors.push(...validateRagPracticePage({ relativePath, html: readText(relativePath) }));
  }
  return errors;
}
