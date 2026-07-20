import {
  RAG_INTERVIEW_DETAILS,
  RAG_PRACTICE_DETAILS,
  RAG_PRACTICE_INTERVIEWS,
  validateRagPracticePage,
} from './rag-practice-keypoints-validation.mjs';
import { RAG_CORE_TARGETS } from './rag-core-concepts-validation.mjs';

const target = RAG_CORE_TARGETS[0];
const detailText = '依据版本化请求、候选 Trace 和风险基线判断当前阶段是否违反契约，并记录明确的成功、失败与升级条件。';
const cards = target.practices.map((practice, index) => `<li id="${practice.id}" data-practice-id="${practice.id}" data-concept-ref="${practice.refs.join(' ')}">
  <strong>实践卡 ${index + 1}：</strong>保留原有摘要并说明当前实践的目标和直接工程边界。
  <dl class="rag-practice-details">${RAG_PRACTICE_DETAILS.map((detail) => `<div data-practice-detail="${detail}"><dt>${detail}</dt><dd>${detailText}</dd></div>`).join('')}</dl>
</li>`).join('');

const interviews = RAG_PRACTICE_INTERVIEWS[target.unit].map((item) => `<article id="${item.id}" data-practice-interview="${item.id}" data-practice-ref="${item.practices.join(' ')}" data-concept-ref="${item.concepts.join(' ')}">
  <p>关联实践：${item.practices.map((ref) => `<a href="#${ref}">${ref}</a>`).join('、')}</p>
  ${RAG_INTERVIEW_DETAILS.map((detail) => `<div data-interview-detail="${detail}"><h5>${detail}</h5><p>${detailText}回答必须使用真实项目、个人实验或方案设计证据。</p></div>`).join('')}
</article>`).join('');

const artifact = `<div data-practice-artifact="typed-rag-result"><h5>代表性工程产物</h5><pre><code>status: evidence_found\ntrace_id: demo\nindex_version: v7\nowner: knowledge</code></pre><p>${detailText}${detailText}</p></div>`;
const experienceNote = `<p data-practice-experience-note>请把经历标记为生产实战、个人实验或方案设计，只使用实际 Trace、版本与评测证据，不得把模板案例、占位指标和团队成果包装为个人生产经历；若未覆盖线上规模与事故协作，也应主动说明验证边界。</p>`;
const validBlock = `<div class="answer-block rag-practice-keypoints" data-rag-practice-keypoints>
  <h3>日常实践关键点</h3>
  <section data-practice-part="core"><h4>核心判断</h4><p>${detailText}${detailText}</p></section>
  <section data-practice-part="checklist"><h4>深度实践卡</h4><ul>${cards}</ul></section>
  <section data-practice-part="troubleshooting"><h4>排障顺序</h4><p>${detailText}${detailText}${detailText}</p></section>
  <section data-practice-part="evidence"><h4>应留证据</h4><p>${detailText}${detailText}</p>${artifact}</section>
  <section data-practice-part="interview"><h4>实践型面试要点</h4>${experienceNote}<div class="rag-practice-interview">${interviews}</div></section>
</div>`;

function page(block = validBlock) {
  return `<link rel="stylesheet" href="../../design-system/blueprint.css" />
    <script src="../../design-system/learning-navigation.js"></script><nav class="learning-nav"></nav>
    <h2>面试表达</h2><div class="answer-block">原答案</div>${block}<h2>下一步</h2>`;
}

function validate(html) {
  return validateRagPracticePage({ relativePath: target.path, html, target });
}

function expect(label, html, message) {
  const errors = validate(html);
  if (!errors.some((error) => error.includes(message))) {
    throw new Error(`RAG 实践关键点负向测试失败：${label}\n实际错误：${errors.join('\n')}`);
  }
}

const validErrors = validate(page());
if (validErrors.length) throw new Error(`合法结构未通过：${validErrors.join('\n')}`);
expect('缺实践块', page(''), '实际 0 个');
expect('缺分区', page(validBlock.replace(/<section data-practice-part="interview">[\s\S]*?<\/section>/, '')), 'interview');
expect('分区错序', page(validBlock.replace(
  /(<section data-practice-part="troubleshooting">[\s\S]*?<\/section>)(\s*)(<section data-practice-part="evidence">[\s\S]*?<\/section>)/,
  '$3$2$1',
)), '五部分必须按');
expect('实践 ID 重复', page(validBlock.replace('data-practice-id="practice-01-typed-result"', 'data-practice-id="practice-01-rag-routing"')), '实践 ID 重复');
expect('稳定映射变化', page(validBlock.replace('data-concept-ref="request-contract typed-outcome-trace"', 'data-concept-ref="unknown"')), 'concept ref 与稳定映射');
expect('缺实践维度', page(validBlock.replace('data-practice-detail="diagnosis"', 'data-missing-detail="diagnosis"')), '六维内容必须按');
expect('实践维度错序', page(validBlock.replace(
  /(<div data-practice-detail="trigger">[\s\S]*?<\/div>)(<div data-practice-detail="diagnosis">[\s\S]*?<\/div>)/,
  '$2$1',
)), '六维内容必须按');
expect('短实践卡', page(validBlock.replace(
  /(<li id="practice-01-rag-routing"[^>]*>)[\s\S]*?<\/li>/,
  '$1短</li>',
)), '内容过短');
expect('缺工程产物', page(validBlock.replace(artifact, '')), '代表性工程产物');
expect('缺真实性提示', page(validBlock.replace(experienceNote, '')), '经验真实性提示');
expect('缺面试项', page(validBlock.replace(interviews, '')), '面试项 ID');
expect('未知 practice ref', page(validBlock.replace('data-practice-ref="practice-01-rag-routing practice-01-typed-result"', 'data-practice-ref="unknown-practice"')), '未知实践');
expect('未知 concept ref', page(validBlock.replace('data-concept-ref="offline-supply orchestration-routing request-contract typed-outcome-trace"', 'data-concept-ref="unknown-concept"')), '未知概念');
expect('悬空实践链接', page(validBlock.replace('href="#practice-01-rag-routing"', 'href="#missing"')), '缺少指向');
expect('缺面试维度', page(validBlock.replace('data-interview-detail="followups"', 'data-missing-interview-detail="followups"')), '面试五维必须按');
expect('面试维度错序', page(validBlock.replace(
  /(<div data-interview-detail="question">[\s\S]*?<\/div>)(<div data-interview-detail="answer-outline">[\s\S]*?<\/div>)/,
  '$2$1',
)), '面试五维必须按');
expect('错位置', page('').replace('<h2>面试表达</h2>', `${validBlock}<h2>面试表达</h2>`), '必须位于');

console.log('RAG 实践深度负向测试通过：五部分、六维实践卡、稳定映射、工程产物、面试五维、引用与真实性退化均可检出。');
