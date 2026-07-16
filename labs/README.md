# Labs

本目录用于放置 Agent 工程实验。实验不是随手 demo,而是为了验证某个能力模块。

## 实验要求

每个实验目录必须包含:

- `README.md`: 说明目标、运行方式、关键文件和预期结果。
- 可运行代码或清楚的复现实验步骤。
- 至少一个失败场景说明。
- 与 9 层 Agent 架构的对应关系。

## 推荐实验顺序

1. `agent-loop-minimal`: 最小 Agent loop。
2. `tool-calling-minimal`: 带 schema 的工具调用。
3. `tool-permission-retry`: 工具权限、重试和幂等。
4. `rag-minimal`: 最小 RAG pipeline。
5. `memory-minimal`: 记忆读写策略。
6. `evals-minimal`: LLM-as-judge 或规则评测。
7. `trace-debugging`: trace 采集与失败分析。

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
