import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const csp = readFileSync("public/_headers", "utf8")
  .split("\n")
  .find((line) => line.includes("Content-Security-Policy:"))!
  .split("Content-Security-Policy:")[1]
  .trim();

test.beforeEach(async ({ page }) => {
  // Apply the same CSP as Cloudflare Pages while testing the built static site.
  await page.route("http://127.0.0.1:4173/**", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp },
    });
  });
  // Deterministic offline fallback, also covering GitHub rate limits and network errors.
  await page.route("https://api.github.com/**", (route) => route.abort());
});

test("page, languages, themes, and downloads work at each screen size", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("ERR_FAILED"))
      errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("#hero-title")).toContainText("自然成文");
  await expect(page.locator("#markdown-preview h1")).toHaveText(
    "好想法，值得被写下来。",
  );
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
  await page
    .getByRole("button", { name: "Night", exact: true })
    .first()
    .click();
  await expect(page.locator("#editor-window")).toHaveAttribute(
    "data-theme",
    "night",
  );
  await page.getByRole("button", { name: "Pixyll", exact: true }).click();
  await expect(page.locator("#theme-paper")).toHaveAttribute(
    "data-theme",
    "pixyll",
  );
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#hero-title")).toContainText("A little space.");
  await expect(page.locator("#markdown-preview h1")).toHaveText(
    "Good ideas deserve a page.",
  );
  await expect(page.locator("#release-version")).toHaveText(
    "v0.7.12 · Release notes",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "切换到简体中文" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("Markdown edits survive mode changes and unsafe markup is removed", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Markdown", exact: true }).click();
  const input = page.getByRole("textbox", { name: "编辑 Markdown" });
  await input.fill(
    '# 我的第一句\n\n**灵感**来了。\n\n<script>window.hacked=true</script>\n<img src=x onerror="window.hacked=true">\n\n[不安全链接](javascript:alert(1))\n\n[文档](https://example.com)',
  );
  await page.getByRole("button", { name: "预览", exact: true }).click();
  await expect(page.locator("#markdown-preview h1")).toHaveText("我的第一句");
  await expect(page.locator("#markdown-preview strong")).toHaveText("灵感");
  await expect(
    page.locator("#markdown-preview script, #markdown-preview img"),
  ).toHaveCount(0);
  expect(await page.evaluate(() => "hacked" in window)).toBeFalsy();
  await expect(page.locator("#markdown-preview a").first()).not.toHaveAttribute(
    "href",
  );
  await expect(page.locator("#markdown-preview a").last()).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  await page.getByRole("button", { name: "Markdown", exact: true }).click();
  await expect(input).toHaveValue(/# 我的第一句/);
  if (await page.locator("#mobile-sample").isVisible()) {
    await page.locator("#mobile-sample").selectOption("notes");
    await expect(input).toHaveValue(/# 项目笔记/);
    await page.locator("#mobile-sample").selectOption("welcome");
  } else {
    await page.locator('[data-sample="notes"]').click();
    await expect(input).toHaveValue(/# 项目笔记/);
    await page.locator('[data-sample="welcome"]').click();
  }
  await expect(input).toHaveValue(/# 我的第一句/);
});

test("a newer GitHub release updates the matching platform assets", async ({
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
