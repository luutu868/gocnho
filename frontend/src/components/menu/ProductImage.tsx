import { useState } from 'react';
import { getInitials } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/menu-data';

interface ProductImageProps {
  imageUrl?: string | null;
  productName: string;
  categorySlug: string;
  isAvailable: boolean;
}

export function ProductImage({ imageUrl, productName, categorySlug, isAvailable }: ProductImageProps) {
  const [imgError, setImgError] = useState(false);
  const bgColor = CATEGORY_COLORS[categorySlug] || '#6B7280';
  const initials = getInitials(productName);
  const showInitials = !imageUrl || imgError;

  return (
    <div
      className="relative flex items-center justify-center text-white text-3xl font-bold overflow-hidden group-hover:scale-105 transition-transform duration-300"
      style={{ backgroundColor: bgColor, aspectRatio: '4/3' }}
    >
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : null}

      {/* Initials placeholder — chỉ hiện khi không có ảnh hoặc ảnh lỗi */}
      {showInitials && (
        <span
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            letterSpacing: '0.05em'
          }}
          aria-hidden="true"
        >
          {initials}
        </span>
      )}

      {/* Gradient overlay for better text contrast */}
      {!showInitials && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Out of stock badge */}
      {!isAvailable && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
          Tạm hết
        </span>
      )}
    </div>
  );
}
