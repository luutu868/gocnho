'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { menuData, categories, categoryColors } from '@/lib/data/menu';
import { useCart } from '@/context/CartContext';
import CustomizeModal from '@/components/CustomizeModal';
import type { MenuItem, CategoryId } from '@/lib/types';

function MenuContent() {
  const searchParams = useSearchParams();
  const { itemCount, tableNumber, setTableNumber } = useCart();

  // BAN-01: Đọc table từ URL param khi chưa có trong localStorage
  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl && !localStorage.getItem('table')) {
      setTableNumber(tableFromUrl);
    }
  }, [searchParams, setTableNumber]);

  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    let items = menuData;
    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      items = items.filter((item) =>
        item.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

  // Viết tắt tên món (2-3 ký tự đầu của chữ đầu) — dùng trong placeholder ảnh
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    // VD: "Cà phê đen" → chữ đầu "Cà" + "phê" → "CP", "Bánh mì nướng muối ớt" → "BM"
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
  };

  // Hiển thị giá: nếu 1 size → "15,000đ", nếu nhiều size → "25K - 35K"
  const getPriceDisplay = (prices: Record<string, number>) => {
    const values = Object.values(prices);
    if (values.length === 1) return values[0].toLocaleString('vi-VN') + 'đ';
    const min = Math.min(...values), max = Math.max(...values);
    return Math.floor(min / 1000) + 'K - ' + Math.floor(max / 1000) + 'K';
  };

  return (
    <>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm" role="banner">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Logo SVG */}
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V12C26 15.866 22.866 19 19 19H13C9.13401 19 6 15.866 6 12V8Z" fill="#92400E"/>
              <rect x="12" y="18" width="8" height="8" rx="1" fill="#92400E"/>
              <path d="M14 26C14 25.4477 14.4477 25 15 25H17C17.5523 25 18 25.4477 18 26V27H14V26Z" fill="#92400E"/>
            </svg>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">Tiệm Cafe Góc Nhỏ</h1>
              {tableNumber && (
                <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                  Bàn {tableNumber}
                </span>
              )}
            </div>
          </div>
          <Link href="/cart"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-amber-50 rounded-full transition-colors"
            aria-label="Giỏ hàng">
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-badge-pulse" aria-live="polite">{itemCount}</span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Search Bar ── */}
      <div className="sticky top-[64px] z-40 bg-white border-b border-gray-200" role="search">
        <div className="px-4 py-3 max-w-7xl mx-auto">
          <div className="relative">
            <label htmlFor="searchInput" className="sr-only">Tìm kiếm món</label>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="searchInput" type="search" placeholder="Tìm món..." className="w-full min-h-[44px] pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent text-base" autoComplete="off" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="sticky top-[120px] z-30 bg-white border-b border-gray-200" role="navigation" aria-label="Danh mục món">
        <div className="px-4 py-2 overflow-x-auto scrollbar-hide max-w-7xl mx-auto">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`px-4 min-h-[44px] rounded-full font-medium text-sm whitespace-nowrap min-w-[80px] transition-colors ${activeCategory === cat.id ? 'bg-amber-100 text-amber-900 border-2 border-amber-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                type="button">{cat.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu Grid ── */}
      <main className="flex-1 px-4 py-4 max-w-7xl mx-auto" role="main">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12" role="status">
            <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
            <p className="text-gray-500 text-sm">Không tìm thấy món nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <article key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-fadeIn">
                {/* Placeholder ảnh: màu nền theo PRD, chữ viết tắt tên món */}
                <div className="relative flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: categoryColors[item.category] || '#6B7280', aspectRatio: '1/1' }}>
                  <span aria-hidden="true">{getInitials(item.name)}</span>
                  {!item.available && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg">Hết hàng</span>
                  )}
                </div>
                <div className="p-3 relative">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                  <p className="hidden md:block text-xs text-gray-600 mb-2 line-clamp-2">{item.desc}</p>
                  <div className="flex items-center justify-between mb-10">
                    <span className={`font-bold text-amber-700 ${Object.keys(item.prices).length > 1 ? 'text-sm' : 'text-base'}`}>
                      {getPriceDisplay(item.prices)}
                    </span>
                  </div>
                  <button
                    onClick={() => { if (item.available) setSelectedItem(item); }}
                    className={`absolute bottom-2 right-2 min-w-[44px] min-h-[44px] bg-amber-600 text-white rounded-full shadow-md transition-colors flex items-center justify-center cursor-pointer ${!item.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'}`}
                    disabled={!item.available}
                    aria-label={`Thêm ${item.name} vào giỏ hàng`}
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ── Customize Modal ── */}
      {selectedItem && (
        <CustomizeModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* ── Mobile Quick Cart FAB ── */}
      {itemCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-6 right-4 z-40 sm:hidden bg-amber-600 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 font-semibold animate-fadeIn"
          aria-label="Xem giỏ hàng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <span>{itemCount} món</span>
        </Link>
      )}
    </>
  );
}

// Wrap in Suspense for useSearchParams per Next.js requirements
export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Đang tải menu...</p></div>}>
      <MenuContent />
    </Suspense>
  );
}
