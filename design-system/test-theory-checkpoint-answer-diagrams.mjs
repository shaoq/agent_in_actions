import { validateAnswerDiagramTargets } from './theory-checkpoint-answer-diagrams.mjs';

const page = 'assessment/answers/example.html';
const source = 'assessment/answers/diagrams/example.mmd';
const target = [{ page, taskId: 'task-a', diagramIds: ['example-diagram'] }];
const manifest = { diagrams: [{ id: 'example-diagram', page, source }] };
const figure = '<figure class="learning-diagram learning-diagram--wide" data-diagram-source="diagrams/example.mmd"><img /></figure>';

function validate(body, options = {}) {
  return validateAnswerDiagramTargets({
    answerPath: page,
    taskBodies: new Map([['task-a', body], ['task-b', '<section class="checkpoint-answer__model"><p>JSON only</p></section>']]),
    manifest: options.manifest ?? manifest,
    targets: options.targets ?? target,
  });
}

function expect(label, condition) {
  if (!condition) throw new Error(`图形化答案契约负向测试失败: ${label}`);
}

expect('合法 figure 应通过', validate(`<section class="checkpoint-answer__model">${figure}</section>`).length === 0);
expect('目标任务缺图应失败', validate('<section class="checkpoint-answer__model"><p>missing</p></section>').some((error) => error.includes('缺少图表')));
expect('figure 位于完整答案之外应失败', validate(`${figure}<section class="checkpoint-answer__model"><p>outside</p></section>`).some((error) => error.includes('缺少图表')));
expect('未登记资产应失败', validate(`<section class="checkpoint-answer__model">${figure}</section>`, { manifest: { diagrams: [] } }).some((error) => error.includes('未登记图表')));
expect('登记页面不匹配应失败', validate(`<section class="checkpoint-answer__model">${figure}</section>`, { manifest: { diagrams: [{ id: 'example-diagram', page: 'assessment/answers/other.html', source }] } }).some((error) => error.includes('登记页面错误')));
expect('非目标结构化任务不要求图表', validate('<section class="checkpoint-answer__model"><p>JSON only</p></section>', { targets: [] }).length === 0);

console.log('图形化答案契约负向测试通过: 缺图、错位、未登记和页面错配均可检出，非目标任务不误判。');
