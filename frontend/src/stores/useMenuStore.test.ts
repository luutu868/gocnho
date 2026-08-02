import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMenuStore } from './useMenuStore';
import * as api from '@/api/menu';

vi.mock('@/api/menu', () => ({
  fetchCategories: vi.fn(),
  fetchProducts: vi.fn(),
}));

describe('useMenuStore (MEN-01)', () => {
  beforeEach(() => {
    // Reset state before each test
    useMenuStore.setState({
      categories: [],
      products: [],
      selectedCategory: null,
      searchQuery: '',
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  // [Happy Path] Tải menu thành công
  it('should fetch menu successfully (happy path)', async () => {
    const mockCategories = [{ id: '1', name: 'Cà phê', slug: 'ca-phe', is_active: true, sort_order: 1, created_at: '' }];
    const mockProducts = [
      { 
        id: '1', 
        name: 'Cà phê sữa đá', 
        slug: 'cf-sua-da', 
        description: 'Ngon', 
        category_id: '1', 
        is_available: true, 
        has_sugar_option: true,
        has_ice_option: true,
        sort_order: 1,
        created_at: '', 
        category: mockCategories[0], 
        primary_image: null,
        variants: [], 
        toppings: []
      }
    ];

    vi.mocked(api.fetchCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.fetchProducts).mockResolvedValue(mockProducts);

    const store = useMenuStore.getState();
    await store.fetchMenu();

    const updatedStore = useMenuStore.getState();
    expect(updatedStore.isLoading).toBe(false);
    expect(updatedStore.categories).toEqual(mockCategories);
    expect(updatedStore.products).toEqual(mockProducts);
    expect(updatedStore.error).toBeNull();
  });

  // [Edge Case] Lỗi khi tải API
  it('should handle API errors gracefully (edge case)', async () => {
    vi.mocked(api.fetchCategories).mockRejectedValue(new Error('Network Error'));
    vi.mocked(api.fetchProducts).mockResolvedValue([]);

    const store = useMenuStore.getState();
    await store.fetchMenu();

    const updatedStore = useMenuStore.getState();
    expect(updatedStore.isLoading).toBe(false);
    expect(updatedStore.error).toBe('Network Error');
    expect(updatedStore.categories).toEqual([]);
  });

  // [Happy Path] Lọc sản phẩm theo category
  it('should filter products by selected category (happy path)', () => {
    useMenuStore.setState({
      products: [
        { id: '1', name: 'Cà phê', category: { slug: 'ca-phe' } } as any,
        { id: '2', name: 'Trà', category: { slug: 'tra' } } as any,
      ],
      selectedCategory: 'ca-phe',
    });

    const filtered = useMenuStore.getState().filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Cà phê');
  });

  // [Happy Path] Tìm kiếm sản phẩm
  it('should filter products by search query (happy path)', () => {
    useMenuStore.setState({
      products: [
        { id: '1', name: 'Cà phê sữa đá', category: { slug: 'ca-phe' } } as any,
        { id: '2', name: 'Trà đào cam sả', category: { slug: 'tra' } } as any,
      ],
      searchQuery: 'đào',
    });

    const filtered = useMenuStore.getState().filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Trà đào cam sả');
  });

  // [Edge Case] Không tìm thấy sản phẩm
  it('should return empty array if no product matches (edge case)', () => {
    useMenuStore.setState({
      products: [
        { id: '1', name: 'Cà phê', category: { slug: 'ca-phe' } } as any,
      ],
      searchQuery: 'Sinh tố',
    });

    const filtered = useMenuStore.getState().filteredProducts();
    expect(filtered.length).toBe(0);
  });
});
