import { validateEngineeringLabs, REQUIRED_README_HEADINGS } from './engineering-lab-validation.mjs';

const completeReadme = `${REQUIRED_README_HEADINGS.join('\n内容\n')}\n[下一步](../e1/README.md)`;
const baseManifest = {
  labs: [
    {
      id: 'e0', stage: 'E0', order: 1, directory: 'labs/e0', readme: 'labs/e0/README.md',
      entry: 'labs/e0/demo.py', tests: 'labs/e0/tests', prerequisites: ['docs/pre.html'],
      nextId: 'e1', status: 'available',
    },
    {
      id: 'e1', stage: 'E1', order: 2, directory: 'labs/e1', readme: 'labs/e1/README.md',
      entry: 'labs/e1/demo.py', tests: 'labs/e1/tests', prerequisites: ['docs/pre.html'],
      nextId: 'check', status: 'available',
    },
  ],
  terminalId: 'check',
};
const baseCatalog = [{
  id: 'l3-engineering',
  items: [
    { id: 'e0', path: 'labs/e0/README.md', order: 1, status: 'available' },
    { id: 'e1', path: 'labs/e1/README.md', order: 2, status: 'available' },
    { id: 'check', path: 'assessment/check.html', order: 3, status: 'available' },
  ],
}];
const baseFiles = new Map([
  ['labs/e0', ''], ['labs/e0/README.md', completeReadme], ['labs/e0/demo.py', ''], ['labs/e0/tests', ''],
  ['labs/e1', ''], ['labs/e1/README.md', completeReadme.replace('../e1/README.md', '../../assessment/check.html')],
  ['labs/e1/demo.py', ''], ['labs/e1/tests', ''], ['docs/pre.html', ''], ['assessment/check.html', ''],
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validate({ manifest = clone(baseManifest), catalog = clone(baseCatalog), files = new Map(baseFiles) } = {}) {
  return validateEngineeringLabs({
    manifest,
    catalog,
    exists: (relative) => files.has(relative),
    readText: (relative) => files.get(relative),
  });
}

function expect(label, condition) {
  if (!condition) throw new Error(`渐进工程案例负向测试失败: ${label}`);
}

expect('合法清单应通过', validate().length === 0);

const missingDirectory = new Map(baseFiles);
missingDirectory.delete('labs/e0');
expect('缺目录可检出', validate({ files: missingDirectory }).some((error) => error.includes('缺少目录')));

const missingHeading = new Map(baseFiles);
missingHeading.set('labs/e0/README.md', completeReadme.replace('## Trace 复盘', '## 其他'));
expect('缺 README 章节可检出', validate({ files: missingHeading }).some((error) => error.includes('README 缺少章节')));

const wrongOrder = clone(baseManifest);
wrongOrder.labs[1].order = 3;
expect('错顺序可检出', validate({ manifest: wrongOrder }).some((error) => error.includes('顺序')));

const brokenChain = clone(baseManifest);
brokenChain.labs[0].nextId = 'check';
expect('断链可检出', validate({ manifest: brokenChain }).some((error) => error.includes('下一项应为')));

const duplicateId = clone(baseManifest);
duplicateId.labs[1].id = 'e0';
expect('重复 ID 可检出', validate({ manifest: duplicateId }).some((error) => error.includes('重复案例 ID')));

const navigationMismatch = clone(baseCatalog);
navigationMismatch[0].items[0].path = 'labs/wrong/README.md';
expect('导航错配可检出', validate({ catalog: navigationMismatch }).some((error) => error.includes('导航路径')));

console.log('渐进工程案例负向测试通过: 缺目录、缺章节、错顺序、断链、重复 ID 和导航错配均可检出。');
