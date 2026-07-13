interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="sticky top-[64px] z-40 bg-white border-b border-gray-200" role="search">
      <div className="px-4 py-3 max-w-7xl mx-auto">
        <div className="relative">
          <label htmlFor="menu-search" className="sr-only">Tìm kiếm món</label>
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="menu-search"
            type="search"
            placeholder="Tìm món..."
            className="w-full min-h-[44px] pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent text-base"
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
