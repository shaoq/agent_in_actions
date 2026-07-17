(function initializeLearningNavigation(global) {
  'use strict';

  const LEARNING_CATALOG = [
    {
      id: 'overview',
      label: '总览与进度',
      stage: 'OVERVIEW',
      order: 0,
      items: [
        { id: 'learning-home', title: '学习首页', path: 'docs/index.html', type: 'overview', order: 1, status: 'available' },
        { id: 'learning-roadmap', title: '学习路线', path: 'roadmap/learning-plan.html', type: 'roadmap', order: 2, status: 'available' },
        { id: 'progress-tracker', title: '进度跟踪', path: 'roadmap/progress-tracker.html', type: 'progress', order: 3, status: 'available' },
        { id: 'assessment-rubric', title: '评分规则', path: 'assessment/rubric.html', type: 'assessment', order: 4, status: 'available' },
      ],
    },
    {
      id: 'l0-foundations',
      label: 'L0 · Agent 基础',
      stage: 'L0',
      order: 1,
      items: [
        { id: 'agent-foundations', title: 'Agent 基础理论', path: 'docs/foundations/01-agent-basics.html', type: 'theory', order: 1, status: 'available' },
        { id: 'agent-foundations-checkpoint', title: '基础理论检查点', path: 'assessment/00-agent-foundations-theory-checkpoint.html', type: 'checkpoint', order: 2, status: 'available' },
      ],
    },
    {
      id: 'l1-architecture',
      label: 'L1 · 九层架构',
      stage: 'L1',
      order: 2,
      items: [
        { id: 'agent-architecture', title: 'Agent 架构总览', path: 'docs/00-agent-architecture.html', type: 'overview', order: 1, status: 'available' },
        { id: 'agent-architecture-checkpoint', title: '九层架构检查点', path: 'assessment/01-agent-architecture-checkpoint.html', type: 'checkpoint', order: 2, status: 'available' },
      ],
    },
    {
      id: 'l2-orchestration',
      label: 'L2 · 编排控制',
      stage: 'L2',
      order: 3,
      items: [
        { id: 'orchestration-overview', title: '编排控制总览', path: 'docs/01-orchestration.html', type: 'overview', order: 1, status: 'available' },
        { id: 'orchestration-course', title: '五单元课程目录', path: 'docs/orchestration/index.html', type: 'course', order: 2, status: 'available' },
        { id: 'orchestration-boundaries', title: '01 职责与边界', path: 'docs/orchestration/01-responsibilities-and-boundaries.html', type: 'theory', order: 3, status: 'available' },
        { id: 'orchestration-state', title: '02 状态与生命周期', path: 'docs/orchestration/02-state-and-lifecycle.html', type: 'theory', order: 4, status: 'available' },
        { id: 'orchestration-patterns', title: '03 模式与取舍', path: 'docs/orchestration/03-patterns-and-tradeoffs.html', type: 'theory', order: 5, status: 'available' },
        { id: 'orchestration-reliability', title: '04 可靠性与恢复', path: 'docs/orchestration/04-reliability-and-recovery.html', type: 'theory', order: 6, status: 'available' },
        { id: 'orchestration-multi-agent', title: '05 Multi-Agent 边界', path: 'docs/orchestration/05-multi-agent-boundaries.html', type: 'theory', order: 7, status: 'available' },
        { id: 'orchestration-checkpoint', title: '编排理论检查点', path: 'assessment/01-orchestration-theory-checkpoint.html', type: 'checkpoint', order: 8, status: 'available' },
      ],
    },
    {
      id: 'l2-reasoning-core',
      label: 'L2 · 推理内核',
      stage: 'L2',
      order: 4,
      items: [
        { id: 'reasoning-core', title: '推理内核课程目录', path: 'docs/reasoning/index.html', type: 'course', order: 1, status: 'available' },
        { id: 'reasoning-contract', title: '01 角色与决策契约', path: 'docs/reasoning/01-role-and-decision-contract.html', type: 'theory', order: 2, status: 'available' },
        { id: 'reasoning-structured-output', title: '02 结构化输出与工具选择', path: 'docs/reasoning/02-structured-output-and-tool-selection.html', type: 'theory', order: 3, status: 'available' },
        { id: 'reasoning-patterns', title: '03 推理模式及取舍', path: 'docs/reasoning/03-reasoning-patterns-and-tradeoffs.html', type: 'theory', order: 4, status: 'available' },
        { id: 'reasoning-uncertainty', title: '04 不确定性与恢复', path: 'docs/reasoning/04-uncertainty-failure-and-recovery.html', type: 'theory', order: 5, status: 'available' },
        { id: 'reasoning-core-checkpoint', title: '推理内核理论检查点', path: 'assessment/02-reasoning-core-theory-checkpoint.html', type: 'checkpoint', order: 6, status: 'available' },
      ],
    },
    {
      id: 'l2-tools-actions',
      label: 'L2 · 工具 / 动作',
      stage: 'L2',
      order: 5,
      items: [
        { id: 'tools-actions-course', title: '工具 / 动作层课程目录', path: 'docs/tools/index.html', type: 'course', order: 1, status: 'available' },
        { id: 'tools-contract-schema', title: '01 工具契约与 Schema', path: 'docs/tools/01-tool-contract-and-schema.html', type: 'theory', order: 2, status: 'available' },
        { id: 'tools-lifecycle-observation', title: '02 调用生命周期与 Observation', path: 'docs/tools/02-call-lifecycle-and-observation.html', type: 'theory', order: 3, status: 'available' },
        { id: 'tools-permissions-sandbox', title: '03 权限、审批与沙箱', path: 'docs/tools/03-permissions-approval-and-sandbox.html', type: 'theory', order: 4, status: 'available' },
        { id: 'tools-retry-idempotency', title: '04 重试、幂等与副作用', path: 'docs/tools/04-retry-idempotency-and-side-effects.html', type: 'theory', order: 5, status: 'available' },
        { id: 'tools-interfaces', title: '05 Function Calling / MCP / Computer Use', path: 'docs/tools/05-function-calling-mcp-and-computer-use.html', type: 'theory', order: 6, status: 'available' },
        { id: 'tools-actions-checkpoint', title: '工具 / 动作层理论检查点', path: 'assessment/03-tools-actions-theory-checkpoint.html', type: 'checkpoint', order: 7, status: 'available' },
      ],
    },
    {
      id: 'l2-planned-components',
      label: 'L2 · 后续组件',
      stage: 'L2',
      order: 6,
      items: [
        { id: 'knowledge-rag', title: '知识 / RAG', path: null, type: 'theory', order: 1, status: 'planned' },
        { id: 'memory-system', title: '记忆系统', path: null, type: 'theory', order: 2, status: 'planned' },
        { id: 'governance-observability', title: '治理与可观测', path: null, type: 'theory', order: 3, status: 'planned' },
        { id: 'evaluation-system', title: '评测层', path: null, type: 'theory', order: 4, status: 'planned' },
        { id: 'model-gateway-infra', title: '模型网关与基础设施', path: null, type: 'theory', order: 5, status: 'planned' },
        { id: 'interaction-access', title: '交互与接入层', path: null, type: 'theory', order: 6, status: 'planned' },
      ],
    },
    {
      id: 'l3-engineering',
      label: 'L3 · 工程验证',
      stage: 'L3',
      order: 7,
      items: [
        { id: 'agent-loop-lab', title: '最小 Agent Loop', path: 'labs/agent-loop-minimal/README.md', type: 'lab', order: 1, status: 'available' },
        { id: 'orchestration-engineering-check', title: '编排工程考核', path: 'assessment/01-orchestration-checklist.html', type: 'assessment', order: 2, status: 'available' },
      ],
    },
    {
      id: 'l4-interview',
      label: 'L4 · 面试训练',
      stage: 'L4',
      order: 8,
      items: [
        { id: 'interview-question-bank', title: '通用面试题库', path: 'interview/questions.html', type: 'interview', order: 1, status: 'available' },
        { id: 'orchestration-interview', title: '编排面试题', path: 'interview/01-orchestration-questions.html', type: 'interview', order: 2, status: 'available' },
      ],
    },
  ];

  global.LEARNING_CATALOG = LEARNING_CATALOG;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LEARNING_CATALOG };
  }

  if (typeof document === 'undefined') return;

  const script = document.currentScript;
  if (!script || document.querySelector('.course-menu')) return;

  const projectRoot = new URL('../', script.src);
  const normalizePath = (value) => decodeURIComponent(new URL(value, window.location.href).pathname).replace(/\/$/, '');
  const currentPath = normalizePath(window.location.href);
  let currentGroupId = null;

  for (const group of LEARNING_CATALOG) {
    const currentItem = group.items.find((item) => item.path && normalizePath(new URL(item.path, projectRoot)) === currentPath);
    if (currentItem) {
      currentGroupId = group.id;
      break;
    }
  }

  const nav = document.createElement('nav');
  nav.id = 'course-menu';
  nav.className = 'course-menu';
  nav.setAttribute('aria-label', 'Agent 学习课程目录');

  const navHeader = document.createElement('div');
  navHeader.className = 'course-menu__header';

  const homeLink = document.createElement('a');
  homeLink.className = 'course-menu__brand';
  homeLink.href = new URL('docs/index.html', projectRoot).href;
  homeLink.innerHTML = '<span>AGENT IN ACTIONS</span><strong>学习目录</strong>';

  const closeButton = document.createElement('button');
  closeButton.className = 'course-menu__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '关闭课程目录');
  closeButton.title = '关闭课程目录';
  closeButton.textContent = '×';

  navHeader.append(homeLink, closeButton);
  nav.append(navHeader);

  const groupContainer = document.createElement('div');
  groupContainer.className = 'course-menu__groups';

  for (const group of [...LEARNING_CATALOG].sort((a, b) => a.order - b.order)) {
    const details = document.createElement('details');
    details.className = 'course-menu__group';
    details.dataset.groupId = group.id;
    details.open = group.id === currentGroupId || group.id === 'overview';

    const summary = document.createElement('summary');
    summary.innerHTML = `<span>${group.label}</span><span class="course-menu__chevron" aria-hidden="true">›</span>`;
    details.append(summary);

    const list = document.createElement('ol');
    list.className = 'course-menu__list';

    for (const item of [...group.items].sort((a, b) => a.order - b.order)) {
      const listItem = document.createElement('li');
      listItem.className = 'course-menu__item';

      if (item.status === 'available' && item.path) {
        const link = document.createElement('a');
        link.href = new URL(item.path, projectRoot).href;
        link.textContent = item.title;
        link.dataset.itemId = item.id;
        link.dataset.assetStatus = item.status;

        if (normalizePath(link.href) === currentPath) {
          link.classList.add('is-current');
          link.setAttribute('aria-current', 'page');
        }

        listItem.append(link);
      } else {
        const planned = document.createElement('span');
        planned.className = 'is-planned';
        planned.textContent = item.title;
        planned.setAttribute('aria-label', `${item.title}，待建设`);

        const status = document.createElement('small');
        status.textContent = '待建设';
        planned.append(status);
        listItem.append(planned);
      }

      list.append(listItem);
    }

    details.append(list);
    groupContainer.append(details);
  }

  nav.append(groupContainer);

  const progressLink = document.createElement('a');
  progressLink.className = 'course-menu__progress';
  progressLink.href = new URL('roadmap/progress-tracker.html', projectRoot).href;
  progressLink.innerHTML = '<span>学习状态与门禁证据</span><strong>查看进度跟踪</strong>';
  nav.append(progressLink);

  const toggleButton = document.createElement('button');
  toggleButton.className = 'course-menu-toggle';
  toggleButton.type = 'button';
  toggleButton.setAttribute('aria-controls', nav.id);
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-label', '打开课程目录');
  toggleButton.innerHTML = '<span class="course-menu-toggle__mark" aria-hidden="true"></span><span>课程目录</span>';

  const overlay = document.createElement('div');
  overlay.className = 'course-menu-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const setMenuOpen = (open, restoreFocus) => {
    document.body.classList.toggle('course-menu-open', open);
    toggleButton.setAttribute('aria-expanded', String(open));
    toggleButton.setAttribute('aria-label', open ? '关闭课程目录' : '打开课程目录');
    if (open) closeButton.focus();
    else if (restoreFocus) toggleButton.focus();
  };

  toggleButton.addEventListener('click', () => {
    setMenuOpen(!document.body.classList.contains('course-menu-open'), true);
  });
  closeButton.addEventListener('click', () => setMenuOpen(false, true));
  overlay.addEventListener('click', () => setMenuOpen(false, true));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && window.matchMedia('(max-width: 1120px)').matches) setMenuOpen(false, false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('course-menu-open')) setMenuOpen(false, true);
  });

  document.body.prepend(overlay);
  document.body.prepend(nav);
  document.body.prepend(toggleButton);
  document.body.classList.add('has-course-menu');
})(typeof window !== 'undefined' ? window : globalThis);
