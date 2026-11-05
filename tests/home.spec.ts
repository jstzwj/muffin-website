import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const csp = readFileSync("public/_headers", "utf8")
  .split("\n")
  .find((line) => line.includes("Content-Security-Policy:"))!
  .split("Content-Security-Policy:")[1]
  .trim();

test.beforeEach(async ({ page }) => {
  await page.route("http://127.0.0.1:4173/**", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp },
    });
  });
  await page.route("https://api.github.com/**", (route) => route.abort());
});

test("HTML product views, bilingual copy and downloads work with the production CSP", async ({
  page,
}) => {
  const errors: string[] = [];
  const screenshotRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/screens/"))
      screenshotRequests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("ERR_FAILED"))
      errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("#hero-title")).toHaveText("Muffin");
  await expect(page.locator(".intro-category")).toContainText(
    "Markdown 编辑器",
  );
  for (const view of ["source", "split", "night", "render"]) {
    await page.locator(`button[data-view="${view}"]`).click();
    await expect(page.locator("#editor-screen")).toHaveAttribute(
      "data-view",
      view,
    );
    if (view === "source" || view === "split") {
      await expect(page.locator("#demo-source")).toBeVisible();
      await expect(page.locator("#demo-source")).toContainText(
        "#include <iostream>",
      );
      if (view === "source")
        await expect(page.locator("#demo-render")).toBeHidden();
      else await expect(page.locator("#demo-render")).toBeVisible();
    } else {
      await expect(page.locator("#demo-render")).toBeVisible();
      await expect(page.locator("#readme-title")).toHaveText("Muffin");
      await expect(page.locator("#demo-source")).toBeHidden();
      await expect(page.locator("#editor-screen")).toHaveCSS(
        "background-color",
        view === "night" ? "rgb(48, 55, 58)" : "rgb(255, 255, 255)",
      );
    }
    await expect(page.locator(`button[data-view="${view}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  await expect(page.locator("#performance-title")).toContainText("1 GiB");
  await expect(page.locator(".window-menubar span")).toHaveText([
    "File",
    "Edit",
    "Paragraph",
    "Insert",
    "Format",
    "View",
    "Themes",
    "Help",
  ]);
  await expect(page.locator(".window-sidebar")).toBeVisible();
  await expect(page.locator("#demo-files")).toContainText("README.md");
  await expect(page.locator(".status-document")).toContainText("UTF-8 | LF");
  await expect(page.locator(".benchmark-visual")).toContainText(
    "1,073,741,824 bytes",
  );
  await expect(page.locator(".workflow-diagram")).toBeVisible();
  await expect(page.locator(".detail-image math")).toBeVisible();
  await expect(page.locator("#download-windows")).toHaveAttribute(
    "href",
    /v0\.7\.12.*windows-x64\.msi$/,
  );
  await page.getByRole("button", { name: "ARM64", exact: true }).click();
  await expect(page.locator("#download-windows")).toHaveAttribute(
    "href",
    /windows-arm64\.msi$/,
  );
  await expect(page.locator("#download-macos")).toHaveAttribute(
    "href",
    /macos-arm64\.dmg$/,
  );
  await expect(page.locator("#download-linux")).toHaveAttribute(
    "href",
    /linux-x64\.tar\.gz$/,
  );
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".intro-category")).toContainText(
    "A native desktop",
  );
  await expect(page.locator("#release-version")).toHaveText(
    "v0.7.12 · Release notes",
  );
  for (const link of await page.locator("[data-documentation]").all()) {
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/jstzwj/Muffin/blob/main/README.md",
    );
  }
  // English download copy must fit too; it is longer than the Chinese version.
  expect(
    await page.locator("#download").evaluate((footer) => {
      const heading = footer
        .querySelector(".download-heading")!
        .getBoundingClientRect();
      const platforms = footer
        .querySelector(".platform-grid")!
        .getBoundingClientRect();
      const architectures = footer
        .querySelector(".architecture-row")!
        .getBoundingClientRect();
      const releases = footer
        .querySelector(".release-links")!
        .getBoundingClientRect();
      return {
        headingsOverlap: heading.bottom > platforms.top,
        platformsOverlap: platforms.bottom > architectures.top,
        architecturesOverlap: architectures.bottom > releases.top,
        contentOverflows:
          releases.bottom > footer.getBoundingClientRect().bottom,
      };
    }),
  ).toEqual({
    headingsOverlap: false,
    platformsOverlap: false,
    architecturesOverlap: false,
    contentOverflows: false,
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "切换到简体中文" }).click();
  for (const link of await page.locator("[data-documentation]").all()) {
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/jstzwj/Muffin/blob/main/README.zh.md",
    );
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(screenshotRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("Muffin sidebar tabs, outline navigation and status controls work", async ({
  page,
}) => {
  await page.goto("/");
  const filesTab = page.getByRole("tab", { name: "Files", exact: true });
  const outlineTab = page.getByRole("tab", { name: "Outline", exact: true });
  await expect(filesTab).toHaveAttribute("aria-selected", "true");
  await filesTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(outlineTab).toBeFocused();
  await expect(outlineTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#demo-files")).toBeHidden();
  await page.locator('[data-document-heading="readme-build"]').click();
  expect(
    await page.locator(".window-document").evaluate((el) => el.scrollTop),
  ).toBeGreaterThan(100);
  await page
    .getByRole("button", { name: "Markdown source view", exact: true })
    .click();
  await expect(page.locator("#demo-source")).toBeVisible();
  await expect(page.locator('button[data-view="source"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Split view", exact: true }).click();
  await expect(page.locator("#demo-render")).toBeVisible();
  await expect(page.locator("#demo-source")).toBeVisible();
  await page
    .getByRole("button", { name: "Document view", exact: true })
    .click();
  await expect(page.locator(".window-sidebar")).toBeVisible();
  await filesTab.click();
  await expect(page.locator("#demo-files")).toBeVisible();
  await expect(page.locator("#demo-outline")).toBeHidden();
});

test("source line numbers, split panes and synchronized scrolling match the document", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('button[data-view="source"]').click();
  await expect(
    page.locator('.source-line[data-line="1"] .source-line-text'),
  ).toHaveText('<div align="center">');
  await expect(
    page.locator('.source-line[data-line="5"] .source-heading'),
  ).toHaveText("# Muffin");
  await expect(
    page.locator('.source-line[data-line="9"] .source-line-text'),
  ).toContainText("no typing lag.");
  const source = page.locator("#demo-source");
  const preview = page.locator(".window-document");
  await page.locator('button[data-view="split"]').click();
  await expect(page.locator(".source-pane .pane-header")).toHaveText(
    "Markdown source",
  );
  await expect(page.locator(".preview-pane .pane-header")).toContainText(
    "Read-only preview",
  );
  const sourceBox = (await source.boundingBox())!;
  const previewBox = (await preview.boundingBox())!;
  expect(sourceBox.x + sourceBox.width).toBeLessThanOrEqual(previewBox.x);
  expect(Math.abs(sourceBox.y - previewBox.y)).toBeLessThan(1);
  expect(sourceBox.width).toBeGreaterThan(130);
  expect(previewBox.width).toBeGreaterThan(130);

  // Scroll a real logical line to the top; the matching rendered heading follows,
  // regardless of how many visual rows the long source paragraphs occupy.
  await source.evaluate((viewport) => {
    const line = [
      ...viewport.querySelectorAll<HTMLElement>(".source-line"),
    ].find((row) => row.querySelector("code")?.textContent === "## Editor")!;
    viewport.scrollTop +=
      line.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
  });
  await expect
    .poll(() => preview.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(100);
  const distance = await preview.evaluate((el) =>
    Math.abs(
      el.querySelector("#readme-editor")!.getBoundingClientRect().top -
        el.getBoundingClientRect().top,
    ),
  );
  expect(distance).toBeLessThan(3);
  const position = await preview.evaluate((el) => el.scrollTop);
  await page
    .getByRole("button", { name: "Synchronized scrolling", exact: true })
    .click();
  await source.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(preview).toHaveJSProperty("scrollTop", position);
  await page
    .getByRole("button", { name: "Synchronized scrolling", exact: true })
    .click();
  await expect
    .poll(() => preview.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(position + 20);
  await preview.evaluate((el) => (el.scrollTop = 0));
  await expect
    .poll(() => source.evaluate((el) => el.scrollTop))
    .toBeLessThan(2);

  await source.evaluate((el) => (el.scrollTop = 400));
  await expect
    .poll(() => preview.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(20);
  await page.locator('button[data-view="render"]').click();
  expect(await preview.evaluate((el) => el.scrollTop)).toBeGreaterThan(20);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("section links and FAQ work on touch screens", async ({ page }) => {
  await page.goto("/");
  const headerLink = page.locator('.site-header a[href="#features"]');
  if (await headerLink.isVisible()) await headerLink.click();
  else await page.locator('.site-footer a[href="#features"]').click();
  await expect(page).toHaveURL(/#features$/);
  const question = page.locator(".questions-list details").nth(1);
  await question.locator("summary").click();
  await expect(question.locator("p")).toBeVisible();
  await expect(question.locator("p")).toContainText("Pandoc");
  await question.locator("summary").click();
  await expect(question.locator("p")).not.toBeVisible();
});

test("download menu exposes verified assets and closes with Escape or an outside click", async ({
  page,
}) => {
  await page.goto("/");
  const picker = page.locator(".download-picker");
  const toggle = picker.locator("summary");
  await toggle.click();
  await expect(picker).toHaveJSProperty("open", true);
  await expect(picker.locator('[data-download="macos"]')).toHaveAttribute(
    "href",
    /macos-arm64\.dmg$/,
  );
  await page.keyboard.press("Escape");
  await expect(picker).toHaveJSProperty("open", false);
  await expect(toggle).toBeFocused();
  await page.getByRole("button", { name: "ARM64", exact: true }).click();
  await toggle.click();
  await expect(picker.locator('[data-download="windows"]')).toHaveAttribute(
    "href",
    /windows-arm64\.msi$/,
  );
  await expect(picker.locator("[data-windows-architecture]")).toHaveText(
    "ARM64",
  );
  await page.locator("#hero-title").click();
  await expect(picker).toHaveJSProperty("open", false);
});

test("a newer release updates matching assets and missing platforms use the release page", async ({
  page,
}) => {
  await page.route("https://api.github.com/**", (route) =>
    route.fulfill({
      json: {
        tag_name: "v0.8.0",
        assets: [
          {
            name: "Muffin-0.8.0-windows-x64.msi",
            browser_download_url:
              "https://github.com/jstzwj/Muffin/releases/download/v0.8.0/Muffin-0.8.0-windows-x64.msi",
          },
        ],
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator("#download-windows")).toHaveAttribute(
    "href",
    /v0\.8\.0.*windows-x64\.msi$/,
  );
  await expect(page.locator("#release-version")).toHaveText(
    "v0.8.0 · 发行说明",
  );
  await expect(page.locator("#download-macos")).toHaveAttribute(
    "href",
    "https://github.com/jstzwj/Muffin/releases/latest",
  );
});

test("untrusted release links do not replace the bundled downloads", async ({
  page,
}) => {
  await page.route("https://api.github.com/**", (route) =>
    route.fulfill({
      json: {
        tag_name: "v0.8.0",
        assets: [
          {
            name: "windows-x64.msi",
            browser_download_url: "https://example.com/installer.msi",
          },
        ],
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator("#download-windows")).toHaveAttribute(
    "href",
    /v0\.7\.12.*windows-x64\.msi$/,
  );
});
