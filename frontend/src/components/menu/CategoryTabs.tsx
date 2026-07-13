interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selected: string | null; // slug or null = "Tất cả"
  onSelect: (slug: string | null) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="sticky top-[120px] z-30 bg-white border-b border-gray-200" role="navigation" aria-label="Danh mục món">
      <div className="px-4 py-2 overflow-x-auto scrollbar-hide max-w-7xl mx-auto">
        <div className="flex gap-2">
          {/* "Tất cả" tab */}
          <button
            key="all"
            onClick={() => onSelect(null)}
            type="button"
            className={`px-4 min-h-[44px] rounded-full font-medium text-sm whitespace-nowrap min-w-[80px] transition-colors ${
              selected === null
                ? 'bg-amber-100 text-amber-900 border-2 border-amber-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.slug)}
              type="button"
              className={`px-4 min-h-[44px] rounded-full font-medium text-sm whitespace-nowrap min-w-[80px] transition-colors ${
                selected === cat.slug
                  ? 'bg-amber-100 text-amber-900 border-2 border-amber-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
