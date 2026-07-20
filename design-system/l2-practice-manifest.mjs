const item = (suffix, title) => ({ suffix, title });

const PLACEMENT = {
  standard: { after: '<h2>面试表达</h2>', before: '<h2>下一步</h2>' },
  thematic: { after: '<h2>面试表达</h2>', before: '<h2>学习产出</h2>' },
  orchestration: { after: 'class="theory-followups"', before: '<h2>本单元产出</h2>' },
};

function target(component, prefix, unit, path, title, profile, topics, artifact) {
  const key = `${prefix}-${unit}`;
  const practices = topics.map(({ suffix, title: practiceTitle }) => ({
    id: `practice-${key}-${suffix}`,
    title: practiceTitle,
    refs: [`${key}-${suffix}`],
  }));
  const groups = [[0, 1], [2, 3], [3, 4]];
  const interviews = groups.map((indexes, index) => ({
    id: `interview-${key}-${index + 1}`,
    practices: indexes.map((i) => practices[i].id),
    concepts: indexes.map((i) => practices[i].refs[0]),
  }));
  return { component, prefix, unit, path, title, profile, placement: PLACEMENT[profile], practices, artifact: `artifact-${key}-${artifact}`, interviews };
}

export const L2_PRACTICE_PARTS = ['core', 'checklist', 'troubleshooting', 'evidence', 'interview'];
export const L2_PRACTICE_DETAILS = ['trigger', 'diagnosis', 'action', 'validation', 'rollback-tradeoff', 'interview-hook'];
export const L2_INTERVIEW_DETAILS = ['question', 'answer-outline', 'evidence', 'followups', 'boundary'];

export const L2_PRACTICE_TARGETS = [
  target('orchestration', 'orc', '01', 'docs/orchestration/01-responsibilities-and-boundaries.html', '职责与边界', 'orchestration', [item('control-boundary','检查控制权边界'),item('typed-handoff','固化类型化交接'),item('governance-gate','校验治理门禁'),item('owner-matrix','维护失败 Owner 矩阵'),item('acceptance-boundary','分离候选完成与业务验收')], 'control-owner-matrix'),
  target('orchestration', 'orc', '02', 'docs/orchestration/02-state-and-lifecycle.html', '状态与生命周期', 'orchestration', [item('state-schema','版本化 Run State'),item('legal-transition','拒绝非法状态转移'),item('checkpoint-readiness','验证 Checkpoint 就绪性'),item('pause-resume-reauth','恢复前重新授权'),item('state-migration','演练状态版本迁移')], 'checkpoint-manifest'),
  target('orchestration', 'orc', '03', 'docs/orchestration/03-patterns-and-tradeoffs.html', '模式与取舍', 'orchestration', [item('start-deterministic','从确定性流程起步'),item('routing-signal','记录模式路由信号'),item('bounded-react','约束 ReAct 循环'),item('plan-replan-gate','设置 Replan 门禁'),item('pattern-adr','维护模式选择 ADR')], 'pattern-adr'),
  target('orchestration', 'orc', '04', 'docs/orchestration/04-reliability-and-recovery.html', '可靠性与恢复', 'orchestration', [item('completion-acceptance','验证完成条件'),item('bounded-termination','设置有界终止'),item('retry-classification','按错误类型重试'),item('idempotent-action','保护动作幂等'),item('compensation-recovery','记录补偿与恢复')], 'recovery-trace'),
  target('orchestration', 'orc', '05', 'docs/orchestration/05-multi-agent-boundaries.html', 'Multi-Agent 边界', 'orchestration', [item('split-signal','验证拆分收益'),item('delegation-contract','固化委派契约'),item('context-isolation','隔离上下文与权限'),item('conflict-arbitration','设计冲突仲裁'),item('multi-agent-attribution','保留多 Agent 归因')], 'delegation-contract'),

  target('reasoning', 'rea', '01', 'docs/reasoning/01-role-and-decision-contract.html', '角色、职责与决策契约', 'thematic', [item('context-minimization','最小化决策上下文'),item('decision-union','维护 Decision 判别联合'),item('evidence-reference','绑定决策证据'),item('decision-validation','分层校验决策'),item('decision-replay','支持决策回放')], 'decision-contract'),
  target('reasoning', 'rea', '02', 'docs/reasoning/02-structured-output-and-tool-selection.html', '结构化输出与工具选择', 'thematic', [item('schema-evolution','治理 Schema 演进'),item('syntactic-validation','执行语法校验'),item('semantic-validation','执行语义校验'),item('tool-shortlist','裁剪工具候选'),item('repair-budget','限制修复预算')], 'validation-report'),
  target('reasoning', 'rea', '03', 'docs/reasoning/03-reasoning-patterns-and-tradeoffs.html', '推理模式及取舍', 'thematic', [item('pattern-entry','定义模式入口'),item('plan-contract','固化 Plan 契约'),item('bounded-react','约束 ReAct'),item('self-check-gate','设置自检门禁'),item('pattern-ablation','用消融选择模式')], 'pattern-adr'),
  target('reasoning', 'rea', '04', 'docs/reasoning/04-uncertainty-failure-and-recovery.html', '不确定性、失败与恢复', 'thematic', [item('evidence-sufficiency','判断证据充分性'),item('failure-typing','类型化推理失败'),item('clarify-escalate','选择澄清或升级'),item('recovery-owner','分配恢复 Owner'),item('decision-trace','保存决策 Trace')], 'reasoning-failure-trace'),

  target('tools', 'tool', '01', 'docs/tools/01-tool-contract-and-schema.html', '工具契约与 Schema', 'thematic', [item('schema-review','审阅工具 Schema'),item('semantic-contract','补齐语义契约'),item('compatibility-test','执行兼容性测试'),item('error-taxonomy','维护错误分类'),item('contract-publish','门禁契约发布')], 'contract-matrix'),
  target('tools', 'tool', '02', 'docs/tools/02-call-lifecycle-and-observation.html', '调用生命周期与 Observation', 'thematic', [item('call-state-machine','追踪调用状态机'),item('correlation-id','贯穿关联 ID'),item('observation-contract','固化 Observation 契约'),item('success-separation','分离三类成功'),item('call-trace','保留调用 Trace')], 'call-trace'),
  target('tools', 'tool', '03', 'docs/tools/03-permissions-approval-and-sandbox.html', '权限、审批与沙箱', 'thematic', [item('capability-scope','收窄能力范围'),item('policy-precheck','执行策略预检'),item('approval-binding','绑定审批上下文'),item('sandbox-profile','选择沙箱 Profile'),item('security-negative-test','运行安全负测')], 'approval-sandbox'),
  target('tools', 'tool', '04', 'docs/tools/04-retry-idempotency-and-side-effects.html', '重试、幂等与副作用', 'thematic', [item('retry-classification','按错误分类重试'),item('idempotency-key','设计幂等键'),item('side-effect-level','标注副作用等级'),item('compensation-record','记录补偿结果'),item('retry-budget','限制重试预算')], 'idempotency-ledger'),
  target('tools', 'tool', '05', 'docs/tools/05-function-calling-mcp-and-computer-use.html', 'Function Calling、MCP 与 Computer Use', 'thematic', [item('interface-fit','评估接口适配性'),item('function-schema','约束 Function Schema'),item('mcp-trust','校验 MCP 信任边界'),item('computer-use-guard','门禁 Computer Use'),item('adapter-observability','统一 Adapter 观测')], 'interface-adr'),

  target('memory', 'mem', '01', 'docs/memory/01-state-session-and-memory-boundaries.html', '状态、会话与记忆边界', 'standard', [item('object-classification','分类 State、Session 与 Memory'),item('memory-candidate','生成 Memory Candidate'),item('promotion-gate','执行晋升门禁'),item('scoped-read','按主体与目的读取'),item('boundary-ablation','用消融验证边界')], 'promotion-record'),
  target('memory', 'mem', '02', 'docs/memory/02-memory-types.html', '记忆类型', 'standard', [item('type-selection','选择记忆类型'),item('provenance-confidence','记录来源与置信'),item('retrieval-policy','制定读取策略'),item('conflict-resolution','处理记忆冲突'),item('type-migration','迁移错误类型')], 'typed-memory-record'),
  target('memory', 'mem', '03', 'docs/memory/03-read-write-consolidation-and-forgetting.html', '读取、写入、整合与遗忘', 'standard', [item('read-ranking','校准记忆读取排序'),item('write-validation','验证写入候选'),item('dedup-consolidation','去重并整合记忆'),item('decay-forgetting','执行衰减与遗忘'),item('deletion-receipt','证明删除传播')], 'consolidation-deletion'),
  target('memory', 'mem', '04', 'docs/memory/04-privacy-poisoning-and-governance.html', '隐私、投毒与治理', 'standard', [item('consent-purpose','绑定同意与目的'),item('sensitive-minimization','最小化敏感记忆'),item('poisoning-detection','检测记忆投毒'),item('subject-access','支持主体访问与纠正'),item('governance-audit','审计记忆治理')], 'consent-audit'),

  target('governance-observability', 'gov', '01', 'docs/governance-observability/01-online-cross-cutting-and-control-plane.html', '在线横切职责与控制面', 'standard', [item('control-point-map','维护在线控制点'),item('typed-policy-outcome','返回类型化策略结果'),item('fail-safe-default','设置 Fail-safe 默认'),item('policy-version','固定策略版本'),item('cross-layer-owner','明确跨层 Owner')], 'control-point-matrix'),
  target('governance-observability', 'gov', '02', 'docs/governance-observability/02-trace-log-and-metric.html', 'Trace、Log 与 Metric', 'standard', [item('correlation-context','贯穿关联上下文'),item('trace-semantics','定义 Trace 语义'),item('log-redaction','执行日志脱敏'),item('metric-cardinality','控制指标基数'),item('incident-pivot','支持事件 Pivot')], 'telemetry-record'),
  target('governance-observability', 'gov', '03', 'docs/governance-observability/03-identity-authorization-and-audit.html', '身份、授权与审计', 'standard', [item('identity-chain','验证身份链'),item('policy-decision','记录 Policy Decision'),item('least-privilege','执行最小权限'),item('reauthorization','在使用点再授权'),item('audit-replay','支持审计回放')], 'policy-audit'),
  target('governance-observability', 'gov', '04', 'docs/governance-observability/04-prompt-injection-pii-and-guardrails.html', 'Prompt Injection、PII 与 Guardrails', 'standard', [item('trust-boundary','标记信任边界'),item('injection-test','运行注入负测'),item('pii-detection','检测 PII'),item('redaction-tokenization','脱敏或 Tokenization'),item('guardrail-escalation','升级护栏事件')], 'security-receipt'),
  target('governance-observability', 'gov', '05', 'docs/governance-observability/05-hitl-budget-and-incident-response.html', 'HITL、预算与事件响应', 'standard', [item('hitl-trigger','定义 HITL 触发'),item('approval-context','绑定审批上下文'),item('budget-enforcement','执行运行预算'),item('incident-severity','划分事件等级'),item('postmortem-action','跟踪复盘动作')], 'incident-timeline'),

  target('evaluation', 'eval', '01', 'docs/evaluation/01-objectives-datasets-and-baselines.html', '目标、数据集与基线', 'standard', [item('objective-contract','固化评测目标'),item('dataset-version','版本化数据集'),item('gold-review','复核 Gold'),item('baseline-freeze','固定可比基线'),item('slice-coverage','检查切片覆盖')], 'dataset-manifest'),
  target('evaluation', 'eval', '02', 'docs/evaluation/02-outcome-and-trajectory-evaluation.html', '结果与轨迹评测', 'standard', [item('outcome-metric','定义 Outcome 指标'),item('trajectory-event','规范轨迹事件'),item('step-attribution','执行步骤归因'),item('partial-credit','设计部分得分'),item('failure-taxonomy','维护失败分类')], 'trajectory-diff'),
  target('evaluation', 'eval', '03', 'docs/evaluation/03-rules-humans-and-llm-as-a-judge.html', '规则、人工与 LLM-as-a-Judge', 'standard', [item('rule-first','优先确定性规则'),item('human-rubric','维护人工 Rubric'),item('judge-prompt-version','固定 Judge 版本'),item('judge-calibration','校准 Judge'),item('disagreement-escalation','升级评分分歧')], 'judge-calibration'),
  target('evaluation', 'eval', '04', 'docs/evaluation/04-regression-tests-and-release-gates.html', '回归测试与发布门禁', 'standard', [item('regression-selection','选择回归样本'),item('metric-threshold','校准指标阈值'),item('hard-fail','设置 Hard Fail'),item('shadow-canary','执行 Shadow / Canary'),item('rollback-decision','记录回滚决定')], 'release-gate'),
  target('evaluation', 'eval', '05', 'docs/evaluation/05-safety-red-teaming-and-online-feedback.html', '安全红队与线上反馈', 'standard', [item('threat-model','维护威胁模型'),item('attack-corpus','版本化攻击语料'),item('safety-triage','执行安全分诊'),item('feedback-governance','治理线上反馈'),item('regression-promotion','门禁样本晋升')], 'redteam-feedback'),

  target('model-gateway-infrastructure', 'gw', '01', 'docs/model-gateway-infrastructure/01-model-abstraction-routing-and-capability-matching.html', '模型抽象、路由与能力匹配', 'standard', [item('capability-profile','维护能力画像'),item('routing-policy','制定路由策略'),item('request-normalization','规范化模型请求'),item('provider-adapter','隔离 Provider Adapter'),item('routing-trace','保留路由 Trace')], 'routing-decision'),
  target('model-gateway-infrastructure', 'gw', '02', 'docs/model-gateway-infrastructure/02-fallback-rate-limiting-and-caching.html', 'Fallback、限流与缓存', 'standard', [item('fallback-matrix','维护 Fallback 矩阵'),item('retry-boundary','限制网关重试'),item('rate-limit-scope','按作用域限流'),item('cache-safety','保护缓存边界'),item('degradation-test','演练受控降级')], 'degradation-matrix'),
  target('model-gateway-infrastructure', 'gw', '03', 'docs/model-gateway-infrastructure/03-cost-latency-and-capacity.html', '成本、延迟与容量', 'standard', [item('cost-allocation','归集调用成本'),item('latency-budget','分配延迟预算'),item('capacity-forecast','预测容量'),item('admission-control','执行 Admission Control'),item('cost-quality-gate','设置成本质量门禁')], 'capacity-budget'),
  target('model-gateway-infrastructure', 'gw', '04', 'docs/model-gateway-infrastructure/04-runtime-storage-and-network.html', '运行时、存储与网络', 'standard', [item('runtime-slo','定义 Runtime SLO'),item('connection-pool','治理连接池'),item('storage-contract','固化存储契约'),item('network-timeout','分配网络超时'),item('dependency-drill','执行依赖演练')], 'topology-drill'),
  target('model-gateway-infrastructure', 'gw', '05', 'docs/model-gateway-infrastructure/05-sandbox-tenant-and-execution-isolation.html', '沙箱、租户与执行隔离', 'standard', [item('tenant-boundary','隔离租户边界'),item('credential-isolation','隔离凭证'),item('sandbox-policy','版本化沙箱策略'),item('egress-control','控制网络 Egress'),item('isolation-test','运行隔离负测')], 'isolation-test'),

  target('interaction-access', 'int', '01', 'docs/interaction-access/01-channel-session-and-identity.html', '渠道、会话与身份', 'standard', [item('channel-envelope','规范化渠道 Envelope'),item('session-correlation','关联会话'),item('identity-binding','绑定当前身份'),item('duplicate-event','抑制重复事件'),item('channel-handoff','处理渠道移交')], 'request-envelope'),
  target('interaction-access', 'int', '02', 'docs/interaction-access/02-streaming-and-multimodal-input.html', '流式响应与多模态输入', 'standard', [item('event-protocol','定义事件协议'),item('ordering-reconnect','处理顺序与重连'),item('partial-failure','表达局部失败'),item('media-validation','校验媒体输入'),item('stream-observability','观测流式链路')], 'event-sequence'),
  target('interaction-access', 'int', '03', 'docs/interaction-access/03-clarification-hitl-and-handoff.html', '澄清、HITL 与人工移交', 'standard', [item('clarification-trigger','识别澄清触发'),item('minimum-question','提出最小问题'),item('hitl-context','固定 HITL 上下文'),item('handoff-package','生成 Handoff Package'),item('resume-after-human','处理人工后恢复')], 'handoff-package'),
  target('interaction-access', 'int', '04', 'docs/interaction-access/04-consent-error-recovery-and-accessibility.html', '同意、错误恢复与可访问性', 'standard', [item('consent-record','记录用户同意'),item('withdrawal-propagation','传播同意撤回'),item('error-contract','返回错误契约'),item('safe-recovery','提供安全恢复'),item('accessibility-check','执行可访问性检查')], 'consent-recovery'),
];

export const L2_PRACTICE_PATHS = L2_PRACTICE_TARGETS.map((entry) => entry.path);
