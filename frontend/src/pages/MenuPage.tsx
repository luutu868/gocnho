import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ProductCard } from "@/components/menu/ProductCard";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { SearchBar } from "@/components/menu/SearchBar";
import { CustomizeModal } from "@/components/menu/CustomizeModal";
import type { Product } from "@/types/menu";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const { itemCount, tableCode, setTableCode } = useCartStore();
  const {
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    fetchMenu,
    setCategory,
    setSearch,
    filteredProducts,
  } = useMenuStore();
  const isOnline = useOnlineStatus();

  // ── CustomizeModal state ──
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Delay clearing product để modal animate ra trước
    setTimeout(() => setSelectedProduct(null), 200);
  };

  // Read table from URL param on mount
  useEffect(() => {
    const tableFromUrl = searchParams.get("table");
    if (tableFromUrl && !tableCode) {
      setTableCode(tableFromUrl);
    }
  }, [searchParams, tableCode, setTableCode]);

  // Fetch menu on mount
  useEffect(() => {
    if (isOnline) {
      fetchMenu();
    }
  }, [isOnline, fetchMenu]);

  const displayedProducts = filteredProducts();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isOnline && <OfflineBanner />}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white shadow-sm" role="banner">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Logo SVG — ly cà phê nhỏ */}
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V12C26 15.866 22.866 19 19 19H13C9.13401 19 6 15.866 6 12V8Z" fill="#92400E" />
              <rect x="12" y="18" width="8" height="8" rx="1" fill="#92400E" />
              <path d="M14 26C14 25.4477 14.4477 25 15 25H17C17.5523 25 18 25.4477 18 26V27H14V26Z" fill="#92400E" />
            </svg>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                Tiệm Cafe Góc Nhỏ
              </h1>
              {tableCode && (
                <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                  Bàn {tableCode}
                </span>
              )}
            </div>
          </div>
          <Link
            to="/cart"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-amber-50 rounded-full transition-colors"
            aria-label="Giỏ hàng"
          >
            <svg
              className="w-7 h-7 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {itemCount() > 0 && (
              <span
                className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                aria-live="polite"
              >
                {itemCount()}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Search Bar ── */}
      <SearchBar value={searchQuery} onChange={setSearch} />

      {/* ── Category Tabs ── */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setCategory}
      />

      {/* ── Menu Grid ── */}
      <main className="flex-1 px-4 py-4 max-w-7xl mx-auto w-full" role="main">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20" role="alert">
            <div className="text-6xl mb-4" aria-hidden="true">😕</div>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => fetchMenu()}
              className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-20" role="status">
            <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
            <p className="text-gray-500 text-sm">Không tìm thấy món nào</p>
            {searchQuery && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-amber-600 text-sm hover:text-amber-700 font-medium"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddClick={(p) => openModal(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Mobile Quick Cart FAB ── */}
      {itemCount() > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-6 right-4 z-40 sm:hidden bg-amber-600 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 font-semibold animate-fadeIn"
          aria-label="Xem giỏ hàng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>{itemCount()} món</span>
        </Link>
      )}

      {/* ── Customize Modal ── */}
      <CustomizeModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
