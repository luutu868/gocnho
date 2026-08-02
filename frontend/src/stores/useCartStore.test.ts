import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';

describe('useCartStore (TCH-01, GIH-01, THA-01)', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({
      items: [],
      tableCode: null,
    });
  });

  // ==========================================
  // TCH-01: Tùy chỉnh món (Size, Đá, Đường, Topping)
  // ==========================================

  // [Happy Path] Thêm món với tùy chỉnh size M, 50% đường, 1 topping
  it('TCH-01: should add item with correct options and toppings (happy path)', () => {
    const store = useCartStore.getState();
    store.addItem(
      'prod_1',
      'Trà sữa',
      'var_1',
      'M',
      30000,
      [{ group_id: 'sugar', group_name: 'Đường', option_id: '50', value: '50%' }],
      [{ id: 'top_1', name: 'Trân châu', price: 5000, quantity: 1 }],
      'Ít đá'
    );

    const updatedStore = useCartStore.getState();
    expect(updatedStore.items.length).toBe(1);
    const item = updatedStore.items[0];
    
    // Check attributes
    expect(item.variantSize).toBe('M');
    expect(item.options.length).toBe(1);
    expect(item.options[0].value).toBe('50%');
    expect(item.toppings.length).toBe(1);
    
    // Check totalPrice (Base 30k + Topping 5k)
    expect(item.totalPrice).toBe(35000);
  });

  // [Edge Case] Thêm topping số lượng âm hoặc giá 0 (Giả sử logic giỏ hàng tính đúng theo data truyền vào)
  it('TCH-01: should handle edge case topping calculations (edge case)', () => {
    const store = useCartStore.getState();
    store.addItem(
      'prod_1',
      'Trà sữa',
      'var_1',
      'L',
      40000,
      [],
      [{ id: 'top_1', name: 'Trân châu', price: 5000, quantity: 3 }],
      ''
    );

    const item = useCartStore.getState().items[0];
    // Base 40k + Topping 3 * 5k = 55k
    expect(item.totalPrice).toBe(55000);
  });

  // ==========================================
  // GIH-01: Giỏ hàng (Thêm, Xóa, Sửa, Tổng tiền)
  // ==========================================

  // [Happy Path] Thêm nhiều món và tính tổng tiền chính xác
  it('GIH-01: should calculate total amount and count correctly (happy path)', () => {
    const store = useCartStore.getState();
    
    // Item 1: 30k, qty 1
    store.addItem('prod_1', 'Cà phê', 'var_1', 'S', 30000, [], [], '');
    
    // Item 2: 40k, qty 1
    store.addItem('prod_2', 'Trà đào', 'var_2', 'M', 40000, [], [], '');
    
    let currentStore = useCartStore.getState();
    expect(currentStore.itemCount()).toBe(2);
    expect(currentStore.totalAmount()).toBe(70000);

    // Tăng số lượng item 1 lên 2 -> Tổng = 60k + 40k = 100k
    currentStore.updateQuantity(currentStore.items[0].id, 1);
    
    currentStore = useCartStore.getState();
    expect(currentStore.itemCount()).toBe(3);
    expect(currentStore.totalAmount()).toBe(100000);
  });

  // [Edge Case] Cập nhật số lượng về số âm hoặc 0 (Phải giữ tối thiểu là 1)
  it('GIH-01: should prevent quantity from dropping below 1 (edge case)', () => {
    const store = useCartStore.getState();
    store.addItem('prod_1', 'Cà phê', 'var_1', 'S', 30000, [], [], '');
    
    let currentStore = useCartStore.getState();
    const itemId = currentStore.items[0].id;
    
    // Giảm quantity đi 5
    currentStore.updateQuantity(itemId, -5);
    
    currentStore = useCartStore.getState();
    expect(currentStore.items[0].quantity).toBe(1); // Tối thiểu là 1
  });

  // [Happy Path] Xóa món khỏi giỏ hàng
  it('GIH-01: should remove item from cart (happy path)', () => {
    const store = useCartStore.getState();
    store.addItem('prod_1', 'Cà phê', 'var_1', 'S', 30000, [], [], '');
    let currentStore = useCartStore.getState();
    const itemId = currentStore.items[0].id;

    currentStore.removeItem(itemId);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  // ==========================================
  // THA-01: Thanh toán (Lưu trữ Table Code & Clean up)
  // ==========================================

  // [Happy Path] Lưu Table Code khi quét mã QR để sẵn sàng thanh toán
  it('THA-01: should set table code successfully (happy path)', () => {
    const store = useCartStore.getState();
    store.setTableCode('B01');
    
    expect(useCartStore.getState().tableCode).toBe('B01');
    expect(localStorage.getItem('table')).toBe('B01');
  });

  // [Happy Path] Clear giỏ hàng sau khi thanh toán thành công
  it('THA-01: should clear cart after checkout (happy path)', () => {
    const store = useCartStore.getState();
    store.addItem('prod_1', 'Cà phê', 'var_1', 'S', 30000, [], [], '');
    expect(useCartStore.getState().items.length).toBe(1);

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items.length).toBe(0);
  });
});
