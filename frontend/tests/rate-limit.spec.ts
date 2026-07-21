import { test, expect } from '@playwright/test';

test.describe('Rate Limiting E2E', () => {

  test('Admin Login should be rate limited after 5 failed attempts', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');

    const usernameInput = page.locator('#admin-username');
    const passwordInput = page.locator('#admin-password');
    const loginButton = page.locator('#admin-login-btn');

    // Attempt 5 failed logins
    for (let i = 0; i < 5; i++) {
      await usernameInput.fill('admin_test_e2e');
      await passwordInput.fill(`wrong_pass_${i}`);
      await loginButton.click();
      
      // Wait for the error message to appear before trying again
      await expect(page.locator('div[role="alert"]')).toBeVisible();
    }

    // 6th attempt should trigger rate limit message
    await usernameInput.fill('admin_test_e2e');
    await passwordInput.fill('wrong_pass_6');
    await loginButton.click();

    await expect(page.locator('div[role="alert"]')).toContainText(/tạm khóa/i);
  });

  test('Staff Login should be rate limited after 5 failed attempts', async ({ page }) => {
    await page.goto('http://localhost:5173/staff');

    const staffCodeInput = page.getByPlaceholder('VD: NV01');
    const pinInput = page.getByPlaceholder('••••••');
    const loginButton = page.getByRole('button', { name: /đăng nhập/i });

    // Attempt 5 failed logins
    for (let i = 1; i <= 5; i++) {
      await staffCodeInput.fill('NV9999');
      await pinInput.fill('123456');
      await loginButton.click();
      
      // Wait for the error message to appear
      await expect(page.locator('div[role="alert"]')).toBeVisible();
    }

    // On the 5th attempt, the button should become disabled and show lockout message
    await expect(loginButton).toBeDisabled();
    await expect(page.locator('div[role="alert"]')).toContainText(/tạm khóa|quá 5 lần/i);
  });

});
