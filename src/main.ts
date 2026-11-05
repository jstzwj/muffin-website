import "./style.css";
import "./product-demo.css";
import "./muffin-window.css";
import { english, labels, type Language } from "./i18n";
import fallbackRelease from "./release.json";
import { initializeSourcePreview } from "./source-preview";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const chinese = new Map<string, string>();
document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
  chinese.set(element.dataset.i18n!, element.innerHTML);
});

type View = "render" | "source" | "split" | "night";
let language: Language = "zh";
let view: View = "render";
let windowsArchitecture: "x64" | "arm64" = "x64";
let currentRelease: Release = fallbackRelease;
const editorPreview = initializeSourcePreview();

function setView(nextView: View) {
  const position = editorPreview.capture(
    view === "source" ? editorPreview.source : editorPreview.preview,
  );
  view = nextView;
  $("#editor-screen").dataset.view = view;
  $(".source-pane").hidden = view !== "source" && view !== "split";
  $(".preview-pane").hidden = view === "source";
  document
    .querySelectorAll<HTMLElement>(".pane-header")
    .forEach((header) => (header.hidden = view !== "split"));
  for (const mode of ["render", "source", "split"]) {
    $(`#demo-view-${mode}`).setAttribute(
      "aria-pressed",
      String(mode === (view === "night" ? "render" : view)),
    );
  }
  if (view !== "source") editorPreview.restore(editorPreview.preview, position);
  if (view === "source" || view === "split")
    editorPreview.restore(editorPreview.source, position);
  document
    .querySelectorAll<HTMLButtonElement>("button[data-view]")
    .forEach((button) => {
      const selected = button.dataset.view === view;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
}

document
  .querySelectorAll<HTMLButtonElement>("button[data-view]")
  .forEach((button) => {
    button.addEventListener("click", () =>
      setView(button.dataset.view as View),
    );
  });

for (const mode of ["render", "source", "split"] as const) {
  $(`#demo-view-${mode}`).addEventListener("click", () => setView(mode));
}

const sidebarTabs = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-sidebar]"),
];
function selectSidebar(tab: HTMLButtonElement) {
  sidebarTabs.forEach((button) => {
    const selected = button === tab;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    $(`#demo-${button.dataset.sidebar}`).hidden = !selected;
  });
  $(".sidebar-toolbar").hidden = tab.dataset.sidebar === "outline";
}
sidebarTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectSidebar(tab));
  tab.addEventListener("keydown", (event) => {
    const next =
      event.key === "ArrowRight" || event.key === "ArrowLeft"
        ? sidebarTabs[1 - index]
        : event.key === "Home"
          ? sidebarTabs[0]
          : event.key === "End"
            ? sidebarTabs[1]
            : null;
    if (!next) return;
    event.preventDefault();
    selectSidebar(next);
    next.focus();
  });
});
document
  .querySelectorAll<HTMLButtonElement>("[data-document-heading]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      if (view === "source") setView("render");
      const viewport = $(".window-document");
      const heading = $(`#${button.dataset.documentHeading}`);
      viewport.scrollTop +=
        heading.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        20;
    });
  });
const words = [
  ...new Intl.Segmenter("en", { granularity: "word" }).segment(
    $("#demo-render").textContent ?? "",
  ),
].filter((segment) => segment.isWordLike).length;
$("#demo-word-count").textContent = `${words} words⌄`;

document
  .querySelectorAll<HTMLButtonElement>("[data-architecture]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      windowsArchitecture = button.dataset
        .architecture as typeof windowsArchitecture;
      document.querySelectorAll("[data-architecture]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      applyRelease(currentRelease);
    });
  });

function setLanguage(nextLanguage: Language) {
  language = nextLanguage;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n!;
    const value = language === "en" ? english[key] : chinese.get(key);
    // Only bundled, trusted copy is inserted as markup (for intentional line breaks).
    if (value !== undefined) element.innerHTML = value;
  });
  document.querySelectorAll<HTMLElement>("[data-label]").forEach((element) => {
    const values = labels[element.dataset.label!];
    if (values)
      element.setAttribute("aria-label", values[language === "zh" ? 0 : 1]);
  });
  const languageButton = $("#language-toggle");
  languageButton.querySelector("span")!.textContent =
    language === "zh" ? "EN" : "中文";
  languageButton.setAttribute(
    "aria-label",
    language === "zh" ? "Switch to English" : "切换到简体中文",
  );
  document.title =
    language === "zh"
      ? "Muffin — 原生桌面 Markdown 编辑器"
      : "Muffin — Native desktop Markdown editor";
  const description =
    language === "zh"
      ? "Muffin 是免费开源的原生 Markdown 编辑器，以 C++ 和 Qt 6 构建。支持所见即所得编辑、源码模式、LaTeX 与 Mermaid，适用于 Windows、macOS 和 Linux。"
      : "Muffin is a free, open-source native Markdown editor built with C++ and Qt 6. Edit documents and source, with LaTeX and Mermaid, on Windows, macOS and Linux.";
  $('meta[name="description"]').setAttribute("content", description);
  $('meta[property="og:title"]').setAttribute("content", document.title);
  $('meta[property="og:description"]').setAttribute("content", description);
  $('meta[property="og:locale"]').setAttribute(
    "content",
    language === "zh" ? "zh_CN" : "en_US",
  );
  document
    .querySelectorAll<HTMLAnchorElement>("[data-documentation]")
    .forEach((link) => {
      link.href = `https://github.com/jstzwj/Muffin/blob/main/${language === "zh" ? "README.zh.md" : "README.md"}`;
    });
  try {
    localStorage.setItem("muffin-language", language);
  } catch {
    /* Storage is optional. */
  }
  applyRelease(currentRelease);
}

$("#language-toggle").addEventListener("click", () =>
  setLanguage(language === "zh" ? "en" : "zh"),
);

const downloadPicker =
  document.querySelector<HTMLDetailsElement>(".download-picker")!;
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node) || !downloadPicker.contains(event.target))
    downloadPicker.open = false;
});
downloadPicker.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && downloadPicker.open) {
    event.preventDefault();
    downloadPicker.open = false;
    downloadPicker.querySelector("summary")!.focus();
  }
});
downloadPicker.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    downloadPicker.open = false;
  });
});

interface Release {
  tag_name: string;
  assets: { name: string; browser_download_url: string }[];
}

function isRelease(value: unknown): value is Release {
  if (!value || typeof value !== "object") return false;
  const release = value as Release;
  return (
    typeof release.tag_name === "string" &&
    /^v?\d[\w.+-]{0,50}$/.test(release.tag_name) &&
    Array.isArray(release.assets) &&
    release.assets.every(
      (asset) =>
        asset &&
        typeof asset.name === "string" &&
        typeof asset.browser_download_url === "string" &&
        asset.browser_download_url.startsWith(
          "https://github.com/jstzwj/Muffin/releases/download/",
        ),
    )
  );
}

function applyRelease(release: Release) {
  currentRelease = release;
  const platforms = {
    windows: new RegExp(`windows-${windowsArchitecture}\\.msi$`, "i"),
    macos: /macos-arm64\.dmg$/i,
    linux: /linux-x64\.tar\.gz$/i,
  };
  Object.entries(platforms).forEach(([platform, pattern]) => {
    const asset = release.assets.find((item) => pattern.test(item.name));
    document
      .querySelectorAll<HTMLAnchorElement>(`[data-download="${platform}"]`)
      .forEach((link) => {
        link.href =
          asset?.browser_download_url ??
          "https://github.com/jstzwj/Muffin/releases/latest";
      });
  });
  document.querySelectorAll("[data-windows-architecture]").forEach((label) => {
    label.textContent = windowsArchitecture === "arm64" ? "ARM64" : "x64";
  });
  $("#release-version").textContent =
    `${release.tag_name} · ${language === "zh" ? "发行说明" : "Release notes"}`;
  $<HTMLAnchorElement>("#release-notes").href =
    `https://github.com/jstzwj/Muffin/releases/tag/${encodeURIComponent(release.tag_name)}`;
}

let savedLanguage: Language = "zh";
try {
  if (localStorage.getItem("muffin-language") === "en") savedLanguage = "en";
} catch {
  /* Default to Chinese. */
}
setLanguage(savedLanguage);

// Verified bundled links remain available when GitHub is offline or rate limited.
fetch("https://api.github.com/repos/jstzwj/Muffin/releases/latest", {
  headers: { Accept: "application/vnd.github+json" },
  signal: AbortSignal.timeout(5000),
})
  .then(async (response) => {
    if (!response.ok) return;
    const release: unknown = await response.json();
    if (isRelease(release)) applyRelease(release);
  })
  .catch(() => {
    /* Keep the bundled release. */
  });
