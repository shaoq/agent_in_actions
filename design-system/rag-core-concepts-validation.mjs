export const RAG_CORE_PARTS = [
  'overview',
  'stages',
  'tradeoffs',
  'failure-propagation',
  'example',
  'practice-bridge',
];

export const RAG_CONCEPT_ASPECTS = ['role-io', 'mechanism', 'constraints', 'difficulty', 'boundary'];

const practice = (id, refs) => ({ id, refs });

export const RAG_CORE_TARGETS = [
  {
    unit: '01',
    path: 'docs/knowledge-rag/01-boundary-and-pipeline.html',
    stages: ['offline-supply', 'orchestration-routing', 'request-contract', 'authorization', 'retrieval-evidence', 'generation-verification', 'typed-outcome-trace'],
    practices: [
      practice('practice-01-rag-routing', ['offline-supply', 'orchestration-routing']),
      practice('practice-01-typed-result', ['request-contract', 'typed-outcome-trace']),
      practice('practice-01-stage-deadline', ['orchestration-routing', 'typed-outcome-trace']),
      practice('practice-01-request-evidence-contract', ['request-contract', 'retrieval-evidence']),
      practice('practice-01-version-pinning', ['offline-supply', 'typed-outcome-trace']),
      practice('practice-01-failure-owner', ['authorization', 'generation-verification']),
      practice('practice-01-production-acceptance', ['retrieval-evidence', 'generation-verification']),
    ],
  },
  {
    unit: '02',
    path: 'docs/knowledge-rag/02-ingestion-chunking-and-indexing.html',
    stages: ['source-snapshot', 'parse-normalize', 'metadata-acl', 'stable-id-idempotency', 'chunking', 'feature-index', 'quality-publish', 'lineage-delete'],
    practices: [
      practice('practice-02-parse-sampling', ['source-snapshot', 'parse-normalize']),
      practice('practice-02-stable-lineage', ['metadata-acl', 'stable-id-idempotency']),
      practice('practice-02-idempotent-ingestion', ['stable-id-idempotency']),
      practice('practice-02-deletion-revocation', ['metadata-acl', 'lineage-delete']),
      practice('practice-02-index-health', ['feature-index', 'quality-publish']),
      practice('practice-02-query-driven-chunking', ['chunking']),
      practice('practice-02-embedding-upgrade', ['feature-index', 'quality-publish']),
    ],
  },
  {
    unit: '03',
    path: 'docs/knowledge-rag/03-retrieval-and-reranking.html',
    stages: ['query-understanding', 'rewrite-decompose', 'multi-retrieval', 'fusion', 'dedup', 'rerank', 'threshold-fallback', 'context-pack'],
    practices: [
      practice('practice-03-protect-query-constraints', ['query-understanding', 'rewrite-decompose']),
      practice('practice-03-choose-retrieval-signals', ['multi-retrieval']),
      practice('practice-03-explainable-fusion', ['fusion']),
      practice('practice-03-calibrate-thresholds', ['threshold-fallback']),
      practice('practice-03-dedup-diversity', ['dedup', 'context-pack']),
      practice('practice-03-funnel-budget', ['rerank', 'context-pack']),
      practice('practice-03-candidate-trace', ['fusion', 'rerank']),
    ],
  },
  {
    unit: '04',
    path: 'docs/knowledge-rag/04-grounding-citations-and-access-control.html',
    stages: ['policy-enforcement', 'untrusted-evidence', 'claim-decomposition', 'support-grounding', 'citation', 'conflict-freshness', 'post-verification-revocation'],
    practices: [
      practice('practice-04-system-citations', ['citation']),
      practice('practice-04-claim-evidence', ['claim-decomposition', 'support-grounding']),
      practice('practice-04-pre-retrieval-auth', ['policy-enforcement']),
      practice('practice-04-permission-cache', ['post-verification-revocation']),
      practice('practice-04-reauth-use-point', ['post-verification-revocation']),
      practice('practice-04-injection-isolation', ['untrusted-evidence']),
      practice('practice-04-conflict-negative-tests', ['conflict-freshness']),
    ],
  },
  {
    unit: '05',
    path: 'docs/knowledge-rag/05-evaluation-and-failure-diagnosis.html',
    stages: ['evaluation-unit-gold', 'version-snapshot', 'corpus-ingestion-metrics', 'retrieval-ranking-metrics', 'generation-citation-policy-metrics', 'first-divergence', 'oracle-ablation', 'slicing-release-feedback'],
    practices: [
      practice('practice-05-gold-evidence', ['evaluation-unit-gold']),
      practice('practice-05-version-snapshot', ['version-snapshot']),
      practice('practice-05-traffic-slices', ['slicing-release-feedback']),
      practice('practice-05-first-divergence', ['corpus-ingestion-metrics', 'retrieval-ranking-metrics', 'first-divergence']),
      practice('practice-05-oracle-ablation', ['oracle-ablation']),
      practice('practice-05-hard-fail', ['generation-citation-policy-metrics', 'slicing-release-feedback']),
      practice('practice-05-online-feedback', ['slicing-release-feedback']),
    ],
  },
];

const MIN = {
  core: 1800,
  stage: 230,
  anchor: 22,
  aspect: 30,
  tradeoffs: 100,
  'failure-propagation': 100,
  example: 140,
  'practice-bridge': 120,
  practiceRecall: 45,
};

function stripMarkup(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ')
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
      if (depth === 0) {
        return { ...start, body: html.slice(start.index, tokenPattern.lastIndex), end: tokenPattern.lastIndex };
      }
    }
    return { ...start, body: '', end: -1 };
  });
}

function valuesInOrder(html, attribute) {
  return [...html.matchAll(new RegExp(`<[^>]+\\b${attribute}="([^"]+)"[^>]*>`, 'gi'))].map((match) => match[1]);
}

function sameList(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function list(value) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function validatePracticeLoop({ html, core, target, label, errors }) {
  const expectedById = new Map(target.practices.map((item) => [item.id, item.refs]));
  const practiceItems = findElementsByAttribute(html, 'data-practice-id');
  const ids = practiceItems.map((item) => item.value);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${label}: 实践 ID 重复：${[...new Set(duplicateIds)].join('、')}`);
  if (!sameList(ids, target.practices.map((item) => item.id))) {
    errors.push(`${label}: 实践稳定 ID 与预期 7 项或顺序不一致`);
  }

  const coveredStages = new Set();
  for (const item of practiceItems) {
    if (attr(item.startTag, 'id') !== item.value) errors.push(`${label}: ${item.value} 缺少同名页面锚点 id`);
    const refs = list(attr(item.startTag, 'data-concept-ref') ?? '');
    if (!refs.length) errors.push(`${label}: ${item.value} 未映射核心概念`);
    const unknown = refs.filter((ref) => !target.stages.includes(ref));
    if (unknown.length) errors.push(`${label}: ${item.value} 引用了未知概念 ${unknown.join('、')}`);
    refs.forEach((ref) => coveredStages.add(ref));
    const expectedRefs = expectedById.get(item.value);
    if (expectedRefs && !sameList(refs, expectedRefs)) {
      errors.push(`${label}: ${item.value} 的 concept ref 应为 ${expectedRefs.join(' ')}`);
    }
  }
  const uncovered = target.stages.filter((stage) => !coveredStages.has(stage));
  if (uncovered.length) errors.push(`${label}: 核心环节未被实践覆盖：${uncovered.join('、')}`);

  const bridge = findElementsByAttribute(core.body, 'data-concept-part', 'practice-bridge')[0]?.body ?? '';
  for (const item of target.practices) {
    const rows = findElementsByAttribute(bridge, 'data-practice-ref', item.id);
    if (rows.length !== 1) {
      errors.push(`${label}: 回扣表中 ${item.id} 应出现一次，实际 ${rows.length} 次`);
      continue;
    }
    const refs = list(attr(rows[0].startTag, 'data-concept-ref') ?? '');
    if (!sameList(refs, item.refs)) errors.push(`${label}: 回扣表中 ${item.id} 的 concept ref 不一致`);
    if (!rows[0].body.includes(`href="#${item.id}"`)) errors.push(`${label}: 回扣表中 ${item.id} 缺少可解析页面内链接`);
    if (!ids.includes(item.id)) errors.push(`${label}: 回扣表链接悬空：${item.id}`);
  }

  const practiceBlocks = findElementsByAttribute(html, 'data-rag-practice-keypoints');
  if (practiceBlocks.length !== 1) {
    errors.push(`${label}: 应保留唯一日常实践关键点块`);
    return;
  }
  const recall = findElementsByAttribute(practiceBlocks[0].body, 'data-practice-example-ref', 'travel-policy');
  if (recall.length !== 1) {
    errors.push(`${label}: 实践块必须包含唯一 travel-policy 案例回忆提示`);
  } else {
    if (stripMarkup(recall[0].body).length < MIN.practiceRecall) errors.push(`${label}: 案例回忆提示内容过短`);
    const firstPart = practiceBlocks[0].body.indexOf('data-practice-part=');
    const recallIndex = practiceBlocks[0].body.indexOf('data-practice-example-ref="travel-policy"');
    if (firstPart < 0 || recallIndex > firstPart) errors.push(`${label}: 案例回忆提示必须位于四个实践分区之前`);
  }
}

export function validateRagCorePage({ target, relativePath = target.path, html }) {
  const label = relativePath;
  const errors = [];
  if (!html.includes('design-system/blueprint.css')) errors.push(`${label}: 未加载 Blueprint 样式`);
  if (!html.includes('design-system/learning-navigation.js') || !html.includes('class="learning-nav"')) {
    errors.push(`${label}: 未完整接入统一学习导航`);
  }

  const cores = findElementsByAttribute(html, 'data-rag-core-concepts');
  if (cores.length !== 1) {
    errors.push(`${label}: 应有且仅有一个深度核心概念容器，实际 ${cores.length} 个`);
    return errors;
  }
  const core = cores[0];
  const coreHeading = html.indexOf('<h2>核心概念</h2>');
  const engineeringHeading = html.indexOf('<h2>工程要点</h2>');
  if (coreHeading < 0 || engineeringHeading < 0 || !(coreHeading < core.index && core.end <= engineeringHeading)) {
    errors.push(`${label}: 深度核心概念容器必须位于“核心概念”之后、“工程要点”之前`);
  }
  if (stripMarkup(core.body).length < MIN.core) errors.push(`${label}: 核心概念内容过短，至少 ${MIN.core} 个可见字符`);

  const parts = valuesInOrder(core.body, 'data-concept-part');
  if (!sameList(parts, RAG_CORE_PARTS)) {
    errors.push(`${label}: 六部分必须按 ${RAG_CORE_PARTS.join(' → ')} 排列`);
  }
  for (const part of RAG_CORE_PARTS) {
    const matches = findElementsByAttribute(core.body, 'data-concept-part', part);
    if (matches.length !== 1) errors.push(`${label}: data-concept-part="${part}" 应出现一次，实际 ${matches.length} 次`);
  }

  const overview = findElementsByAttribute(core.body, 'data-concept-part', 'overview')[0]?.body ?? '';
  if (!/<figure\b[^>]*class="[^"]*\blearning-diagram\b/i.test(overview)) errors.push(`${label}: overview 缺少现有学习图`);
  if (!/<table\b/i.test(overview)) errors.push(`${label}: overview 缺少摘要表`);

  const stageElements = findElementsByAttribute(core.body, 'data-concept-stage');
  const stageIds = stageElements.map((stage) => stage.value);
  if (!sameList(stageIds, target.stages)) errors.push(`${label}: 核心环节 ID、数量或顺序与契约不一致`);
  const duplicateStages = stageIds.filter((id, index) => stageIds.indexOf(id) !== index);
  if (duplicateStages.length) errors.push(`${label}: 核心环节 ID 重复：${[...new Set(duplicateStages)].join('、')}`);

  for (const stage of stageElements) {
    if (stripMarkup(stage.body).length < MIN.stage) errors.push(`${label}: ${stage.value} 内容过短`);
    const anchors = findElementsByAttribute(stage.body, 'data-concept-anchor');
    if (anchors.length !== 1) errors.push(`${label}: ${stage.value} 必须包含唯一概念不变量`);
    else if (stripMarkup(anchors[0].body).length < MIN.anchor) errors.push(`${label}: ${stage.value} 概念不变量过短`);
    const aspects = valuesInOrder(stage.body, 'data-concept-aspect');
    if (!sameList(aspects, RAG_CONCEPT_ASPECTS)) {
      errors.push(`${label}: ${stage.value} 五维解释必须按 ${RAG_CONCEPT_ASPECTS.join(' → ')} 排列`);
    }
    for (const aspect of RAG_CONCEPT_ASPECTS) {
      const matches = findElementsByAttribute(stage.body, 'data-concept-aspect', aspect);
      if (matches.length !== 1) errors.push(`${label}: ${stage.value} 的 ${aspect} 应出现一次`);
      else if (stripMarkup(matches[0].body).length < MIN.aspect) errors.push(`${label}: ${stage.value} 的 ${aspect} 内容过短`);
    }
  }

  for (const part of ['tradeoffs', 'failure-propagation']) {
    const body = findElementsByAttribute(core.body, 'data-concept-part', part)[0]?.body ?? '';
    if (stripMarkup(body).length < MIN[part]) errors.push(`${label}: ${part} 内容过短`);
    if (!/<(?:table|ul|ol)\b/i.test(body)) errors.push(`${label}: ${part} 必须包含实质表格或列表`);
  }

  const examples = findElementsByAttribute(core.body, 'data-concept-example');
  if (examples.length !== 1 || examples[0]?.value !== 'travel-policy') {
    errors.push(`${label}: 必须包含唯一 data-concept-example="travel-policy" 贯穿案例`);
  } else if (stripMarkup(examples[0].body).length < MIN.example) {
    errors.push(`${label}: travel-policy 贯穿案例内容过短`);
  }
  const bridge = findElementsByAttribute(core.body, 'data-concept-part', 'practice-bridge')[0]?.body ?? '';
  if (stripMarkup(bridge).length < MIN['practice-bridge']) errors.push(`${label}: practice-bridge 内容过短`);
  if (!/<table\b/i.test(bridge)) errors.push(`${label}: practice-bridge 缺少可见映射表`);

  validatePracticeLoop({ html, core, target, label, errors });
  return errors;
}

export function validateRagCorePages({ targets = RAG_CORE_TARGETS, exists, readText }) {
  const errors = [];
  for (const target of targets) {
    if (!exists(target.path)) {
      errors.push(`${target.path}: 目标页面不存在`);
      continue;
    }
    errors.push(...validateRagCorePage({ target, html: readText(target.path) }));
  }
  return errors;
}
