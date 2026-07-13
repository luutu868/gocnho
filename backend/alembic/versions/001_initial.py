"""Initial migration — all tables + seed data.

Revision ID: 001
Revises: None
Create Date: 2026-07-13
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all tables and seed initial data."""

    # Enable uuid-ossp extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # ────── categories ──────
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── option_groups ──────
    op.create_table(
        "option_groups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(50), unique=True, nullable=False),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── options ──────
    op.create_table(
        "options",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("group_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("option_groups.id"), nullable=False),
        sa.Column("value", sa.String(50), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── toppings ──────
    op.create_table(
        "toppings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── product_images (created before products for FK reference) ──────
    op.create_table(
        "product_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=True),  # FK added after products
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("alt_text", sa.String(200), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── products ──────
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(200), unique=True, nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("primary_image_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("has_sugar_option", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("has_ice_option", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # FK for product_images → products (was deferred)
    op.create_foreign_key(
        "fk_product_images_product_id", "product_images", "products", ["product_id"], ["id"], ondelete="CASCADE"
    )
    # FK for products → product_images (primary_image_id)
    op.create_foreign_key(
        "fk_products_primary_image_id", "products", "product_images", ["primary_image_id"], ["id"], ondelete="SET NULL"
    )

    # ────── product_variants ──────
    op.create_table(
        "product_variants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("size", sa.String(10), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("product_id", "size", name="uq_product_variants_product_size"),
    )

    # ────── product_toppings ──────
    op.create_table(
        "product_toppings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("topping_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("toppings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── tables ──────
    op.create_table(
        "tables",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("code", sa.String(10), unique=True, nullable=False),
        sa.Column("qr_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── orders ──────
    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_code", sa.String(20), unique=True, nullable=False),
        sa.Column("table_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tables.id"), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending_payment'")),
        sa.Column("payment_method", sa.String(20), nullable=False, server_default=sa.text("'vietqr'")),
        sa.Column("total_amount", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_orders_status", "orders", ["status"])
    op.create_index("idx_orders_table_id", "orders", ["table_id"])
    op.create_index("idx_orders_expires_at", "orders", ["expires_at"])

    # ────── order_items ──────
    op.create_table(
        "order_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("variant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("product_variants.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("unit_price", sa.Integer(), nullable=False),
        sa.Column("note", sa.String(100), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_order_items_order_id", "order_items", ["order_id"])

    # ────── order_item_options ──────
    op.create_table(
        "order_item_options",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("option_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("options.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── order_item_toppings ──────
    op.create_table(
        "order_item_toppings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("topping_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("toppings.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── staff ──────
    op.create_table(
        "staff",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("staff_code", sa.String(10), unique=True, nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("pin_hash", sa.String(128), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── admins ──────
    op.create_table(
        "admins",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("username", sa.String(50), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(128), nullable=False),
        sa.Column("password_changed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── settings ──────
    op.create_table(
        "settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ────── SEED DATA ──────

    # Seed option_groups
    op.execute("""
        INSERT INTO option_groups (id, name, is_required) VALUES
        (gen_random_uuid(), 'Đường', true),
        (gen_random_uuid(), 'Đá', true)
    """)

    # Seed options for "Đường" (Sugar)
    op.execute("""
        INSERT INTO options (id, group_id, value, sort_order)
        SELECT gen_random_uuid(), id, '100%', 1 FROM option_groups WHERE name = 'Đường'
        UNION ALL
        SELECT gen_random_uuid(), id, '70%', 2 FROM option_groups WHERE name = 'Đường'
        UNION ALL
        SELECT gen_random_uuid(), id, '50%', 3 FROM option_groups WHERE name = 'Đường'
        UNION ALL
        SELECT gen_random_uuid(), id, '30%', 4 FROM option_groups WHERE name = 'Đường'
        UNION ALL
        SELECT gen_random_uuid(), id, '0%', 5 FROM option_groups WHERE name = 'Đường'
    """)

    # Seed options for "Đá" (Ice)
    op.execute("""
        INSERT INTO options (id, group_id, value, sort_order)
        SELECT gen_random_uuid(), id, 'Bình thường', 1 FROM option_groups WHERE name = 'Đá'
        UNION ALL
        SELECT gen_random_uuid(), id, 'Ít đá', 2 FROM option_groups WHERE name = 'Đá'
        UNION ALL
        SELECT gen_random_uuid(), id, 'Không đá', 3 FROM option_groups WHERE name = 'Đá'
    """)

    # Seed admin account (password: admin123 → bcrypt)
    import bcrypt
    admin_password_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
    op.execute(f"""
        INSERT INTO admins (id, username, password_hash, password_changed_at)
        VALUES (gen_random_uuid(), 'admin', '{admin_password_hash}', NULL)
    """)

    # Seed settings (8 keys)
    for key, value in [
        ("shop_name", "Tiệm Cafe Góc Nhỏ"),
        ("shop_phone", "0912345678"),
        ("shop_address", "123 Nguyễn Huệ, Quận 1, TP.HCM"),
        ("bank_name", "VPBank"),
        ("bank_bin", "970432"),
        ("bank_account_no", "680180598"),
        ("bank_account_name", "LUU VAN TU"),
        ("bank_branch", "Hà Nội"),
    ]:
        op.execute(f"""
            INSERT INTO settings (id, key, value)
            VALUES (gen_random_uuid(), '{key}', '{value}')
        """)

    # ────── Seed categories ──────
    op.execute("""
        INSERT INTO categories (id, name, slug, sort_order) VALUES
        (gen_random_uuid(), 'Cà phê', 'ca-phe', 1),
        (gen_random_uuid(), 'Trà', 'tra', 2),
        (gen_random_uuid(), 'Sinh tố', 'sinh-to', 3),
        (gen_random_uuid(), 'Đá xay', 'da-xay', 4),
        (gen_random_uuid(), 'Nước ép', 'nuoc-ep', 5),
        (gen_random_uuid(), 'Bánh ngọt', 'banh-ngot', 6),
        (gen_random_uuid(), 'Ăn nhẹ', 'an-nhe', 7)
    """)

    # ────── Seed toppings ──────
    op.execute("""
        INSERT INTO toppings (id, name, price) VALUES
        (gen_random_uuid(), 'Trân châu đen', 7000),
        (gen_random_uuid(), 'Kem béo', 7000),
        (gen_random_uuid(), 'Thạch cà phê', 7000),
        (gen_random_uuid(), 'Đào miếng', 7000),
        (gen_random_uuid(), 'Thạch dừa', 7000),
        (gen_random_uuid(), 'Kem cheese', 7000)
    """)

    # ────── Seed products (CTE approach to reference category IDs) ──────

    # --- Cà phê (5 products) ---
    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Cà phê đen', 'ca-phe-den', 'Cà phê phin nguyên chất, đậm đà. Dành cho tín đồ cafe truyền thống.', true, true, 1
        FROM cats WHERE slug = 'ca-phe'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'S', 25000, true FROM products WHERE slug = 'ca-phe-den'
        UNION ALL
        SELECT gen_random_uuid(), id, 'M', 30000, false FROM products WHERE slug = 'ca-phe-den'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 35000, false FROM products WHERE slug = 'ca-phe-den'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Cà phê sữa', 'ca-phe-sua', 'Cà phê phin + sữa đặc, vị đắng hậu ngọt — best seller của quán.', true, true, 2
        FROM cats WHERE slug = 'ca-phe'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'S', 28000, true FROM products WHERE slug = 'ca-phe-sua'
        UNION ALL
        SELECT gen_random_uuid(), id, 'M', 33000, false FROM products WHERE slug = 'ca-phe-sua'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 38000, false FROM products WHERE slug = 'ca-phe-sua'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Bạc xỉu', 'bac-xiu', 'Sữa nhiều, cà phê ít — dành cho người thích vị nhẹ nhàng, béo thơm.', true, true, 3
        FROM cats WHERE slug = 'ca-phe'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'S', 28000, true FROM products WHERE slug = 'bac-xiu'
        UNION ALL
        SELECT gen_random_uuid(), id, 'M', 33000, false FROM products WHERE slug = 'bac-xiu'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 38000, false FROM products WHERE slug = 'bac-xiu'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Cà phê trứng', 'ca-phe-trung', 'Cà phê phin phủ kem trứng đánh bông. Không có tùy chọn đá.', true, false, 4
        FROM cats WHERE slug = 'ca-phe'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 38000, true FROM products WHERE slug = 'ca-phe-trung'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Cà phê cốt dừa', 'ca-phe-cot-dua', 'Cà phê đen + nước cốt dừa béo ngậy, lắc đều trước khi uống.', true, true, 5
        FROM cats WHERE slug = 'ca-phe'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 35000, true FROM products WHERE slug = 'ca-phe-cot-dua'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 40000, false FROM products WHERE slug = 'ca-phe-cot-dua'
    """)
    op.execute("""
        INSERT INTO product_toppings (product_id, topping_id)
        SELECT p.id, t.id
        FROM products p, toppings t
        WHERE p.slug = 'ca-phe-cot-dua' AND t.name = 'Kem béo'
    """)

    # --- Trà (5 products) ---
    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Trà đào', 'tra-dao', 'Trà đen + đào ngâm, thanh mát, thơm dịu.', true, true, 1
        FROM cats WHERE slug = 'tra'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 35000, true FROM products WHERE slug = 'tra-dao'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 40000, false FROM products WHERE slug = 'tra-dao'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Trà vải', 'tra-vai', 'Trà xanh + vải ngâm, ngọt thanh tự nhiên.', true, true, 2
        FROM cats WHERE slug = 'tra'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 35000, true FROM products WHERE slug = 'tra-vai'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 40000, false FROM products WHERE slug = 'tra-vai'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Trà chanh mật ong', 'tra-chanh-mat-ong', 'Trà đen + chanh tươi + mật ong. Chỉ 3 mức đường — không có 70%, 100%.', true, true, 3
        FROM cats WHERE slug = 'tra'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 30000, true FROM products WHERE slug = 'tra-chanh-mat-ong'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 35000, false FROM products WHERE slug = 'tra-chanh-mat-ong'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Trà sữa ô long', 'tra-sua-o-long', 'Trà ô long + sữa tươi, thơm tự nhiên, không dùng bột pha sẵn.', true, true, 4
        FROM cats WHERE slug = 'tra'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'S', 32000, true FROM products WHERE slug = 'tra-sua-o-long'
        UNION ALL
        SELECT gen_random_uuid(), id, 'M', 38000, false FROM products WHERE slug = 'tra-sua-o-long'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 42000, false FROM products WHERE slug = 'tra-sua-o-long'
    """)
    op.execute("""
        INSERT INTO product_toppings (product_id, topping_id)
        SELECT p.id, t.id
        FROM products p, toppings t
        WHERE p.slug = 'tra-sua-o-long'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Trà sữa matcha', 'tra-sua-matcha', 'Matcha Nhật + sữa tươi, màu xanh đẹp, vị chát nhẹ hậu ngọt.', true, true, 5
        FROM cats WHERE slug = 'tra'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 40000, true FROM products WHERE slug = 'tra-sua-matcha'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 45000, false FROM products WHERE slug = 'tra-sua-matcha'
    """)
    op.execute("""
        INSERT INTO product_toppings (product_id, topping_id)
        SELECT p.id, t.id
        FROM products p, toppings t
        WHERE p.slug = 'tra-sua-matcha'
    """)

    # --- Sinh tố (3 products) ---
    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Sinh tố bơ', 'sinh-to-bo', 'Bơ sáp + sữa đặc + đá xay mịn. Chỉ chọn size, không chọn đường/đá.', false, false, 1
        FROM cats WHERE slug = 'sinh-to'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 40000, true FROM products WHERE slug = 'sinh-to-bo'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 45000, false FROM products WHERE slug = 'sinh-to-bo'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Sinh tố xoài', 'sinh-to-xoai', 'Xoài chín tươi + sữa chua + đá xay.', false, false, 2
        FROM cats WHERE slug = 'sinh-to'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 38000, true FROM products WHERE slug = 'sinh-to-xoai'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 43000, false FROM products WHERE slug = 'sinh-to-xoai'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Sinh tố dâu', 'sinh-to-dau', 'Dâu tây Đà Lạt + sữa đặc + đá xay.', false, false, 3
        FROM cats WHERE slug = 'sinh-to'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 40000, true FROM products WHERE slug = 'sinh-to-dau'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 45000, false FROM products WHERE slug = 'sinh-to-dau'
    """)

    # --- Đá xay (3 products) ---
    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Đá xay cà phê', 'da-xay-ca-phe', 'Cà phê + đá xay như đá bào, uống mát lạnh ngày nóng.', true, false, 1
        FROM cats WHERE slug = 'da-xay'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 42000, true FROM products WHERE slug = 'da-xay-ca-phe'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 47000, false FROM products WHERE slug = 'da-xay-ca-phe'
    """)
    op.execute("""
        INSERT INTO product_toppings (product_id, topping_id)
        SELECT p.id, t.id
        FROM products p, toppings t
        WHERE p.slug = 'da-xay-ca-phe'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Đá xay trà xanh', 'da-xay-tra-xanh', 'Trà xanh matcha + sữa + đá xay mịn.', true, false, 2
        FROM cats WHERE slug = 'da-xay'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 42000, true FROM products WHERE slug = 'da-xay-tra-xanh'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 47000, false FROM products WHERE slug = 'da-xay-tra-xanh'
    """)
    op.execute("""
        INSERT INTO product_toppings (product_id, topping_id)
        SELECT p.id, t.id
        FROM products p, toppings t
        WHERE p.slug = 'da-xay-tra-xanh'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Đá xay socola', 'da-xay-socola', 'Socola đen + sữa + đá xay, vị đắng nhẹ của cacao.', true, false, 3
        FROM cats WHERE slug = 'da-xay'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 42000, true FROM products WHERE slug = 'da-xay-socola'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 47000, false FROM products WHERE slug = 'da-xay-socola'
    """)
    op.execute("""
        INSERT INTO product_toppings (product_id, topping_id)
        SELECT p.id, t.id
        FROM products p, toppings t
        WHERE p.slug = 'da-xay-socola' AND t.name = 'Kem béo'
    """)

    # --- Nước ép (3 products) ---
    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Nước ép cam tươi', 'nuoc-ep-cam-tuoi', 'Cam tươi vắt nguyên chất, không đường, không nước pha.', false, true, 1
        FROM cats WHERE slug = 'nuoc-ep'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 35000, true FROM products WHERE slug = 'nuoc-ep-cam-tuoi'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 40000, false FROM products WHERE slug = 'nuoc-ep-cam-tuoi'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Nước ép ổi', 'nuoc-ep-oi', 'Ổi ruột đỏ tươi ép lấy nước, thơm mát.', true, true, 2
        FROM cats WHERE slug = 'nuoc-ep'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 30000, true FROM products WHERE slug = 'nuoc-ep-oi'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 35000, false FROM products WHERE slug = 'nuoc-ep-oi'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Nước ép dưa hấu', 'nuoc-ep-dua-hau', 'Dưa hấu tươi ép nguyên chất, ngọt tự nhiên.', false, true, 3
        FROM cats WHERE slug = 'nuoc-ep'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, 'M', 30000, true FROM products WHERE slug = 'nuoc-ep-dua-hau'
        UNION ALL
        SELECT gen_random_uuid(), id, 'L', 35000, false FROM products WHERE slug = 'nuoc-ep-dua-hau'
    """)

    # --- Bánh ngọt (2 products) ---
    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Bánh flan', 'banh-flan', 'Caramel flan béo mịn, làm từ trứng + sữa tươi.', false, false, 1
        FROM cats WHERE slug = 'banh-ngot'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, '1 size', 15000, true FROM products WHERE slug = 'banh-flan'
    """)

    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Tiramisu', 'tiramisu', 'Tiramisu chuẩn vị Ý: cà phê + mascarpone + bột cacao.', false, false, 2
        FROM cats WHERE slug = 'banh-ngot'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, '1 size', 30000, true FROM products WHERE slug = 'tiramisu'
    """)

    # --- Ăn nhẹ (1 product) ---
    op.execute("""
        WITH cats AS (
            SELECT slug, id FROM categories
        )
        INSERT INTO products (id, category_id, name, slug, description, has_sugar_option, has_ice_option, sort_order)
        SELECT gen_random_uuid(), id, 'Bánh mì nướng muối ớt', 'banh-mi-nuong-muoi-ot', 'Bánh mì giòn tan phết bơ + muối ớt, nướng nóng hổi.', false, false, 1
        FROM cats WHERE slug = 'an-nhe'
    """)
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, price, is_default)
        SELECT gen_random_uuid(), id, '1 size', 20000, true FROM products WHERE slug = 'banh-mi-nuong-muoi-ot'
    """)

    # ────── Seed tables (B01–B10) ──────
    op.execute("""
        INSERT INTO tables (id, code) VALUES
        (gen_random_uuid(), 'B01'),
        (gen_random_uuid(), 'B02'),
        (gen_random_uuid(), 'B03'),
        (gen_random_uuid(), 'B04'),
        (gen_random_uuid(), 'B05'),
        (gen_random_uuid(), 'B06'),
        (gen_random_uuid(), 'B07'),
        (gen_random_uuid(), 'B08'),
        (gen_random_uuid(), 'B09'),
        (gen_random_uuid(), 'B10')
    """)


def downgrade() -> None:
    """Drop all tables in reverse order."""
    op.drop_table("settings")
    op.drop_table("admins")
    op.drop_table("staff")
    op.drop_table("order_item_toppings")
    op.drop_table("order_item_options")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("tables")
    op.drop_table("product_toppings")
    op.drop_table("product_variants")
    op.drop_table("products")
    op.drop_table("product_images")
    op.drop_table("toppings")
    op.drop_table("options")
    op.drop_table("option_groups")
    op.drop_table("categories")
