import { test, expect } from '@playwright/test';

test.describe('Customer E2E Journey', () => {

  test('MEN-01 to THA-01: Full order flow via VietQR', async ({ page }) => {
    // 1. MEN-01: Xem menu và danh mục món
    // Truy cập bằng URL có table=B01 để giả lập việc quét QR tại bàn
    await page.goto('http://localhost:5173/?table=B01');
    
    // Kiểm tra logo/title tiệm hiển thị (xác nhận trang đã load xong)
    await expect(page.locator('h1').filter({ hasText: 'Tiệm Cafe Góc Nhỏ' })).toBeVisible();
    
    // Kiểm tra tab bàn B01 được lưu
    await expect(page.getByText('Bàn B01')).toBeVisible();

    // 2. TCH-01: Tùy chỉnh món
    // Lấy nút "Thêm vào giỏ hàng" của món đầu tiên (nằm trong thẻ article)
    const firstProductAddBtn = page.locator('article button[aria-label^="Thêm"]').first();
    await expect(firstProductAddBtn).toBeVisible();
    await firstProductAddBtn.click();

    // Popup CustomizeModal hiện lên
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // (Tùy chọn) Có thể click Size L nếu có
    const sizeL = modal.getByText('Size L');
    if (await sizeL.isVisible()) {
      await sizeL.click();
    }

    // (Tùy chọn) Thêm Trân châu nếu có
    const topping = modal.getByText('Trân châu');
    if (await topping.isVisible()) {
      await topping.click();
    }

    // Bấm nút Thêm vào giỏ
    const addToCartBtn = modal.getByRole('button', { name: /Thêm vào giỏ/i });
    await addToCartBtn.click();

    // Xác nhận Modal đã đóng
    await expect(modal).not.toBeVisible();

    // Kiểm tra giỏ hàng có số lượng = 1 (badge hiển thị)
    const cartLink = page.locator('a[aria-label="Giỏ hàng"]');
    await expect(cartLink.locator('span')).toHaveText('1');

    // 3. GIH-01: Giỏ hàng & đặt món
    // Truy cập giỏ hàng
    await cartLink.click();
    await expect(page).toHaveURL(/.*\/cart/);

    // Xác nhận Bàn B01 vẫn được chọn ở trang giỏ hàng
    await expect(page.getByText('Bàn:B01', { exact: false })).toBeVisible();

    // Nhấn nút Đặt món
    const placeOrderBtn = page.getByRole('button', { name: /đặt món/i });
    await expect(placeOrderBtn).toBeEnabled();
    await placeOrderBtn.click();

    // 4. THA-01: Thanh toán qua VietQR
    // Chờ hệ thống tạo đơn và chuyển hướng tới trang Checkout
    await expect(page).toHaveURL(/.*\/checkout\/.+/);

    // Xác nhận đang ở trang thanh toán
    await expect(page.locator('h1').filter({ hasText: 'Thanh toán' })).toBeVisible();

    // Chọn phương thức VietQR
    const vietqrBtn = page.getByRole('button', { name: /chuyển khoản \(vietqr\)/i });
    await vietqrBtn.click();

    // Kiểm tra xem QR code image đã được render ra chưa
    const qrImage = page.locator('img[alt="VietQR Code"]');
    await expect(qrImage).toBeVisible();

    // Nhấn Tôi đã chuyển khoản
    const confirmPaymentBtn = page.getByRole('button', { name: /tôi đã chuyển khoản/i });
    await confirmPaymentBtn.click();

    // Trình duyệt phải tự động chuyển sang trang Order Confirmed
    await expect(page).toHaveURL(/.*\/order-confirmed\/.+/);
    
    // Kiểm tra lời cảm ơn
    await expect(page.getByText(/thanh toán thành công/i)).toBeVisible();
  });

});
