import type { Language } from "./i18n";

export type Sample = "welcome" | "notes" | "writing";

export const samples: Record<Language, Record<Sample, string>> = {
  zh: {
    welcome:
      "# 好想法，值得被写下来。\n\n或许是一段故事，一个计划，或只是今天的一点小小感悟。打开 Muffin，从第一行开始。\n\n> 写作，是把脑海里的光，留在纸上。\n\n## 给灵感一点空间\n\n- **轻松开始** — 写下标题，让文字自然成形\n- **保持专注** — 把注意力交给正在写的这一句\n- **自由表达** — 列表、引用与代码，各有其所\n\n## 把今天写成一个开始\n\n一杯咖啡，一页空白。你的下一个好故事，也许就从这里开始。\n\n---\n\n*点击上方 Markdown，试着写下你自己的第一句。*",
    notes:
      '# 项目笔记\n\n把想法理清楚，再一步步实现。\n\n## 本周计划\n\n| 事项 | 进度 |\n| --- | --- |\n| 整理需求 | 已完成 |\n| 编写文档 | 进行中 |\n| 发布新版本 | 待开始 |\n\n## 一点代码\n\n```cpp\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, Muffin!";\n}\n```\n\n> 从最小的一步开始，让好点子慢慢长大。',
    writing:
      "# 今天，写点什么？\n\n不需要宏大的计划，完成一件小事就很好。\n\n## 我的写作清单\n\n- [x] 找一处安静的角落\n- [x] 准备一杯喜欢的饮品\n- [ ] 记下今天的一个发现\n- [ ] 给明天留一个小小的期待\n\n## 一个小练习\n\n用 **三个词** 描述今天，再把它们连成一段话。\n\n1. 我看到了什么？\n2. 我想到了什么？\n3. 我想把什么留下来？\n\n---\n\n*好文字，从愿意开始的那一刻生长。*",
  },
  en: {
    welcome:
      "# Good ideas deserve a page.\n\nA story, a plan, or a small discovery from today. Open Muffin and start with a single line.\n\n> Writing is a way of keeping a little light on the page.\n\n## Give your ideas room to grow\n\n- **Start simply** — a heading, a thought, a sentence\n- **Stay focused** — one idea at a time\n- **Express freely** — lists, quotes, and code, all at home\n\n## Make today a beginning\n\nA cup of coffee. A fresh page. Your next good story might start right here.\n\n---\n\n*Switch to Markdown above and try a first line of your own.*",
    notes:
      '# Project notes\n\nA little clarity goes a long way.\n\n## This week’s plan\n\n| Task | Progress |\n| --- | --- |\n| Gather ideas | Done |\n| Write documentation | In progress |\n| Ship a new version | Up next |\n\n## A little code\n\n```cpp\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, Muffin!";\n}\n```\n\n> Start with one small step. Give a good idea time to grow.',
    writing:
      "# What will you write today?\n\nNo grand plans needed. One small thing is enough.\n\n## A writing checklist\n\n- [x] Find a quiet corner\n- [x] Make something nice to drink\n- [ ] Capture one discovery from today\n- [ ] Leave a small hope for tomorrow\n\n## A tiny exercise\n\nDescribe today in **three words**, then make a paragraph out of them.\n\n1. What did I notice?\n2. What did it make me think?\n3. What would I like to remember?\n\n---\n\n*Good writing grows from the moment you choose to begin.*",
  },
};
