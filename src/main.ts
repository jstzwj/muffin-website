import "./style.css";
import { english, labels, imageDescriptions, type Language } from "./i18n";
import fallbackRelease from "./release.json";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const chinese = new Map<string, string>();
document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
  chinese.set(element.dataset.i18n!, element.innerHTML);
});

type View = "render" | "source" | "night";
let language: Language = "zh";
let view: View = "source";
let windowsArchitecture: "x64" | "arm64" = "x64";
let currentRelease: Release = fallbackRelease;

function updateImageDescriptions() {
  document.querySelectorAll<HTMLImageElement>("[data-alt]").forEach((image) => {
    const key = image.id === "editor-image" ? view : image.dataset.alt!;
    image.alt = imageDescriptions[key]?.[language === "zh" ? 0 : 1] ?? "Muffin";
  });
}

document
  .querySelectorAll<HTMLButtonElement>("button[data-view]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view as View;
      $("#editor-screen").dataset.view = view;
      $<HTMLImageElement>("#editor-image").src = `/screens/${view}.webp`;
      document.querySelector<HTMLSourceElement>(
        "#editor-mobile-image",
      )!.srcset = `/screens/${view}-mobile.webp`;
      document.querySelectorAll("button[data-view]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      updateImageDescriptions();
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
  try {
    localStorage.setItem("muffin-language", language);
  } catch {
    /* Storage is optional. */
  }
  updateImageDescriptions();
  applyRelease(currentRelease);
}

$("#language-toggle").addEventListener("click", () =>
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
    $<HTMLAnchorElement>(`#download-${platform}`).href =
      asset?.browser_download_url ??
      "https://github.com/jstzwj/Muffin/releases/latest";
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
