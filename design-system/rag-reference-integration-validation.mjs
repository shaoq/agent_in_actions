export const RAG_REFERENCE_TARGETS = [
  {
    path: 'docs/knowledge-rag/01-boundary-and-pipeline.html',
    modules: ['identity-pipeline', 'cost-risk-ladder'],
    details: ['cross-stage-contract'],
    practiceIds: ['practice-01-rag-routing', 'practice-01-typed-result', 'practice-01-stage-deadline', 'practice-01-request-evidence-contract', 'practice-01-version-pinning', 'practice-01-failure-owner', 'practice-01-production-acceptance'],
    interviewIds: ['interview-01-when-rag', 'interview-01-budget-owner', 'interview-01-production-gate'],
    terms: ['source_system_id', 'source_object_id', 'document_id', 'version_id', 'content_hash', 'content_id = namespace + content_hash', 'ContextPack', 'GroundedResult', '类型化状态'],
  },
  {
    path: 'docs/knowledge-rag/02-ingestion-chunking-and-indexing.html',
    modules: ['identity-model', 'registry-recovery', 'parser-hitl', 'parent-child-index', 'index-engineering'],
    details: ['identity-transitions', 'registry-ledger-shapes', 'recovery-upgrade', 'parser-chunk-index-selection', 'ann-embedding-sparse'],
    practiceIds: ['practice-02-parse-sampling', 'practice-02-stable-lineage', 'practice-02-idempotent-ingestion', 'practice-02-deletion-revocation', 'practice-02-index-health', 'practice-02-query-driven-chunking', 'practice-02-embedding-upgrade'],
    interviewIds: ['interview-02-chunking-quality', 'interview-02-idempotency-delete', 'interview-02-index-upgrade'],
    terms: ['document_id', 'version_id', 'content_hash', 'content_id = namespace + content_hash', 'chunk_id', 'source_object_id', 'Action Ledger/WAL', 'run_manifest', 'reconciliation', 'RPO', 'RTO', 'Document → Section → Block', 'HITL', 'AutoMerging', 'Flat', 'HNSW', 'IVF/PQ', 'BM25', 'VectorStore', 'tombstone'],
  },
  {
    path: 'docs/knowledge-rag/03-retrieval-and-reranking.html',
    modules: ['query-strategy', 'candidate-context', 'advanced-retrieval'],
    details: ['query-strategy-matrix', 'scoring-order-context', 'advanced-trigger-matrix'],
    practiceIds: ['practice-03-protect-query-constraints', 'practice-03-choose-retrieval-signals', 'practice-03-explainable-fusion', 'practice-03-calibrate-thresholds', 'practice-03-dedup-diversity', 'practice-03-funnel-budget', 'practice-03-candidate-trace'],
    interviewIds: ['interview-03-hybrid-fusion', 'interview-03-threshold-budget', 'interview-03-first-loss'],
    terms: ['Raw Query', 'rewrite', 'multi-query', 'decomposition', 'HyDE', 'Step-Back', 'Bi-encoder', 'cross-encoder', 'RRF', '候选预算', 'Context Budget', 'evidence_budget', 'lost-in-the-middle', 'SPLADE', 'ColBERT', 'GraphRAG', 'agentic retrieval', 'Pareto'],
  },
  {
    path: 'docs/knowledge-rag/04-grounding-citations-and-access-control.html',
    modules: ['citation-support', 'judge-abstention'],
    details: ['three-party-citation-contract', 'semantic-verifier-boundary', 'authorization-stream-commit'],
    practiceIds: ['practice-04-system-citations', 'practice-04-claim-evidence', 'practice-04-pre-retrieval-auth', 'practice-04-permission-cache', 'practice-04-reauth-use-point', 'practice-04-injection-isolation', 'practice-04-conflict-negative-tests'],
    interviewIds: ['interview-04-authorization', 'interview-04-grounding-citations', 'interview-04-injection-conflict'],
    terms: ['CitationChecker', 'evidence_id', 'validity', 'correctness', 'completeness', 'semantic support', 'direct', 'partial', 'conflict', 'unsupported', 'atomic claims', 'NLI', 'LLM-as-Judge', 'RAGAS', '流式', 'abstain'],
  },
  {
    path: 'docs/knowledge-rag/05-evaluation-and-failure-diagnosis.html',
    modules: ['metrics-experiments', 'pareto-release'],
    details: ['metric-boundaries', 'dataset-experiment-template'],
    practiceIds: ['practice-05-gold-evidence', 'practice-05-version-snapshot', 'practice-05-traffic-slices', 'practice-05-first-divergence', 'practice-05-oracle-ablation', 'practice-05-hard-fail', 'practice-05-online-feedback'],
    interviewIds: ['interview-05-gold-versions', 'interview-05-first-divergence', 'interview-05-release-feedback'],
    terms: ['Recall@K', 'Precision@K', 'MRR', 'nDCG', 'ANN Recall', 'Groundedness', 'RAGAS', 'forbidden evidence', 'hold-out', 'chunk_size × top_k × top_n × context_budget', 'oracle', 'ablation', 'Pareto', 'hard fail', 'P95', '成本', '版本矩阵'],
  },
];

export const RAG_REFERENCE_DOWNSTREAM = [
  { path: 'docs/04-knowledge-rag.html', marker: 'data-rag-reference-overview="identity-and-control"', terms: ['namespace + content_hash', 'document_id', 'version_id'] },
  { path: 'docs/knowledge-rag/index.html', marker: 'data-rag-reference-index="learning-thread"', terms: ['Query Transformation', 'Semantic Support', 'Pareto'] },
  { path: 'assessment/04-knowledge-rag-theory-checkpoint.html', marker: 'data-rag-reference-checkpoint="deep-contract"', terms: ['namespace+hash', 'HITL', 'Context Budget', 'semantic support', 'oracle/ablation'] },
  { path: 'assessment/answers/04-knowledge-rag.html', marker: 'data-rag-reference-answer="integrated-model"', terms: ['source_system_id', 'source_object_id', 'content_id = namespace + content_hash', 'staging', 'Pareto'] },
];

export const RAG_REFERENCE_INTERVIEW_IDS = Array.from({ length: 8 }, (_, index) => `RAG-${String(index + 1).padStart(2, '0')}`);

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function stripMarkup(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateRagReferencePage({ target, html }) {
  const errors = [];
  const label = target.path;
  for (const module of target.modules) {
    const marker = `data-rag-reference-module="${module}"`;
    if (count(html, marker) !== 1) errors.push(`${label}: 模块 ${module} 应且仅应出现一次`);
  }
  for (const detail of target.details) {
    const marker = `data-rag-reference-detail="${detail}"`;
    if (count(html, marker) !== 1) errors.push(`${label}: 深化细节 ${detail} 应且仅应出现一次`);
  }
  if (count(html, 'data-rag-reference-practice=') !== 1) errors.push(`${label}: 必须有且仅有一个参考知识实践回扣`);
  if (count(html, 'data-rag-reference-practice-map') !== 1) errors.push(`${label}: 必须有且仅有一个新增机制实践映射表`);
  for (const practiceId of target.practiceIds) {
    if (count(html, `data-rag-reference-practice-id="${practiceId}"`) !== 1) {
      errors.push(`${label}: 稳定实践 ${practiceId} 必须有唯一新增机制映射`);
    }
  }
  for (const interviewId of target.interviewIds) {
    if (count(html, `data-rag-reference-interview-id="${interviewId}"`) < 1) {
      errors.push(`${label}: 实践型面试项 ${interviewId} 未被新增机制覆盖`);
    }
  }
  if (html.indexOf('data-rag-reference-module=') > html.indexOf('<h2>工程要点')) {
    errors.push(`${label}: 参考核心概念必须位于工程要点之前`);
  }
  if (html.indexOf('data-rag-reference-practice=') < html.indexOf('data-rag-practice-keypoints')) {
    errors.push(`${label}: 参考实践回扣必须位于日常实践关键点内部`);
  }
  for (const term of target.terms) {
    if (!html.includes(term)) errors.push(`${label}: 缺少关键内容 ${term}`);
  }
  const text = stripMarkup(html);
  if (text.length < 8000) errors.push(`${label}: 整体学习内容过短，无法承载深化链路`);
  if (html.includes('/Users/jie.hua/Documents/Developments/Projects/agents_glm')) {
    errors.push(`${label}: 学习者页面不得暴露本地参考资料路径`);
  }
  return errors;
}

export function validateRagReferenceAssets({ exists, readText }) {
  const errors = [];
  for (const target of RAG_REFERENCE_TARGETS) {
    if (!exists(target.path)) {
      errors.push(`${target.path}: 文件不存在`);
      continue;
    }
    errors.push(...validateRagReferencePage({ target, html: readText(target.path) }));
  }
  for (const target of RAG_REFERENCE_DOWNSTREAM) {
    if (!exists(target.path)) {
      errors.push(`${target.path}: 文件不存在`);
      continue;
    }
    const html = readText(target.path);
    if (count(html, target.marker) !== 1) errors.push(`${target.path}: 缺少唯一同步标记 ${target.marker}`);
    for (const term of target.terms) {
      if (!html.includes(term)) errors.push(`${target.path}: 缺少下游关键内容 ${term}`);
    }
  }
  const checkpointAnswer = readText('assessment/answers/04-knowledge-rag.html');
  for (const taskId of ['task-a', 'task-b', 'task-c', 'task-d', 'task-e']) {
    if (count(checkpointAnswer, `data-rag-reference-task-artifact="${taskId}"`) !== 1) {
      errors.push(`assessment/answers/04-knowledge-rag.html: ${taskId} 缺少唯一填充产物`);
    }
  }

  const questionsPath = 'interview/04-knowledge-rag-questions.html';
  const answersPath = 'interview/suggested-answers.html';
  if (!exists(questionsPath) || !exists(answersPath)) {
    errors.push('RAG 面试题或建议答案不存在');
    return errors;
  }
  const questions = readText(questionsPath);
  const answers = readText(answersPath);
  for (const id of RAG_REFERENCE_INTERVIEW_IDS) {
    const questionMatch = questions.match(new RegExp(`<article class="question-card"[^>]*data-question-id="${id}"[\\s\\S]*?<\\/article>`));
    if (!questionMatch) {
      errors.push(`${questionsPath}: 缺少 ${id}`);
    } else if ((questionMatch[0].match(/<li>/g) ?? []).length < 4) {
      errors.push(`${questionsPath}: ${id} 必须包含深化追问`);
    }
    if (count(answers, `data-rag-reference-interview="${id}"`) !== 1) {
      errors.push(`${answersPath}: ${id} 必须包含唯一深化回答`);
    }
  }
  return errors;
}
