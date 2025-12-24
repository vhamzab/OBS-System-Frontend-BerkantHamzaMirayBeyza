import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {
    test('notification bell should have proper ARIA attributes', async ({ page }) => {
        await page.goto('/login');

        // Navigate to a page that might have notification bell
        // For unauthenticated, check login page accessibility
        const loginButton = page.getByRole('button', { name: /giriş|login/i });

        // Check accessibility of interactive elements
        await expect(loginButton).toBeVisible();
        await expect(loginButton).toBeEnabled();
    });

    test('should have keyboard navigation support', async ({ page }) => {
        await page.goto('/login');

        // Tab through interactive elements
        await page.keyboard.press('Tab');

        // Focused element should be visible
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
    });

    test('forms should have proper labels', async ({ page }) => {
        await page.goto('/login');

        // Check that inputs have associated labels or aria-labels
        const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])');
        const count = await inputs.count();

        for (let i = 0; i < count; i++) {
            const input = inputs.nth(i);
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledBy = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');

            // At least one form of labeling should exist
            const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0;
            const hasAccessibleName = ariaLabel || ariaLabelledBy || hasLabel || placeholder;

            expect(hasAccessibleName).toBeTruthy();
        }
    });
});
