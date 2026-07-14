// CustomizeModal — TCH-01
// Bottom sheet/modal tùy chỉnh món: size, đường, đá, topping, ghi chú
// Tham chiếu: PRD Feature 2, TDD Section 7.2, ui-demo/components/CustomizeModal.tsx

import { useState, useMemo, useEffect } from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { getCustomizationRule, getCategorySlug } from '@/lib/menu-data';
import type { Product } from '@/types/menu';
import type { CartItemOption, CartItemTopping } from '@/types/order';

interface CustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPriceDisplay(variant: { price: number }): string {
  return Math.floor(variant.price / 1000) + 'K';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CustomizeModal({ product, isOpen, onClose }: CustomizeModalProps) {
  const { addItem } = useCartStore();

  // Lấy customization rule theo category + product slug
  const rule = useMemo(() => {
    if (!product) return null;
    const categorySlug =
      product.category?.slug ?? getCategorySlug(product.category?.name ?? '');
    return getCustomizationRule(categorySlug, product.slug);
  }, [product]);

  // Derive available toppings từ product.toppings (API trả về)
  const availableToppings = useMemo(() => {
    if (!product || !rule?.hasTopping) return [];
    return product.toppings.filter((t) => t.is_available);
  }, [product, rule]);

  // ── Local State ──
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [sugar, setSugar] = useState<string>('');
  const [ice, setIce] = useState<string>('');
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Reset khi mở modal với sản phẩm mới
  useEffect(() => {
    if (!isOpen || !product || !rule) return;

    // Chọn default variant (is_default hoặc variant đầu tiên)
    const defaultVariant =
      product.variants.find((v) => v.is_default) ?? product.variants[0];
    setSelectedVariantId(defaultVariant?.id ?? '');

    // Chọn default sugar (mức cao nhất = 100% hoặc mức đầu trong list)
    if (rule.hasSugar && rule.sugarLevels.length > 0) {
      setSugar(rule.sugarLevels[0]); // 100% (theo order trong constants: 100%, 70%...)
    } else {
      setSugar('');
    }

    // Chọn default ice (Bình thường)
    if (rule.hasIce && rule.iceLevels.length > 0) {
      setIce(rule.iceLevels[0]); // Bình thường
    } else {
      setIce('');
    }

    setSelectedToppingIds([]);
    setNote('');
    setShowValidation(false);
  }, [isOpen, product, rule]);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !product || !rule) return null;

  // ── Derived values ──
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const basePrice = selectedVariant?.price ?? 0;
  const selectedToppings = availableToppings.filter((t) =>
    selectedToppingIds.includes(t.id)
  );
  const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const totalPrice = basePrice + toppingTotal;

  const multiSize = product.variants.length > 1;
  const isSizeRequired = multiSize;
  const isValid = !isSizeRequired || !!selectedVariantId;

  // ── Handlers ──
  const toggleTopping = (id: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (!isValid) {
      setShowValidation(true);
      return;
    }
    if (!selectedVariant) return;

    // Build options list (đường + đá)
    const options: CartItemOption[] = [];
    if (rule.hasSugar && sugar) {
      options.push({ group_id: 'sugar', group_name: 'Đường', option_id: sugar, value: sugar });
    }
    if (rule.hasIce && ice) {
      options.push({ group_id: 'ice', group_name: 'Đá', option_id: ice, value: ice });
    }

    // Build toppings list
    const toppings: CartItemTopping[] = selectedToppings.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      quantity: 1,
    }));

    addItem(
      product.id,
      product.name,
      selectedVariant.id,
      selectedVariant.size,
      selectedVariant.price,
      options,
      toppings,
      note.trim()
    );

    onClose();
  };

  const initials = getInitials(product.name);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal Sheet ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tùy chỉnh ${product.name}`}
        className="fixed bottom-0 left-0 right-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none"
      >
        <div
          className="
            bg-white w-full max-h-[90vh] overflow-y-auto pointer-events-auto
            rounded-t-2xl sm:rounded-2xl sm:max-w-md sm:max-h-[85vh]
            shadow-2xl
            animate-slideUp sm:animate-fadeIn
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10 rounded-t-2xl">
            {/* Handle bar (mobile) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />
            <h2 className="font-semibold text-lg text-gray-900 mt-1 sm:mt-0">{product.name}</h2>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Đóng"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-4 space-y-5">
            {/* Product info card */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
              {product.primary_image?.url ? (
                <img
                  src={product.primary_image.url}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: '#6F4E37' }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                {product.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>
                )}
              </div>
            </div>

            {/* ── Size selector ── */}
            {product.variants.length > 0 && (
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-900 mb-2">
                  {multiSize ? 'Size' : 'Size'}
                  {showValidation && !selectedVariantId && (
                    <span className="ml-2 text-red-500 text-xs font-normal" role="alert">
                      Vui lòng chọn size
                    </span>
                  )}
                </legend>
                <div className="flex gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setShowValidation(false);
                      }}
                      type="button"
                      className={`
                        flex-1 min-h-[52px] py-2 rounded-xl text-sm font-medium transition-all
                        border-2 flex flex-col items-center justify-center
                        ${selectedVariantId === v.id
                          ? 'border-amber-600 bg-amber-600 text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400'
                        }
                        ${showValidation && !selectedVariantId ? 'border-red-400' : ''}
                      `}
                    >
                      <span className="font-bold">{v.size}</span>
                      <span className="text-xs opacity-80">{getPriceDisplay(v)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* ── Sugar selector ── */}
            {rule.hasSugar && rule.sugarLevels.length > 0 && (
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-900 mb-2">
                  Đường
                  <span className="ml-2 font-normal text-amber-600 text-xs">· {sugar}</span>
                </legend>
                <div className="flex gap-2 flex-wrap">
                  {rule.sugarLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSugar(level)}
                      type="button"
                      className={`
                        flex-1 min-w-[48px] min-h-[44px] py-2 rounded-xl text-xs font-medium transition-all
                        border-2
                        ${sugar === level
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400'
                        }
                      `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* ── Ice selector ── */}
            {rule.hasIce && rule.iceLevels.length > 0 && (
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-900 mb-2">
                  Đá
                  <span className="ml-2 font-normal text-amber-600 text-xs">· {ice}</span>
                </legend>
                <div className="flex gap-2">
                  {rule.iceLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setIce(level)}
                      type="button"
                      className={`
                        flex-1 min-h-[44px] py-2 rounded-xl text-xs font-medium transition-all
                        border-2
                        ${ice === level
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400'
                        }
                      `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* ── Topping selector ── */}
            {rule.hasTopping && availableToppings.length > 0 && (
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-900 mb-2">
                  Topping
                  <span className="ml-2 font-normal text-gray-500 text-xs">· +7,000đ mỗi loại</span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {availableToppings.map((topping) => {
                    const selected = selectedToppingIds.includes(topping.id);
                    return (
                      <button
                        key={topping.id}
                        onClick={() => toggleTopping(topping.id)}
                        type="button"
                        className={`
                          min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-left transition-all
                          border-2 flex items-center gap-2
                          ${selected
                            ? 'border-amber-600 bg-amber-50 text-amber-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-amber-400'
                          }
                        `}
                      >
                        <span
                          className={`
                            w-4 h-4 rounded flex items-center justify-center shrink-0
                            ${selected ? 'bg-amber-600' : 'bg-gray-200'}
                          `}
                        >
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>{topping.name}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* ── Note ── */}
            <div>
              <label
                htmlFor="customize-note"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Ghi chú
                <span className="ml-2 font-normal text-gray-500 text-xs">· tối đa 100 ký tự</span>
              </label>
              <textarea
                id="customize-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                rows={2}
                placeholder="VD: ít đường hơn nữa, không bỏ ống hút..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none outline-none transition-shadow"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{note.length}/100</p>
            </div>
          </div>

          {/* ── Footer — Add to cart ── */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 rounded-b-2xl">
            {/* Live price summary */}
            {selectedToppingIds.length > 0 && (
              <div className="text-xs text-gray-500 mb-2 flex justify-between">
                <span>
                  Giá base ({selectedVariant?.size ?? '–'}): {basePrice.toLocaleString('vi-VN')}đ
                  {toppingTotal > 0 && ` + Topping: ${toppingTotal.toLocaleString('vi-VN')}đ`}
                </span>
              </div>
            )}

            <button
              onClick={handleAdd}
              type="button"
              disabled={showValidation && !isValid}
              id="customize-add-to-cart-btn"
              className={`
                w-full min-h-[52px] font-semibold rounded-xl transition-all shadow-md
                flex items-center justify-center gap-2 text-base
                ${isValid
                  ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Thêm vào giỏ · {totalPrice.toLocaleString('vi-VN')}đ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
