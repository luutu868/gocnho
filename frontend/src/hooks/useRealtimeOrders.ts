// Polling abstraction for staff dashboard
// MVP: Polling 3s → swap to WebSocket later without changing components

import { useEffect, useRef, useState, useMemo } from "react";
import * as staffApi from "@/api/staff";
import type { StaffOrder } from "@/types/staff";

interface RealtimeOrdersOptions {
  pollInterval?: number; // ms, default 3000
  statuses?: string[]; // ['confirmed', 'preparing']
  enabled?: boolean;
}

interface RealtimeOrdersResult {
  orders: StaffOrder[];
  isLoading: boolean;
  error: string | null;
  newOrderCount: number;
}

function mergeOrders(prev: StaffOrder[], incoming: StaffOrder[]): StaffOrder[] {
  const map = new Map(prev.map((o) => [o.id, o]));
  for (const order of incoming) {
    map.set(order.id, order);
  }
  return Array.from(map.values());
}

export function useRealtimeOrders(
  options: RealtimeOrdersOptions = {}
): RealtimeOrdersResult {
  const {
    pollInterval = 3000,
    statuses = ["confirmed", "preparing"],
    enabled = true,
  } = options;

  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPollTimeRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const poll = async () => {
      try {
        setIsLoading(true);
        const result = await staffApi.fetchStaffOrders({
          since: lastPollTimeRef.current,
          status: statuses.join(","),
        });
        if (cancelled) return;

        setOrders((prev) => mergeOrders(prev, result.orders));
        lastPollTimeRef.current = new Date().toISOString();
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Không thể tải đơn mới. Đang thử lại..."
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    poll(); // Initial fetch
    const interval = setInterval(poll, pollInterval);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, pollInterval, statuses.join(",")]);

  const newOrderCount = useMemo(
    () => orders.filter((o) => o.status === "confirmed").length,
    [orders]
  );

  return { orders, isLoading, error, newOrderCount };
}
