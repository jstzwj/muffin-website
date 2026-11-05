import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const logo = await readFile(
  new URL("../public/muffin.svg", import.meta.url),
  "utf8",
);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><style>
    *{box-sizing:border-box}body{margin:0;background:#f8f7f3;color:#292e29;font-family:"Microsoft YaHei",sans-serif;padding:62px 76px}
    .brand{display:flex;align-items:center;gap:13px;font-family:Georgia,serif;font-size:38px;letter-spacing:-1px}.brand svg{width:59px;height:59px}.dot{color:#7c916c}
    .eyebrow{margin-top:54px;color:#718267;font-size:13px;letter-spacing:3px}h1{font-size:70px;font-weight:400;font-family:"SimSun",serif;letter-spacing:-3px;margin:24px 0 28px}em{font-style:normal;color:#385647}
    p{font-size:21px;color:#7c8471;letter-spacing:1px}.bottom{display:flex;justify-content:space-between;align-items:center;margin-top:67px;border-top:1px solid #dee3d3;padding-top:24px;font-size:15px;color:#8b947f}.tag{border:1px solid #d7dfcc;border-radius:30px;padding:7px 14px;font-size:13px;color:#6e805f}
    .leaf{position:absolute;right:85px;top:78px;font-size:100px;color:#d4debf;transform:rotate(15deg)}
    </style><div class="brand">${logo}<strong>Muffin<span class="dot">.</span></strong></div><span class="leaf">✳</span>
    <div class="eyebrow">LESS FRICTION. MORE FLOW.</div><h1>让灵感，<em>自然成文。</em></h1><p>原生、轻盈、所见即所得的 Markdown 编辑器。</p>
    <div class="bottom"><span>Windows / macOS / Linux</span><span class="tag">免费开源 · MIT</span></div></html>`);
  await page.screenshot({
    path: fileURLToPath(new URL("../public/social.png", import.meta.url)),
  });
} finally {
  await browser.close();
}
