import { L2_CORE_ASPECTS, L2_CORE_TARGETS } from './l2-core-concepts-manifest.mjs';
import { validateL2CorePage } from './l2-core-concepts-validation.mjs';

const target = L2_CORE_TARGETS[0];
const text = '该维度说明输入如何转为版本化中间状态、必须保持的身份与控制不变量、判断依据以及失效后对相邻层证据链的具体影响。';
const stages = target.stages.map((stage, index) => `<section id="concept-${stage.id}" class="l2-concept-stage" data-concept-stage="${stage.id}"><h3>${index + 1}. ${stage.title}</h3><p class="l2-concept-anchor" data-concept-anchor>该概念只有在输入、owner、版本和可验证输出同时明确时成立，不能由相邻层的成功状态替代。</p><dl class="l2-concept-aspects">${L2_CORE_ASPECTS.map((aspect) => `<div data-concept-aspect="${aspect}"><dt>${aspect}</dt><dd>${text}</dd></div>`).join('')}</dl></section>`).join('');
const bridges = target.stages.map((stage) => `<li data-concept-bridge="${stage.id}" data-concept-ref="${stage.id}" data-practice-ref="${stage.practiceId}"><a href="#concept-${stage.id}">${stage.title}</a>的约束失效后，进入<a href="#${stage.practiceId}">对应实践</a>，以版本化 Trace、拒绝结果和验收记录证明恢复是否成立。</li>`).join('');
const core = `<section class="l2-core-concepts" data-l2-core-concepts data-component="${target.component}" data-unit="${target.unit}"><section data-concept-part="overview"><h3>链路总览</h3>${target.corePlacement.start}<p>${text}${text}</p></section><section data-concept-part="stages"><h3>五个核心环节</h3>${stages}</section><section data-concept-part="tradeoffs"><h3>难点与取舍</h3><ul><li>${text}${text}</li><li>${text}${text}</li></ul></section><section data-concept-part="failure-propagation"><h3>失败传播</h3><ol><li>${text}${text}</li><li>${text}${text}</li></ol></section><section data-concept-part="example" data-concept-example="enterprise-travel-agent"><h3>企业差旅 Agent</h3><p>员工查询上海 P6 差旅住宿上限并发起超标审批；本页只展示编排状态、类型化交接、治理决定引用和业务验收，不把制度原文、记忆偏好或工具执行混为编排事实。所有版本和参数均为教学占位，实际值必须来自 SLO、策略和评测基线。</p><pre><code>case: enterprise-travel-agent
owner: orchestration-owner
input_version: teaching-v1
decision: pending
evidence_ref: trace-demo</code></pre></section><section data-concept-part="practice-bridge"><h3>概念—实践—证据</h3><p>${text}${text}${text}</p><ul class="l2-concept-bridge-list">${bridges}</ul></section></section>`;
const cards = target.stages.map((stage) => `<li id="${stage.practiceId}" data-practice-id="${stage.practiceId}" data-concept-ref="${stage.id}">实践内容保持不变并提供触发、诊断、动作、验证、止损和面试证据。</li>`).join('');
const practice = `<section data-l2-practice-keypoints><section data-practice-part="checklist"><ul>${cards}</ul></section></section>`;

function page(coreBlock = core, practiceBlock = practice) {
  return `<link rel="stylesheet" href="../../design-system/blueprint.css"><script src="../../design-system/learning-navigation.js"></script><nav class="learning-nav"></nav>${coreBlock}${target.corePlacement.end}${practiceBlock}`;
}
function validate(html) { return validateL2CorePage({ target, relativePath: target.path, html }); }
function expect(label, html, message) { const errors = validate(html); if (!errors.some((error) => error.includes(message))) throw new Error(`L2 核心概念负向测试失败：${label}\n${errors.join('\n')}`); }

const validErrors = validate(page());
if (validErrors.length) throw new Error(`合法结构未通过：${validErrors.join('\n')}`);
expect('缺容器', page(''), '实际 0 个');
expect('错位置', page('').replace(target.corePlacement.end, `${target.corePlacement.end}${core}`), '成熟叙事范围');
expect('缺 stage', page(core.replace(new RegExp(`<section id="concept-${target.stages[0].id}"[\\s\\S]*?<\\/section>`), '')), 'stage ID');
expect('重复 stage', page(core.replace(`data-concept-stage="${target.stages[1].id}"`, `data-concept-stage="${target.stages[0].id}"`)), '重复');
expect('错锚点', page(core.replace(`id="concept-${target.stages[0].id}"`, 'id="concept-wrong"')), '稳定 concept');
expect('短不变量', page(core.replace('该概念只有在输入、owner、版本和可验证输出同时明确时成立，不能由相邻层的成功状态替代。', '待补充')), '概念不变量过短');
expect('缺 aspect', page(core.replace('data-concept-aspect="mechanism"', 'data-missing-aspect="mechanism"')), '五维解释');
expect('aspect 错序', page(core.replace(/(<div data-concept-aspect="mechanism">[\s\S]*?<\/div>)(<div data-concept-aspect="constraints">[\s\S]*?<\/div>)/, '$2$1')), '五维解释');
expect('缺案例', page(core.replace('data-concept-example="enterprise-travel-agent"', 'data-missing-example="enterprise-travel-agent"')), '核心案例');
expect('未知 concept ref', page(core, practice.replace(`data-concept-ref="${target.stages[0].id}"`, 'data-concept-ref="unknown"')), '未知 stage');
expect('孤立 stage', page(core, practice.replace(`data-concept-ref="${target.stages[0].id}"`, 'data-empty-ref=""')), '未引用核心 stage');
expect('悬空实践链接', page(core.replace(`href="#${target.stages[0].practiceId}"`, 'href="#missing"')), '缺少实践锚点链接');
expect('缺 bridge', page(core.replace(/<section data-concept-part="practice-bridge">[\s\S]*?<\/section>/, '')), 'practice-bridge');
console.log('L2 非 RAG 核心概念负向测试通过：范围、stage、五维解释、案例与 concept / practice 双向映射退化均可检出。');
