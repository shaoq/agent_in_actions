# Agent in Actions

面向 AI Agent 应用工程师的系统化学习、工程实战、能力考核与面试训练项目。

项目目标不是收集零散资料或堆叠 demo，而是围绕生产级 Agent 应用工程，建立一套可学习、可运行、可评测、可复盘、可面试表达的长期训练系统。

## 当前状态

项目已形成从 L0 到 L4 的完整学习骨架：

- **L0 · Agent 基础**：基础理论、理论检查点和独立建议答案已可用。
- **L1 · 九层架构**：架构总览、知识地图检查点和独立建议答案已可用。
- **L2 · 组件理论深潜**：九个核心组件均已提供总览、4～5 个课程单元、理论检查点和独立建议答案。
- **L3 · 工程验证**：最小 Agent Loop 实验、自动化测试和编排工程考核已可用。
- **L4 · 面试训练**：92 道核心题、276 个连续追问、独立建议答案、系统设计与 Trace 调试题、项目经验题及面试就绪度检查点已可用。

学习内容已统一接入 Blueprint 视觉系统和共享学习导航。Mermaid 图表以 `.mmd` 为源码生成静态 SVG；课程图表与理论检查点答案图表均进入统一登记、生成和校验流程。

> 内容资产 `available` 只表示可以学习，不表示学习者已经掌握。当前个人学习进度仍是 **L0 · Agent 基础**，应以 [`roadmap/progress-tracker.html`](roadmap/progress-tracker.html) 中保存的答卷、评分和复测证据为准。

## 快速开始

1. 打开 [`docs/index.html`](docs/index.html)，进入统一学习首页。
2. 阅读 [`docs/foundations/01-agent-basics.html`](docs/foundations/01-agent-basics.html)，建立 Agent、Workflow、状态、动作、环境和反馈的共同语义。
3. 闭卷完成 [`assessment/00-agent-foundations-theory-checkpoint.html`](assessment/00-agent-foundations-theory-checkpoint.html)。
4. 保存原始答卷后，再查看 [`assessment/answers/00-agent-foundations.html`](assessment/answers/00-agent-foundations.html) 校准并生成补学清单。
5. 按 [`roadmap/learning-plan.html`](roadmap/learning-plan.html) 继续进入 L1、L2；通过对应理论门禁后再运行 L3 实验。

常用入口：

- [统一学习首页](docs/index.html)
- [完整学习路线](roadmap/learning-plan.html)
- [学习进度跟踪](roadmap/progress-tracker.html)
- [九层 Agent 架构总览](docs/00-agent-architecture.html)
- [评分规则](assessment/rubric.html)
- [面试题库](interview/questions.html)

## 能力目标

所有学习和训练资产服务于六类核心能力：

1. **架构理解**：解释生产级 Agent 系统的分层、职责、边界和数据流。
2. **工程实现**：实现编排、工具调用、RAG、记忆、评测、可观测等核心能力。
3. **调试分析**：基于 Trace、Log 和 Metric 定位第一处事实偏离及其责任层。
4. **安全治理**：设计权限、审计、Prompt Injection 防御、沙箱和 Human-in-the-loop。
5. **评测上线**：构建评测集、回归测试、上线门禁和线上观测指标。
6. **面试表达**：用结构化语言说明方案、取舍、风险、失败和真实工程证据。

## 九组件架构

项目以九个核心组件组织 Agent 应用工程知识：

1. 交互与接入层
2. 编排控制层
3. 推理内核
4. 工具 / 动作层
5. 记忆系统
6. 知识 / 检索
7. 治理与可观测层
8. 评测层
9. 模型网关 + 基础设施

关键边界保持一致：记忆沉淀 Agent 经历，知识 / RAG 检索外部资料；在线治理贯穿实时请求，离线评测消费运行证据并反馈编排；推理内核通过模型网关访问模型，真实工具执行由沙箱和基础设施隔离。

## 学习闭环

每个主题采用 Theory First 的证据驱动闭环：

1. **知识输入**：阅读课程、论文、官方说明或源码。
2. **架构抽象**：明确主题在九组件架构中的位置、职责和边界。
3. **理论推演**：完成概念图、模式比较、失败分析和连续追问。
4. **理论门禁**：在不依赖代码的情况下完成边界解释和系统设计。
5. **答案校准**：先保存原始答卷，再用独立建议答案评分、补学并换题复测。
6. **工程实验**：门禁通过后，用最小可运行实验验证理论。
7. **面试与考核**：把设计取舍、失败证据和改进方案组织成可信表达。

不以阅读数量或页面访问记录作为完成标准。每个层级必须在进度跟踪页登记可复核的能力证据。

## 目录结构

```text
agent_in_actions/
├── docs/            # 学习首页、九组件架构总览与 L0～L2 理论课程
├── labs/            # 可运行实验、测试与调试案例
├── interview/       # 九组件题库、系统设计、调试和项目经验训练
├── assessment/      # 理论检查点、建议答案、工程考核与评分规则
├── roadmap/         # L0～L4 学习路线和个人进度证据
├── design-system/   # Blueprint 样式、共享导航、图表生成与内容校验工具
├── package.json     # 内容维护与质量检查命令
└── AGENTS.md        # 项目协作与内容规范
```

面向学习者直接发布的课程、路线、面试和考核内容以 HTML 为唯一权威源；根目录说明、实验 README、OpenSpec artifacts 和内部模板继续使用 Markdown。

## 当前已实现的训练资产

### 理论课程与考核

- L0 Agent 基础语义与 L1 九层架构知识地图。
- L2 编排控制、推理内核、工具 / 动作、知识 / RAG、记忆、治理与可观测、评测、模型网关 + 基础设施、交互与接入课程。
- 每个层级对应的理论检查点、评分要求和独立建议答案。
- 建议答案中的关键控制流、生命周期、治理、恢复和系统拓扑图表。

### 工程实验

[`labs/agent-loop-minimal/`](labs/agent-loop-minimal/README.md) 提供一个不依赖模型 API 的确定性 Agent Loop，用于观察：

- 显式 `LoopState` 和运行状态转换。
- `decide -> act -> observe` 有界循环。
- 正常完成、最大步数、非法决策和动作异常。
- 可用于失败归因的结构化 Trace。

该实验用于验证编排理论，不替代完整的模型网关、工具系统、权限治理或生产级持久化实现。

### 面试训练

面试资产覆盖九组件专题，并额外提供：

- 系统设计与 Trace 调试题。
- 项目经验与行为追问题。
- 30 秒结论、3 分钟展开和连续追问训练。
- 独立建议答案与六维评分。
- 60 分钟面试就绪度检查点。

## 内容维护与校验

安装内容工具依赖：

```bash
npm install
```

修改 Mermaid 源码、共享主题或生成工具后，重新生成静态 SVG：

```bash
npm run diagrams:generate
```

交付学习内容前运行完整检查：

```bash
npm run content:check
```

完整检查覆盖图表源码与 SVG 指纹、共享导航、站内链接、面试题库、理论追问、答案图表规则和理论检查点建议答案。

运行最小 Agent Loop 的自动化测试：

```bash
conda run -n agent_in_actions \
  python -m unittest discover \
  -s labs/agent-loop-minimal/tests \
  -t labs/agent-loop-minimal -v
```

## 新增内容的交付标准

新增学习主题应尽量形成“专题文档 → 面试问题 → 最小实验 → 考核或复盘”的完整资产链，并回答：

- 它解决什么问题，位于九组件架构的哪一部分？
- 职责边界、生产设计取舍和常见失败模式是什么？
- 如何通过 Trace 或其他证据定位失败？
- 学习者如何证明自己已经掌握，而不是只读过内容？
- 下一步实验、考核或面试训练入口是什么？

新增或迁移学习者 HTML 时，还必须注册 [`design-system/learning-navigation.js`](design-system/learning-navigation.js)，更新进度资产状态，并通过统一导航和本地链接校验。新增或修改学习图表时，应同步维护 `.mmd` 源码、静态 SVG 和 [`design-system/learning-diagrams.json`](design-system/learning-diagrams.json)。

## 防跑偏原则

- 不把项目变成资料下载目录、纯前端展示项目或模型 API 示例集合。
- 不把“能运行”误判为“已掌握”，实验完成后仍需考核和复测证据。
- 不混淆 Memory 与外部 Knowledge / RAG，也不混淆在线治理与离线评测。
- 不跳过单 Agent 基础直接追逐 Multi-Agent 热点。
- 不引入无法映射到学习、实战、面试或考核目标的资产。

## 下一阶段建设重点

在现有 L0～L4 学习骨架上，下一步优先扩展 L3 工程验证资产：工具调用与权限、RAG、记忆、评测和 Trace 调试实验，并让每个实验与对应理论门禁、面试题和考核证据闭环连接。
