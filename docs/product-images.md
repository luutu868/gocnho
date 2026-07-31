# Product Images Guide

## 📸 Overview

**22 placeholder images** cho menu items, màu sắc theo category.

**Location:**
- Source: `scripts/product_images/`
- Public: `backend/static/uploads/products/` (served via `/static/uploads/products/`)

---

## 🎯 Usage

### In Frontend Code

```typescript
// Simple reference
const imageUrl = `/static/uploads/products/${product.slug}.jpg`;

// With fallback (API primary_image trước, fallback về placeholder)
const imageUrl = product.primary_image?.url || `/static/uploads/products/${product.slug}.jpg`;
```

### Examples
```
/static/uploads/products/ca-phe-den.jpg
/static/uploads/products/tra-dao.jpg
/static/uploads/products/sinh-to-bo.jpg
```

---

## 🎨 Color Scheme

| Category | Color | Hex |
|----------|-------|-----|
| ☕ Cà phê | Coffee Brown | #6F4E37 |
| 🍵 Trà | Tea Green | #86A873 |
| 🍑 Sinh tố | Smoothie Peach | #E8A87C |
| 🧊 Đá xay | Frappe Blue | #9AC5F4 |
| 🍊 Nước ép | Juice Orange | #F9B572 |
| 🍰 Bánh ngọt | Dessert Pink | #F5A3C7 |
| 🍞 Ăn nhẹ | Snack Yellow | #FFD93D |

---

## 🔄 Regenerate

Nếu cần tạo lại:

```powershell
# Generate
python scripts/generate-placeholder-images.py

# Copy to backend static
Copy-Item "scripts\product_images\*.jpg" "backend\static\uploads\products\" -Force
```

---

## 📋 Product List

22 products with placeholder images:

**Cà phê (5):** đen, sữa, bạc xỉu, trứng, cốt dừa  
**Trà (5):** đào, vải, chanh mật ong, sữa ô long, sữa matcha  
**Sinh tố (3):** bơ, xoài, dâu  
**Đá xay (3):** cà phê, trà xanh, socola  
**Nước ép (3):** cam tươi, ổi, dưa hấu  
**Bánh ngọt (2):** flan, tiramisu  
**Ăn nhẹ (1):** bánh mì nướng muối ớt

---

**Simple. Clean. Done. ✅**
