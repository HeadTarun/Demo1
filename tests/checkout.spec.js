// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * GhostRunner Demo — Checkout Flow Test
 *
 * REVISION A (initial):  #checkout-btn → "Checkout"   → PASSES ✅
 * REVISION B (drift):    button renamed to #place-order-btn "Place Order"
 *                        → this test FAILS on selector lookup ⚠️
 *                        → GhostRunner detects LOCATOR_DRIFT, self-heals
 * REVISION C (API bug):  button found, click succeeds, but /api/checkout → 500
 *                        → this test FAILS on assertion ❌
 *                        → GhostRunner classifies BACKEND_ERROR
 */

test.describe('Checkout Flow', () => {
  test('user can complete a purchase and see order confirmation', async ({ page }) => {
    // Step 1: Navigate to store homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Demo Store/);

    // Step 2: Verify product is visible
    await expect(page.getByText('Widget Pro')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();

    // Step 3: Click the checkout button
    // NOTE: In REVISION B this selector breaks — GhostRunner detects LOCATOR_DRIFT
    const checkoutBtn = page.locator('#checkout-btn');
    await expect(checkoutBtn).toBeVisible({ timeout: 5_000 });
    await checkoutBtn.click();

    // Step 4: Assert order confirmation is shown
    // NOTE: In REVISION C the API returns 500 — GhostRunner detects BACKEND_ERROR
    const statusDiv = page.locator('#status');
    await expect(statusDiv).toBeVisible({ timeout: 10_000 });
    await expect(statusDiv).toHaveClass(/success/);
    await expect(statusDiv).toContainText('Order confirmed');
  });

  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});
