# Mermaid 学习图表维护

学习页面中的 Mermaid 图表采用“独立 `.mmd` 权威源 → 维护阶段生成静态 SVG → HTML 通过语义化 `figure` 引用”的交付方式。学习者不需要安装 Node 依赖，页面也不加载 Mermaid runtime 或 CDN。

## 首次准备

```bash
npm ci
```

`package.json` 和 `package-lock.json` 固定 `@mermaid-js/mermaid-cli` 版本。该依赖只服务仓库维护，不进入学习页面。

## 新增或修改图表

1. 在课程页面同目录的 `diagrams/` 下创建或修改稳定命名的 `.mmd`。
2. 在 `design-system/learning-diagrams.json` 登记页面、类型、源码、SVG、caption 和 alt；该清单也是首次迁移的 11 张图审计表。
3. 运行 `npm run diagrams:generate` 生成同名 SVG。生成物会记录源码、共享配置、图表 CSS 和 CLI 版本的 SHA-256 输入指纹。
4. 在 HTML 中用 `figure.learning-diagram` 接入 SVG，提供 caption、alt、源码入口和原图入口。
5. 运行 `npm run content:check`，同时校验图表、统一导航和本地链接。

单独命令：

```bash
npm run diagrams:generate
npm run diagrams:check
npm run navigation:check
npm run links:check
```

校验失败会返回非零状态，并报告具体页面或图表。若 `.mmd`、共享 Mermaid 配置、主题 CSS 或 CLI 版本变更后未重新生成 SVG，指纹校验会明确报告不同步。
