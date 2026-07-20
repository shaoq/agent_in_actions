import {
  RAG_CONCEPT_ASPECTS,
  RAG_CORE_TARGETS,
  validateRagCorePage,
} from './rag-core-concepts-validation.mjs';

const target = RAG_CORE_TARGETS[0];
const aspectText = '该维度说明本阶段的数据如何变化、约束为何存在、决策依据来自何处，并指出违反不变量后对下游证据链的具体影响。';
const stages = target.stages.map((stage, index) => `<section class="rag-concept-stage" data-concept-stage="${stage}">
  <h3>${index + 1}. 测试环节</h3>
  <p data-concept-anchor>本环节必须保留可验证的输入、版本和边界，且不能替代相邻阶段的独立职责。</p>
  <dl>${RAG_CONCEPT_ASPECTS.map((aspect) => `<div data-concept-aspect="${aspect}"><dt>${aspect}</dt><dd>${aspectText}</dd></div>`).join('')}</dl>
</section>`).join('');
const bridgeRows = target.practices.map((item) => `<tr data-practice-ref="${item.id}" data-concept-ref="${item.refs.join(' ')}"><td>概念锚点与约束失效信号</td><td><a href="#${item.id}">对应实践</a></td><td>版本化 Trace 与回归证据</td></tr>`).join('');
const practiceItems = target.practices.map((item) => `<li id="${item.id}" data-practice-id="${item.id}" data-concept-ref="${item.refs.join(' ')}">实践条目正文保持完整，并说明日常信号、动作、验证证据和失败后的恢复条件。</li>`).join('');

const core = `<section class="rag-core-concepts" data-rag-core-concepts>
  <div data-concept-part="overview"><figure class="learning-diagram"><img alt="测试图" /></figure><div class="table-wrap"><table><tr><td>链路总览</td></tr></table></div><p>${aspectText}${aspectText}</p></div>
  <div data-concept-part="stages">${stages}</div>
  <section data-concept-part="tradeoffs"><h3>难点与取舍</h3><table><tr><td>${aspectText}${aspectText}</td></tr></table></section>
  <section data-concept-part="failure-propagation"><h3>失败传播</h3><ul><li>${aspectText}${aspectText}</li></ul></section>
  <section data-concept-part="example" data-concept-example="travel-policy"><h3>贯穿案例</h3><p>“上海地区 P6 员工当前出差住宿上限是多少？”是教学示例，携带主体、地区、职级、查询时间和制度版本，并展示请求、结果与 Trace 的中间数据形状。示例值不是生产默认值，所有阈值由版本化评测决定。</p><pre><code>status: evidence_found\nindex_version: travel-policy-v3\ntrace_id: demo</code></pre></section>
  <section data-concept-part="practice-bridge"><h3>概念—实践—证据</h3><table><tbody>${bridgeRows}</tbody></table></section>
</section>`;

const practiceBlock = `<div class="answer-block rag-practice-keypoints" data-rag-practice-keypoints>
  <h3>日常实践关键点</h3>
  <p class="practice-concept-recall" data-practice-example-ref="travel-policy">阅读清单前，先用差旅制度案例回忆本章概念链、身份与版本约束、首个失效信号，再核对动作留下的版本化证据。</p>
  <section data-practice-part="core"><p>核心判断内容。</p></section>
  <section data-practice-part="checklist"><ul>${practiceItems}</ul></section>
  <section data-practice-part="troubleshooting"><p>排障顺序内容。</p></section>
  <section data-practice-part="evidence"><p>应留证据内容。</p></section>
</div>`;

function page(coreBlock = core, practice = practiceBlock) {
  return `<link rel="stylesheet" href="../../design-system/blueprint.css" />
    <script src="../../design-system/learning-navigation.js"></script><nav class="learning-nav"></nav>
    <h2>核心概念</h2>${coreBlock}<h2>工程要点</h2><h2>面试表达</h2>${practice}<h2>下一步</h2>`;
}

function validate(html) {
  return validateRagCorePage({ target, relativePath: 'docs/knowledge-rag/fixture.html', html });
}

function expect(label, html, message) {
  const errors = validate(html);
  if (!errors.some((error) => error.includes(message))) {
    throw new Error(`RAG 核心概念负向测试失败：${label}\n实际错误：${errors.join('\n')}`);
  }
}

if (validate(page()).length) throw new Error(`合法结构未通过：${validate(page()).join('\n')}`);
expect('缺容器', page(''), '实际 0 个');
expect('错位置', page('').replace('<h2>工程要点</h2>', `<h2>工程要点</h2>${core}`), '必须位于');
expect('缺环节', page(core.replace(/<section class="rag-concept-stage" data-concept-stage="offline-supply">[\s\S]*?<\/section>/, '')), '环节 ID');
expect('重复环节 ID', page(core.replace('data-concept-stage="orchestration-routing"', 'data-concept-stage="offline-supply"')), '重复');
expect('缺概念锚点', page(core.replace('data-concept-anchor', 'data-missing-anchor')), '概念不变量');
expect('缺解释维度', page(core.replace('data-concept-aspect="mechanism"', 'data-missing-aspect="mechanism"')), '五维解释');
expect('解释维度错序', page(core.replace(
  /(<div data-concept-aspect="mechanism">[\s\S]*?<\/div>)(<div data-concept-aspect="constraints">[\s\S]*?<\/div>)/,
  '$2$1',
)), '五维解释');
expect('短占位', page(core.replace(/本环节必须保留可验证的输入、版本和边界，且不能替代相邻阶段的独立职责。/, '待补充')), '概念不变量过短');
expect('缺案例', page(core.replace('data-concept-example="travel-policy"', 'data-missing-example="travel-policy"')), '贯穿案例');
expect('错误案例 ID', page(core.replace('data-concept-example="travel-policy"', 'data-concept-example="other"')), '贯穿案例');
expect('重复实践 ID', page(core, practiceBlock.replace('data-practice-id="practice-01-typed-result"', 'data-practice-id="practice-01-rag-routing"')), '实践 ID 重复');
expect('未知概念引用', page(core, practiceBlock.replace('data-concept-ref="request-contract typed-outcome-trace"', 'data-concept-ref="unknown-stage"')), '未知概念');
expect('未映射实践', page(core, practiceBlock.replace('data-concept-ref="request-contract typed-outcome-trace"', 'data-empty-concept-ref=""')), '未映射核心概念');
expect('未覆盖环节', page(core, practiceBlock.replaceAll('offline-supply', 'orchestration-routing')), '未被实践覆盖');
expect('悬空页面锚点', page(core.replace('href="#practice-01-rag-routing"', 'href="#missing-practice"')), '缺少可解析页面内链接');
expect('缺回扣表', page(core.replace(/<section data-concept-part="practice-bridge">[\s\S]*?<\/section>/, '')), 'practice-bridge');
expect('缺案例回忆提示', page(core, practiceBlock.replace(/<p class="practice-concept-recall"[\s\S]*?<\/p>/, '')), '案例回忆提示');

console.log('RAG 深度核心概念负向测试通过：结构、内容量、贯穿案例与概念—实践双向映射退化均可检出。');
