# 产品展示维护

用户要求以网页代码替代截图，并提供实际应用截图校正布局。当前按截图重建 Muffin 的菜单栏、文件/大纲标签、文件树工具栏、README 正文和状态栏；仅标题栏采用 macOS 控件。这是一份网页展示，不是 macOS 实机截图，也没有移植桌面编辑引擎。

- `index.html` 中 `.muffin-window`：应用菜单、文件树、大纲、英文 README、表格、代码及源码内容。
- `src/muffin-window.css`：窗口和 GitHub 主题排版，使用原项目的 Open Sans 字体及许可。
- `src/product-demo.css`：窗口之外的功能细节及大文件展示。
- `src/main.ts`：编辑/源码/左右分栏/Night 切换、侧栏标签及键盘导航、目录定位与底部三个模式按钮；字数由展示文档实时统计。
- `src/source-preview.ts`：为同一份英文源码生成逻辑行号、自动换行和语法颜色，按文档锚点同步源码与预览的滚动位置，保留模式切换前的阅读位置。代码只通过文本节点生成，不解释源码中的 HTML。
- `.workflow-diagram`：英文流程图，使用内联 SVG。
- `math`：使用浏览器原生 MathML，保留数学语义，无需公式图片或第三方运行时。
- `public/muffin-notes.md`：格式功能的英文样例；窗口开头使用原项目英文 README 的简介，后接样例中的表格和代码。调整文档时同步维护渲染视图和源码片段。
- `scripts/generate-social.mjs`：接收网页窗口裁切图，生成分享 PNG，不在首页加载。运行方式为 `npm run social -- <window-crop.png>`。

底部圆形、源码、分栏三个按钮分别选择编辑视图、Markdown 源码、左右分栏，按用户后续截图校正了先前误作侧栏开关的圆形按钮。“Files / Outline”支持点击和方向键切换，目录条目能定位到文档内容。源码的逻辑行保持完整，长行自动换行，粉色标题、紫色强调标记、橙色链接文字与蓝色链接地址沿用真实应用的配色。

分栏使用左右等宽面板，标题为 “Markdown source” 和 “Read-only preview”，右上角链接按钮可关闭或开启双向同步滚动；两边按对应标题和内容块定位，不按整篇滚动百分比强行对齐。切换模式时也保留对应文档位置。手机分栏暂时隐藏文件树以留出两个面板的阅读宽度，回到编辑或源码视图即恢复文件树。各面板独立滚动，网页本身没有横向滚动；窗口之外的功能细节在手机上为单列。

旧截图已移到本地忽略提交的 `.taste-skill/retired-product-screens/`，不随网站构建发布；页面不再依赖 `public/screens/`。当前不需要额外采集 Mac 截图。

## 大文件证据

重点文案以 Muffin 的 [1 GiB 打开分析](https://github.com/jstzwj/Muffin/blob/main/docs/benchmarks/large-document-open-analysis-2026-10-18.md) 为依据。样例为 1,073,741,824 字节、7,282,689 行的混合 Markdown。

该记录包含历史 GUI 打开和之后的独立 Core 阶段测量，不能将解析阶段时间当成新的 GUI 打开时间。官网只说明实际测试过 1 GiB、按需排版和增量更新，不宣称秒开、零延迟、低于某个内存值或在所有机器上达到相同表现；测试环境为 Windows，窗口的 macOS 风格不代表 Mac 性能测量。
