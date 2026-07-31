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
  
  // Fallback to local images if API doesn't provide image URL
  const imageUrl = product.primary_image?.url || `/static/uploads/products/${product.slug}.jpg`;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeIn border border-gray-100 hover:border-amber-200">
      <ProductImage
        imageUrl={imageUrl}
        productName={product.name}
        categorySlug={categorySlug}
        isAvailable={product.is_available}
      />
      <div className="p-4 relative">
        {/* Product Name */}
        <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        
        {/* Description - visible on desktop */}
        {product.description && (
          <p className="hidden sm:block text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        
        {/* Price & Add Button Container */}
        <div className="flex items-end justify-between mt-3 pt-2">
          <div className="flex flex-col gap-1">
            <span className={`font-bold text-amber-700 ${product.variants.length > 1 ? 'text-base' : 'text-lg'}`}>
              {getPriceDisplay(product.variants)}
            </span>
            {!product.is_available && (
              <span className="text-xs text-red-600 font-medium">Tạm hết</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={() => {
              if (product.is_available) onAddClick(product);
            }}
            className={`min-w-[44px] min-h-[44px] rounded-full shadow-md transition-all duration-200 flex items-center justify-center ${
              !product.is_available 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700 hover:scale-110 active:scale-95 cursor-pointer'
            }`}
            disabled={!product.is_available}
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            type="button"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
