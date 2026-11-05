export type Language = "zh" | "en";

export const english: Record<string, string> = {
  skip: "Skip to content",
  navFeatures: "Features",
  navQuestions: "FAQ",
  download: "Download Muffin",
  documentation: "Read the docs",
  source: "View source",
  heroCategory: "A native desktop Markdown editor.",
  heroLead:
    'From a few pages of notes to 1 GiB of Markdown.<br class="desktop-break" /> Native C++ / Qt 6. Write directly on the formatted page.',
  performanceLabel: "Built for long documents",
  performanceTitle: "Open a 1 GiB<br />Markdown file.",
  performanceText:
    "Lay out what is on screen. Parse and update what changed. A longer document does not mean rendering everything again with every keystroke.",
  benchmarkLink: "Read the large-file test report",
  performanceNote:
    "Based on the mixed-document stress test on Windows. Opening time and memory use depend on the content and your hardware.",
  nativeTitle: "A native desktop app",
  nativeText:
    "Built with C++ and Qt 6. No bundled Chromium or Node.js runtime.",
  directTitle: "Write on the formatted page",
  directText:
    "Edit tables, code and equations directly. Your cursor and reading position stay in sync with source mode.",
  portableTitle: "Your files stay yours",
  portableText:
    "Ordinary Markdown files. Works offline. Free and open source under the MIT license.",
  renderView: "Document view",
  sourceView: "Markdown source",
  splitView: "Split view",
  nightView: "Night theme",
  featuresLabel: "Editing & formatting",
  featuresTitle: "Code, diagrams and equations.<br />Right in your document.",
  featuresText:
    "Document an implementation with highlighted code, a process with Mermaid, or an equation with LaTeX. Keep them together in one Markdown file.",
  sourceText:
    "Switch to source whenever you need it. Your cursor and reading position stay in sync.",
  viewEditor: "See the editor",
  tableTitle: "Editable tables",
  tableText: "Type in cells. Add and remove rows and columns directly.",
  codeTitle: "Syntax highlighting",
  codeText: "Highlighted code blocks for over 20 languages.",
  mathTitle: "LaTeX equations",
  mathText: "Inline and display math, rendered natively.",
  themeTitle: "Five built-in themes",
  themeText: "From GitHub to Night. Custom CSS themes, too.",
  localTitle: "Local files. Offline editing.",
  localText:
    "Documents are ordinary .md files that open in other editors. Muffin is built with C++ and Qt 6, and is free and open source.",
  questionsTitle: "Frequently asked questions",
  questionFiles: "Can I open my existing Markdown files?",
  answerFiles:
    "Yes. Open your existing .md files directly, with no import or conversion. Switch to source mode to view and edit the original Markdown.",
  questionExport: "Which formats can I export?",
  answerExport:
    "Export PDF, HTML and PNG directly. Word, EPUB and other formats require a separate Pandoc installation.",
  questionThemes: "Can I customize the theme?",
  answerThemes:
    "Choose from GitHub, Newsprint, Night, Pixyll and Whitey, or import your own CSS theme.",
  questionLicense: "Does it cost anything?",
  answerLicense:
    "Muffin is free, with source code under the MIT license. Browse the code, report issues or contribute on GitHub.",
  downloadTitle: "Try Muffin on your desktop.",
  downloadText: "Free and open source. For Windows, macOS and Linux.",
  windowsPackage: "MSI installer",
  macPackage: "DMG installer · ARM64",
  windowsArchitecture: "Windows architecture",
  releaseNotes: "Release notes",
  allDownloads: "Other versions & portable builds ↗",
  footerDescription: "A native desktop Markdown editor.",
  footerProduct: "Product",
  footerProject: "Open source",
  license: "MIT license",
  issues: "Report an issue",
};

export const labels: Record<string, [string, string]> = {
  navigation: ["主导航", "Main navigation"],
  editor: ["Muffin 编辑器界面", "Muffin editor"],
  views: ["查看编辑器界面", "Editor views"],
  architecture: ["Windows 架构", "Windows architecture"],
  downloadMenu: ["选择下载版本", "Choose a download"],
};
