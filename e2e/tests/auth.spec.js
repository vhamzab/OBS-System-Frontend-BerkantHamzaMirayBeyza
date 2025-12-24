import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display login page for unauthenticated users', async ({ page }) => {
        await page.goto('/login');

        // Check login form is visible
        await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();

        // Check login button exists
        await expect(page.getByRole('button', { name: /giriş|login/i })).toBeVisible();
    });

    test('should show validation errors for empty login form', async ({ page }) => {
        await page.goto('/login');

        // Try to submit empty form
        await page.getByRole('button', { name: /giriş|login/i }).click();

        // Should show validation errors or the button should be disabled
        const hasErrors = await page.locator('.text-red-500, .error, [role="alert"]').count() > 0;
        const buttonDisabled = await page.getByRole('button', { name: /giriş|login/i }).isDisabled();

        expect(hasErrors || buttonDisabled).toBeTruthy();
    });

    test('should navigate to register page', async ({ page }) => {
        await page.goto('/login');

        // Click register link
        const registerLink = page.getByRole('link', { name: /kayıt|register|hesap oluştur/i });
        if (await registerLink.isVisible()) {
            await registerLink.click();
            await expect(page).toHaveURL(/register/);
        }
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await page.goto('/login');

        // Click forgot password link
        const forgotLink = page.getByRole('link', { name: /şifre|forgot|unuttum/i });
        if (await forgotLink.isVisible()) {
            await forgotLink.click();
            await expect(page).toHaveURL(/forgot/);
        }
    });

    test('register page should have required form fields', async ({ page }) => {
        await page.goto('/register');

        // Check registration form fields
        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });
});
