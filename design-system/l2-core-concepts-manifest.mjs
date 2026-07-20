import { L2_PRACTICE_TARGETS } from './l2-practice-manifest.mjs';

export const L2_CORE_PARTS = ['overview', 'stages', 'tradeoffs', 'failure-propagation', 'example', 'practice-bridge'];
export const L2_CORE_ASPECTS = ['role-io', 'mechanism', 'constraints', 'difficulty', 'boundary'];

const thematicStarts = {
  reasoning: [
    '<h2>核心概念：决策面而不是控制面</h2>',
    '<h2>为什么结构化输出仍然会失败</h2>',
    '<h2>先区分两类“模式”</h2>',
    '<h2>不确定性不是一个分数</h2>',
  ],
  tools: [
    '<h2>工具是受控能力契约</h2>',
    '<h2>一次调用的状态机</h2>',
    '<h2>授权是独立确定性判定</h2>',
    '<h2>重试不是默认恢复</h2>',
    '<h2>三个概念不在同一层</h2>',
  ],
  'interaction-access': [
    '<h2>核心概念</h2>',
    '<h2>核心概念：流式的是事件，不只是文本</h2>',
    '<h2>核心概念</h2>',
    '<h2>同意：可证明、可理解、可撤回</h2>',
  ],
};

const orchestrationStarts = [
  '<h2>1. 编排解决的核心问题</h2>',
  '<h2>1. 为什么状态是编排的中心</h2>',
  '<h2>1. 先从最简单方案开始</h2>',
  '<h2>1. 可靠性不等于“最终返回了答案”</h2>',
  '<h2>1. Multi-Agent 不是默认高级形态</h2>',
];

const orchestrationEnds = [
  '<h2>10. 常见误区</h2>',
  '<h2>11. 常见误区</h2>',
  '<h2>常见误区</h2>',
  '<h2>常见误区</h2>',
  '<h2>常见误区</h2>',
];

function conceptTitle(title) {
  return title
    .replace(/^(检查|固化|校验|维护|分离|版本化|拒绝|验证|演练|记录|约束|设置|执行|支持|选择|限制|判断|隔离|设计|保留|生成|处理|检测|绑定|最小化|归集|分配|预测|规范化|追踪|制定|保护|控制|提出|提供|返回|划分|跟踪|审阅|门禁|优先|固定|升级|运行|补齐)/, '')
    .replace(/^从/, '');
}

function placement(target) {
  const index = Number(target.unit) - 1;
  if (target.profile === 'orchestration') {
    return { mode: 'wrap', start: orchestrationStarts[index], end: orchestrationEnds[index] };
  }
  if (thematicStarts[target.component]) {
    return { mode: 'wrap', start: thematicStarts[target.component][index], end: '<h2>工程要点</h2>' };
  }
  return { mode: 'after', start: '<h2>核心概念</h2>', end: '<h2>工程要点</h2>' };
}

export const L2_CORE_TARGETS = L2_PRACTICE_TARGETS.map((target) => ({
  ...target,
  corePlacement: placement(target),
  stages: target.practices.map((practice) => ({
    id: practice.refs[0],
    title: conceptTitle(practice.title),
    practiceId: practice.id,
  })),
}));

export const L2_CORE_PATHS = L2_CORE_TARGETS.map((target) => target.path);
