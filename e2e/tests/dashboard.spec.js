import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    // Skip authenticated tests if no test credentials
    test.skip(({ browserName }) => !process.env.E2E_TEST_EMAIL, 'Skipping authenticated tests - no test credentials');

    test('should redirect unauthenticated users to login', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/login/);
    });

    test('should display navigation elements', async ({ page }) => {
        await page.goto('/');

        // Check for navbar
        const navbar = page.locator('nav, [role="navigation"]');
        await expect(navbar).toBeVisible();

        // Check for logo
        const logo = page.locator('img[alt*="logo" i], img[src*="logo" i]');
        if (await logo.count() > 0) {
            await expect(logo.first()).toBeVisible();
        }
    });

    test('should have accessible navigation', async ({ page }) => {
        await page.goto('/');

        // Check for main navigation landmark
        const mainNav = page.locator('[role="navigation"]');
        await expect(mainNav).toBeVisible();

        // Check aria-label exists
        const ariaLabel = await mainNav.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
    });

    test('should toggle dark mode', async ({ page }) => {
        await page.goto('/');

        // Find theme toggle button
        const themeButton = page.locator('button[aria-label*="tema" i], button[aria-label*="mode" i], button[aria-label*="dark" i], button[aria-label*="light" i]');

        if (await themeButton.count() > 0) {
            const buttonEl = themeButton.first();

            // Get initial state
            const htmlElement = page.locator('html');
            const initialDark = await htmlElement.evaluate(el => el.classList.contains('dark'));

            // Click toggle
            await buttonEl.click();

            // Verify state changed
            const newDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
            expect(newDark).not.toBe(initialDark);
        }
    });
});
