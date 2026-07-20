# E0 · 最小 Agent Loop

> **进入条件**:本实验用于验证编排理论,不是编排概念的第一学习入口。请先完成[编排五单元理论课程](../../docs/orchestration/index.html),并通过[编排无代码理论检查点](../../assessment/01-orchestration-theory-checkpoint.html)。若尚未通过,先不要运行代码。

## 学习目标

本实验用一个无需模型 API 的确定性程序拆开 Agent 编排控制的核心链路:

1. 用显式状态保存任务、步骤、观察、结果和错误。
2. 执行 `decide -> act -> observe` 循环。
3. 区分正常完成、最大步数终止和失败。
4. 用结构化 trace 还原每一步发生了什么。

理论门禁通过后,先阅读[编排控制总览](../../docs/01-orchestration.html),再运行实验。本案例是渐进工程路径的 E0，完成证据后进入 E1，而不是直接把示例运行结果当成阶段通过。

## 架构层映射

- 主要对应:② 编排控制层。
- 仅作接口演示:③ 推理内核、④ 工具 / 动作层。
- 贯穿行为:⑦ 治理与可观测层中的 trace。

`ScriptedDecisionProvider` 不是 LLM 模拟器。它用于固定决策序列,把模型随机性从实验中移除,让学习者只观察编排状态和失败行为。

`LocalActionExecutor` 也不是完整工具系统。它只有受控的 `inspect` 和 `fail` 动作,不包含 tool schema、MCP、权限、重试或幂等。这些属于后续工具调用单元。

## 前置理论

- [编排控制总览](../../docs/01-orchestration.html)
- [编排五单元理论课程](../../docs/orchestration/index.html)
- [编排无代码理论检查点](../../assessment/01-orchestration-theory-checkpoint.html)

## 范围边界

范围内是显式运行状态、有界 `decide → act → observe` 循环、终止和教学型 Trace。范围外是真实模型、Tool Schema、权限、重试、幂等、Checkpoint、长期 Memory 和生产遥测；这些能力由后续案例逐步加入。

## 环境与运行

项目使用 Conda 环境 `agent_in_actions`,当前验证版本为 Python 3.12.13。

```bash
conda activate agent_in_actions
python --version
```

也可以不改变当前 shell,直接使用:

```bash
conda run -n agent_in_actions python --version
```

本实验只使用 Python 标准库,不需要安装依赖、配置 API key 或访问网络。

在本目录执行正常场景:

```bash
conda activate agent_in_actions
python demo.py --scenario success
```

或者从项目根目录执行:

```bash
conda run -n agent_in_actions \
  python labs/agent-loop-minimal/demo.py --scenario success
```

## 自动化测试

运行全部测试:

```bash
conda run -n agent_in_actions \
  python -m unittest discover \
  -s labs/agent-loop-minimal/tests \
  -t labs/agent-loop-minimal -v
```

## 成功场景

成功场景应得到:

- `status = completed`
- `step = 2`
- 一条 `Observation`
- trace 依次包含 `run_started`、决策、动作、观察和 `run_completed`

## 关键文件

| 文件 | 职责 |
|---|---|
| `agent_loop/core.py` | 状态、决策接口、动作接口、trace 和循环控制 |
| `agent_loop/__init__.py` | 对外暴露实验需要的类型 |
| `demo.py` | 四种可复现运行场景 |
| `tests/test_agent_loop.py` | 正常、终止和失败行为的自动化验证 |

## 主流程

```text
LoopState(task, max_steps)
        |
        v
provider.decide(state)
        |
        +-- finish --> COMPLETED
        |
        +-- act --> executor.execute(...)
                         |
                         v
                  Observation 写回状态
                         |
                         +--> 下一步 / MAX_STEPS
```

## 故障场景

### 最大步数

```bash
conda run -n agent_in_actions \
  python labs/agent-loop-minimal/demo.py --scenario max-steps
```

预期状态为 `max_steps`,最后一个事件为 `max_steps_reached`。这说明终止是编排器的确定性保护,不能只依赖模型主动结束。

### 非法决策

```bash
conda run -n agent_in_actions \
  python labs/agent-loop-minimal/demo.py --scenario invalid
```

预期状态为 `failed`,失败 phase 为 `decide`。编排器在执行副作用前拒绝不符合契约的输出。

### 动作异常

```bash
conda run -n agent_in_actions \
  python labs/agent-loop-minimal/demo.py --scenario action-error
```

预期状态为 `failed`,失败 phase 为 `act`,trace 保留 `action_name=fail` 和此前事件。

## 设计取舍

1. **显式状态**:关键数据不依赖隐藏全局变量或控制台输出。
2. **结构化决策**:编排器只接受 `Decision`,并在执行前校验。
3. **有界循环**:最大步数是最小保护,生产环境还需要时间和成本预算。
4. **失败即状态**:已知失败被转换为 `RunStatus.FAILED`,同时保留 trace。
5. **职责分离**:决策器提出下一步,动作执行器产生观察,编排器推进状态。

## 常见误区

- 把 `while` 循环本身当作完整编排能力。
- 只记录 prompt 和最终回答,丢失中间动作与观察。
- 将所有异常无条件重试,导致重复副作用。
- 把达到 `finish` 当作业务成功,却没有独立验收任务结果。
- 用一个复杂框架隐藏状态转换,导致无法解释失败发生在哪一层。

## Trace 复盘

完成实验后,应能不看代码回答:

1. 为什么 `LoopState` 和长期 Memory 不是同一个概念?
2. 为什么 finish、failed 和 max_steps 必须是不同状态?
3. 从 trace 如何区分决策失败和动作失败?
4. 接入真实模型后哪些接口不变,哪些实现会变化?

## 小步改造

在独立分支或副本中增加 `cancelled` 状态、取消信号接口、Trace event 和自动化测试，并说明取消发生在不可逆动作期间时当前实现还缺少什么。

## 面试表达

用 30 秒解释“为什么一个 `while` 循环不是生产级编排器”，再用 3 分钟展开状态、终止、失败、Checkpoint、幂等和 Trace 边界。

## 完成证据

进入 E1 前保存：取消功能代码差异、完整测试输出、一份 `invalid` 与 `action-error` 的分层调试记录，以及一次 3 分钟口述。资产可用和示例成功均不代表个人已经掌握。

## 下一步

完成证据后进入 [E1 · 结构化决策契约](../decision-contract-minimal/README.md)。E0～E4 全部完成后再进入阶段工程考核。
