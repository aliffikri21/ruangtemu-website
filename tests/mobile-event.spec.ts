import { test, expect } from "@playwright/test";

test.describe("Mobile Event Flow Smoke Test", () => {
  test("Landing page loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/RUANGTEMU/i);
    const heroTitle = page.locator("h1");
    await expect(heroTitle).toBeVisible();
  });

  test("Event page loads for Jaya & Rika wedding and starts guest flow", async ({ page }) => {
    await page.goto("/event/jayarika-wedding");
    
    // Verify main CTA button is visible on mobile
    const startButton = page.locator("text=Tambahkan Momen Anda");
    await expect(startButton).toBeVisible({ timeout: 10000 });

    // Click 'Tambahkan Momen Anda' to enter photobooth flow
    await startButton.click();

    // Verify next step (Name input or Frame selection)
    const nextStepIndicator = page.locator("input, button").filter({ hasText: /Lanjut|Pilih Frame|Nama/i });
    await expect(nextStepIndicator.first()).toBeVisible({ timeout: 5000 });
  });
});
