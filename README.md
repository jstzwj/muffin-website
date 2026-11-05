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
- `src/samples.ts`：三个中英双语 Markdown 示例。
- `src/style.css`、`src/themes.css`：布局与网页示意配色。
- `public/muffin.svg`：来自 Muffin 项目的原始 Logo。
- `public/social.png`：分享卡片；可运行 `npm run social` 重新生成（先安装 Playwright Chromium）。

网页中的编辑器是明确标注的交互演示，不是桌面应用截图。可切换源码/预览、修改 Markdown、更换示例与配色。五种主题区块是网页配色示意，桌面应用以实际主题为准。演示内容仅保存在内存中，刷新会重置，不会上传。

Markdown 经 `marked` 解析并由 DOMPurify 清理。演示不加载用户输入的远程图片，也不渲染 LaTeX 或 Mermaid；对应完整能力由桌面应用提供。

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

测试覆盖桌面和手机尺寸、语言切换与记忆、主题切换、Markdown 编辑与清理、下载架构选择、GitHub 新版本更新和离线回退。CI 在 `main` 推送和 Pull Request 时执行构建及浏览器测试。

## 许可

[MIT](LICENSE)。Logo 与产品文案基于 [Muffin](https://github.com/jstzwj/Muffin)。
