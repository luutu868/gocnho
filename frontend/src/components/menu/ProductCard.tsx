import { ProductImage } from './ProductImage';
import type { Product, ProductVariant } from '@/types/menu';
import { getCategorySlug } from '@/lib/menu-data';

interface ProductCardProps {
  product: Product;
  onAddClick: (product: Product) => void;
}

function getPriceDisplay(variants: ProductVariant[]): string {
  if (variants.length === 0) return 'Liên hệ';
  const prices = variants.map((v) => v.price);
  if (prices.length === 1) return prices[0].toLocaleString('vi-VN') + 'đ';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return Math.floor(min / 1000) + 'K - ' + Math.floor(max / 1000) + 'K';
}

export function ProductCard({ product, onAddClick }: ProductCardProps) {
  const categorySlug = product.category?.slug || getCategorySlug(product.category?.name || '');

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-fadeIn">
      <ProductImage
        imageUrl={product.primary_image?.url}
        productName={product.name}
        categorySlug={categorySlug}
        isAvailable={product.is_available}
      />
      <div className="p-3 relative">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        <p className="hidden md:block text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-10">
          <span className={`font-bold text-amber-700 ${product.variants.length > 1 ? 'text-sm' : 'text-base'}`}>
            {getPriceDisplay(product.variants)}
          </span>
        </div>
        <button
          onClick={() => {
            if (product.is_available) onAddClick(product);
          }}
          className={`absolute bottom-2 right-2 min-w-[44px] min-h-[44px] bg-amber-600 text-white rounded-full shadow-md transition-colors flex items-center justify-center ${
            !product.is_available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700 cursor-pointer'
          }`}
          disabled={!product.is_available}
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </article>
  );
}
