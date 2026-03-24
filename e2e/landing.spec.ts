import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Revenue Map/);
    await expect(page.locator("text=Know Your Revenue")).toBeVisible();
  });

  test("pricing section is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Plus")).toBeVisible();
    await expect(page.locator("text=Pro")).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Pricing");
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator("text=Simple, transparent pricing")).toBeVisible();
  });
});

test.describe("Pricing page", () => {
  test("shows 10-day free trial", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("text=10-day free trial").first()).toBeVisible();
  });

  test("billing toggle works", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("text=Save 20%")).toBeVisible();
    await page.click("text=Monthly");
    await expect(page.locator("text=Save 20%")).not.toBeVisible();
  });

  test("FAQ accordion opens", async ({ page }) => {
    await page.goto("/pricing");
    await page.click("text=Is there a free trial?");
    await expect(page.locator("text=10-day free trial")).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("shows custom 404 for unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await expect(page.locator("text=Page not found")).toBeVisible();
    await expect(page.locator("text=Go to Homepage")).toBeVisible();
  });

  test("404 homepage link works", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await page.click("text=Go to Homepage");
    await expect(page).toHaveURL("/");
  });
});

test.describe("Auth redirect", () => {
  test("dashboard redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/auth\/login|\/onboarding/);
  });

  test("plans page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/plans");
    await page.waitForURL(/\/auth\/login/);
  });
});
