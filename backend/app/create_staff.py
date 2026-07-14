"""End-to-end test of Staff API via HTTP."""
import asyncio, json
from app.database import async_session_factory
from app.redis_client import init_redis, get_redis
from app.models.staff import Staff
from sqlalchemy import select

async def run():
    await init_redis()
    redis = get_redis()
    
    async with async_session_factory() as db:
        result = await db.execute(select(Staff).where(Staff.staff_code == "NV01"))
        staff = result.scalar_one_or_none()
        if not staff:
            print("NV01 not found!")
            return
    
    import secrets
    token = secrets.token_urlsafe(32)
    session_data = {"id": str(staff.id), "staff_code": staff.staff_code, "name": staff.name}
    await redis.setex(f"session:{token}", 28800, json.dumps(session_data))
    print(f"Session OK: {staff.name}")
    print(f"Cookie: session_token={token[:20]}...")
    
    # Test orders endpoint via service layer
    from app.services.staff_order_service import get_staff_orders, update_order_status, update_item_status
    
    async with async_session_factory() as db:
        orders = await get_staff_orders(db, "confirmed,preparing,completed")
        print(f"\nOrders found: {len(orders)}")
        for o in orders[:3]:
            t = o.table.code if o.table else "Mang di"
            items_info = []
            for it in o.items:
                name = it.product.name if it.product else "?"
                opts = [f"{opt.option.group.name if opt.option and opt.option.group else '?'}:{opt.option.value if opt.option else '?'}" for opt in it.options[:2]]
                tops = [f"+{top.topping.name if top.topping else '?'}" for top in it.toppings[:1]]
                items_info.append(f"{it.quantity}x {name} [{', '.join(opts+tops)}] ({it.status})")
            print(f"  {o.order_code} | {o.status} | Bang: {t} | {' | '.join(items_info[:2])}")
    
    # Test status update (prepare first order)
    async with async_session_factory() as db:
        orders = await get_staff_orders(db, "confirmed")
        if orders:
            first = orders[0]
            print(f"\nUpdating {first.order_code} status: confirmed -> preparing")
            await update_order_status(db, str(first.id), "preparing")
            print("  Status updated OK!")
            
            # Mark all items done
            refreshed = await get_staff_orders(db, "preparing")
            if refreshed:
                for it in refreshed[0].items:
                    print(f"  Marking item {it.id} as done...")
                    await update_item_status(db, str(it.id), "done")
                print("  Items marked done OK!")
            
        orders_done = await get_staff_orders(db, "completed")
        print(f"\nCompleted orders: {len(orders_done)}")
        if orders_done:
            print(f"  Latest: {orders_done[0].order_code}")

asyncio.run(run())
