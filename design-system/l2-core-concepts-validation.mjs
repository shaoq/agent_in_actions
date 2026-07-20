import { L2_CORE_ASPECTS, L2_CORE_PARTS, L2_CORE_TARGETS } from './l2-core-concepts-manifest.mjs';

const MIN = { core: 2800, stage: 330, anchor: 30, aspect: 35, overview: 80, tradeoffs: 220, 'failure-propagation': 220, example: 220, 'practice-bridge': 300 };

function stripMarkup(value) {
  return value.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ').replace(/\s+/g, ' ').trim();
}

function attr(startTag, name) {
  const assigned = startTag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  if (assigned) return assigned[1];
  return new RegExp(`\\b${name}(?=\\s|/?>)`, 'i').test(startTag) ? '' : null;
}

function findElementsByAttribute(html, attribute, expectedValue = null) {
  const starts = [];
  for (const match of html.matchAll(/<([a-z][\w:-]*)\b[^>]*>/gi)) {
    const value = attr(match[0], attribute);
    if (value === null || (expectedValue !== null && value !== expectedValue)) continue;
    starts.push({ tag: match[1].toLowerCase(), index: match.index, startTag: match[0], value });
  }
  return starts.map((start) => {
    const tokens = new RegExp(`<\\/?${start.tag}\\b[^>]*>`, 'gi');
    tokens.lastIndex = start.index;
    let depth = 0;
    let token;
    while ((token = tokens.exec(html))) {
      depth += /^<\//.test(token[0]) ? -1 : 1;
      if (depth === 0) return { ...start, body: html.slice(start.index, tokens.lastIndex), end: tokens.lastIndex };
    }
    return { ...start, body: '', end: -1 };
  });
}

function valuesInOrder(html, attribute) {
  return [...html.matchAll(new RegExp(`<[^>]+\\b${attribute}="([^"]+)"[^>]*>`, 'gi'))].map((match) => match[1]);
}

function list(value) { return value.trim().split(/\s+/).filter(Boolean); }
function sameList(a, b) { return a.length === b.length && a.every((value, index) => value === b[index]); }

function validatePlacement(html, core, target, label, errors) {
  const startIndex = html.indexOf(target.corePlacement.start);
  const endIndex = html.indexOf(target.corePlacement.end);
  if (startIndex < 0 || endIndex < 0) return errors.push(`${label}: 缺少核心概念 placement 锚点`);
  if (target.corePlacement.mode === 'after') {
    if (!(startIndex < core.index && core.end <= endIndex)) errors.push(`${label}: 核心容器未位于核心标题之后、工程要点之前`);
  } else if (!(core.index <= startIndex && startIndex < core.end && core.end <= endIndex)) {
    errors.push(`${label}: 核心容器未完整包裹成熟叙事范围`);
  }
}

function validateLoop(html, core, target, label, errors) {
  const practiceBlock = findElementsByAttribute(html, 'data-l2-practice-keypoints');
  if (practiceBlock.length !== 1) return errors.push(`${label}: 应保留唯一 L2 实践块`);
  const cards = findElementsByAttribute(practiceBlock[0].body, 'data-practice-id');
  const expectedPracticeIds = target.stages.map((stage) => stage.practiceId);
  const actualPracticeIds = cards.map((card) => card.value);
  if (!sameList(actualPracticeIds, expectedPracticeIds)) errors.push(`${label}: 实践卡 ID 或顺序与联合 manifest 不一致`);
  const stageIds = target.stages.map((stage) => stage.id);
  const covered = new Set();
  for (const card of cards) {
    const stage = target.stages.find((candidate) => candidate.practiceId === card.value);
    const refs = list(attr(card.startTag, 'data-concept-ref') ?? '');
    if (!refs.length) errors.push(`${label}: ${card.value} 未引用核心 stage`);
    if (refs.some((ref) => !stageIds.includes(ref))) errors.push(`${label}: ${card.value} 引用了未知 stage`);
    if (stage && !sameList(refs, [stage.id])) errors.push(`${label}: ${card.value} 的 concept ref 与联合 manifest 不一致`);
    refs.forEach((ref) => covered.add(ref));
  }
  const uncovered = stageIds.filter((id) => !covered.has(id));
  if (uncovered.length) errors.push(`${label}: 存在未被实践覆盖的 stage：${uncovered.join('、')}`);

  const bridge = findElementsByAttribute(core.body, 'data-concept-part', 'practice-bridge')[0]?.body ?? '';
  const rows = findElementsByAttribute(bridge, 'data-concept-bridge');
  if (!sameList(rows.map((row) => row.value), stageIds)) errors.push(`${label}: bridge 的 stage 数量、ID 或顺序不一致`);
  for (const row of rows) {
    const stage = target.stages.find((candidate) => candidate.id === row.value);
    if (!stage) continue;
    if (attr(row.startTag, 'data-concept-ref') !== stage.id || attr(row.startTag, 'data-practice-ref') !== stage.practiceId) errors.push(`${label}: ${row.value} 的 bridge 映射不一致`);
    if (!row.body.includes(`href="#concept-${stage.id}"`)) errors.push(`${label}: ${row.value} 缺少概念锚点链接`);
    if (!row.body.includes(`href="#${stage.practiceId}"`)) errors.push(`${label}: ${row.value} 缺少实践锚点链接`);
  }
}

export function validateL2CorePage({ target, relativePath = target.path, html }) {
  const label = relativePath;
  const errors = [];
  if (!html.includes('design-system/blueprint.css')) errors.push(`${label}: 未加载 Blueprint 样式`);
  if (!html.includes('design-system/learning-navigation.js') || !html.includes('class="learning-nav"')) errors.push(`${label}: 未完整接入统一学习导航`);
  const cores = findElementsByAttribute(html, 'data-l2-core-concepts');
  if (cores.length !== 1) {
    errors.push(`${label}: 应有且仅有一个 L2 深度核心概念容器，实际 ${cores.length} 个`);
    return errors;
  }
  const core = cores[0];
  if (!core.body) return [`${label}: 核心概念容器未正确闭合`];
  if (!core.startTag.includes('l2-core-concepts')) errors.push(`${label}: 核心容器缺少 l2-core-concepts 样式类`);
  if (attr(core.startTag, 'data-component') !== target.component || attr(core.startTag, 'data-unit') !== target.unit) errors.push(`${label}: 核心容器 component / unit 不一致`);
  validatePlacement(html, core, target, label, errors);
  if (stripMarkup(core.body).length < MIN.core) errors.push(`${label}: 核心概念内容过短，至少 ${MIN.core} 个可见字符`);

  const partNames = valuesInOrder(core.body, 'data-concept-part');
  if (!sameList(partNames, L2_CORE_PARTS)) errors.push(`${label}: 六部分必须按 ${L2_CORE_PARTS.join(' → ')} 排列`);
  const parts = new Map();
  for (const part of L2_CORE_PARTS) {
    const matches = findElementsByAttribute(core.body, 'data-concept-part', part);
    if (matches.length !== 1) errors.push(`${label}: data-concept-part="${part}" 应出现一次，实际 ${matches.length} 次`);
    else {
      parts.set(part, matches[0]);
      if (stripMarkup(matches[0].body).length < MIN[part]) errors.push(`${label}: ${part} 内容过短`);
    }
  }

  const stageElements = findElementsByAttribute(parts.get('stages')?.body ?? '', 'data-concept-stage');
  const expectedStageIds = target.stages.map((stage) => stage.id);
  const actualStageIds = stageElements.map((stage) => stage.value);
  if (!sameList(actualStageIds, expectedStageIds)) errors.push(`${label}: 核心 stage ID、数量或顺序与 manifest 不一致`);
  const duplicate = actualStageIds.filter((id, index) => actualStageIds.indexOf(id) !== index);
  if (duplicate.length) errors.push(`${label}: 核心 stage ID 重复：${[...new Set(duplicate)].join('、')}`);
  for (const stage of stageElements) {
    if (attr(stage.startTag, 'id') !== `concept-${stage.value}`) errors.push(`${label}: ${stage.value} 缺少稳定 concept 页面锚点`);
    if (stripMarkup(stage.body).length < MIN.stage) errors.push(`${label}: ${stage.value} 内容过短`);
    const anchors = findElementsByAttribute(stage.body, 'data-concept-anchor');
    if (anchors.length !== 1) errors.push(`${label}: ${stage.value} 必须包含唯一概念不变量`);
    else if (stripMarkup(anchors[0].body).length < MIN.anchor) errors.push(`${label}: ${stage.value} 概念不变量过短`);
    const aspects = valuesInOrder(stage.body, 'data-concept-aspect');
    if (!sameList(aspects, L2_CORE_ASPECTS)) errors.push(`${label}: ${stage.value} 五维解释必须按 ${L2_CORE_ASPECTS.join(' → ')} 排列`);
    for (const aspect of L2_CORE_ASPECTS) {
      const matches = findElementsByAttribute(stage.body, 'data-concept-aspect', aspect);
      if (matches.length !== 1) errors.push(`${label}: ${stage.value} 的 ${aspect} 应出现一次`);
      else if (stripMarkup(matches[0].body).length < MIN.aspect) errors.push(`${label}: ${stage.value} 的 ${aspect} 内容过短`);
    }
  }

  for (const part of ['tradeoffs', 'failure-propagation']) {
    const body = parts.get(part)?.body ?? '';
    if (!/<(?:table|ul|ol)\b/i.test(body)) errors.push(`${label}: ${part} 必须包含实质表格或列表`);
  }
  const examples = findElementsByAttribute(core.body, 'data-concept-example');
  if (examples.length !== 1 || examples[0]?.value !== 'enterprise-travel-agent') errors.push(`${label}: 必须包含唯一 enterprise-travel-agent 核心案例`);
  const bridge = parts.get('practice-bridge')?.body ?? '';
  if (!/<(?:table|ul|ol)\b/i.test(bridge)) errors.push(`${label}: practice-bridge 缺少可见映射结构`);
  validateLoop(html, core, target, label, errors);
  return errors;
}

export function validateL2CorePages({ targets = L2_CORE_TARGETS, exists, readText }) {
  const errors = [];
  for (const target of targets) {
    if (!exists(target.path)) errors.push(`${target.path}: 目标页面不存在`);
    else errors.push(...validateL2CorePage({ target, html: readText(target.path) }));
  }
  return errors;
}
