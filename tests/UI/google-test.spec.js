// @ts-check
const { test, expect } = require('@playwright/test');


test.skip("Google Playwright getting started - navigating", async ({ page }) => {
    await page.goto("https://www.google.com");
    // await page.getByRole("button", {name: "Odrzuć wszystko"}).click();  // or
    await page.locator("#W0wltc").click();

    await page.locator("#APjFqb").click();
    await page.locator("#APjFqb").fill("Playwright getting started");
    // await page.waitForLoadState("networkidle");
    await page.keyboard.press("Enter"); 

    await page.getByRole("heading", {name: /Getting started - Library | Playwright Python/}).click();
    await expect(page).toHaveTitle(/Getting started/);
    
    // await page.getByRole("heading", {name: /Installation | Playwright/}).click();
    // await expect(page).toHaveTitle(/Installation/);

});


