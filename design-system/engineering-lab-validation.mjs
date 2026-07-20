import path from 'node:path';

export const REQUIRED_README_HEADINGS = [
  '## 学习目标',
  '## 架构层映射',
  '## 前置理论',
  '## 范围边界',
  '## 环境与运行',
  '## 关键文件',
  '## 主流程',
  '## 成功场景',
  '## 故障场景',
  '## 自动化测试',
  '## 设计取舍',
  '## 小步改造',
  '## Trace 复盘',
  '## 面试表达',
  '## 完成证据',
  '## 下一步',
];

function normalize(value) {
  return value.replaceAll('\\', '/');
}

function relativeLink(from, to) {
  return normalize(path.posix.relative(path.posix.dirname(from), to));
}

export function validateEngineeringLabs({
  manifest,
  catalog,
  exists,
  readText,
}) {
  const errors = [];
  const labs = Array.isArray(manifest?.labs) ? manifest.labs : [];
  if (!labs.length) return ['工程案例清单必须包含 labs'];

  const l3Group = catalog.find((group) => group.id === 'l3-engineering');
  if (!l3Group) return ['共享导航缺少 l3-engineering 分组'];
  const navById = new Map(l3Group.items.map((item) => [item.id, item]));
  const ids = new Set();
  const orders = new Set();

  for (const lab of labs) {
    if (ids.has(lab.id)) errors.push(`重复案例 ID: ${lab.id}`);
    ids.add(lab.id);
    if (orders.has(lab.order)) errors.push(`重复案例顺序: ${lab.order}`);
    orders.add(lab.order);

    const expectedStage = `E${lab.order - 1}`;
    if (lab.stage !== expectedStage) {
      errors.push(`${lab.id} 阶段应为 ${expectedStage}，实际为 ${lab.stage}`);
    }
    if (!['available', 'planned'].includes(lab.status)) {
      errors.push(`${lab.id} 状态非法: ${lab.status}`);
    }

    const nav = navById.get(lab.id);
    if (!nav) {
      errors.push(`${lab.id} 未登记到 L3 共享导航`);
    } else {
      if (nav.path !== lab.readme) errors.push(`${lab.id} 导航路径与清单不一致`);
      if (nav.status !== lab.status) errors.push(`${lab.id} 导航状态与清单不一致`);
      if (nav.order !== lab.order) errors.push(`${lab.id} 导航顺序与清单不一致`);
    }

    if (lab.status !== 'available') continue;
    for (const [label, target] of [
      ['目录', lab.directory],
      ['README', lab.readme],
      ['入口', lab.entry],
      ['测试目录', lab.tests],
    ]) {
      if (!target || !exists(target)) errors.push(`${lab.id} 缺少${label}: ${target ?? '(empty)'}`);
    }
    for (const prerequisite of lab.prerequisites ?? []) {
      if (!exists(prerequisite)) errors.push(`${lab.id} 前置路径不存在: ${prerequisite}`);
    }

    if (lab.readme && exists(lab.readme)) {
      const source = readText(lab.readme);
      for (const heading of REQUIRED_README_HEADINGS) {
        if (!source.includes(heading)) errors.push(`${lab.id} README 缺少章节: ${heading}`);
      }
      const next = navById.get(lab.nextId);
      if (!next?.path) {
        errors.push(`${lab.id} 的下一项不存在或没有路径: ${lab.nextId}`);
      } else {
        const targetLink = relativeLink(lab.readme, next.path);
        if (!source.includes(`(${targetLink})`)) {
          errors.push(`${lab.id} README 未链接下一项: ${targetLink}`);
        }
      }
    }
  }

  const sorted = [...labs].sort((a, b) => a.order - b.order);
  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index].order !== index + 1) {
      errors.push(`案例顺序必须从 1 连续递增，位置 ${index + 1} 实际为 ${sorted[index].order}`);
    }
    const expectedNext = sorted[index + 1]?.id ?? manifest.terminalId;
    if (sorted[index].nextId !== expectedNext) {
      errors.push(`${sorted[index].id} 下一项应为 ${expectedNext}，实际为 ${sorted[index].nextId}`);
    }
  }

  const visited = new Set();
  let current = sorted[0]?.id;
  while (current && current !== manifest.terminalId) {
    if (visited.has(current)) {
      errors.push(`案例 next 链存在循环: ${current}`);
      break;
    }
    visited.add(current);
    current = labs.find((lab) => lab.id === current)?.nextId;
    if (!current) errors.push('案例 next 链在到达阶段考核前断开');
  }
  if (visited.size !== labs.length) errors.push(`next 链只覆盖 ${visited.size}/${labs.length} 个案例`);

  const terminal = navById.get(manifest.terminalId);
  if (!terminal?.path) errors.push(`阶段考核未登记或没有路径: ${manifest.terminalId}`);
  return errors;
}
