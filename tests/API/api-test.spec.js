// @ts-check
const { test, expect } = require('@playwright/test');
const exp = require('constants');


const randomString = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};


test.describe('API testing', () => {
    const baseURL = "https://simple-grocery-store-api.glitch.me"
    const globalProductID = 4643
    const globalCartID = "X4atdf9C2gl0xr56zIZJN"  // can be created @https://simple-grocery-store-api.glitch.me/carts
    let token;

    let allProductIds = async (request) => {
        var response = await request.get(baseURL + "/products");
        var responseBody = await response.json();
        // console.log(responseBody)

        expect(response.status()).toBe(200);

        var productIds = [];
        for (var element of responseBody) {
            productIds.push(element.id);
        };

        if (productIds.length === 0) {
            throw new Error("Something went wrong - API response show no products available!")
        }

        // console.log(productIds);
        return productIds
    }

    test('Validate endpoint response status is successful', async ({ request }) => {
        var responseMain = await request.get(baseURL);
        expect(responseMain.status()).toBe(200);
        console.log(responseMain.status());
        var responseStatus = await request.get(baseURL + "/status");
        expect(responseStatus.status()).toBe(200);

        await allProductIds(request);
    });

    test('Validate endpoint is invalid', async ({ request }) => {
        var response = await request.get(baseURL + "/status1");
        expect(response.status()).toBe(404);
    });

    test('Validate the response body', async ({ request }) => {
        var response = await request.get(baseURL + "/status");
        expect(response.status()).toBe(200);

        // extracting body in JSON format
        var responseBody = JSON.parse(await response.text());
        console.log(responseBody);
        // or
        var responseBody2 = await response.json();
        console.log(responseBody2);

        expect(responseBody.status).toBe("UP");
    });

    test('Validate the single product response body', async ({ request }) => {
        var response = await request.get(`${baseURL}/products/${globalProductID}`);
        expect(response.status()).toBe(200);
        var responseBody = JSON.parse(await response.text());
        console.log(responseBody);

        expect(responseBody.id).toBe(4643);
        expect(responseBody.category).toBe("coffee");
        expect(responseBody.name).toContain("Starbucks");
        expect(responseBody.manufacturer).not.toBeNull();
        expect(responseBody.price).toBeGreaterThan(40);
        expect(responseBody["current-stock"]).toBe(14);
        expect(responseBody.inStock).toBeTruthy();
    });

    test('Add new product to the cart', async ({ request }) => {
        // NOTE: the cart cannot have the given product before adding new one

        var response = await request.post(`${baseURL}/carts/${globalCartID}/items`, {
            data: {
                productId: 8739,
            }
        });
        var responseBody = JSON.parse(await response.text());
        console.log(responseBody);

        expect(response.status()).toBe(201);

        expect(responseBody.created).toBeTruthy();
        expect(responseBody.itemId).not.toBeNull();


        // deleting added product
        let item = responseBody.itemId;

        await test.step("STEP 5: deleting a product from a cart", async () => {
            var response = await request.delete(`${baseURL}/carts/${globalCartID}/items/${item}`);

            expect(response.status()).toBe(204);
        });

    });

    test('SCENARIO: Adding a new product to the cart and deleting it', async ({ request }) => {
        let productID; // to be declared within test steps
        let itemID;  // to be declared within test steps
        let cartLength; // (number of products in a cart) to be declared within test steps

        // NOTE: if a product is already in the cart, it cannot be added again
        // User needs to choose a product with different ID
        await test.step("STEP 0: choosing a product ID to add to the cart", async () => {
            // getting the list of all products added to the cart
            var response = await request.get(`${baseURL}/carts/${globalCartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Cart items:", responseBody);

            expect(response.status()).toBe(200);

            // checking which product id is available to add to the cart
            var productIds = await allProductIds(request);  // list of all available product ids
            var productsIdsOnTheCart = [];  // list of all product ids already added to the cart

            if (responseBody != false) {
                for (var element of responseBody) {
                    productsIdsOnTheCart.push(element.productId);
                };
            };

            console.log("✅ AVAILABLE PRODUCTS - FULL ID LIST:", productIds);
            console.log("✅ PRODUCTS ON THE CART - LIST:", productsIdsOnTheCart);

            if (productsIdsOnTheCart.length !== 0) {
                for (var element of productIds) {
                    if (productsIdsOnTheCart.includes(element)) {
                        continue
                    }
                    else {
                        productID = element;
                        break
                    };
                };
            }
            else {
                productID = productIds[0];
            }

            if (productID === undefined) {
                throw new Error("All available products are already on the cart")
            }

            console.log("☑️ Product id that will be added to the cart:", productID);
        });

        await test.step("STEP 1: adding a product to a cart", async () => {
            var response = await request.post(`${baseURL}/carts/${globalCartID}/items`, {
                data: {
                    productId: productID
                }
            });
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Adding product to a cart:", responseBody);

            expect(response.status()).toBe(201);

            expect(responseBody.created).toBeTruthy();
            expect(responseBody.itemId).not.toBeNull();

            itemID = responseBody.itemId;
            // console.log("ItemId:", itemID)
        });

        await test.step("STEP 2: validating the cart has added product", async () => {
            var response = await request.get(`${baseURL}/carts/${globalCartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart has one product:", responseBody);

            expect(responseBody.length).toBeGreaterThan(0);
            expect(responseBody[responseBody.length - 1].id).toBe(itemID);
            expect(responseBody[responseBody.length - 1].productId).toBe(productID);
            expect(responseBody[responseBody.length - 1].quantity).toBe(1);

            cartLength = responseBody.length  // saving number of products in a cart
        });

        await test.step("STEP 3: deleting a product from a cart", async () => {
            var response = await request.delete(`${baseURL}/carts/${globalCartID}/items/${itemID}`);

            expect(response.status()).toBe(204);
        });

        await test.step("STEP 4: validating the product is no longer on the cart", async () => {
            var response = await request.get(`${baseURL}/carts/${globalCartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart is empty:", responseBody);

            if (cartLength === 1) {
                expect(responseBody).toHaveLength(0);
            }
            else {
                expect(responseBody[responseBody.length - 1].id).not.toBe(itemID);
                expect(responseBody[responseBody.length - 1].productId).not.toBe(productID);
            }
        });
    });

    test('SCENARIO: Creating a new cart, adding a new product to the cart and deleting it', async ({ request }) => {
        let cartID;  // to be declared within test steps
        let itemID;  // to be declared within test steps

        await test.step("STEP 1: creating a new cart", async () => {
            var response = await request.post(baseURL + "/carts");
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Creating a cart:", responseBody);

            expect(response.status()).toBe(201);

            expect(responseBody.created).toBeTruthy();
            expect(responseBody.cartId).not.toBeNull();

            cartID = responseBody.cartId;
            // console.log("CartId:", cartID)
        });

        await test.step("STEP 2: validating the cart is empty", async () => {
            var response = await request.get(`${baseURL}/carts/${cartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart is empty:", responseBody);

            expect(responseBody).toHaveLength(0);
        });

        await test.step("STEP 3: adding a product to a cart", async () => {
            var response = await request.post(`${baseURL}/carts/${cartID}/items`, {
                data: {
                    productId: globalProductID
                }
            });
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Adding product to a cart:", responseBody);

            expect(response.status()).toBe(201);

            expect(responseBody.created).toBeTruthy();
            expect(responseBody.itemId).not.toBeNull();

            itemID = responseBody.itemId;
            // console.log("ItemId:", itemID)
        });

        await test.step("STEP 4: validating the cart has one product", async () => {
            var response = await request.get(`${baseURL}/carts/${cartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart has one product:", responseBody);

            expect(responseBody).toHaveLength(1);
            expect(responseBody[0].id).toBe(itemID);
            expect(responseBody[0].productId).toBe(globalProductID);
            expect(responseBody[0].quantity).toBe(1);
        });

        await test.step("STEP 5: deleting a product from a cart", async () => {
            var response = await request.delete(`${baseURL}/carts/${cartID}/items/${itemID}`);

            expect(response.status()).toBe(204);
        });

        await test.step("STEP 6: validating the cart is empty", async () => {
            var response = await request.get(`${baseURL}/carts/${cartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart is empty:", responseBody);

            expect(responseBody).toHaveLength(0);
        });
    });


    test('SCENARIO: Create a cart, add 2 items and replace one of them', async ({ request }) => {
        let cartID;  // to be declared within test steps
        let productIds = await allProductIds(request);
        let itemIds = [];

        console.log("☑️ All product IDs:", productIds);

        await test.step("STEP 1: creating a new cart", async () => {
            var response = await request.post(baseURL + "/carts");
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Creating a cart:", responseBody);

            expect(response.status()).toBe(201);

            expect(responseBody.created).toBeTruthy();
            expect(responseBody.cartId).not.toBeNull();

            cartID = responseBody.cartId;
            // console.log("CartId:", cartID)
        });

        await test.step("STEP 2: validating the cart is empty", async () => {
            var response = await request.get(`${baseURL}/carts/${cartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart is empty:", responseBody);

            expect(responseBody).toHaveLength(0);
        });

        await test.step("STEP 3: adding 2 products to a cart", async () => {
            let productsToAdd = [productIds[0], productIds[1]];
            console.log("☑️ PRODUCTS:", productsToAdd);

            for (var product of productsToAdd) {
                console.log("☑️ Single product:", product);

                var response = await request.post(`${baseURL}/carts/${cartID}/items`, {
                    data: {
                        productId: product
                    }
                });
                var responseBody = JSON.parse(await response.text());
                console.log("➡️ Adding product to a cart:", responseBody);

                expect(response.status()).toBe(201);

                expect(responseBody.created).toBeTruthy();
                expect(responseBody.itemId).not.toBeNull();

                itemIds.push(responseBody.itemId);
            };
            expect(itemIds.length).toBe(2);
        });

        await test.step("STEP 4: validating the cart has two products", async () => {
            var response = await request.get(`${baseURL}/carts/${cartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart has two products:", responseBody);

            expect(responseBody).toHaveLength(2);
            expect(responseBody[0].productId).toBe(productIds[0]);
            expect(responseBody[1].productId).toBe(productIds[1]);
        });

        await test.step("STEP 5: replacing a product in a cart", async () => {
            let newProductId = [productIds[2]];  // replacing second product (itemIDs[1]) with new product

            console.log("☑️ New product ID:", newProductId);
            console.log("☑️ Item ID:", itemIds[1]);

            var response = await request.put(`${baseURL}/carts/${cartID}/items/${itemIds[1]}`, {
                data: {
                    productId: newProductId,
                }
            }
            );

            expect(response.status()).toBe(204);
        });

        await test.step("STEP 6: validating the cart has two products - one old and one new", async () => {
            var response = await request.get(`${baseURL}/carts/${cartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart has two products:", responseBody);

            expect(responseBody).toHaveLength(2);
            expect(responseBody[0].productId).toBe(productIds[0]);
            expect(responseBody[1].productId).not.toBe(productIds[1]);

            itemIds.push(responseBody[1].id);  // itemsIds[2]
        });

        await test.step("STEP 7: deleting a product from a cart", async () => {
            let itemToDelete = [itemIds[0], itemIds[2]];
            for (let item of itemToDelete) {
                var response = await request.delete(`${baseURL}/carts/${cartID}/items/${item}`);
                expect(response.status()).toBe(204);
            }
        });

        await test.step("STEP 8: validating the cart is empty", async () => {
            var response = await request.get(`${baseURL}/carts/${cartID}/items`);
            var responseBody = JSON.parse(await response.text());
            console.log("➡️ Validating the cart is empty:", responseBody);

            expect(responseBody).toHaveLength(0);
        });
    });

    test('Create a user account and extract token', async ({ request }) => {
        // generate random email address
        let name = randomString(7);
        let email = name + "@example.com"

        // calling the endpoint
        var response = await request.post(baseURL + "/api-clients", {
            data: {
                "clientName": "Nat Smi",
                "clientEmail": email
            }
        });

        var responseBody = await response.json();
        console.log("🛑  TOKEN:\n", responseBody);

        expect(response.status()).toBe(201);
        expect(responseBody.accessToken).not.toBeNull();

        token = responseBody.accessToken;
        // process.env.TOKEN = token;
    });

    test('GET the list of orders with token', async ({ request }) => {
        // const token = process.env.TOKEN; // Retrieve token from environment variable
        console.log("🛑  TOKEN:", token);

        var response = await request.get(baseURL + "/orders",
            {
                headers: { "Authorization": "fb1d6e8844e279d820c3549fd48532a341855c084d12470b856a10dd2e71b804" }
                // headers: { "Authorization": "Bearer " + String(token) }
            }
        );
        var responseBody = await response.json();
        console.log("➡️ List of orders:", responseBody);
        expect(response.status()).toBe(200);

    });

});
