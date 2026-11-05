export type Language = "zh" | "en";

export const english: Record<string, string> = {
  skip: "Skip to content",
  navEditor: "Editor",
  navFeatures: "Features",
  navQuestions: "FAQ",
  menuEditing: "Editing",
  menuViews: "Document and source views",
  menuContents: "Document content",
  menuBlocks: "Code, diagrams and equations",
  menuFiles: "Files and export",
  menuFormats: "Markdown and other formats",
  download: "Download Muffin",
  source: "View source",
  heroNotice: "Muffin · Windows / macOS / Linux",
  heroTitle: "A native desktop<br />Markdown editor.",
  heroLead:
    'Built with C++ and Qt 6. Edit the formatted document,<br class="desktop-break" /> switch to source, and save ordinary .md files.',
  editorTitle: "Edit the document.<br />Or edit its source.",
  editorText:
    "Change headings, tables and code blocks directly on the page. Your cursor and reading position stay in sync when you switch to source.",
  renderView: "Document view",
  sourceView: "Markdown source",
  nightView: "Night theme",
  featuresTitle: "Code, diagrams and equations.<br />In one Markdown file.",
  codeTitle: "Edit code and tables",
  codeText:
    "Syntax highlighting for code blocks. Add and remove table rows and columns directly.",
  technicalTitle: "Write equations and flowcharts",
  technicalText: "Native rendering for LaTeX math and Mermaid diagrams.",
  questionsTitle: "Files, export and themes.",
  questionFiles: "Where are documents stored?",
  answerFiles:
    "Locally, as .md files. Edit offline and open the same files in other Markdown tools.",
  questionExport: "Which formats can I export?",
  answerExport:
    "Export PDF, HTML and PNG natively. Word, EPUB and other formats require a separate Pandoc installation.",
  questionThemes: "Can I change the theme?",
  answerThemes:
    "Choose GitHub, Newsprint, Night, Pixyll or Whitey, or import your own CSS theme.",
  questionLicense: "Does it cost anything?",
  answerLicense:
    "Muffin is free, with source code under the MIT license. Report issues and follow development on GitHub.",
  downloadTitle: "Download Muffin.",
  downloadText:
    "Choose your system and architecture. Installers are hosted on GitHub Releases.",
  downloadWindows: "Download MSI installer ↗",
  downloadMac: "Download DMG installer ↗",
  downloadLinux: "Download Linux archive ↗",
  releaseNotes: "Release notes",
  allDownloads: "Other versions and portable builds ↗",
  license: "MIT license",
  issues: "Report an issue ↗",
};

export const labels: Record<string, [string, string]> = {
  navigation: ["主导航", "Main navigation"],
  menu: ["菜单", "Menu"],
  views: ["查看编辑器界面", "Editor views"],
  architecture: ["Windows 架构", "Windows architecture"],
};

export const imageDescriptions: Record<string, [string, string]> = {
  render: [
    "Muffin 的原生编辑界面，显示文档大纲、表格与 C++ 代码",
    "Muffin's native editor with a document outline, table and C++ code",
  ],
  source: [
    "Muffin 的 Markdown 源码视图，显示同一份文档",
    "The same document in Muffin's Markdown source view",
  ],
  night: [
    "Muffin 使用内置 Night 主题显示文档",
    "Muffin displaying the document with the built-in Night theme",
  ],
  code: [
    "Muffin 中可编辑的表格与带语法高亮的 C++ 代码块",
    "An editable table and a syntax-highlighted C++ code block in Muffin",
  ],
  technical: [
    "Muffin 原生渲染的 Mermaid 流程图与 LaTeX 公式",
    "A Mermaid flowchart and LaTeX equation rendered natively in Muffin",
  ],
};
