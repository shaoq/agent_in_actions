# Labs

本目录承载 Agent 工程验证案例。实验不是随手 demo，而是把已经通过门禁的理论转化成可运行、可测试、可故障注入和可复盘的工程证据。

## L3 渐进工程路径

第一期统一使用“企业工单 Agent”语境，每个案例只增加一个主要工程变量，同时保持独立运行：

| 阶段 | 案例 | 新增能力 | 前置门禁 |
|---|---|---|---|
| E0 | [`agent-loop-minimal`](agent-loop-minimal/README.md) | 显式状态、有界循环、终止与 Trace | 编排理论 |
| E1 | [`decision-contract-minimal`](decision-contract-minimal/README.md) | `act / finish / clarify` 结构化决策契约 | 推理内核理论 |
| E2 | [`tool-calling-minimal`](tool-calling-minimal/README.md) | Tool Registry、Schema、调用生命周期与 Observation | 工具理论 |
| E3 | [`tool-reliability-minimal`](tool-reliability-minimal/README.md) | 权限、审批、重试、幂等与 unknown outcome | 工具可靠性理论 |
| E4 | [`checkpoint-resume-minimal`](checkpoint-resume-minimal/README.md) | Checkpoint、HITL、恢复重验与去重 | 编排恢复与交互理论 |

完成 E0～E4 的实现、测试、调试和表达证据后，再进入 [L3 基础工程阶段考核](../assessment/01-orchestration-checklist.html)。案例资产 `available` 或测试通过都不会自动更新个人掌握状态。

## 统一学习方法

每个案例按相同闭环推进：

1. 通过前置理论门禁。
2. 运行确定性成功基线。
3. 注入至少两个失败场景。
4. 完成一个 30～60 分钟的小步改造。
5. 保存代码差异和完整测试输出。
6. 用“现象—证据—归因—修复—回归”复盘 Trace。
7. 完成 30 秒结论和 3 分钟工程表达。

## 独立运行原则

- 每个实验必须包含自己的 README、Python package、Fixtures、CLI 和测试。
- E1～E4 不得从其他实验目录导入运行时代码。
- 基础路径不依赖 API key、网络、外部模型或远程服务。
- Fake Adapter、教学型 Schema 和 JSON Checkpoint 必须明确生产边界。
- 测试必须验证状态、关键 Trace 和不应发生的副作用，而不只检查退出码。

运行全部 E0～E4 回归：

```bash
npm run engineering-labs:test
```

## 第二期规划

完成基础工程路径后，再分别建设：

1. `model-gateway-minimal`：真实模型适配、路由、超时、降级和成本证据。
2. `rag-grounded-answer`：摄取、检索、引用、权限过滤和证据不足。
3. `memory-lifecycle-minimal`：Session / State / Memory 边界、同意、TTL 与纠错删除。
4. `trace-eval-regression`：故障注入、轨迹评测、规则评分和回归门禁。
5. `ticket-agent-capstone`：把交互、工具、RAG、审批、恢复和评测组合成端到端项目。

## 实验 README 契约

新实验必须包含：学习目标、架构层映射、前置理论、范围边界、环境与运行、关键文件、主流程、成功场景、故障场景、自动化测试、设计取舍、小步改造、Trace 复盘、面试表达、完成证据和下一步。
