# UI Before & After Comparison

## Component-by-Component Improvements

### 1. ProductCard

#### Before
```tsx
<article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-fadeIn">
  {/* Image */}
  <div className="p-3 relative">
    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">...</h3>
    <p className="hidden md:block text-xs text-gray-600 mb-2 line-clamp-2">...</p>
    <div className="flex items-center justify-between mb-10">
      <span className="font-bold text-amber-700 text-sm">...</span>
    </div>
    <button className="absolute bottom-2 right-2 min-w-[44px] min-h-[44px] bg-amber-600 text-white rounded-full">
      +
    </button>
  </div>
</article>
```

#### After
```tsx
<article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fadeIn border border-gray-100 hover:border-amber-200">
  {/* Image with hover effects */}
  <div className="p-4 relative">
    <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 leading-snug">...</h3>
    <p className="hidden sm:block text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">...</p>
    <div className="flex items-end justify-between mt-3 pt-2">
      <div className="flex flex-col gap-1">
        <span className="font-bold text-amber-700 text-lg">...</span>
        {!available && <span className="text-xs text-red-600 font-medium">Tạm hết</span>}
      </div>
      <button className="min-w-[44px] min-h-[44px] rounded-full shadow-md transition-all duration-200 bg-amber-600 hover:bg-amber-700 hover:scale-110 active:scale-95">
        +
      </button>
    </div>
  </div>
</article>
```

**Changes:**
- ✅ `rounded-xl` → `rounded-2xl` (softer corners)
- ✅ `shadow-sm` → `shadow-lg` on hover
- ✅ `border-gray-200` → `border-gray-100` with `hover:border-amber-200`
- ✅ Added `group` for coordinated hover effects
- ✅ `p-3` → `p-4` (more breathing room)
- ✅ `text-sm` → `text-base` for product name
- ✅ `text-sm` → `text-lg` for price (single size)
- ✅ `hover:scale-110 active:scale-95` on button
- ✅ "Tạm hết" badge below price instead of disabled opacity

---

### 2. ProductImage

#### Before
```tsx
<div className="relative flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: bgColor, aspectRatio: '1/1' }}>
  {imageUrl && <img src={imageUrl} className="w-full h-full object-cover" />}
  <span className="absolute inset-0 flex items-center justify-center">{initials}</span>
  {!isAvailable && (
    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl-lg">
      Hết hàng
    </span>
  )}
</div>
```

#### After
```tsx
<div className="relative flex items-center justify-center text-white text-3xl font-bold overflow-hidden group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: bgColor, aspectRatio: '4/3' }}>
  {imageUrl && (
    <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
  )}
  <span className="absolute inset-0 flex items-center justify-center select-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)', letterSpacing: '0.05em' }}>
    {initials}
  </span>
  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
  {!isAvailable && (
    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
      Tạm hết
    </span>
  )}
</div>
```

**Changes:**
- ✅ `aspectRatio: '1/1'` → `'4/3'` (standard photography ratio)
- ✅ `text-2xl` → `text-3xl` for initials
- ✅ Added `text-shadow` for better contrast
- ✅ Added `letter-spacing: 0.05em` for readability
- ✅ `group-hover:scale-105` on container
- ✅ `group-hover:scale-110` on image
- ✅ Gradient overlay `from-black/20 to-transparent`
- ✅ Badge: `top-0 right-0` → `top-2 right-2 rounded-full shadow-lg`

---

### 3. CategoryTabs

#### Before
```tsx
<div className="sticky top-[120px] z-30 bg-white border-b border-gray-200">
  <div className="px-4 py-2 overflow-x-auto scrollbar-hide">
    <div className="flex gap-2">
      <button className={`px-4 min-h-[44px] rounded-full font-medium text-sm ${
        selected ? 'bg-amber-100 text-amber-900 border-2 border-amber-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}>
        Tất cả
      </button>
    </div>
  </div>
</div>
```

#### After
```tsx
<div className="sticky top-[120px] z-30 bg-white border-b border-gray-200 shadow-sm">
  <div className="px-4 py-3 overflow-x-auto scrollbar-hide scroll-smooth">
    <div className="flex gap-3">
      <button className={`px-5 py-2.5 min-h-[44px] rounded-full font-semibold text-sm transition-all duration-200 ${
        selected ? 'bg-amber-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95'
      }`} aria-current={selected ? 'page' : undefined}>
        Tất cả
      </button>
    </div>
  </div>
</div>
```

**Changes:**
- ✅ Added `shadow-sm` to container
- ✅ `py-2` → `py-3`
- ✅ `gap-2` → `gap-3`
- ✅ `scroll-smooth` for better UX
- ✅ `px-4` → `px-5 py-2.5` on buttons
- ✅ `font-medium` → `font-semibold`
- ✅ Active: border style → `bg-amber-600 text-white shadow-md`
- ✅ `scale-105` on active
- ✅ `hover:scale-105 active:scale-95` on inactive
- ✅ `aria-current="page"` for accessibility

---

### 4. SearchBar

#### Before
```tsx
<div className="sticky top-[64px] z-40 bg-white border-b border-gray-200">
  <div className="px-4 py-3">
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">...</svg>
      <input placeholder="Tìm món..." className="w-full min-h-[44px] pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600" />
    </div>
  </div>
</div>
```

#### After
```tsx
<div className="sticky top-[64px] z-40 bg-white border-b border-gray-200 shadow-sm">
  <div className="px-4 py-3">
    <div className="relative">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none">...</svg>
      <input placeholder="Tìm cà phê, trà, bánh..." className="w-full min-h-[48px] pl-12 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 shadow-sm hover:shadow-md" />
      {value && (
        <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-400">✕</svg>
        </button>
      )}
    </div>
  </div>
</div>
```

**Changes:**
- ✅ Added `shadow-sm` to container
- ✅ `min-h-[44px]` → `min-h-[48px]`
- ✅ `rounded-lg` → `rounded-xl`
- ✅ `pl-10` → `pl-12`, `pr-4` → `pr-12`
- ✅ `focus:ring-amber-600` → `focus:ring-amber-500`
- ✅ Added `shadow-sm hover:shadow-md`
- ✅ Clear button appears when text exists
- ✅ Placeholder: "Tìm món..." → "Tìm cà phê, trà, bánh..."

---

### 5. MenuPage - Loading State

#### Before
```tsx
{isLoading && (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
  </div>
)}
```

#### After
```tsx
{isLoading && (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
        <div className="aspect-[4/3] bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="flex items-end justify-between pt-2">
            <div className="h-5 bg-gray-200 rounded w-20" />
            <div className="w-11 h-11 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
)}
```

**Changes:**
- ✅ Replaced spinner with skeleton grid
- ✅ 8 skeleton cards matching real ProductCard layout
- ✅ Pulse animation for realistic loading effect
- ✅ Aspect ratio `4/3` matches ProductImage

---

### 6. MenuPage - Error State

#### Before
```tsx
{error && (
  <div className="text-center py-20">
    <div className="text-6xl mb-4">😕</div>
    <p className="text-red-600 text-sm">{error}</p>
    <button onClick={retry} className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg">
      Thử lại
    </button>
  </div>
)}
```

#### After
```tsx
{error && (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-20 h-20 mb-6 rounded-full bg-red-50 flex items-center justify-center">
      <svg className="w-10 h-10 text-red-600">⚠</svg>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tải được menu</h2>
    <p className="text-gray-600 text-sm mb-6 text-center max-w-sm">{error}</p>
    <button onClick={retry} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 active:scale-95 transition-all shadow-md">
      Thử lại
    </button>
  </div>
)}
```

**Changes:**
- ✅ Icon in colored circle instead of emoji
- ✅ Proper heading hierarchy
- ✅ Better spacing and max-width
- ✅ `active:scale-95` on button
- ✅ `rounded-xl` and `shadow-md`

---

### 7. Mobile Quick Cart FAB

#### Before
```tsx
<Link to="/cart" className="fixed bottom-6 right-4 z-40 sm:hidden bg-amber-600 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 font-semibold">
  <svg>🛒</svg>
  <span>{itemCount} món</span>
</Link>
```

#### After
```tsx
<Link to="/cart" className="fixed bottom-6 right-6 z-40 sm:hidden bg-amber-600 text-white rounded-full shadow-xl px-6 py-4 flex items-center gap-3 font-bold hover:bg-amber-700 active:scale-95 transition-all">
  <div className="relative">
    <svg className="w-6 h-6" strokeWidth="2.5">🛒</svg>
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
      {itemCount}
    </span>
  </div>
  <span className="text-base">Xem giỏ</span>
</Link>
```

**Changes:**
- ✅ `right-4` → `right-6`
- ✅ `shadow-lg` → `shadow-xl`
- ✅ `px-5 py-3` → `px-6 py-4`
- ✅ `font-semibold` → `font-bold`
- ✅ Counter badge on icon instead of separate text
- ✅ `active:scale-95` feedback
- ✅ Thicker icon stroke: `2.5`

---

## Global CSS Enhancements

### Before
```css
@layer utilities {
  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out both;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
```

### After
```css
@layer base {
  html { scroll-behavior: smooth; scrollbar-gutter: stable; }
  *:focus-visible { outline: 2px solid #d97706; outline-offset: 2px; }
  body { -webkit-font-smoothing: antialiased; }
}

@layer utilities {
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out both;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; }
  }
}
```

**Changes:**
- ✅ Smooth scrolling with reduced-motion support
- ✅ Stable scrollbar gutter (no layout shift)
- ✅ Universal focus-visible outlines
- ✅ Antialiased font rendering
- ✅ New `scaleIn` animation for modals
- ✅ Improved fadeIn timing (300ms)
- ✅ Respect user motion preferences

---

## Summary of Improvements

### Visual Polish
- Softer corners (rounded-2xl)
- Better shadows (sm → lg)
- Refined colors (gray-100, amber-200)
- More breathing room (p-3 → p-4)

### Interactions
- Scale animations (hover + active)
- Smooth transitions (200-350ms)
- Clear feedback on all actions
- Coordinated group effects

### Typography
- Larger text (sm → base/lg)
- Better line heights
- Bolder weights
- Improved readability

### States
- Skeleton loading screens
- Illustrated error states
- Contextual empty states
- Clear success/failure feedback

### Accessibility
- 44x44px touch targets
- Visible focus rings
- Semantic HTML
- Reduced motion support
- ARIA labels

---

**Next:** Run `npm run dev` in frontend folder to see the improvements live!
