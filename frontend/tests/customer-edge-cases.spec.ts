import { test, expect } from '@playwright/test';

test.describe('Customer Edge Cases E2E', () => {

  // MEN-01 Edge Cases
  test('TC04: Truy cập không có mã bàn', async ({ page }) => {
    // Không truyền query param ?table=
    await page.goto('http://localhost:5173/');
    
    // Kiểm tra logo/title
    await expect(page.locator('h1').filter({ hasText: 'Tiệm Cafe Góc Nhỏ' })).toBeVisible();
    
    // Kì vọng không thấy mã bàn nào hiển thị (vì chưa quét mã bàn)
    // Hoặc ứng dụng sẽ có thông báo yêu cầu chọn bàn (nếu có tính năng này).
    // Hiện tại ứng dụng chỉ đơn giản là không hiển thị mã bàn.
    await expect(page.getByText(/Bàn B/)).not.toBeVisible();
  });

  // TCH-01 Edge Cases
  test('TC11: Hủy modal tùy chỉnh món không thêm vào giỏ', async ({ page }) => {
    await page.goto('http://localhost:5173/?table=B01');
    
    // Đợi menu load
    await expect(page.locator('h1').filter({ hasText: 'Tiệm Cafe Góc Nhỏ' })).toBeVisible();

    // Mở modal thêm món đầu tiên
    const firstProductAddBtn = page.locator('article button[aria-label^="Thêm"]').first();
    await expect(firstProductAddBtn).toBeVisible();
    await firstProductAddBtn.click();

    // Popup CustomizeModal hiện lên
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Nhấn ra ngoài modal hoặc nút X để đóng (Giả sử nhấn backdrop)
    // Nhấn escape để đóng
    await page.keyboard.press('Escape');

    // Xác nhận Modal đã đóng
    await expect(modal).not.toBeVisible();

    // Xác nhận giỏ hàng không có item nào (badge không xuất hiện)
    const cartBadge = page.locator('a[aria-label="Giỏ hàng"] span');
    await expect(cartBadge).not.toBeVisible();
  });

  // GIH-01 Edge Cases
  test('TC16 & TC17: Quản lý giỏ hàng trống và xóa món', async ({ page }) => {
    await page.goto('http://localhost:5173/?table=B01');

    // 1. Kiểm tra giỏ hàng rỗng (TC16)
    const cartLink = page.locator('a[aria-label="Giỏ hàng"]');
    await cartLink.click();
    await expect(page).toHaveURL(/.*\/cart/);

    // Kì vọng thấy thông báo giỏ hàng trống và nút Đặt món bị disabled
    await expect(page.getByText('Giỏ hàng trống')).toBeVisible();
    
    const placeOrderBtn = page.getByRole('button', { name: /đặt món/i });
    // Nếu nút không tồn tại hoặc bị disable đều hợp lệ
    const isBtnVisible = await placeOrderBtn.isVisible();
    if (isBtnVisible) {
      await expect(placeOrderBtn).toBeDisabled();
    }

    // 2. Thêm món vào giỏ để test giảm số lượng (TC17)
    await page.goto('http://localhost:5173/?table=B01');
    
    // Mở modal thêm món đầu tiên
    const firstProductAddBtn = page.locator('article button[aria-label^="Thêm"]').first();
    await expect(firstProductAddBtn).toBeVisible();
    await firstProductAddBtn.click();

    // Bấm nút Thêm vào giỏ
    const modal = page.locator('div[role="dialog"]');
    const addToCartBtn = modal.getByRole('button', { name: /Thêm vào giỏ/i });
    await addToCartBtn.click();

    // Vào lại giỏ hàng
    await cartLink.click();
    
    // Kiểm tra nút xóa món
    const deleteBtn = page.locator('button[aria-label^="Xóa"]').first();
    await expect(deleteBtn).toBeVisible();
    
    // Bấm xóa món
    await deleteBtn.click();

    // Kì vọng món đã biến mất và giỏ hàng lại trống
    await expect(page.getByText('Giỏ hàng trống')).toBeVisible();
  });

  // THA-01 Edge Cases
  test('TC21: Tải lại trang (F5) khi đang ở màn hình checkout', async ({ page }) => {
    // Flow từ đầu: thêm vào giỏ -> đặt món -> checkout
    await page.goto('http://localhost:5173/?table=B01');
    
    const firstProductAddBtn = page.locator('article button[aria-label^="Thêm"]').first();
    await firstProductAddBtn.click();
    
    const modal = page.locator('div[role="dialog"]');
    const addToCartBtn = modal.getByRole('button', { name: /Thêm vào giỏ/i });
    await addToCartBtn.click();

    const cartLink = page.locator('a[aria-label="Giỏ hàng"]');
    await cartLink.click();

    const placeOrderBtn = page.getByRole('button', { name: /đặt món/i });
    await placeOrderBtn.click();

    // Đang ở trang checkout
    await expect(page).toHaveURL(/.*\/checkout\/.+/);
    const checkoutUrl = page.url();

    // Load mã QR
    const vietqrBtn = page.getByRole('button', { name: /chuyển khoản \(vietqr\)/i });
    await vietqrBtn.click();

    const qrImage = page.locator('img[alt="VietQR Code"]');
    await expect(qrImage).toBeVisible();

    // F5 tải lại trang
    await page.reload();

    // Kì vọng vẫn ở trang checkout đó và vẫn có thể thao tác
    await expect(page).toHaveURL(checkoutUrl);
    await expect(page.locator('h1').filter({ hasText: 'Thanh toán' })).toBeVisible();
    
    // Mở lại VietQR (do có thể state thanh toán không giữ modal đang mở)
    await page.getByRole('button', { name: /chuyển khoản \(vietqr\)/i }).click();
    await expect(page.locator('img[alt="VietQR Code"]')).toBeVisible();
  });

});
