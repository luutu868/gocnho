"""Menu business logic — query categories, products with eager loading."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.category import Category
from app.models.product import Product
from app.models.topping import ProductTopping


def _extract_toppings(product: Product) -> list[dict]:
    """Convert ProductTopping objects to plain Topping dicts for serialization."""
    result = []
    for pt in product.toppings:
        if pt and pt.topping:
            t = pt.topping
            result.append({
                "id": t.id,
                "name": t.name,
                "price": t.price,
                "is_available": t.is_available,
            })
    return result


class MenuService:
    """Service for menu-related database queries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_categories(self, active_only: bool = True) -> list[Category]:
        """Get all active categories, sorted by sort_order."""
        stmt = select(Category).order_by(Category.sort_order)
        if active_only:
            stmt = stmt.where(Category.is_active.is_(True))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_products(
        self,
        category_slug: str | None = None,
        search: str | None = None,
        available_only: bool = True,
    ) -> list[dict]:
        """Get products with eager-loaded relationships.

        Returns list of dicts with toppings pre-flattened for JSON serialization.
        """
        stmt = (
            select(Product)
            .options(
                selectinload(Product.category),
                selectinload(Product.primary_image),
                selectinload(Product.variants),
                selectinload(Product.toppings).selectinload(ProductTopping.topping),
            )
            .order_by(Product.sort_order, Product.name)
        )

        if available_only:
            stmt = stmt.where(Product.is_available.is_(True))

        if category_slug:
            stmt = stmt.join(Product.category).where(Category.slug == category_slug)

        if search and search.strip():
            stmt = stmt.where(Product.name.ilike(f"%{search.strip()}%"))

        result = await self.db.execute(stmt)
        products = list(result.unique().scalars().all())

        # Convert to dicts with flattened toppings
        return [
            {
                "id": p.id,
                "category_id": p.category_id,
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "is_available": p.is_available,
                "has_sugar_option": p.has_sugar_option,
                "has_ice_option": p.has_ice_option,
                "sort_order": p.sort_order,
                "created_at": p.created_at,
                "category": p.category,
                "primary_image": p.primary_image,
                "variants": p.variants,
                "toppings": _extract_toppings(p),
            }
            for p in products
        ]

    async def get_product_by_slug(self, slug: str) -> dict | None:
        """Get a single product by slug with all relationships loaded.

        Returns dict with toppings and images pre-flattened for JSON serialization.
        """
        stmt = (
            select(Product)
            .where(Product.slug == slug)
            .options(
                selectinload(Product.category),
                selectinload(Product.primary_image),
                selectinload(Product.variants),
                selectinload(Product.images),
                selectinload(Product.toppings).selectinload(ProductTopping.topping),
            )
        )
        result = await self.db.execute(stmt)
        product = result.unique().scalar_one_or_none()

        if not product:
            return None

        return {
            "id": product.id,
            "category_id": product.category_id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "is_available": product.is_available,
            "has_sugar_option": product.has_sugar_option,
            "has_ice_option": product.has_ice_option,
            "sort_order": product.sort_order,
            "created_at": product.created_at,
            "category": product.category,
            "primary_image": product.primary_image,
            "variants": product.variants,
            "images": product.images,
            "toppings": _extract_toppings(product),
        }
