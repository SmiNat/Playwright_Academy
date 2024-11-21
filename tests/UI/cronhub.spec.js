// @ts-check
const { test, expect } = require('@playwright/test');

test("SCENARIO: User should be able verify the translation from cron to user-friendly information", async ({ page }) => {
    await test.step("GIVEN: User has entered the crontab page", async () => {
        const URL = "https://crontab.cronhub.io/"
        await page.goto(URL);
        await expect(page).toHaveURL(String(URL));
        await expect(page.locator(".sc-iwsKbI.eYoEjn")).toContainText("Cronhub");
    });

    await test.step("WHEN: User enters a required schedule", async () => {
        // schedule: 10:15 AM, 1st day of the month
        await page.locator("[name='cronExpression']").fill("15 10 1 * *");
    });

    await test.step("THEN: User can observe translation from cron expression to normal one", async () => {
        let expectedMessage = "At 10:15 AM, on day 1 of the month";
        await expect(page.locator(".sc-gZMcBi.cERZRx")).toHaveText(expectedMessage);

    });
});
