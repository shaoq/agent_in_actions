# Labs

本目录用于放置 Agent 工程实验。实验不是随手 demo,而是为了验证某个能力模块。

## 实验要求

每个实验目录必须包含:

- `README.md`: 说明目标、运行方式、关键文件和预期结果。
- 可运行代码或清楚的复现实验步骤。
- 至少一个失败场景说明。
- 与 9 层 Agent 架构的对应关系。

## 推荐实验顺序

1. [`agent-loop-minimal`](agent-loop-minimal/README.md): 最小 Agent loop。代码与测试已就绪,当前学习入口。
2. `tool-calling-minimal`: 带 schema 的工具调用。
3. `tool-permission-retry`: 工具权限、重试和幂等。
4. `rag-minimal`: 最小 RAG pipeline。
5. `memory-minimal`: 记忆读写策略。
6. `evals-minimal`: LLM-as-judge 或规则评测。
7. `trace-debugging`: trace 采集与失败分析。

实验资产完成不代表能力已掌握。运行第一个实验后,继续完成[编排模块考核](../assessment/01-orchestration-checklist.html),并在进度表中记录证据。

## 实验 README 模板

```md
# 实验名称

## 目标

## 对应架构层

## 运行方式

## 关键文件

## 预期结果

## 失败场景

## 学到什么
```
