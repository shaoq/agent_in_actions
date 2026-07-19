import path from 'node:path';

export const ANSWER_DIAGRAM_TARGETS = [
  { page: 'assessment/answers/00-agent-foundations.html', taskId: 'task-3', diagramIds: ['answer-nine-component-control-feedback'] },
  { page: 'assessment/answers/01-agent-architecture.html', taskId: 'task-2', diagramIds: ['answer-architecture-online-control-flow', 'answer-architecture-offline-evaluation-feedback'] },
  { page: 'assessment/answers/01-orchestration.html', taskId: 'task-1', diagramIds: ['answer-orchestration-request-loop'] },
  { page: 'assessment/answers/01-orchestration.html', taskId: 'task-2', diagramIds: ['answer-orchestration-run-lifecycle'] },
  { page: 'assessment/answers/03-tools-actions.html', taskId: 'task-2', diagramIds: ['answer-tools-call-lifecycle'] },
  { page: 'assessment/answers/04-knowledge-rag.html', taskId: 'task-a', diagramIds: ['answer-rag-ingestion-indexing', 'answer-rag-online-pipeline'] },
  { page: 'assessment/answers/05-memory-system.html', taskId: 'task-a', diagramIds: ['answer-memory-state-session-boundary'] },
  { page: 'assessment/answers/05-memory-system.html', taskId: 'task-c', diagramIds: ['answer-memory-lifecycle'] },
  { page: 'assessment/answers/06-governance-observability.html', taskId: 'task-a', diagramIds: ['answer-governance-online-control-plane'] },
  { page: 'assessment/answers/06-governance-observability.html', taskId: 'task-b', diagramIds: ['answer-governance-telemetry-correlation'] },
  { page: 'assessment/answers/06-governance-observability.html', taskId: 'task-e', diagramIds: ['answer-governance-hitl-budget-incident'] },
  { page: 'assessment/answers/08-model-gateway-infrastructure.html', taskId: 'task-d', diagramIds: ['answer-infrastructure-runtime-topology'] },
  { page: 'assessment/answers/09-interaction-access.html', taskId: 'task-b', diagramIds: ['answer-interaction-streaming-resume'] },
  { page: 'assessment/answers/09-interaction-access.html', taskId: 'task-c', diagramIds: ['answer-interaction-clarification-approval-resume'] },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateAnswerDiagramTargets({ answerPath, taskBodies, manifest, targets = ANSWER_DIAGRAM_TARGETS }) {
  const errors = [];
  const pageTargets = targets.filter((target) => target.page === answerPath);
  const diagrams = new Map(manifest.diagrams.map((diagram) => [diagram.id, diagram]));

  for (const target of pageTargets) {
    const taskBody = taskBodies.get(target.taskId);
    if (!taskBody) {
      errors.push(`${answerPath} 缺少图形化目标任务 ${target.taskId}`);
      continue;
    }

    const model = taskBody.match(/<section class="[^"]*checkpoint-answer__model[^"]*"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    if (!model) {
      errors.push(`${answerPath} 的 ${target.taskId} 缺少完整示范答案，无法校验图表`);
      continue;
    }

    for (const diagramId of target.diagramIds) {
      const diagram = diagrams.get(diagramId);
      if (!diagram) {
        errors.push(`${answerPath} 的 ${target.taskId} 引用未登记图表 ID: ${diagramId}`);
        continue;
      }
      if (diagram.page !== answerPath) {
        errors.push(`${diagramId} 登记页面错误: ${diagram.page}，预期 ${answerPath}`);
        continue;
      }

      const sourceRef = path.posix.relative(path.posix.dirname(answerPath), diagram.source);
      const figurePattern = new RegExp(`<figure\\s+class="[^"]*learning-diagram[^"]*"\\s+data-diagram-source="${escapeRegExp(sourceRef)}"[\\s\\S]*?<\\/figure>`);
      if (!figurePattern.test(model)) {
        errors.push(`${answerPath} 的 ${target.taskId} 完整示范答案缺少图表 ${diagramId}（${sourceRef}）`);
      }
    }
  }

  return errors;
}
