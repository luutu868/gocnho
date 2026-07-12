'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { getCustomizationRule, TOPPING_OPTIONS } from '@/lib/data/menu';
import type { MenuItem } from '@/lib/types';

interface CustomizeModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomizeModal({ item, isOpen, onClose }: CustomizeModalProps) {
  const { addItem } = useCart();

  // Lấy quy tắc tùy chỉnh theo danh mục + item-specific override từ PRD
  const rule = useMemo(() => getCustomizationRule(item), [item]);

  const defaultSize = Object.keys(item.prices)[0] || 'M';
  const defaultSugar = rule.sugarLevels.length > 0 ? rule.sugarLevels[rule.sugarLevels.length - 1] : '';
  const defaultIce = rule.iceLevels.length > 0 ? rule.iceLevels[rule.iceLevels.length - 1] : '';

  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [sugar, setSugar] = useState(defaultSugar);
  const [ice, setIce] = useState(defaultIce);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [note, setNote] = useState('');
  // Has customization: has sugar, ice, size choices (>1), or topping available
  const hasAnyCustomization = rule.hasSugar || rule.hasIce || Object.keys(item.prices).length > 1 || rule.hasTopping;

  const basePrice = item.prices[selectedSize] || 0;
  const toppingsTotal = selectedToppings.length * 7000;

  const toggleTopping = (name: string) => {
    setSelectedToppings((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  // Validation: kiểm tra thiếu field bắt buộc
  const isSizeValid = !!selectedSize;
  const isValid = isSizeValid;

  const handleAdd = () => {
    if (!isValid) return;
    addItem(item.id, selectedSize, sugar || undefined, ice || undefined, selectedToppings, note || undefined);
    onClose();
  };

  if (!isOpen) return null;

  const sizeEntries = Object.entries(item.prices);

  // Helper: initials cho ảnh mini trong modal
  const itemInitials = item.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Tùy chỉnh ${item.name}`}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Đóng"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-4 space-y-5">
          {/* Item Info */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
            <div className="w-16 h-16 bg-amber-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0" aria-hidden="true">
              {itemInitials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
            </div>
          </div>

          {/* ── Size Selection (nếu có nhiều hơn 1 size) ── */}
          {sizeEntries.length > 1 && (
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-900 mb-2">Size</legend>
              <div className="flex gap-2">
                {sizeEntries.map(([size, price]) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    type="button"
                    className={`flex-1 min-h-[44px] py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{size}</span>
                    <span className="block text-xs opacity-80">{(price / 1000).toFixed(0)}K</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* ── Sugar (chỉ hiện nếu danh mục có tùy chọn đường) ── */}
          {rule.hasSugar && rule.sugarLevels.length > 0 && (
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-900 mb-2">
                Đường <span className="font-normal text-gray-500">· {sugar}</span>
              </legend>
              <div className="flex gap-2 flex-wrap">
                {rule.sugarLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSugar(level)}
                    type="button"
                    className={`flex-1 min-w-[48px] min-h-[44px] py-2 rounded-lg text-xs font-medium transition-colors ${
                      sugar === level
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* ── Ice (chỉ hiện nếu danh mục có tùy chọn đá) ── */}
          {rule.hasIce && rule.iceLevels.length > 0 && (
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-900 mb-2">
                Đá <span className="font-normal text-gray-500">· {ice}</span>
              </legend>
              <div className="flex gap-2">
                {rule.iceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setIce(level)}
                    type="button"
                    className={`flex-1 min-h-[44px] py-2 rounded-lg text-xs font-medium transition-colors ${
                      ice === level
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* ── Topping (chỉ hiện nếu món hỗ trợ topping) ── */}
          {rule.hasTopping && (
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-900 mb-2">
                Topping <span className="font-normal text-gray-500">· +7,000đ mỗi loại</span>
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {TOPPING_OPTIONS.map((topping) => (
                  <button
                    key={topping.name}
                    onClick={() => toggleTopping(topping.name)}
                    type="button"
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      selectedToppings.includes(topping.name)
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topping.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* ── Note (ghi chú) ── */}
          <div>
            <label htmlFor="customize-note" className="block text-sm font-semibold text-gray-900 mb-2">
              Ghi chú <span className="font-normal text-gray-500">· tối đa 100 ký tự</span>
            </label>
            <textarea
              id="customize-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
              rows={2}
              placeholder="VD: ít đường hơn nữa, không bỏ ống hút..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* ── Add to cart button ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
          {/* Validation message */}
          {!isValid && (
            <p className="text-red-600 text-xs mb-2 text-center" role="alert">Vui lòng chọn size</p>
          )}
          <button
            onClick={handleAdd}
            type="button"
            disabled={!isValid}
            className={`w-full min-h-[48px] font-semibold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 ${
              isValid
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Thêm vào giỏ · {(basePrice + toppingsTotal).toLocaleString('vi-VN')}đ
          </button>
        </div>
      </div>
    </div>
  );
}
