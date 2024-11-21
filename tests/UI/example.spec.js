// @ts-check
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);  // anything before and anything afert is not relevant (we only want to check if that 'Playwright' is there)
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});


test('Navigate to Playwright API page and validate it got there', async ({ page }) => {
  await page.goto("https://playwright.dev/");
  await page.getByRole('link', { name: 'API', exact: true}).click();  // or
  // await page.getByRole('link', { name: 'API'}).nth(0).click();

  await expect(page.getByRole('heading', { name: 'Playwright Library' })).toBeVisible();  // or (alternative way)
  await expect(page).toHaveTitle(/Playwright Library/);  // or (alternative way)
  await expect(page).toHaveURL("https://playwright.dev/docs/api/class-playwright");  // or (alternative way)
  await expect(page).toHaveURL(/.*class-playwright/);
});


test("Navigate to 'locators' page after searching for the word 'locators' in the search field", async ({ page }) => {
    // hit the homepage
    // click search box
    // type locators (.fill())
    // mouse click on Locators (locator.press("Enter")) or enter (await page.keyboard.press("Enter"))
    // validate that we landed on the desired page (url / heading / page title)
  
    
    // Method 1
    await page.goto("https://playwright.dev/");

    const locatorSearch = page.getByRole('button', { name: 'Search', exact: true})
    await locatorSearch.click(); 
    await page.locator("#docsearch-input").fill("locators");
    await page.waitForLoadState("networkidle");
    // await page.locator("#docsearch-input").press("Enter");  // or
    await page.keyboard.press("Enter"); 

    await expect(page).toHaveTitle(/Locators/);

    // Method 2
    await page.goto("https://playwright.dev/");

    await page.getByLabel("Search").click();
    await page.getByPlaceholder("Search docs").fill("locators");
    await page.getByRole("link", {name: "Locators", exact: true}).click();

    await expect(page.getByRole("heading", {name: "Locators", exact: true})).toBeVisible();

});

