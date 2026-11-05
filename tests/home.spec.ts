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

test("real product views, bilingual copy and downloads work with the production CSP", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("ERR_FAILED"))
      errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("#hero-title")).toContainText("Markdown 编辑器");
  for (const view of ["source", "night", "render"]) {
    await page.locator(`button[data-view="${view}"]`).click();
    await expect(page.locator("#editor-screen")).toHaveAttribute(
      "data-view",
      view,
    );
    await expect(page.locator("#editor-image")).toHaveAttribute(
      "src",
      `/screens/${view}.webp`,
    );
    await expect(page.locator(`button[data-view="${view}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect
      .poll(() =>
        page
          .locator("#editor-image")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBeTruthy();
  }
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
  const menu = page.locator(".nav__toggle");
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#hero-title")).toContainText("A native desktop");
  await expect(page.locator("#release-version")).toHaveText(
    "v0.7.12 · Release notes",
  );
  // English download copy must fit too; it is longer than the Chinese version.
  expect(
    await page.locator("#download").evaluate((footer) => {
      const action = footer
        .querySelector(".closing__cta > .btn")!
        .getBoundingClientRect();
      const platforms = footer
        .querySelector(".platform-grid")!
        .getBoundingClientRect();
      const legal = footer
        .querySelector(".footer__legal")!
        .getBoundingClientRect();
      return {
        actionOverlapsPlatforms: action.bottom > platforms.top,
        overlap: Math.round(Math.max(0, action.bottom - platforms.top)),
        legalOverflowsFooter:
          legal.bottom > footer.getBoundingClientRect().bottom,
      };
    }),
  ).toEqual({
    actionOverlapsPlatforms: false,
    legalOverflowsFooter: false,
    overlap: 0,
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "切换到简体中文" }).click();
  if (await menu.isVisible()) await menu.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  // Every lazy screenshot must load when brought into view.
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0,
        ),
      )
      .toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test("navigation links remain usable on touch screens", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator(".nav__toggle");
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page
      .locator('.nav__links > .nav__item > a[href="#questions"]')
      .click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("body")).not.toHaveClass(/nav-locked/);
  } else {
    await page
      .locator('.nav__links > .nav__item > a[href="#questions"]')
      .click();
  }
  await expect(page).toHaveURL(/#questions$/);
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
