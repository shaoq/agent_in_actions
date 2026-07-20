# E3 · 权限与可靠副作用

本案例把 E2 的工具调用推进到真实写动作语义：先授权和审批，再处理派发前故障、幂等、Effect Receipt 与派发后未知结果。

## 学习目标

- 在副作用前执行主体权限和风险审批。
- 区分派发前瞬时故障与派发后 unknown outcome。
- 用稳定幂等键约束同一逻辑动作。
- 用 Effect Receipt 查询已经发生的业务效果。

## 架构层映射

- ④ 工具 / 动作层：工单写动作、派发边界和 Effect Receipt。
- ⑦ 治理与可观测层：授权、审批、审计事件和预算。
- ② 编排控制层：等待审批、重试、查询和终止策略。
- ⑨ 基础设施：生产中的可信幂等存储；本案例仅使用本地 Fake Ledger。

## 前置理论

先学习[权限、审批与沙箱](../../docs/tools/03-permissions-approval-and-sandbox.html)和[重试、幂等与副作用](../../docs/tools/04-retry-idempotency-and-side-effects.html)，并保存 [E2](../tool-calling-minimal/README.md) 完成证据。

## 范围边界

范围内：权限、风险审批、统一重试预算、稳定幂等键、本地 Effect Ledger、Receipt 查询和确定性故障注入。

范围外：真实身份系统、分布式锁、数据库事务、补偿工作流、密钥管理和生产审计存储。本地 Ledger 只用于让“效果是否发生”变成可观察事实。

## 环境与运行

```bash
conda run -n agent_in_actions \
  python labs/tool-reliability-minimal/demo.py --scenario success
```

可用场景：`success`、`waiting-approval`、`unauthorized`、`retry-exhausted`、`unknown-outcome`、`idempotency-conflict`。

## 关键文件

| 文件 | 职责 |
|---|---|
| `tool_reliability/core.py` | 策略、审批、重试、幂等和 Fake Effect Ledger |
| `fixtures/scenarios.json` | 授权、故障与冲突配置 |
| `demo.py` | 场景构造和结构化结果 |
| `tests/test_tool_reliability.py` | 零越权、预算、未知结果和去重测试 |

## 主流程

```text
subject + action
      ↓ authorization
approval gate ──等待/拒绝──→ stop
      ↓ stable idempotency key
dispatch attempt
      ├─ before dispatch transient → budgeted retry
      ├─ after dispatch timeout ───→ query Effect Ledger
      ├─ conflict ─────────────────→ refresh / re-plan
      └─ receipt ──────────────────→ completed
```

## 成功场景

`success` 应只产生一次 effect，返回 Effect Receipt，并在 Trace 中保存同一个 idempotency key。`waiting-approval` 必须在派发前停止，`effect_count=0`。

## 故障场景

```bash
conda run -n agent_in_actions python labs/tool-reliability-minimal/demo.py --scenario unauthorized
conda run -n agent_in_actions python labs/tool-reliability-minimal/demo.py --scenario retry-exhausted
conda run -n agent_in_actions python labs/tool-reliability-minimal/demo.py --scenario unknown-outcome
```

未授权不会尝试派发；重试耗尽使用同一个逻辑键且没有效果；unknown outcome 只执行一次，通过查询 Receipt 完成对账。

## 自动化测试

```bash
conda run -n agent_in_actions \
  python -m unittest discover \
  -s labs/tool-reliability-minimal/tests \
  -t labs/tool-reliability-minimal -v
```

## 设计取舍

Fake Service 把下游系统和 Effect Ledger 放在同一进程，便于观察，但不提供原子跨服务事务、并发 claim 或持久恢复。生产系统必须让服务端或可信 Adapter 原子绑定幂等键、请求摘要、状态和 Receipt，并定义 TTL 与人工核对流程。

## 小步改造

增加 `business-conflict` 场景：工单版本变化后禁止复用旧参数重试，要求返回刷新权威状态的类型化出口，并补充 effect 仍为零的测试。

## Trace 复盘

1. 如何证明 unauthorized 没有越过派发边界？
2. 为什么 unknown outcome 不能直接换一个幂等键重试？
3. Receipt 与“客户端收到 200”分别证明什么？
4. 同 key 不同请求摘要为什么必须冲突？

## 面试表达

用“先判断是否 dispatch，再判断 effect 是否已知”解释超时恢复；补充权限、审批、统一预算、幂等存储和人工核对的职责边界。

## 完成证据

进入 E4 前保存：新冲突场景代码和测试、一次 unknown outcome 证据链、一次未授权零副作用证明，以及 3 分钟“超时后为什么不能直接重试”的口述。

## 下一步

完成证据后进入 [E4 · Checkpoint 与安全恢复](../checkpoint-resume-minimal/README.md)。
