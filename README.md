# Muffin Website

[Muffin](https://github.com/jstzwj/Muffin) Markdown 编辑器的项目主页，面向 Cloudflare Pages 部署。

原生 HTML / CSS / TypeScript，使用 Vite 构建。无服务端、数据库或登录功能。默认简体中文，可切换 English；语言偏好仅保存在当前浏览器。

## 本地开发

需要 Node.js 22.12+（推荐使用 `.node-version` 中的版本）。

```sh
npm ci
npm run dev
```

开发地址：`http://127.0.0.1:5173`。

```sh
npm run build   # TypeScript 检查并构建到 dist/
npm run preview # 预览生产构建
```

## Cloudflare Pages

在 Cloudflare 控制台创建或打开 Pages 项目，连接 `jstzwj/muffin-website`：

| 设置         | 值                               |
| ------------ | -------------------------------- |
| 生产分支     | `main`                           |
| 框架预设     | Vite（或 None）                  |
| 根目录       | 仓库根目录                       |
| 构建命令     | `npm run build`                  |
| 构建输出目录 | `dist`                           |
| Node.js      | 22.12+；仓库包含 `.node-version` |

`wrangler.jsonc` 也声明了 Pages 输出目录。无需 API 密钥或其他环境变量。连接 Git 集成后，后续推送到 `main` 会由 Cloudflare 构建部署。本仓库的 GitHub Actions 负责构建与浏览器检查，不负责创建 Cloudflare 项目。

`public/_headers` 包含 Cloudflare Pages 使用的 CSP 等响应头。开发服务器不会自动应用这些响应头；浏览器测试会加载同一份 CSP 进行验证。

绑定最终域名后，请把 `index.html` 中 `og:image` 的相对路径改为该域名下的绝对 URL，并补充 `og:url`、canonical 与 sitemap。当前没有假设尚未确认的部署域名。

## 内容维护

- `index.html`：页面结构、中文文案与产品功能。
- `src/i18n.ts`：英文文案与双语无障碍标签。
- `src/style.css`：页面字体、配色与产品展示布局。
- `src/muffin-window.css`：按真实应用截图重建的窗口、菜单、侧栏与 README 排版。
- `src/source-preview.ts`：源码行号与高亮、分栏同步滚动和模式切换的阅读位置保持。
- `src/product-demo.css`：功能细节和大文件展示。
- `public/assets/motion/`：Taste Skill 原始悬停与点击交互，保留上游许可。当前页面不加载旧版整屏布局资源。
- `public/muffin-notes.md`：英文公开示例文档，包含表格、代码、流程图和公式。
- `public/muffin.svg`：来自 Muffin 项目的原始 Logo。
- `public/social.png`：分享卡片；传入网页窗口裁切图，运行 `npm run social -- <window-crop.png>` 重新生成（需要 Python 与 Pillow）。

编辑器区用 HTML/CSS 按真实截图重建 Muffin 的应用菜单、文件树、README 文档与状态栏，标题栏保留 macOS 风格。可切换文件/大纲、目录定位，以及切换编辑、源码、左右分栏和 Night 主题。源码包含行号、自动换行与语法颜色，分栏提供可开关的双向同步滚动，模式切换保持对应阅读位置。正文使用原项目 GitHub 主题的 Open Sans 字体；表格和代码是 HTML，流程图使用 SVG，公式使用 MathML。英文示例保持一致，网页没有移植桌面编辑引擎，也不加载产品截图。

当前版式采用白底、窄幅介绍与浅绿色产品展示框。区块随内容自然展开，页头不固定；常见问题使用原生可展开条目，首屏下载箭头可选择系统，手机上同样可以直接切换语言。

当前支持简体中文和英文；文案、无障碍标签及使用说明链接随语言切换，选择保存在浏览器中。产品窗口中的英文示例保持一致。组件与大文件文案的维护说明见 [product-demo.md](docs/product-demo.md)。

首屏及独立介绍区重点说明原生 C++/Qt、大文件按需排版、增量更新及 1 GiB 混合 Markdown 测试。数字依据链接到 Muffin 仓库中的测试分析；没有把 Core 解析阶段时间当成 GUI 打开速度，也没有承诺秒开或固定内存占用。

### 下载入口

页面加载时会请求 GitHub 的公开 `releases/latest` API，按文件名选择 Windows MSI（可切换 x64/ARM64）、macOS ARM64 DMG、Linux x64 tar.gz。请求超时、限流或离线时，使用 `src/release.json` 中已核实的 `v0.7.12` 发行版。若某个平台在新发行版中没有匹配的包，则跳转 GitHub 发行页。

发布新版本后可同步更新 `src/release.json`，确保回退数据保持新鲜。文件名规则变化时也应更新 `src/main.ts` 的匹配规则。

## 验证

```sh
npx playwright install chromium
npm run build
npm test
npm run format:check
```

测试覆盖桌面和手机尺寸、语言切换与记忆、HTML 文档/源码/左右分栏切换、行号与长行、双向同步及独立滚动、阅读位置保持、Night 配色、公式与图表、零截图请求、FAQ 展开、下载菜单及键盘关闭、下载架构选择、GitHub 新版本更新、无效下载地址和离线回退。CI 在 `main` 推送和 Pull Request 时执行构建及浏览器测试。

## 许可

[MIT](LICENSE)。Logo、产品界面参考与功能资料来自 [Muffin](https://github.com/jstzwj/Muffin)。布局资源来自 [Taste Skill](https://github.com/Leonxlnx/taste-skill)，许可见 `public/assets/LICENSE.txt`。Familjen Grotesk 字体遵循 `public/fonts/OFL.txt`；Open Sans 遵循 `public/fonts/Open-Sans-Apache-2.0.txt`。设计取舍见 [design-plan.md](docs/design-plan.md)，检查结果与例外见 [design-review.md](docs/design-review.md)。
