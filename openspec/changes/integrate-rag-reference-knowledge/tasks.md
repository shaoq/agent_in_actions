## 1. 基线盘点与参考知识映射

- [x] 1.1 记录五章现有 38 个概念环节、35 个实践 ID、15 个实践型面试项、五张课程图、检查点任务和 RAG-01—RAG-08 的稳定基线
- [x] 1.2 将参考知识库构建文档的知识点逐项标记为 adopt、adapt、defer 或 reject，并映射到单元 01、02 或 05
- [x] 1.3 将参考查询管线文档的知识点逐项标记为 adopt、adapt、defer 或 reject，并映射到单元 01、03、04 或 05
- [x] 1.4 审阅参考内容中的供应商选型、固定参数、经验比例和简化指标定义，形成不得直接进入学习者正文的排除清单
- [x] 1.5 为双身份、构建恢复、Query Transformation、Context、引用验证和评测实验建立“概念 → 实践 → 检查点 → 面试题”目标映射

## 2. 先扩展自动契约与失败测试

- [x] 2.1 扩展 RAG 核心概念 manifest，登记每章必须出现的深化模块、稳定环节和下游资产映射
- [x] 2.2 扩展 RAG 实践 manifest，在不改变 35 个实践 ID 和 concept ref 的前提下登记新增工程证据与面试覆盖
- [x] 2.3 为双身份字段、Document Registry、恢复状态机、Parser quality、Query 策略、Context budget、验证分层和实验矩阵增加失败 fixture
- [x] 2.4 更新 RAG 核心概念测试，证明缺少任一必备深化模块、稳定 ID 或 `travel-policy` 回扣时失败
- [x] 2.5 更新 RAG 实践测试，证明新增概念未连接动作、证据、检查点或面试追问时失败
- [x] 2.6 扩展 RAG 专项校验输出，使错误能定位到页面、模块、字段、稳定 ID 或悬空映射
- [x] 2.7 将新增测试与校验保持在 Node 标准库范围内，并确认 `package.json` 的 `content:check` 顺序覆盖它们

## 3. 深化单元 02 的身份与构建状态模型

- [x] 3.1 在单元 02 的来源、ID 与血缘环节加入 `source_system_id`、`source_object_id`、`document_id`、`version_id`、`content_hash/content_id`、`locator` 和 `chunk_id` 的生成与职责表
- [x] 3.2 用同一差旅制度案例展示更新、移动、复制和同内容不同 ACL 四种情景，明确逻辑身份与内容身份的不同变化
- [x] 3.3 补充无上游稳定 ID 时的首次注册、locator alias、唯一移动匹配、歧义隔离和人工确认边界
- [x] 3.4 补充 Document Registry、来源事件、Action Ledger/WAL、run manifest 和多索引 receipt 的实际数据形状
- [x] 3.5 补充新增、内容更新、移动、元数据/ACL 更新、删除和未变化的状态—动作—可见性—证据矩阵
- [x] 3.6 补充幂等重放、部分写入、active/superseded、tombstone、读时拦截、异步清理、孤儿检测和 reconciliation 的恢复链路
- [x] 3.7 补充 shadow/active alias、Embedding 或 Chunker 升级、回滚窗口、备份种子及 RPO/RTO 的决定依据

## 4. 深化单元 02 的解析、分块与索引机制

- [x] 4.1 加入统一 Document/Section/Block 中间模型，解释标题树、阅读顺序、page/bbox、表格、代码、公式和 locator 保真
- [x] 4.2 加入诊断式 ParserRouter、质量报告、按失败原因有限降级、异常隔离和批次阻断机制
- [x] 4.3 加入解析置信度、关键内容强制复核、HITL 队列、人工修正回写和反馈闭环
- [x] 4.4 比较固定、递归、结构感知、语义、父子、句子窗口和格式感知分块的输入、适用场景和失败
- [x] 4.5 展示父块/子块数据结构、父块 KV、子块稀疏/稠密索引、AutoMerging、父子协同更新与删除
- [x] 4.6 补充 Flat、HNSW、IVF/PQ 的 Recall、延迟、内存、构建和规模权衡，避免写成固定选型
- [x] 4.7 补充 Embedding 批处理、限流、重试、进度、缓存键版本化、模型漂移和蓝绿重建
- [x] 4.8 补充 BM25 analyzer parity、中文词法处理、稀疏/稠密 ID 对齐、多索引对账和 VectorStore 抽象边界
- [x] 4.9 深化单元 02 的七张实践卡、代表性工程产物、排障顺序和三组实践型面试项，使新增机制都有动作与证据

## 5. 深化单元 03 的 Query Transformation

- [x] 5.1 在 Query 环节增加 Raw Query、Rewrite、Multi-Query、Decomposition、HyDE 和 Step-Back 策略比较表
- [x] 5.2 为每种策略补充触发症状、不适用场景、硬约束保护、lexical/semantic 表示、延迟成本、领域偏差和回退条件
- [x] 5.3 补充“先无改写基线、后按查询桶启用”的路由决策，并展示改写前后实体、时间、否定、租户和资源范围 diff
- [x] 5.4 补充多轮指代、真多跳依赖、Multi-Query 发散和 HyDE 术语偏差的失败案例及专项 Recall 回归

## 6. 深化单元 03 的候选漏斗与 Context Building

- [x] 6.1 深化 bi-encoder、cross-encoder、lexical/dense/metadata、RRF、raw score、rank 和概率的关系与边界
- [x] 6.2 明确 RRF、Rerank、父子扩展和 Context Packing 时序，并说明替代时序的粒度或验证代价
- [x] 6.3 补充 hash、lineage、近重复、MMR、来源多样性和冲突证据保留的分层去重逻辑
- [x] 6.4 补充 lost-in-the-middle、文档分组、头尾安排和引用连贯之间的排序取舍
- [x] 6.5 加入 Context budget 公式、system/query 占用、generation reserve、tokenizer 安全余量和超预算淘汰原因
- [x] 6.6 补充召回为空、Rerank 低相关、Context 缺证和生成后不支持的早期/后期拒答状态机
- [x] 6.7 补充 Contextual Retrieval、术语扩展、SPLADE、ColBERT 和 GraphRAG 的失败触发、成本、版本和退出条件
- [x] 6.8 深化单元 03 的七张实践卡、候选级 Trace、排障顺序和三组实践型面试项，使策略选择与预算决定可验证

## 7. 深化单元 04 的引用与语义验证

- [x] 7.1 增加 Context Builder、Prompt 和 CitationChecker 共享引用格式、evidence ID 与 locator 的三方契约
- [x] 7.2 明确 CitationChecker 只负责编号、locator、漏标和格式校验，不证明引用内容支持 claim
- [x] 7.3 深化 direct、partial、conflict、unsupported 的 claim—evidence 判定，并加入金额、日期、方向和适用条件反例
- [x] 7.4 增加 faithfulness、NLI 和 LLM Judge 的输入、rubric、版本、偏差、成本和人工校准边界
- [x] 7.5 补充检索前授权、使用点复核、撤权期间安全终止、缓存/Trace/引用旁路防护和流式输出提交边界
- [x] 7.6 深化单元 04 的七张实践卡、claim—citation 工程产物、排障顺序和三组实践型面试项

## 8. 深化单元 05 的指标与实验方法

- [x] 8.1 增加 Recall@K、Precision@K、MRR、nDCG、ANN Recall、Groundedness、Citation 和 Abstention 的测量对象与不可推导结论
- [x] 8.2 区分规则计算、人工标注和 LLM Judge，说明 RAGAS 是可选工具映射而不是唯一评测定义
- [x] 8.3 深化评测集来源、Gold Evidence、answerability、forbidden evidence、标注一致性、hold-out 和真实流量切片
- [x] 8.4 增加 `chunk_size × top_k × top_n × context budget` 参数实验和 Embedding/Reranker/Prompt 单变量消融模板
- [x] 8.5 增加质量、p95、token、单位成本、拒答率和安全 hard fail 的 Pareto 决策与发布门禁
- [x] 8.6 深化单元 05 的七张实践卡、版本化实验记录、排障顺序和三组实践型面试项

## 9. 回补单元 01、总览与课程入口

- [x] 9.1 在单元 01 增加索引侧与查询侧成本结构、基础/增强/高风险链路和能力按需启用原则
- [x] 9.2 在单元 01 的请求、证据和结果契约中引用深化后的身份、策略、Context、验证和评测字段，保持 owner 边界
- [x] 9.3 更新 `docs/04-knowledge-rag.html`，用一页式心智模型概括双身份、离线供给、在线取证、增强梯度和成本质量边界
- [x] 9.4 更新 `docs/knowledge-rag/index.html` 的目标、学习顺序和完成标准，使基础主线与进阶采用条件清楚且不复制正文
- [x] 9.5 深化单元 01 的七张实践卡、工程产物和三组实践型面试项，使新增跨章机制具有入口契约

## 10. 更新受管学习图表

- [x] 10.1 更新 `rag-online-pipeline.mmd`，强化离线供给、在线预算、类型化结果和评测反馈，并同步页面语义
- [x] 10.2 更新 `ingestion-indexing-pipeline.mmd`，加入双身份、Registry/Action、Parser quality、shadow/active 和恢复回路
- [x] 10.3 更新 `retrieval-reranking-funnel.mmd`，加入 Query 策略、硬约束、子块漏斗、父块扩展和 Context budget
- [x] 10.4 更新 `grounded-answer-control.mmd`，加入 Citation 语法、claim 支持、policy、使用点复核和拒答分层
- [x] 10.5 更新 `rag-failure-diagnosis.mmd`，在 First Divergence 主线中连接单变量实验和成本质量判定
- [x] 10.6 核对总览图与五张课程图的 owner、对象、方向和失败出口，必要时更新 `knowledge-rag-overview.mmd`
- [x] 10.7 更新图表 manifest、alt、caption、源码/原图入口，运行 `npm run diagrams:generate` 并确认 SVG 指纹同步

## 11. 同步理论检查点与完整建议答案

- [x] 11.1 更新 RAG 理论检查点 A—E 的任务、Rubric、证据要求和补学映射，同时保持任务 ID、总分和双门槛
- [x] 11.2 在任务 B 完整建议答案中提供双身份、Registry、状态动作、Parser/Chunk/Index 和恢复的填充产物
- [x] 11.3 在任务 C 完整建议答案中提供 Query 策略选择、约束 diff、候选漏斗、父子扩展和 Context budget 的填充产物
- [x] 11.4 在任务 D 完整建议答案中提供 CitationChecker、claim 支持、权限、恶意证据和拒答结果的填充产物
- [x] 11.5 在任务 E 完整建议答案中提供 Gold、版本矩阵、分层指标、单变量实验、Pareto 门禁和回滚的填充产物
- [x] 11.6 核对任务 A—E 的课程链接、完整答案、得分证据、达标/优秀、变体、扣分和补学分区
- [x] 11.7 更新必要的答案图表映射并验证检查点无答案泄露、检查点与答案双向链接有效

## 12. 同步 RAG 专题面试资产

- [x] 12.1 在保持 RAG-01—RAG-08 题号和数量的前提下，重新分配主问题与追问对深化知识的覆盖
- [x] 12.2 深化 RAG-02 与 RAG-07 对双身份、Parser/Chunk、索引一致性、部分失败、shadow 和恢复的追问
- [x] 12.3 深化 RAG-03 与 RAG-04 对 Query Transformation、Hybrid/Fusion/Rerank、父子扩展、Context budget 和成本的追问
- [x] 12.4 深化 RAG-05 与 RAG-06 对 CitationChecker、claim 支持、权限复核、缓存和拒答的追问
- [x] 12.5 深化 RAG-08 对 Gold、First Divergence、RAGAS/Judge、消融、切片和成本质量实验的追问
- [x] 12.6 同步 RAG-01—RAG-08 建议答案的 30 秒回答、3 分钟框架、工程证据、取舍、常见错误和追问提示
- [x] 12.7 审阅所有 RAG 面试答案的供应商中立与经验真实性，不虚构生产参数、收益、事故或个人职责

## 13. 集成校验与视觉验收

- [x] 13.1 运行 RAG 核心概念和实践专项单元测试，修复所有稳定 ID、模块、映射和内容量错误
- [x] 13.2 运行图表、统一导航、本地链接、题库、理论检查点答案和全部专项内容校验
- [x] 13.3 运行 `npm run content:check` 并确认无新增第三方运行时依赖
- [x] 13.4 执行 `git diff --check`，检查 learner HTML 没有裸 Mermaid、绝对参考路径或并行 Markdown 权威内容
- [x] 13.5 在桌面与 390px 视口检查总览、五章、检查点、答案和面试页的表格、代码、图表、锚点和横向溢出
- [x] 13.6 检查统一导航的键盘操作、页面内概念/实践跳转、检查点/答案/面试双向链接和焦点返回
- [x] 13.7 检查打印输出的高对比度、分页、代码换行、图表可读性和关键内容无裁切
- [x] 13.8 完成人工技术审阅，确认双身份语义、章节 owner、指标边界、参数依据、图文一致性和进阶采用条件正确
- [x] 13.9 运行 `openspec validate integrate-rag-reference-knowledge --strict` 并确认全部提案任务和规范可进入实施
