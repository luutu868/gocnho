import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/useCartStore";
import type { CartItem, CartItemOption } from "@/types/order";
import { SUGAR_LEVELS, ICE_LEVELS } from "@/lib/constants";

interface EditCartItemModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCartItemModal({ item, isOpen, onClose }: EditCartItemModalProps) {
  const { updateItem } = useCartStore();

  const [sugar, setSugar] = useState<string>("");
  const [ice, setIce] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !item) return;

    const sugarOpt = item.options.find((o) => o.group_id === "sugar");
    const iceOpt = item.options.find((o) => o.group_id === "ice");

    setSugar(sugarOpt ? sugarOpt.value : "");
    setIce(iceOpt ? iceOpt.value : "");
    setNote(item.note || "");
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    const newOptions: CartItemOption[] = [];
    if (sugar) {
      newOptions.push({
        group_id: "sugar",
        group_name: "Đường",
        option_id: sugar,
        value: sugar,
      });
    }
    if (ice) {
      newOptions.push({
        group_id: "ice",
        group_name: "Đá",
        option_id: ice,
        value: ice,
      });
    }

    updateItem(item.id, {
      options: newOptions,
      note: note.trim(),
    });

    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Sửa món ${item.productName}`}
        className="fixed bottom-0 left-0 right-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none"
      >
        <div
          className="bg-white w-full max-h-[90vh] overflow-y-auto pointer-events-auto rounded-t-2xl sm:rounded-2xl sm:max-w-md shadow-2xl animate-slideUp sm:animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10 rounded-t-2xl">
            <h2 className="font-semibold text-lg text-gray-900">
              Sửa tùy chỉnh · {item.productName} ({item.variantSize})
            </h2>
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

          {/* Body */}
          <div className="p-4 space-y-5">
            {/* Sugar selector */}
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-900 mb-2">
                Mức đường
              </legend>
              <div className="flex gap-2 flex-wrap">
                {SUGAR_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSugar(level)}
                    type="button"
                    className={`flex-1 min-w-[48px] min-h-[44px] py-2 rounded-xl text-xs font-medium transition-all border-2 ${
                      sugar === level
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-amber-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Ice selector */}
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-900 mb-2">
                Mức đá
              </legend>
              <div className="flex gap-2">
                {ICE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setIce(level)}
                    type="button"
                    className={`flex-1 min-h-[44px] py-2 rounded-xl text-xs font-medium transition-all border-2 ${
                      ice === level
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-amber-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Note */}
            <div>
              <label
                htmlFor="edit-note"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Ghi chú
              </label>
              <textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                rows={2}
                placeholder="Ghi chú thêm cho món này..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none outline-none transition-shadow"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{note.length}/100</p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 rounded-b-2xl">
            <button
              onClick={handleSave}
              type="button"
              className="w-full min-h-[52px] font-semibold rounded-xl transition-all shadow-md bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white flex items-center justify-center text-base"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
