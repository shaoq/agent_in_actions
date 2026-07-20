# E1 · 结构化决策契约

本案例把“模型样式的原始对象”转换成受编排器信任的类型化决定。它不调用真实模型或工具，重点是先守住决策边界。

## 学习目标

- 区分原始模型输出与可执行控制指令。
- 校验 `act`、`finish`、`clarify` 三类决定。
- 证明非法输出会在动作边界前停止。
- 从 Trace 判断失败发生在推理输出、契约校验还是动作阶段。

## 架构层映射

- 主要对应：③ 推理内核的结构化决策契约。
- 控制状态归属：② 编排控制层。
- Trace 对应：⑦ 治理与可观测层的教学型事件记录。
- 本案例没有进入④工具 / 动作层的真实派发。

## 前置理论

先完成[推理内核四单元课程](../../docs/reasoning/index.html)与[推理内核理论检查点](../../assessment/02-reasoning-core-theory-checkpoint.html)。E0 的状态与终止行为见[最小 Agent Loop](../agent-loop-minimal/README.md)。

## 范围边界

范围内：严格字段校验、三类控制状态、动作意图探针和结构化 Trace。

范围外：真实 LLM、Prompt、Tool Schema、权限、重试、持久化和沙箱。`RecordingActionIntentSink` 只证明合法动作到达边界，不执行副作用。

## 环境与运行

无需 API key、网络或第三方 Python 包：

```bash
conda run -n agent_in_actions \
  python labs/decision-contract-minimal/demo.py --scenario act-success
```

可用场景：`act-success`、`finish`、`clarify`、`invalid-kind`、`missing-field`、`extra-field`。

## 关键文件

| 文件 | 职责 |
|---|---|
| `decision_contract/core.py` | Decision 类型、严格校验、运行状态和 Trace |
| `fixtures/scenarios.json` | 确定性正常与非法输入 |
| `demo.py` | 场景 CLI |
| `tests/test_decision_contract.py` | 控制分支与零副作用边界测试 |

## 主流程

```text
raw object → contract validation ──失败──→ FAILED
                    │
                    ├─ act ───────→ ACTION_READY
                    ├─ finish ────→ COMPLETED
                    └─ clarify ───→ WAITING_CLARIFICATION
```

## 成功场景

运行 `act-success` 后应得到 `status=action_ready`、一个已接受动作意图，以及 `decision_validated → action_ready` Trace。运行 `finish` 和 `clarify` 时，动作意图数必须保持为零。

## 故障场景

```bash
conda run -n agent_in_actions python labs/decision-contract-minimal/demo.py --scenario invalid-kind
conda run -n agent_in_actions python labs/decision-contract-minimal/demo.py --scenario extra-field
```

两者都应以 `decision_validation_failed` 结束，`accepted_action_intents` 必须为 `0`。这证明“看起来合理的文本”不能绕过控制契约。

## 自动化测试

```bash
conda run -n agent_in_actions \
  python -m unittest discover \
  -s labs/decision-contract-minimal/tests \
  -t labs/decision-contract-minimal -v
```

## 设计取舍

案例直接校验 Python Mapping，而不是引入模型 SDK，目的是隔离输出契约。生产系统还需要 Schema 版本、模型响应解析、敏感字段治理和模型网关可观测；这些不应被这个小示例掩盖。

## 小步改造

在独立分支或副本中增加 `cancel` 决策：定义唯一必需字段、终态和 Trace event，并补充合法、缺字段及多余字段测试。建议控制在 30～45 分钟。

## Trace 复盘

1. `decision_received` 能否证明输出合法？
2. 为什么非法决定不能只记录错误后继续猜测？
3. `clarify` 为什么不是 `finish` 的一种文案？
4. 哪个事件是动作边界前最后一条可信证据？

## 面试表达

尝试用 30 秒回答：“为什么模型的 Function Call 仍不能直接执行？”再用 3 分钟展开契约校验、权限、幂等与 Trace 的分层职责。

## 完成证据

资产 `available` 不代表掌握。进入 E2 前保存：小步改造代码差异、完整测试输出、一份“现象—证据—归因—回归”调试记录，以及一次 30 秒口述。

## 下一步

完成证据后进入 [E2 · 工具调用与 Schema](../tool-calling-minimal/README.md)。
