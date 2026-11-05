import "./style.css";
import DOMPurify from "dompurify";
import { Marked } from "marked";
import { english, labels, type Language } from "./i18n";
import { samples, type Sample } from "./samples";
import fallbackRelease from "./release.json";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const source = $<HTMLTextAreaElement>("#markdown-source");
const preview = $("#markdown-preview");
const outline = $("#outline");
const previewButton = $<HTMLButtonElement>("#preview-mode");
const sourceButton = $<HTMLButtonElement>("#source-mode");
const languageButton = $<HTMLButtonElement>("#language-toggle");
const chinese = new Map<string, string>();
document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
  chinese.set(element.dataset.i18n!, element.innerHTML);
});

let language: Language = "zh";
let sample: Sample = "welcome";
let mode: "preview" | "source" = "preview";
let currentRelease: Release = fallbackRelease;
let windowsArchitecture: "x64" | "arm64" = "x64";
const drafts = structuredClone(samples);

const markdown = new Marked({
  gfm: true,
  renderer: {
    checkbox({ checked }) {
      return `<span class="task-marker" aria-hidden="true">${checked ? "☑" : "☐"}</span> `;
    },
  },
});

function renderMarkdown() {
  const rawHtml = markdown.parse(source.value, { async: false });
  preview.innerHTML = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "del",
      "blockquote",
      "ul",
      "ol",
      "li",
      "pre",
      "code",
      "a",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
    ],
    ALLOWED_ATTR: ["href", "title", "class", "aria-hidden", "align"],
    ALLOW_DATA_ATTR: false,
  });
  // Local fragments and safe web/mail links only. Demo content cannot load remote media.
  preview.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("#")) return;
    try {
      const url = new URL(href);
      if (!["https:", "http:", "mailto:"].includes(url.protocol)) {
        link.removeAttribute("href");
      } else {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    } catch {
      link.removeAttribute("href");
    }
  });
  outline.replaceChildren();
  preview
    .querySelectorAll<HTMLElement>("h1, h2, h3")
    .forEach((heading, index) => {
      heading.id = `demo-heading-${index}`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = heading.textContent;
      button.addEventListener("click", () => {
        setMode("preview");
        // Scroll inside the demo without moving the surrounding page.
        const scroller = $(".document-area");
        scroller.scrollTo({
          top: Math.max(0, heading.offsetTop - 25),
          behavior: "smooth",
        });
      });
      outline.append(button);
    });
  $("#word-count").textContent = String(Array.from(source.value).length);
}

function setMode(nextMode: typeof mode) {
  mode = nextMode;
  const isPreview = mode === "preview";
  preview.hidden = !isPreview;
  source.hidden = isPreview;
  previewButton.classList.toggle("is-active", isPreview);
  sourceButton.classList.toggle("is-active", !isPreview);
  previewButton.setAttribute("aria-pressed", String(isPreview));
  sourceButton.setAttribute("aria-pressed", String(!isPreview));
  if (!isPreview) source.focus({ preventScroll: true });
}

function updateSample() {
  $<HTMLSelectElement>("#mobile-sample").value = sample;
  source.value = drafts[language][sample];
  renderMarkdown();
  document
    .querySelectorAll<HTMLButtonElement>("[data-sample]")
    .forEach((button) => {
      const active = button.dataset.sample === sample;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  const titleKeys = {
    welcome: "sampleWelcome",
    notes: "sampleNotes",
    writing: "sampleWriting",
  };
  $('[data-i18n="demoFile"]').textContent =
    language === "en"
      ? english[titleKeys[sample]]
      : chinese.get(titleKeys[sample])!;
  $(".document-area").scrollTop = 0;
}

source.addEventListener("input", () => {
  drafts[language][sample] = source.value;
  renderMarkdown();
});
$<HTMLSelectElement>("#mobile-sample").addEventListener("change", (event) => {
  sample = (event.currentTarget as HTMLSelectElement).value as Sample;
  updateSample();
});
previewButton.addEventListener("click", () => setMode("preview"));
sourceButton.addEventListener("click", () => setMode("source"));
document
  .querySelectorAll<HTMLButtonElement>("[data-sample]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      sample = button.dataset.sample as Sample;
      updateSample();
    });
  });

document
  .querySelectorAll<HTMLButtonElement>(".demo-themes [data-theme]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      $("#editor-window").dataset.theme = button.dataset.theme;
      $("#theme-name").textContent = button.getAttribute("aria-label");
      document.querySelectorAll(".demo-themes button").forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
    });
  });

document
  .querySelectorAll<HTMLButtonElement>("[data-showcase-theme]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      $("#theme-paper").dataset.theme = button.dataset.showcaseTheme;
      $("#showcase-theme-name").textContent = button
        .textContent!.trim()
        .toUpperCase();
      document.querySelectorAll("[data-showcase-theme]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
    });
  });

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
    if (value !== undefined) element.innerHTML = value;
  });
  document.querySelectorAll<HTMLElement>("[data-label]").forEach((element) => {
    const values = labels[element.dataset.label!];
    if (values)
      element.setAttribute("aria-label", values[language === "zh" ? 0 : 1]);
  });
  languageButton.querySelector("span")!.textContent =
    language === "zh" ? "EN" : "中文";
  languageButton.setAttribute(
    "aria-label",
    language === "zh" ? "Switch to English" : "切换到简体中文",
  );
  document.title =
    language === "zh"
      ? "Muffin — 让灵感，自然成文。"
      : "Muffin — A little space. A lot of possibility.";
  const description =
    language === "zh"
      ? "Muffin 是一款免费开源的原生 Markdown 编辑器。所见即所得，支持数学公式、Mermaid 图表和多种主题，为 Windows、macOS 与 Linux 而生。"
      : "Muffin is a free, open-source native Markdown editor. Enjoy WYSIWYG editing, math, Mermaid diagrams, and beautiful themes on Windows, macOS, and Linux.";
  $('meta[name="description"]').setAttribute("content", description);
  $('meta[property="og:title"]').setAttribute("content", document.title);
  $('meta[property="og:description"]').setAttribute("content", description);
  $('meta[property="og:locale"]').setAttribute(
    "content",
    language === "zh" ? "zh_CN" : "en_US",
  );
  try {
    localStorage.setItem("muffin-language", language);
  } catch {
    /* Storage is optional. */
  }
  updateSample();
  applyRelease(currentRelease);
}

languageButton.addEventListener("click", () =>
  setLanguage(language === "zh" ? "en" : "zh"),
);

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
    const link = $<HTMLAnchorElement>(`#download-${platform}`);
    link.href =
      asset?.browser_download_url ??
      "https://github.com/jstzwj/Muffin/releases/latest";
  });
  $("#release-version").textContent =
    `${release.tag_name} · ${language === "zh" ? "发行说明" : "Release notes"}`;
  $("#release-version").closest("a")!.href =
    `https://github.com/jstzwj/Muffin/releases/tag/${encodeURIComponent(release.tag_name)}`;
}

let savedLanguage: Language = "zh";
try {
  if (localStorage.getItem("muffin-language") === "en") savedLanguage = "en";
} catch {
  /* Use Chinese by default. */
}
setLanguage(savedLanguage);

// Ship known, verified links. Refresh them when GitHub is reachable; API failures stay unobtrusive.
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
    /* The bundled release remains available when offline or rate limited. */
  });
