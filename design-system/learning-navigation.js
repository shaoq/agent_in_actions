(function initializeLearningNavigation(global) {
  'use strict';

  const LEARNING_CATALOG = [
    {
      id: 'overview',
      label: '总览与进度',
      stage: 'OVERVIEW',
      order: 0,
      items: [
        { id: 'learning-home', title: '学习首页', path: 'docs/index.html', type: 'overview', order: 1, status: 'available' },
        { id: 'learning-roadmap', title: '学习路线', path: 'roadmap/learning-plan.html', type: 'roadmap', order: 2, status: 'available' },
        { id: 'progress-tracker', title: '进度跟踪', path: 'roadmap/progress-tracker.html', type: 'progress', order: 3, status: 'available' },
        { id: 'assessment-rubric', title: '评分规则', path: 'assessment/rubric.html', type: 'assessment', order: 4, status: 'available' },
      ],
    },
    {
      id: 'l0-foundations',
      label: 'L0 · Agent 基础',
      stage: 'L0',
      order: 1,
      items: [
        { id: 'agent-foundations', title: 'Agent 基础理论', path: 'docs/foundations/01-agent-basics.html', type: 'theory', order: 1, status: 'available' },
        { id: 'agent-foundations-checkpoint', title: '基础理论检查点', path: 'assessment/00-agent-foundations-theory-checkpoint.html', type: 'checkpoint', order: 2, status: 'available' },
        { id: 'agent-foundations-suggested-answer', title: '基础检查点建议答案', path: 'assessment/answers/00-agent-foundations.html', type: 'suggested-answer', answerFor: 'agent-foundations-checkpoint', order: 3, status: 'available' },
      ],
    },
    {
      id: 'l1-architecture',
      label: 'L1 · 九层架构',
      stage: 'L1',
      order: 2,
      items: [
        { id: 'agent-architecture', title: 'Agent 架构总览', path: 'docs/00-agent-architecture.html', type: 'overview', order: 1, status: 'available' },
        { id: 'agent-architecture-checkpoint', title: '九层架构检查点', path: 'assessment/01-agent-architecture-checkpoint.html', type: 'checkpoint', order: 2, status: 'available' },
        { id: 'agent-architecture-suggested-answer', title: '架构检查点建议答案', path: 'assessment/answers/01-agent-architecture.html', type: 'suggested-answer', answerFor: 'agent-architecture-checkpoint', order: 3, status: 'available' },
      ],
    },
    {
      id: 'l2-orchestration',
      label: 'L2 · 编排控制',
      stage: 'L2',
      order: 3,
      items: [
        { id: 'orchestration-overview', title: '编排控制总览', path: 'docs/01-orchestration.html', type: 'overview', order: 1, status: 'available' },
        { id: 'orchestration-course', title: '五单元课程目录', path: 'docs/orchestration/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'orchestration-boundaries', title: '01 职责与边界', path: 'docs/orchestration/01-responsibilities-and-boundaries.html', type: 'theory', order: 3, status: 'available' },
        { id: 'orchestration-state', title: '02 状态与生命周期', path: 'docs/orchestration/02-state-and-lifecycle.html', type: 'theory', order: 4, status: 'available' },
        { id: 'orchestration-patterns', title: '03 模式与取舍', path: 'docs/orchestration/03-patterns-and-tradeoffs.html', type: 'theory', order: 5, status: 'available' },
        { id: 'orchestration-reliability', title: '04 可靠性与恢复', path: 'docs/orchestration/04-reliability-and-recovery.html', type: 'theory', order: 6, status: 'available' },
        { id: 'orchestration-multi-agent', title: '05 Multi-Agent 边界', path: 'docs/orchestration/05-multi-agent-boundaries.html', type: 'theory', order: 7, status: 'available' },
        { id: 'orchestration-checkpoint', title: '编排理论检查点', path: 'assessment/01-orchestration-theory-checkpoint.html', type: 'checkpoint', order: 8, status: 'available' },
        { id: 'orchestration-suggested-answer', title: '编排检查点建议答案', path: 'assessment/answers/01-orchestration.html', type: 'suggested-answer', answerFor: 'orchestration-checkpoint', order: 9, status: 'available' },
      ],
    },
    {
      id: 'l2-reasoning-core',
      label: 'L2 · 推理内核',
      stage: 'L2',
      order: 4,
      items: [
        { id: 'reasoning-core-overview', title: '推理内核总览', path: 'docs/02-reasoning-core.html', type: 'overview', order: 1, status: 'available' },
        { id: 'reasoning-core', title: '推理内核课程目录', path: 'docs/reasoning/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'reasoning-contract', title: '01 角色与决策契约', path: 'docs/reasoning/01-role-and-decision-contract.html', type: 'theory', order: 3, status: 'available' },
        { id: 'reasoning-structured-output', title: '02 结构化输出与工具选择', path: 'docs/reasoning/02-structured-output-and-tool-selection.html', type: 'theory', order: 4, status: 'available' },
        { id: 'reasoning-patterns', title: '03 推理模式及取舍', path: 'docs/reasoning/03-reasoning-patterns-and-tradeoffs.html', type: 'theory', order: 5, status: 'available' },
        { id: 'reasoning-uncertainty', title: '04 不确定性与恢复', path: 'docs/reasoning/04-uncertainty-failure-and-recovery.html', type: 'theory', order: 6, status: 'available' },
        { id: 'reasoning-core-checkpoint', title: '推理内核理论检查点', path: 'assessment/02-reasoning-core-theory-checkpoint.html', type: 'checkpoint', order: 7, status: 'available' },
        { id: 'reasoning-core-suggested-answer', title: '推理检查点建议答案', path: 'assessment/answers/02-reasoning-core.html', type: 'suggested-answer', answerFor: 'reasoning-core-checkpoint', order: 8, status: 'available' },
      ],
    },
    {
      id: 'l2-tools-actions',
      label: 'L2 · 工具 / 动作',
      stage: 'L2',
      order: 5,
      items: [
        { id: 'tools-actions-overview', title: '工具 / 动作层总览', path: 'docs/03-tools-actions.html', type: 'overview', order: 1, status: 'available' },
        { id: 'tools-actions-course', title: '工具 / 动作层课程目录', path: 'docs/tools/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'tools-contract-schema', title: '01 工具契约与 Schema', path: 'docs/tools/01-tool-contract-and-schema.html', type: 'theory', order: 3, status: 'available' },
        { id: 'tools-lifecycle-observation', title: '02 调用生命周期与 Observation', path: 'docs/tools/02-call-lifecycle-and-observation.html', type: 'theory', order: 4, status: 'available' },
        { id: 'tools-permissions-sandbox', title: '03 权限、审批与沙箱', path: 'docs/tools/03-permissions-approval-and-sandbox.html', type: 'theory', order: 5, status: 'available' },
        { id: 'tools-retry-idempotency', title: '04 重试、幂等与副作用', path: 'docs/tools/04-retry-idempotency-and-side-effects.html', type: 'theory', order: 6, status: 'available' },
        { id: 'tools-interfaces', title: '05 Function Calling / MCP / Computer Use', path: 'docs/tools/05-function-calling-mcp-and-computer-use.html', type: 'theory', order: 7, status: 'available' },
        { id: 'tools-actions-checkpoint', title: '工具 / 动作层理论检查点', path: 'assessment/03-tools-actions-theory-checkpoint.html', type: 'checkpoint', order: 8, status: 'available' },
        { id: 'tools-actions-suggested-answer', title: '工具检查点建议答案', path: 'assessment/answers/03-tools-actions.html', type: 'suggested-answer', answerFor: 'tools-actions-checkpoint', order: 9, status: 'available' },
      ],
    },
    {
      id: 'l2-knowledge-rag',
      label: 'L2 · 知识 / RAG',
      stage: 'L2',
      order: 6,
      items: [
        { id: 'knowledge-rag-overview', title: '知识 / RAG 总览', path: 'docs/04-knowledge-rag.html', type: 'overview', order: 1, status: 'available' },
        { id: 'knowledge-rag-course', title: '知识 / RAG 课程目录', path: 'docs/knowledge-rag/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'knowledge-rag-boundary-pipeline', title: '01 边界与端到端流水线', path: 'docs/knowledge-rag/01-boundary-and-pipeline.html', type: 'theory', order: 3, status: 'available' },
        { id: 'knowledge-rag-ingestion-indexing', title: '02 摄取、切分与索引', path: 'docs/knowledge-rag/02-ingestion-chunking-and-indexing.html', type: 'theory', order: 4, status: 'available' },
        { id: 'knowledge-rag-retrieval-reranking', title: '03 检索与重排', path: 'docs/knowledge-rag/03-retrieval-and-reranking.html', type: 'theory', order: 5, status: 'available' },
        { id: 'knowledge-rag-grounding-security', title: '04 Grounding、引用与访问控制', path: 'docs/knowledge-rag/04-grounding-citations-and-access-control.html', type: 'theory', order: 6, status: 'available' },
        { id: 'knowledge-rag-evaluation-diagnosis', title: '05 评测与失败诊断', path: 'docs/knowledge-rag/05-evaluation-and-failure-diagnosis.html', type: 'theory', order: 7, status: 'available' },
        { id: 'knowledge-rag-checkpoint', title: '知识 / RAG 理论检查点', path: 'assessment/04-knowledge-rag-theory-checkpoint.html', type: 'checkpoint', order: 8, status: 'available' },
        { id: 'knowledge-rag-suggested-answer', title: 'RAG 检查点建议答案', path: 'assessment/answers/04-knowledge-rag.html', type: 'suggested-answer', answerFor: 'knowledge-rag-checkpoint', order: 9, status: 'available' },
      ],
    },
    {
      id: 'l2-memory-system',
      label: 'L2 · 记忆系统',
      stage: 'L2',
      order: 7,
      items: [
        { id: 'memory-system-overview', title: '记忆系统总览', path: 'docs/05-memory-system.html', type: 'overview', order: 1, status: 'available' },
        { id: 'memory-system-course', title: '记忆系统课程目录', path: 'docs/memory/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'memory-boundaries', title: '01 状态、会话与记忆边界', path: 'docs/memory/01-state-session-and-memory-boundaries.html', type: 'theory', order: 3, status: 'available' },
        { id: 'memory-types', title: '02 工作、情景、语义与程序记忆', path: 'docs/memory/02-memory-types.html', type: 'theory', order: 4, status: 'available' },
        { id: 'memory-lifecycle', title: '03 读取、写入、整合与遗忘', path: 'docs/memory/03-read-write-consolidation-and-forgetting.html', type: 'theory', order: 5, status: 'available' },
        { id: 'memory-governance', title: '04 隐私、投毒与治理', path: 'docs/memory/04-privacy-poisoning-and-governance.html', type: 'theory', order: 6, status: 'available' },
        { id: 'memory-system-checkpoint', title: '记忆系统理论检查点', path: 'assessment/05-memory-system-theory-checkpoint.html', type: 'checkpoint', order: 7, status: 'available' },
        { id: 'memory-system-suggested-answer', title: '记忆检查点建议答案', path: 'assessment/answers/05-memory-system.html', type: 'suggested-answer', answerFor: 'memory-system-checkpoint', order: 8, status: 'available' },
      ],
    },
    {
      id: 'l2-governance-observability',
      label: 'L2 · 治理与可观测',
      stage: 'L2',
      order: 8,
      items: [
        { id: 'governance-observability-overview', title: '治理与可观测总览', path: 'docs/06-governance-observability.html', type: 'overview', order: 1, status: 'available' },
        { id: 'governance-observability-course', title: '治理与可观测课程目录', path: 'docs/governance-observability/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'governance-online-control-plane', title: '01 在线横切职责与控制面', path: 'docs/governance-observability/01-online-cross-cutting-and-control-plane.html', type: 'theory', order: 3, status: 'available' },
        { id: 'governance-telemetry', title: '02 Trace、Log 与 Metric', path: 'docs/governance-observability/02-trace-log-and-metric.html', type: 'theory', order: 4, status: 'available' },
        { id: 'governance-identity-authorization-audit', title: '03 身份、权限与审计', path: 'docs/governance-observability/03-identity-authorization-and-audit.html', type: 'theory', order: 5, status: 'available' },
        { id: 'governance-injection-pii', title: '04 Prompt Injection、PII 与防护', path: 'docs/governance-observability/04-prompt-injection-pii-and-guardrails.html', type: 'theory', order: 6, status: 'available' },
        { id: 'governance-hitl-budget-incident', title: '05 HITL、预算与事件响应', path: 'docs/governance-observability/05-hitl-budget-and-incident-response.html', type: 'theory', order: 7, status: 'available' },
        { id: 'governance-observability-checkpoint', title: '治理与可观测理论检查点', path: 'assessment/06-governance-observability-theory-checkpoint.html', type: 'checkpoint', order: 8, status: 'available' },
        { id: 'governance-observability-suggested-answer', title: '治理检查点建议答案', path: 'assessment/answers/06-governance-observability.html', type: 'suggested-answer', answerFor: 'governance-observability-checkpoint', order: 9, status: 'available' },
      ],
    },
    {
      id: 'l2-evaluation',
      label: 'L2 · 评测层',
      stage: 'L2',
      order: 9,
      items: [
        { id: 'evaluation-overview', title: '评测层总览', path: 'docs/07-evaluation.html', type: 'overview', order: 1, status: 'available' },
        { id: 'evaluation-course', title: '评测层课程目录', path: 'docs/evaluation/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'evaluation-objectives-datasets-baselines', title: '01 目标、数据集与基线', path: 'docs/evaluation/01-objectives-datasets-and-baselines.html', type: 'theory', order: 3, status: 'available' },
        { id: 'evaluation-outcome-trajectory', title: '02 结果评测与轨迹评测', path: 'docs/evaluation/02-outcome-and-trajectory-evaluation.html', type: 'theory', order: 4, status: 'available' },
        { id: 'evaluation-rules-humans-judge', title: '03 规则、人工与 LLM-as-a-Judge', path: 'docs/evaluation/03-rules-humans-and-llm-as-a-judge.html', type: 'theory', order: 5, status: 'available' },
        { id: 'evaluation-regression-release-gates', title: '04 回归测试与上线门禁', path: 'docs/evaluation/04-regression-tests-and-release-gates.html', type: 'theory', order: 6, status: 'available' },
        { id: 'evaluation-safety-feedback', title: '05 安全红队与线上反馈', path: 'docs/evaluation/05-safety-red-teaming-and-online-feedback.html', type: 'theory', order: 7, status: 'available' },
        { id: 'evaluation-checkpoint', title: '评测层理论检查点', path: 'assessment/07-evaluation-theory-checkpoint.html', type: 'checkpoint', order: 8, status: 'available' },
        { id: 'evaluation-suggested-answer', title: '评测检查点建议答案', path: 'assessment/answers/07-evaluation.html', type: 'suggested-answer', answerFor: 'evaluation-checkpoint', order: 9, status: 'available' },
      ],
    },
    {
      id: 'l2-model-gateway-infrastructure',
      label: 'L2 · 模型网关 + 基础设施',
      stage: 'L2',
      order: 10,
      items: [
        { id: 'model-gateway-infrastructure-overview', title: '模型网关 + 基础设施总览', path: 'docs/08-model-gateway-infrastructure.html', type: 'overview', order: 1, status: 'available' },
        { id: 'model-gateway-infrastructure-course', title: '模型网关 + 基础设施课程目录', path: 'docs/model-gateway-infrastructure/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'model-gateway-abstraction-routing', title: '01 模型抽象、路由与能力匹配', path: 'docs/model-gateway-infrastructure/01-model-abstraction-routing-and-capability-matching.html', type: 'theory', order: 3, status: 'available' },
        { id: 'model-gateway-resilience-cache', title: '02 降级、限流与缓存', path: 'docs/model-gateway-infrastructure/02-fallback-rate-limiting-and-caching.html', type: 'theory', order: 4, status: 'available' },
        { id: 'model-gateway-cost-capacity', title: '03 成本、延迟与容量', path: 'docs/model-gateway-infrastructure/03-cost-latency-and-capacity.html', type: 'theory', order: 5, status: 'available' },
        { id: 'infrastructure-runtime-storage-network', title: '04 运行时、存储与网络', path: 'docs/model-gateway-infrastructure/04-runtime-storage-and-network.html', type: 'theory', order: 6, status: 'available' },
        { id: 'infrastructure-sandbox-tenant-isolation', title: '05 沙箱、租户与执行隔离', path: 'docs/model-gateway-infrastructure/05-sandbox-tenant-and-execution-isolation.html', type: 'theory', order: 7, status: 'available' },
        { id: 'model-gateway-infrastructure-checkpoint', title: '模型网关 + 基础设施理论检查点', path: 'assessment/08-model-gateway-infrastructure-theory-checkpoint.html', type: 'checkpoint', order: 8, status: 'available' },
        { id: 'model-gateway-infrastructure-suggested-answer', title: '网关与基础设施检查点建议答案', path: 'assessment/answers/08-model-gateway-infrastructure.html', type: 'suggested-answer', answerFor: 'model-gateway-infrastructure-checkpoint', order: 9, status: 'available' },
      ],
    },
    {
      id: 'l2-interaction-access',
      label: 'L2 · 交互与接入',
      stage: 'L2',
      order: 11,
      items: [
        { id: 'interaction-access-overview', title: '交互与接入层总览', path: 'docs/09-interaction-access.html', type: 'overview', order: 1, status: 'available' },
        { id: 'interaction-access-course', title: '交互与接入层课程目录', path: 'docs/interaction-access/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'interaction-channel-session-identity', title: '01 渠道、会话与身份', path: 'docs/interaction-access/01-channel-session-and-identity.html', type: 'theory', order: 3, status: 'available' },
        { id: 'interaction-streaming-multimodal', title: '02 流式响应与多模态输入', path: 'docs/interaction-access/02-streaming-and-multimodal-input.html', type: 'theory', order: 4, status: 'available' },
        { id: 'interaction-clarification-hitl-handoff', title: '03 澄清、HITL 与人工移交', path: 'docs/interaction-access/03-clarification-hitl-and-handoff.html', type: 'theory', order: 5, status: 'available' },
        { id: 'interaction-consent-recovery-accessibility', title: '04 同意、错误恢复与可访问性', path: 'docs/interaction-access/04-consent-error-recovery-and-accessibility.html', type: 'theory', order: 6, status: 'available' },
        { id: 'interaction-access-checkpoint', title: '交互与接入层理论检查点', path: 'assessment/09-interaction-access-theory-checkpoint.html', type: 'checkpoint', order: 7, status: 'available' },
        { id: 'interaction-access-suggested-answer', title: '交互检查点建议答案', path: 'assessment/answers/09-interaction-access.html', type: 'suggested-answer', answerFor: 'interaction-access-checkpoint', order: 8, status: 'available' },
      ],
    },
    {
      id: 'l3-engineering',
      label: 'L3 · 工程验证',
      stage: 'L3',
      order: 12,
      items: [
        { id: 'agent-loop-lab', title: '最小 Agent Loop', path: 'labs/agent-loop-minimal/README.md', type: 'lab', order: 1, status: 'available' },
        { id: 'decision-contract-lab', title: 'E1 · 结构化决策契约', path: 'labs/decision-contract-minimal/README.md', type: 'lab', order: 2, status: 'available' },
        { id: 'tool-calling-lab', title: 'E2 · 工具调用与 Schema', path: 'labs/tool-calling-minimal/README.md', type: 'lab', order: 3, status: 'available' },
        { id: 'tool-reliability-lab', title: 'E3 · 权限与可靠副作用', path: 'labs/tool-reliability-minimal/README.md', type: 'lab', order: 4, status: 'available' },
        { id: 'checkpoint-resume-lab', title: 'E4 · Checkpoint 与安全恢复', path: 'labs/checkpoint-resume-minimal/README.md', type: 'lab', order: 5, status: 'available' },
        { id: 'orchestration-engineering-check', title: 'L3 基础工程阶段考核', path: 'assessment/01-orchestration-checklist.html', type: 'assessment', order: 6, status: 'available' },
      ],
    },
    {
      id: 'l4-interview',
      label: 'L4 · 面试训练',
      stage: 'L4',
      order: 13,
      items: [
        { id: 'interview-question-bank', title: '面试题库总览', path: 'interview/questions.html', type: 'interview', order: 1, status: 'available' },
        { id: 'orchestration-interview', title: '编排控制层面试题', path: 'interview/01-orchestration-questions.html', type: 'interview', order: 2, status: 'available' },
        { id: 'reasoning-core-interview', title: '推理内核面试题', path: 'interview/02-reasoning-core-questions.html', type: 'interview', order: 3, status: 'available' },
        { id: 'tools-actions-interview', title: '工具 / 动作层面试题', path: 'interview/03-tools-actions-questions.html', type: 'interview', order: 4, status: 'available' },
        { id: 'knowledge-rag-interview', title: '知识 / RAG 面试题', path: 'interview/04-knowledge-rag-questions.html', type: 'interview', order: 5, status: 'available' },
        { id: 'memory-system-interview', title: '记忆系统面试题', path: 'interview/05-memory-system-questions.html', type: 'interview', order: 6, status: 'available' },
        { id: 'governance-observability-interview', title: '治理与可观测面试题', path: 'interview/06-governance-observability-questions.html', type: 'interview', order: 7, status: 'available' },
        { id: 'evaluation-interview', title: '评测层面试题', path: 'interview/07-evaluation-questions.html', type: 'interview', order: 8, status: 'available' },
        { id: 'model-gateway-infrastructure-interview', title: '模型网关 + 基础设施面试题', path: 'interview/08-model-gateway-infrastructure-questions.html', type: 'interview', order: 9, status: 'available' },
        { id: 'interaction-access-interview', title: '交互与接入层面试题', path: 'interview/09-interaction-access-questions.html', type: 'interview', order: 10, status: 'available' },
        { id: 'system-design-debugging-interview', title: '系统设计与 Trace 调试题', path: 'interview/10-system-design-debugging-questions.html', type: 'interview', order: 11, status: 'available' },
        { id: 'project-experience-interview', title: '项目经验与行为追问题', path: 'interview/11-project-experience-questions.html', type: 'interview', order: 12, status: 'available' },
        { id: 'interview-suggested-answers', title: '面试题建议答案', path: 'interview/suggested-answers.html', type: 'interview', order: 13, status: 'available' },
        { id: 'interview-readiness-checkpoint', title: 'L4 面试就绪度检查点', path: 'assessment/interview-readiness-checkpoint.html', type: 'assessment', order: 14, status: 'available' },
      ],
    },
  ];

  global.LEARNING_CATALOG = LEARNING_CATALOG;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LEARNING_CATALOG };
  }

  if (typeof document === 'undefined') return;

  const script = document.currentScript;
  if (!script || document.querySelector('.course-menu')) return;

  const projectRoot = new URL('../', script.src);
  const normalizePath = (value) => decodeURIComponent(new URL(value, window.location.href).pathname).replace(/\/$/, '');
  const currentPath = normalizePath(window.location.href);
  let currentGroupId = null;

  for (const group of LEARNING_CATALOG) {
    const currentItem = group.items.find((item) => item.path && normalizePath(new URL(item.path, projectRoot)) === currentPath);
    if (currentItem) {
      currentGroupId = group.id;
      break;
    }
  }

  const nav = document.createElement('nav');
  nav.id = 'course-menu';
  nav.className = 'course-menu';
  nav.setAttribute('aria-label', 'Agent 学习课程目录');

  const navHeader = document.createElement('div');
  navHeader.className = 'course-menu__header';

  const homeLink = document.createElement('a');
  homeLink.className = 'course-menu__brand';
  homeLink.href = new URL('docs/index.html', projectRoot).href;
  homeLink.innerHTML = '<span>AGENT IN ACTIONS</span><strong>学习目录</strong>';

  const closeButton = document.createElement('button');
  closeButton.className = 'course-menu__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '关闭课程目录');
  closeButton.title = '关闭课程目录';
  closeButton.textContent = '×';

  navHeader.append(homeLink, closeButton);
  nav.append(navHeader);

  const groupContainer = document.createElement('div');
  groupContainer.className = 'course-menu__groups';

  for (const group of [...LEARNING_CATALOG].sort((a, b) => a.order - b.order)) {
    const details = document.createElement('details');
    details.className = 'course-menu__group';
    details.dataset.groupId = group.id;
    details.open = group.id === currentGroupId || group.id === 'overview';

    const summary = document.createElement('summary');
    summary.innerHTML = `<span>${group.label}</span><span class="course-menu__chevron" aria-hidden="true">›</span>`;
    details.append(summary);

    const list = document.createElement('ol');
    list.className = 'course-menu__list';

    for (const item of [...group.items].sort((a, b) => a.order - b.order)) {
      const listItem = document.createElement('li');
      listItem.className = 'course-menu__item';

      if (item.status === 'available' && item.path) {
        const link = document.createElement('a');
        link.href = new URL(item.path, projectRoot).href;
        link.textContent = item.title;
        link.dataset.itemId = item.id;
        link.dataset.assetStatus = item.status;

        if (normalizePath(link.href) === currentPath) {
          link.classList.add('is-current');
          link.setAttribute('aria-current', 'page');
        }

        listItem.append(link);
      } else {
        const planned = document.createElement('span');
        planned.className = 'is-planned';
        planned.textContent = item.title;
        planned.setAttribute('aria-label', `${item.title}，待建设`);

        const status = document.createElement('small');
        status.textContent = '待建设';
        planned.append(status);
        listItem.append(planned);
      }

      list.append(listItem);
    }

    details.append(list);
    groupContainer.append(details);
  }

  nav.append(groupContainer);

  const progressLink = document.createElement('a');
  progressLink.className = 'course-menu__progress';
  progressLink.href = new URL('roadmap/progress-tracker.html', projectRoot).href;
  progressLink.innerHTML = '<span>学习状态与门禁证据</span><strong>查看进度跟踪</strong>';
  nav.append(progressLink);

  const toggleButton = document.createElement('button');
  toggleButton.className = 'course-menu-toggle';
  toggleButton.type = 'button';
  toggleButton.setAttribute('aria-controls', nav.id);
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-label', '打开课程目录');
  toggleButton.innerHTML = '<span class="course-menu-toggle__mark" aria-hidden="true"></span><span>课程目录</span>';

  const overlay = document.createElement('div');
  overlay.className = 'course-menu-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const setMenuOpen = (open, restoreFocus) => {
    document.body.classList.toggle('course-menu-open', open);
    toggleButton.setAttribute('aria-expanded', String(open));
    toggleButton.setAttribute('aria-label', open ? '关闭课程目录' : '打开课程目录');
    if (open) closeButton.focus();
    else if (restoreFocus) toggleButton.focus();
  };

  toggleButton.addEventListener('click', () => {
    setMenuOpen(!document.body.classList.contains('course-menu-open'), true);
  });
  closeButton.addEventListener('click', () => setMenuOpen(false, true));
  overlay.addEventListener('click', () => setMenuOpen(false, true));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && window.matchMedia('(max-width: 1120px)').matches) setMenuOpen(false, false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('course-menu-open')) setMenuOpen(false, true);
  });

  document.body.prepend(overlay);
  document.body.prepend(nav);
  document.body.prepend(toggleButton);
  document.body.classList.add('has-course-menu');
})(typeof window !== 'undefined' ? window : globalThis);
