import {
  L2_INTERVIEW_DETAILS,
  L2_PRACTICE_DETAILS,
  L2_PRACTICE_TARGETS,
} from './l2-practice-manifest.mjs';
import { validateL2PracticePage } from './l2-practice-keypoints-validation.mjs';

const target = L2_PRACTICE_TARGETS[0];
const detailText = '先依据版本化输入、运行 Trace、策略结果与验收证据判断首个偏离点，再执行有明确负责人、成功条件和停止条件的修复动作。';
const cards = target.practices.map((practice, index) => `<li id="${practice.id}" data-practice-id="${practice.id}" data-concept-ref="${practice.refs.join(' ')}">
  <strong>实践卡 ${index + 1}：${practice.title}</strong>
  <dl class="l2-practice-details">${L2_PRACTICE_DETAILS.map((detail) => `<div data-practice-detail="${detail}"><dt>${detail}</dt><dd>${detailText}</dd></div>`).join('')}</dl>
</li>`).join('');

const interviews = target.interviews.map((item, index) => `<article id="${item.id}" data-practice-interview="${item.id}" data-practice-ref="${item.practices.join(' ')}" data-concept-ref="${item.concepts.join(' ')}">
  <h5>实践面试 ${index + 1}</h5><p class="l2-practice-interview__links">关联实践：${item.practices.map((ref) => `<a href="#${ref}">${ref}</a>`).join('、')}</p>
  ${L2_INTERVIEW_DETAILS.map((detail) => `<div data-interview-detail="${detail}"><h5>${detail}</h5><p>${detailText}表达时区分生产实战、个人实验和方案设计。</p></div>`).join('')}
</article>`).join('');

const artifact = `<div class="l2-practice-artifact" data-practice-artifact="${target.artifact}"><h5>代表性工程产物</h5><pre><code>run_id: travel-demo-01
policy_version: travel-policy-v3
owner: orchestration
decision: approved
evidence_ref: trace-demo</code></pre><p>${detailText}${detailText}</p></div>`;
const example = `<div data-practice-example-ref="enterprise-travel-agent"><strong>企业差旅 Agent：</strong>${detailText}${detailText}案例参数只用于教学，必须根据业务风险和真实基线校准。</div>`;
const experienceNote = '<p data-practice-experience-note>面试表达必须明确标注生产实战、个人实验或方案设计，只主张自己实际完成的职责，并用 Trace、评测或变更记录举证；示例参数不是生产默认值，未验证规模、事故与协作边界时应主动说明。</p>';
const validBlock = `<section class="answer-block l2-practice-keypoints" data-l2-practice-keypoints data-component="${target.component}" data-unit="${target.unit}">
  <h3>日常实践关键点</h3>
  <section data-practice-part="core"><h4>核心判断</h4><p>${detailText}${detailText}</p></section>
  <section data-practice-part="checklist"><h4>深度实践卡</h4><ul>${cards}</ul></section>
  <section data-practice-part="troubleshooting"><h4>排障顺序</h4><p>${detailText}${detailText}</p>${example}</section>
  <section data-practice-part="evidence"><h4>应留证据</h4><p>${detailText}${detailText}</p>${artifact}</section>
  <section data-practice-part="interview"><h4>实践型面试要点</h4>${experienceNote}<div class="l2-practice-interviews">${interviews}</div></section>
</section>`;

function page(block = validBlock) {
  return `<link rel="stylesheet" href="../../design-system/blueprint.css"><script src="../../design-system/learning-navigation.js"></script><nav class="learning-nav"></nav>${target.placement.after}${block}${target.placement.before}`;
}

function validate(html) {
  return validateL2PracticePage({ relativePath: target.path, html, target });
}

function expect(label, html, message) {
  const errors = validate(html);
  if (!errors.some((error) => error.includes(message))) throw new Error(`L2 实践负向测试失败：${label}\n实际错误：${errors.join('\n')}`);
}

const validErrors = validate(page());
if (validErrors.length) throw new Error(`合法结构未通过：${validErrors.join('\n')}`);
expect('缺实践块', page(''), '实际 0 个');
expect('错位置', page('').replace(target.placement.after, `${validBlock}${target.placement.after}`), 'placement');
expect('缺分区', page(validBlock.replace(/<section data-practice-part="interview">[\s\S]*?<\/section>\s*<\/section>$/, '</section>')), 'interview');
expect('分区错序', page(validBlock.replace(/(<section data-practice-part="troubleshooting">[\s\S]*?<\/section>)(\s*)(<section data-practice-part="evidence">[\s\S]*?<\/section>)/, '$3$2$1')), '五部分必须按');
expect('实践 ID 重复', page(validBlock.replace(`data-practice-id="${target.practices[1].id}"`, `data-practice-id="${target.practices[0].id}"`)), '实践 ID 重复');
expect('未知概念映射', page(validBlock.replace(`data-concept-ref="${target.practices[0].refs[0]}"`, 'data-concept-ref="unknown-concept"')), 'concept ref 与稳定映射');
expect('短实践卡', page(validBlock.replace(new RegExp(`(<li id="${target.practices[0].id}"[^>]*>)[\\s\\S]*?<\\/li>`), '$1短</li>')), '内容过短');
expect('实践维度错序', page(validBlock.replace(/(<div data-practice-detail="trigger">[\s\S]*?<\/div>)(<div data-practice-detail="diagnosis">[\s\S]*?<\/div>)/, '$2$1')), '六维内容必须按');
expect('缺案例', page(validBlock.replace(example, '')), 'enterprise-travel-agent');
expect('缺工程产物', page(validBlock.replace(artifact, '')), '代表性工程产物');
expect('错误产物 ID', page(validBlock.replace(target.artifact, 'artifact-unknown')), '工程产物 ID');
expect('缺真实性提示', page(validBlock.replace(experienceNote, '')), '经验真实性提示');
expect('缺面试项', page(validBlock.replace(interviews, '')), '面试项 ID');
expect('未知实践引用', page(validBlock.replace(`data-practice-ref="${target.interviews[0].practices.join(' ')}"`, 'data-practice-ref="unknown-practice"')), '未知实践');
expect('悬空实践链接', page(validBlock.replace(`href="#${target.interviews[0].practices[0]}"`, 'href="#missing"')), '缺少指向');
expect('面试维度错序', page(validBlock.replace(/(<div data-interview-detail="question">[\s\S]*?<\/div>)(<div data-interview-detail="answer-outline">[\s\S]*?<\/div>)/, '$2$1')), '面试五维必须按');

console.log('L2 非 RAG 实践负向测试通过：结构、位置、深度、稳定映射、案例、工程产物、面试引用与真实性退化均可检出。');
