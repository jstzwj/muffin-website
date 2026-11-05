// Small, read-only product demonstration. No editor or Markdown runtime is shipped.
export function initializeSourcePreview() {
  const source = document.querySelector<HTMLElement>("#demo-source")!;
  const preview = document.querySelector<HTMLElement>(".window-document")!;
  const screen = document.querySelector<HTMLElement>("#editor-screen")!;
  const syncButton =
    document.querySelector<HTMLButtonElement>("#demo-sync-scroll")!;
  const markdown = source
    .querySelector("code")!
    .textContent!.replace(/\r\n/g, "\n");
  const lines = markdown.split("\n");
  const listing = document.createElement("div");
  listing.className = "source-lines";
  let fenced = false;

  function token(text: string, className: string) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    return span;
  }

  lines.forEach((line, index) => {
    const row = document.createElement("div");
    row.className = "source-line";
    row.dataset.line = String(index + 1);
    const number = token(String(index + 1), "source-line-number");
    number.setAttribute("aria-hidden", "true");
    const code = document.createElement("code");
    code.className = "source-line-text";
    if (line.startsWith("```")) {
      code.append(token(line, "source-fence"));
      fenced = !fenced;
    } else if (!fenced && /^#{1,6} /.test(line)) {
      code.append(token(line, "source-heading"));
    } else if (!fenced) {
      const pattern = /!?\[[^\]]*\]\([^)]+\)|\*\*|\$\$|\|/g;
      let offset = 0;
      for (const match of line.matchAll(pattern)) {
        code.append(line.slice(offset, match.index));
        const link = match[0].match(/^(!?\[[^\]]*\])\(([^)]+)\)$/);
        if (link) {
          code.append(
            token(link[1], "source-link-label"),
            token(`(${link[2]})`, "source-link-target"),
          );
        } else {
          code.append(
            token(
              match[0],
              match[0] === "**" ? "source-emphasis" : "source-fence",
            ),
          );
        }
        offset = match.index + match[0].length;
      }
      code.append(line.slice(offset) || (line ? "" : "\u200b"));
    } else {
      code.textContent = line || "\u200b";
    }
    row.append(number, code);
    listing.append(row);
  });
  source.replaceChildren(listing);

  // Paired document anchors keep headings aligned even when source lines wrap.
  const selectors: [string, string][] = [
    [".readme-logo", '<img src="logo.svg"'],
    ["#readme-title", "# Muffin"],
    [".readme-tagline", "**A native"],
    [".readme-description", "Muffin is a block-level"],
    [".readme-links", "[Download]"],
    [".readme-badges", "![C++]"],
    [".readme-language", "Other languages:"],
    ["#readme-editor", "## Editor"],
    ["#readme-editor + p", "Edit the document directly"],
    ["#demo-render .demo-table", "| Content"],
    ["#readme-build", "## Build"],
    ["#demo-render .demo-code", "```cpp"],
    ["#readme-workflow", "## Release workflow"],
    ["#readme-workflow + p", "Write, review"],
    ["#readme-equations", "## Equations"],
    [".demo-equation", "$$"],
  ];
  const anchors = selectors.map(([selector, prefix]) => ({
    preview: document.querySelector<HTMLElement>(selector)!,
    source: listing.children[
      lines.findIndex((line) => line.startsWith(prefix))
    ] as HTMLElement,
  }));
  type Position = { anchor: number; fraction: number };
  function points(viewport: HTMLElement) {
    const key = viewport === source ? "source" : "preview";
    const top = viewport.getBoundingClientRect().top;
    return [
      0,
      ...anchors.map(
        (anchor) =>
          anchor[key].getBoundingClientRect().top - top + viewport.scrollTop,
      ),
      viewport.scrollHeight,
    ];
  }
  function capture(viewport: HTMLElement): Position {
    const positions = points(viewport);
    let anchor = 0;
    for (let index = 1; index < positions.length; index++) {
      if (positions[index] > viewport.scrollTop) break;
      anchor = index;
    }
    const distance =
      (positions[anchor + 1] ?? positions[anchor]) - positions[anchor];
    return {
      anchor,
      fraction:
        distance > 0 ? (viewport.scrollTop - positions[anchor]) / distance : 0,
    };
  }
  function restore(viewport: HTMLElement, position: Position) {
    const positions = points(viewport);
    const start = positions[position.anchor];
    viewport.scrollTop =
      start +
      ((positions[position.anchor + 1] ?? start) - start) * position.fraction;
  }
  const pendingScroll = new WeakMap<HTMLElement, number>();
  function synchronize(viewport: HTMLElement) {
    if (
      screen.dataset.view !== "split" ||
      syncButton.getAttribute("aria-pressed") !== "true"
    )
      return;
    const pending = pendingScroll.get(viewport);
    pendingScroll.delete(viewport);
    if (pending !== undefined && Math.abs(viewport.scrollTop - pending) < 1)
      return;
    const target = viewport === source ? preview : source;
    restore(target, capture(viewport));
    pendingScroll.set(target, target.scrollTop);
  }
  for (const viewport of [source, preview]) {
    viewport.addEventListener("scroll", () => synchronize(viewport), {
      passive: true,
    });
  }
  syncButton.addEventListener("click", () => {
    const enabled = syncButton.getAttribute("aria-pressed") !== "true";
    syncButton.setAttribute("aria-pressed", String(enabled));
    if (enabled) {
      pendingScroll.delete(source);
      synchronize(source);
    }
  });
  return { source, preview, capture, restore };
}
