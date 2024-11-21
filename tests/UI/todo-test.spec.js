// @ts-check
const { test, expect } = require('@playwright/test');
const exp = require('constants');


// beforeEach

test.beforeEach(async ({ page }) => {
  await page.goto("https://todomvc.com/examples/react/dist/");
});


// tests

test("SCENARIO: A User is able to enter a multiple todos", async ({ page }) => {

  await test.step("GIVEN: User has opened the todomvc todos page", async () => {
    // await page.goto("https://todomvc.com/examples/react/dist/");  // page in test.beforeEach()
  });

  await test.step("WHEN: User types a new todos and submits it", async () => {
    // Different locators to target the 'needs to be done' input box;
    await page.getByTestId("text-input").fill("buy milk");
    await page.getByTestId("text-input").press("Enter");
    await page.getByPlaceholder("What needs to be done?").fill("buy coffee");
    await page.keyboard.press("Enter");
    await page.getByLabel("New Todo Input").fill("buy soap");
    await page.keyboard.press("Enter");
    await page.locator("[class='new-todo']").fill("buy TV");
    await page.keyboard.press("Enter");
    await page.locator("#todo-input").fill("buy towel");
    await page.keyboard.press("Enter");
    await page.locator("xpath=/html/body/section/header/div/input").fill("buy food");
    await page.keyboard.press("Enter");
    // await page.locator("input").fill("buy blanket");  // will not work if I added an item to the list (more than 1 input field)


    // all content of todos (as a list)
    const listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toContain("buy TV");
    expect(listTodos).not.toContain("buy HOUSE");
  });

  await test.step("THEN: User should see the new todo got added", async () => {
    await expect(page.locator("[data-testid='todo-item-label']").first()).toHaveText("buy milk");
    await expect(page.locator("[data-testid='todo-item-label']").nth(1)).toContainText("buy coffee");
  });

});


test("SCENARIO: User should be able to add a new todo.", async ({ page }) => {
  await test.step("GIVEN: User has opened the todomvc todos page", async () => {
    // await page.goto("https://todomvc.com/examples/react/dist/");  // page in beforeEach()
  });

  await test.step("WHEN: User types a new todo and submits it", async () => {
    await page.getByTestId("text-input").fill("buy milk");
    await page.getByTestId("text-input").press("Enter");
  });

  await test.step("THEN: User should see the new todo got added", async () => {
    await expect(page.locator("[data-testid='todo-item-label']").first()).toContainText("milk");
    await expect(page.getByTestId("todo-item-label")).toBeVisible();
  });
});


test("SCENARIO: User should be able to see the completed tasks when “Completed” filter is selected", async ({ page }) => {
  await test.step("GIVEN: User is on the todo page and has entered one todo that has been completed", async () => {
    await page.getByTestId("text-input").fill("feed the dog");
    await page.getByTestId("text-input").press("Enter");
    await expect(page.getByTestId("todo-item-label")).toBeVisible();
    await expect(page.getByTestId('todo-item-toggle')).not.toBeChecked();
    // await page.locator("[data-testid='todo-item-toggle']").click();  // or
    await page.getByTestId('todo-item-toggle').click();
    await expect(page.getByTestId('todo-item-toggle')).toBeChecked();

  });

  await test.step("WHEN: User selects the “Completed” filter from the menu", async () => {
    await page.getByRole("link", { name: "Completed" }).click();

  });

  await test.step("THEN: User is able to see the completed todo task.", async () => {
    await expect(page).toHaveURL("https://todomvc.com/examples/react/dist/#/completed");
    await expect(page.locator("[data-testid='todo-item-label']")).toContainText("feed the dog");

  });
});


test("SCENARIO: User should be able to filter between 'All', 'Active' and 'Completed' filters with desired results", async ({ page }) => {

  await test.step("GIVEN: User added 3 things on the list and selected 1 as completed", async () => {
    await page.getByTestId('text-input').fill("Item 1");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 2 - completed");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 3");
    await page.getByTestId('text-input').press("Enter");
    await page.locator('[data-testid="todo-item-toggle"]').nth(1).click();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(1)).toBeChecked();
  });

  // Scenario A - all completed
  await test.step("WHEN: User goes to Completed", async () => {
    await page.getByRole("link", { name: 'Completed' }).click();

  });
  await test.step("THEN: User sees 1 item", async () => {
    const listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toHaveLength(1);
    expect(listTodos).toContain("Item 2 - completed");
    expect(listTodos).not.toContain("Item 1");
  });

  // Scenario B - all active
  await test.step("WHEN: User goes to Active", async () => {
    await page.getByRole("link", { name: 'Active' }).click();
  });
  await test.step("THEN: User sees 2 items", async () => {
    const listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toHaveLength(2);
    expect(listTodos).not.toContain("Item 2 - completed");
    expect(listTodos).toContain("Item 1");
    expect(listTodos).toContain("Item 3");
    await expect(page.locator('[data-testid="todo-item-label"]').nth(0)).toContainText("Item 1")
    await expect(page.locator('[data-testid="todo-item-label"]').nth(1)).toContainText("Item 3")
  });

  // Scenario C - all items
  await test.step("WHEN: User goes to All", async () => {
    await page.getByRole("link", { name: 'All' }).click();
  });
  await test.step("THEN: User sees 3 items", async () => {
    await expect(page.locator('[data-testid="todo-item-label"]').nth(0)).toContainText("Item 1")
    await expect(page.locator('[data-testid="todo-item-label"]').nth(1)).toContainText("Item 2 - completed")
    await expect(page.locator('[data-testid="todo-item-label"]').nth(2)).toContainText("Item 3")
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(0)).not.toBeChecked();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(1)).toBeChecked();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(2)).not.toBeChecked();
    const listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toHaveLength(3);
  });
});


test("SCENARIO: User should be able to remove the completed todos", async ({ page }) => {
  await test.step("GIVEN: User added 3 things on the list and selected 2 as completed", async () => {
    await page.getByTestId('text-input').fill("Item 1");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 2 - completed");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 3 - completed");
    await page.getByTestId('text-input').press("Enter");
    await page.locator('[data-testid="todo-item-toggle"]').nth(1).click();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(1)).toBeChecked();
    await page.locator('[data-testid="todo-item-toggle"]').nth(2).click();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(2)).toBeChecked();
    let listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toHaveLength(3);
  });

  await test.step("WHEN: User clicks on 'Clear completed' button", async () => {
    await page.locator(".clear-completed").click();

  });
  await test.step("THEN: User don't see any completed taska on the list", async () => {
    let listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toHaveLength(1);
    expect(listTodos).toContain("Item 1");
  })

});

test("SCENARIO: User should be able to toggle multiple tasks as completed from complete all toggle", async ({ page }) => {
  await test.step("GIVEN: User added 4 things on the list", async () => {
    await page.getByTestId('text-input').fill("Item 1");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 2 - completed");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 3 - completed");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 4 - completed");
    await page.getByTestId('text-input').press("Enter");
  });

  await test.step("WHEN: User clicks on 'toggle' button", async () => {
    await page.getByTestId("toggle-all").click();
  });

  await test.step("THEN: User can see all tasks as completed ", async () => {
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(0)).toBeChecked();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(1)).toBeChecked();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(2)).toBeChecked();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(3)).toBeChecked();
  });

});


test("SCENARIO: User should be able to remove an added todo with x icon", async ({ page }) => {
  await test.step("GIVEN: User added 3 things on the list and selected 2 as completed", async () => {
    await page.getByTestId('text-input').fill("Item 1");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 2 - completed");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 3 - completed");
    await page.getByTestId('text-input').press("Enter");
    await page.locator('[data-testid="todo-item-toggle"]').nth(1).click();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(1)).toBeChecked();
    await page.locator('[data-testid="todo-item-toggle"]').nth(2).click();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(2)).toBeChecked();
    let listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toHaveLength(3);
    expect(listTodos).toContain("Item 2 - completed");

  });

  await test.step("WHEN: User clicks on the 'x' button for the completed task named 'Item 2 - completed'", async () => {
    await page.locator('[data-testid="todo-item-label"]').nth(1).hover();
    await page.locator('[data-testid="todo-item-button"]').nth(1).click();  //NOTE: this is taking a long time without hovering first
  });

  await test.step("THEN: The completed task is removed from the list", async () => {
    let listTodos = await page.locator("[data-testid='todo-item-label']").allTextContents();
    console.log(listTodos);
    expect(listTodos).toHaveLength(2);
    expect(listTodos).not.toContain("Item 2 - completed");
  });
});



test("SCENARIO: User should be able to uncheck a completed todo item from todo list that has multiple items", async ({ page }) => {
  await test.step("GIVEN: User added 4 things on the list and selected 3 as completed", async () => {
    await page.getByTestId('text-input').fill("Item 1");
    await page.getByTestId('text-input').press("Enter");
    await page.getByTestId('text-input').fill("Item 2 - completed");
    await page.getByTestId('text-input').press("Enter");
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(0)).not.toBeChecked();
    await page.locator('[data-testid="todo-item-toggle"]').nth(1).click();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(1)).toBeChecked();
  });

  await test.step("WHEN: User uncheckes the completed tasks", async () => {
    await page.locator('[data-testid="todo-item-toggle"]').nth(1).click();
  });

  await test.step("THEN: User can see all tasks are not checked", async () => {
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(0)).not.toBeChecked();
    await expect(page.locator('[data-testid="todo-item-toggle"]').nth(1)).not.toBeChecked();
  });
});



test("SCENARIO: User should be able to edit existing todo item and change the name to a new one", async ({ page }) => {
  await test.step("GIVEN: User has created a todo task", async () => {
    await page.getByTestId('text-input').fill("Item 1");
    await page.getByTestId('text-input').press("Enter");
    await expect(page.locator('[data-testid="todo-item-label"]').first()).toHaveText("Item 1")
  });

  await test.step("WHEN: User double click on the created task", async () => {
    await page.locator('[data-testid="todo-item-label"]').first().dblclick();
  });

  await test.step("THEN: User can change the text of the created todo task", async () => {
    await page.getByTestId('todo-item').getByTestId('text-input').fill("Item UPDATED");
    await page.getByTestId('todo-item').getByTestId('text-input').press("Enter");
    await expect(page.locator('[data-testid="todo-item-label"]').first()).toHaveText("Item UPDATED")
  });
});







