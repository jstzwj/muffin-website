import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// A static share image uses the same product capture, colors and plain copy as the page.
execFileSync(
  "python",
  [
    "-c",
    String.raw`
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root = Path.cwd()
im = Image.new('RGB', (1200, 630), '#dfdedb')
d = ImageDraw.Draw(im)
regular = 'C:/Windows/Fonts/msyh.ttc'
d.text((64, 42), 'Muffin', fill='#26251e', font=ImageFont.truetype(str(root/'public/fonts/familjen-500.ttf'), 38))
d.text((64, 107), '原生桌面 Markdown 编辑器', fill='#26251e', font=ImageFont.truetype(regular, 47))
d.text((64, 181), 'C++ / Qt 6     Windows / macOS / Linux', fill='#5a5850', font=ImageFont.truetype(str(root/'public/fonts/familjen-400.ttf'), 23))
capture = Image.open(root/'public/screens/render.webp').convert('RGB')
capture.thumbnail((1072, 657), Image.Resampling.LANCZOS)
im.paste(capture, (64, 244))
im.save(root/'public/social.png', optimize=True)
`,
  ],
  { cwd: fileURLToPath(new URL("..", import.meta.url)), stdio: "inherit" },
);
