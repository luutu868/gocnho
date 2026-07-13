import { getInitials } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/menu-data';

interface ProductImageProps {
  imageUrl?: string | null;
  productName: string;
  categorySlug: string;
  isAvailable: boolean;
}

export function ProductImage({ imageUrl, productName, categorySlug, isAvailable }: ProductImageProps) {
  const bgColor = CATEGORY_COLORS[categorySlug] || '#6B7280';
  const initials = getInitials(productName);

  return (
    <div
      className="relative flex items-center justify-center text-white text-2xl font-bold"
      style={{ backgroundColor: bgColor, aspectRatio: '1/1' }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to initials on image load error
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.setAttribute('data-fallback', 'true');
            }
          }}
        />
      ) : null}
      {/* Always render initials behind image — visible when no image or image error */}
      <span
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        {initials}
      </span>
      {!isAvailable && (
        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg">
          Hết hàng
        </span>
      )}
    </div>
  );
}
