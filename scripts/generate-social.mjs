import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// The input is a crop of this website's HTML window, captured with the design tools.
// It is used only in the static share card; the homepage has no raster product assets.
const capturePath = process.argv[2];
if (!capturePath) {
  throw new Error("Usage: npm run social -- <path-to-HTML-window-crop.png>");
}
execFileSync(
  "python",
  [
    "-c",
    String.raw`
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import sys

root = Path.cwd()
im = Image.new('RGB', (1200, 630), '#ffffff')
d = ImageDraw.Draw(im)
regular = 'C:/Windows/Fonts/msyh.ttc'
font = lambda size: ImageFont.truetype(str(root/'public/fonts/familjen-400.ttf'), size)
d.text((64, 156), 'Muffin', fill='#17191a', font=ImageFont.truetype(str(root/'public/fonts/familjen-500.ttf'), 56))
d.text((64, 242), '原生桌面', fill='#17191a', font=ImageFont.truetype(regular, 31))
d.text((64, 290), 'Markdown 编辑器。', fill='#17191a', font=ImageFont.truetype(regular, 31))
d.text((64, 367), '为大文档按需排版', fill='#6c737c', font=ImageFont.truetype(regular, 23))
d.text((64, 411), '免费开源 · Windows / macOS / Linux', fill='#6c737c', font=ImageFont.truetype(regular, 17))
d.rounded_rectangle((540, 62, 1136, 568), radius=20, fill='#a9c9b9')
window = Image.open(sys.argv[1]).convert('RGB')
window.thumbnail((540, 410), Image.Resampling.LANCZOS)
im.paste(window, (838 - window.width // 2, 315 - window.height // 2))
im.save(root/'public/social.png', optimize=True)
`,
    resolve(capturePath),
  ],
  { cwd: fileURLToPath(new URL("..", import.meta.url)), stdio: "inherit" },
);
