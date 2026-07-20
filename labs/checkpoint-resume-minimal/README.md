# E4 · Checkpoint 与安全恢复

本案例把等待澄清和等待审批从内存状态变成版本化 Checkpoint，并验证恢复不是“从原行继续”，而是一次新的受治理请求。

## 学习目标

- 在暂停前持久化恢复所需的最小状态。
- 区分等待澄清、等待审批、完成、拒绝和过期。
- 恢复时重新验证身份、环境、动作摘要与前置条件。
- 防止重复恢复产生重复副作用。

## 架构层映射

- ② 编排控制层：暂停、Checkpoint、恢复和类型化状态。
- ⑨ 基础设施：持久化和原子替换；本案例使用本地 JSON。
- ⑦ 治理与可观测层：恢复重验、审批和 Trace 关联。
- ① 交互与接入层：澄清及审批响应进入恢复请求。

## 前置理论

先学习[编排可靠性与恢复](../../docs/orchestration/04-reliability-and-recovery.html)、[澄清、HITL 与人工移交](../../docs/interaction-access/03-clarification-hitl-and-handoff.html)，并保存 [E3](../tool-reliability-minimal/README.md) 完成证据。

## 范围边界

范围内：版本化 JSON Checkpoint、原子文件替换、澄清/审批等待、恢复重验、消费记录和进程内幂等执行探针。

范围外：数据库并发锁、加密、租户隔离、跨进程 Effect Ledger、定时调度和生产工作流引擎。JSON 文件便于观察协议，不代表生产持久化建议。

## 环境与运行

```bash
conda run -n agent_in_actions \
  python labs/checkpoint-resume-minimal/demo.py --scenario valid-resume
```

可用场景：`valid-resume`、`subject-mismatch`、`environment-changed`、`expired`、`action-changed`、`duplicate-resume`、`clarification-resume`。

## 关键文件

| 文件 | 职责 |
|---|---|
| `checkpoint_resume/core.py` | Checkpoint Schema、Store、暂停与恢复协议 |
| `fixtures/scenarios.json` | 恢复上下文与故障配置 |
| `demo.py` | 使用临时目录模拟跨进程持久状态 |
| `tests/test_checkpoint_resume.py` | 重验、过期、重复恢复和零副作用测试 |

## 主流程

```text
running → checkpoint saved → waiting
                              ↓ resume request
       version / expiry / subject / environment / action digest
                              ↓
            clarification validation or approval revalidation
                              ↓
                effect → checkpoint consumed → completed
```

## 成功场景

`valid-resume` 先输出 `waiting_approval`，恢复后输出 `completed`，暂停与恢复 Trace 使用同一个 correlation ID，`effect_count=1`。`clarification-resume` 完成回答恢复但不产生工具效果。

## 故障场景

```bash
conda run -n agent_in_actions python labs/checkpoint-resume-minimal/demo.py --scenario subject-mismatch
conda run -n agent_in_actions python labs/checkpoint-resume-minimal/demo.py --scenario expired
conda run -n agent_in_actions python labs/checkpoint-resume-minimal/demo.py --scenario action-changed
conda run -n agent_in_actions python labs/checkpoint-resume-minimal/demo.py --scenario duplicate-resume
```

前三种恢复均在动作前拒绝；重复恢复返回 `already_completed`，总效果数仍为一。

## 自动化测试

```bash
conda run -n agent_in_actions \
  python -m unittest discover \
  -s labs/checkpoint-resume-minimal/tests \
  -t labs/checkpoint-resume-minimal -v
```

## 设计取舍

Store 通过同目录临时文件和 `os.replace` 避免半写文件，但没有解决并发 claim、网络文件系统语义、加密、备份和执行后写回前崩溃。生产恢复必须把 Checkpoint 与可信幂等执行协议组合，而不是只保存一份 JSON。

## 小步改造

增加 `authorization-revoked` 场景：审批虽然通过，但恢复时权限已经撤销。要求返回类型化拒绝、保留 Checkpoint、效果数为零，并补测试和 Trace 归因。

## Trace 复盘

1. 哪条事件证明 Checkpoint 已在暂停前落盘？
2. 为什么旧审批不能在环境或参数变化后直接复用？
3. `already_completed` 与重新执行后“碰巧结果一样”有什么差别？
4. 当前 JSON 方案在哪个崩溃窗口仍可能需要外部幂等保障？

## 面试表达

用“恢复是新请求”作为结论，展开 Checkpoint、身份重验、环境版本、动作摘要、幂等执行、过期与人工出口。

## 完成证据

进入阶段考核前保存：权限撤销改造、全部测试输出、一份重复恢复证据链、一份崩溃窗口分析和 3 分钟暂停恢复方案口述。资产可用和测试通过不自动等于掌握。

## 下一步

完成 E0～E4 全部证据后进入 [L3 基础工程阶段考核](../../assessment/01-orchestration-checklist.html)。
