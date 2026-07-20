# E2 · 工具调用与 Schema

本案例把 E1 中已验证的动作意图推进到受控工具边界，观察 Tool Registry、输入 Schema、派发和类型化 Observation。

## 学习目标

- 用 Registry 限制 Agent 可选择的工具集合。
- 在派发前校验工具参数。
- 区分未知工具、参数错误、业务拒绝和执行异常。
- 用调用 ID 和 Trace 还原一次工具生命周期。

## 架构层映射

- 主要对应：④ 工具 / 动作层。
- 上游输入：③ 推理内核产生的结构化动作意图。
- 生命周期推进：② 编排控制层。
- 调用证据：⑦ 治理与可观测层。

## 前置理论

先完成[工具 / 动作层五单元课程](../../docs/tools/index.html)前两个单元与[工具理论检查点](../../assessment/03-tools-actions-theory-checkpoint.html)，并保存 [E1](../decision-contract-minimal/README.md) 的四类证据。

## 范围边界

范围内：本地 Tool Registry、教学型 Schema 子集、只读工具、类型化 Observation 和确定性故障。

范围外：完整 JSON Schema、远程 API、MCP、OAuth、审批、重试、幂等和沙箱。示例 Schema 只实现 object、string、integer、boolean、required 与禁止多余字段。

## 环境与运行

```bash
conda run -n agent_in_actions \
  python labs/tool-calling-minimal/demo.py --scenario success
```

可用场景：`success`、`unknown-tool`、`missing-field`、`wrong-type`、`extra-field`、`business-rejected`、`execution-error`。

## 关键文件

| 文件 | 职责 |
|---|---|
| `tool_calling/core.py` | Registry、Schema 校验、调用生命周期和 Fake 工具 |
| `fixtures/scenarios.json` | 正常、拒绝与故障输入 |
| `demo.py` | 场景 CLI 与结构化输出 |
| `tests/test_tool_calling.py` | 派发边界和结果分类测试 |

## 主流程

```text
action intent
    ↓ prepare
registry lookup ──未知──→ UNKNOWN_TOOL
    ↓ validate
schema check ────非法──→ VALIDATION_ERROR
    ↓ dispatch
fake tool
    ↓ observe
SUCCESS / BUSINESS_REJECTED / EXECUTION_ERROR
```

## 成功场景

`success` 应依次产生 `call_prepared`、`input_validated`、`tool_dispatched` 和 `observation_recorded`，Observation 包含稳定 call ID，`dispatch_count=1`。

## 故障场景

```bash
conda run -n agent_in_actions python labs/tool-calling-minimal/demo.py --scenario extra-field
conda run -n agent_in_actions python labs/tool-calling-minimal/demo.py --scenario business-rejected
conda run -n agent_in_actions python labs/tool-calling-minimal/demo.py --scenario execution-error
```

参数错误的 `dispatch_count` 必须为 `0`；业务拒绝和执行异常都已派发，但结果类别不同，修复责任也不同。

## 自动化测试

```bash
conda run -n agent_in_actions \
  python -m unittest discover \
  -s labs/tool-calling-minimal/tests \
  -t labs/tool-calling-minimal -v
```

## 设计取舍

手写 Schema 子集是为了让校验链路可读，不是生产建议。生产环境应使用成熟 Validator、Schema 版本、兼容策略、大小限制和安全审计；远程派发还需要身份、超时、网络与 Effect Receipt。

## 小步改造

增加只读工具 `list_ticket_comments`，要求 `ticket_id` 为 string、`limit` 为 integer，并禁止额外字段。补充成功、缺字段、错类型和工具业务拒绝测试。

## Trace 复盘

1. 哪条事件证明请求已经越过派发边界？
2. 参数非法和工具业务拒绝为什么不能使用同一错误类别？
3. Observation 为什么需要 call ID，而不只需要输出字符串？
4. 如果工具超时，当前 Trace 为什么还不足以判断副作用？

## 面试表达

用“契约、授权、派发、观察”四段解释 Function Calling 为什么不等于安全工具执行，并说明 Schema 只能解决输入形状，不能替代业务权限。

## 完成证据

进入 E3 前保存：新增工具代码差异、全部测试输出、一次参数错误与一次执行异常的分层归因，以及 3 分钟口述记录。测试通过不自动表示已经掌握。

## 下一步

完成证据后进入 [E3 · 权限与可靠副作用](../tool-reliability-minimal/README.md)。
