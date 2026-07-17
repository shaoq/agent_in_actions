# agent_in_actions 项目指令

## 项目定位

本项目用于沉淀 AI Agent 应用工程师的学习、训练、实战与考核资产。目标不是收集零散资料,而是建立一套可持续演进的能力训练系统,服务于后续面试与真实 Agent 应用研发。

用户背景:项目使用者是一名正在系统学习 Agent 相关知识的研发工程师。目标是精通 Agent 应用工程核心技术,并在后续应聘 Agent 应用工程师岗位时通过技术面试、拿到较好的 offer。

当前默认阶段:学习阶段。除非用户明确要求进入实现或考核阶段,否则优先帮助其理解概念、建立知识框架、拆解学习路径、形成可复用学习资产。

## 范围

项目内只保留与 Agent 学习和训练直接相关的内容:

- `docs/`: Agent 知识蓝图、架构说明、专题文档。
- `labs/`: 可运行的练习项目、实验代码、调试案例。
- `interview/`: 高频面试题、系统设计题、追问链、回答模板。
- `assessment/`: 阶段考核、评分标准、实战任务。
- `roadmap/`: 学习路径、阶段计划、里程碑。
- `design-system/`: Blueprint 文档视觉系统。

不要把无关的 Excel、临时脚本、业务表格、下载资料直接放入本项目根目录。

## 目标能力模型

后续所有内容都应服务于以下能力:

1. 架构理解:能解释生产级 Agent 系统分层、职责、边界和数据流。
2. 工程实现:能实现编排、工具调用、RAG、记忆、评测、可观测等核心能力。
3. 调试分析:能基于 trace 和日志定位失败来源。
4. 安全治理:能设计权限、审计、prompt injection 防御、沙箱和人在回路。
5. 评测上线:能构建评测集、回归测试、上线门禁和线上观测指标。
6. 面试表达:能用结构化语言讲清方案、取舍、风险和真实经验。

## 文档规范

- 语言以中文为主,关键技术术语保留英文对照。
- 面向学习者直接发布的内容统一使用 HTML 作为唯一权威源,包括 `docs/` 中的课程与架构内容、`roadmap/` 学习路线、`interview/` 面试资产和 `assessment/` 考核资产。
- 所有学习者 HTML 必须复用 Blueprint 设计系统,并从 `design-system/template.html` 或已有学习页面骨架生成。
- 根目录 `README.md`、`AGENTS.md`、`labs/**/README.md`、OpenSpec artifacts 和内部内容模板继续使用 Markdown,用于工程协作和维护。
- 同一份学习者内容不得长期并行维护 HTML 与 Markdown 两个权威版本;迁移完成并更新引用后必须删除被替代的学习者 Markdown。
- 新增学习者 HTML 必须接入 `docs/index.html` 或对应课程索引,并提供清晰的前置、下一步和检查点链接。
- 所有学习者 HTML 必须加载 `design-system/learning-navigation.js`;课程层级、顺序、路径和资产状态以该文件中的共享清单为唯一目录数据源。
- 新增或迁移学习者 HTML 时,必须同步注册共享课程清单,声明稳定 ID、所属层级、内容类型、顺序和 `available/planned` 状态,并更新 `roadmap/progress-tracker.html` 的资产状态。
- 同一内容的 `available` 只表示学习资产可用,不得用它表达学习者已经掌握;个人门禁证据和复测结果仍以 progress tracker 为准。
- 新增学习页面交付前必须运行 `node design-system/validate-learning-navigation.mjs`,确保页面已注册、导航脚本已加载且目标路径有效。
- 根目录下的技术文档应放入 `docs/`,不要直接散落在项目根目录。
- 文档内容要服务于学习、实战或面试,避免只做概念堆砌。
- 学习文档要尽量包含“目标、核心概念、工程要点、常见坑、面试表达、下一步”。
- 实验目录必须有 README,说明运行方式和学习目标。

## Blueprint 设计系统

- 样式权威源: `design-system/blueprint.css`。
- 新文档应根据所在目录层级通过相对路径引用 `design-system/blueprint.css`,不得复制整份 CSS 到页面中。
- 标题字体使用 Fraunces,正文使用 IBM Plex Sans,技术标注使用 IBM Plex Mono。
- 继续保持工程蓝图风格:深靛蓝背景、细网格、青色墨线、克制可读。

## Mermaid 学习图表

- Mermaid 图表以课程旁 `diagrams/<stable-name>.mmd` 为唯一图表源码，并在维护阶段生成同名静态 SVG；学习页面不得加载 Mermaid runtime 或 CDN。
- 新增或修改图表是一个完整交付事务:创建或更新 `.mmd`、登记 `design-system/learning-diagrams.json`、生成 SVG、用 `figure.learning-diagram` 接入 HTML，并补齐有效 alt、caption、源码入口和原图入口。
- HTML 不得长期手工维护第二份 Mermaid 源码，也不得把 `language-mermaid`、`sequenceDiagram`、`flowchart` 或 `stateDiagram` 裸代码块作为学习者默认内容。
- 图表统一使用 `design-system/mermaid-config.json` 与 `design-system/mermaid-theme.css` 生成，不得逐页复制完整主题。
- 修改图表源码、共享主题或生成工具版本后必须运行 `npm run diagrams:generate`；交付前必须运行 `npm run content:check`，验证指纹、语法、引用、可访问性、统一导航和本地链接。

## Agent 架构语义

当前 Agent 总览采用 9 个核心组件:

1. 交互与接入层
2. 编排控制层
3. 推理内核
4. 工具 / 动作层
5. 记忆系统
6. 知识 / 检索
7. 治理与可观测层
8. 评测层
9. 模型网关 + 基础设施

后续扩展时要保持边界清晰:

- 记忆是 Agent 的经历沉淀,知识 / RAG 是外部资料检索。
- 在线治理与可观测贯穿实时请求,离线评测消费 trace 并反馈编排层。
- 安全能力分布在在线治理、离线安全评测、沙箱执行隔离三处,不要单独堆成一个泛化安全层。
- 推理内核不直接调用模型厂商,统一经过模型网关。

## 工作流

需求设计、学习路线、架构讨论、方案权衡类任务,先做探索分析,不要直接改应用内容。用户确认后再进入落地。

进入实现阶段时:

1. 保持目录结构清晰。
2. 优先补文档和训练资产,再补实验代码。
3. 每次改动后检查文件清单和关键链接。
4. 不引入与 Agent 学习目标无关的资产。

## 每次新增内容的自检问题

新增或修改内容前,先判断:

1. 它属于 docs、labs、interview、assessment、roadmap、design-system 中的哪一类?
2. 它对应 9 层 Agent 架构中的哪一层?
3. 它是否能沉淀为学习资产、实验资产、面试资产或考核资产?
4. 它是否有明确的后续动作?
5. 如果它是学习者 HTML,是否已注册统一目录、连接前后顺序、更新资产进度并通过导航校验?

如果无法回答,应先补充定位,不要盲目创建文件。

## 推荐推进节奏

一个主题不要只写一篇总结。推荐顺序:

1. 先补专题文档。
2. 再补 5 到 10 个面试问题。
3. 再补一个最小实验。
4. 最后补一份考核题或复盘。

例如学习“工具调用”时,应产出:

- `docs/02-tool-calling.html`
- `interview/tool-calling-questions.html`
- `labs/tool-calling-minimal/README.md`
- `assessment/tool-calling-checklist.html`
