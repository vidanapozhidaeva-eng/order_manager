import { useMemo } from "react";
import type { Order } from "../types/order";
import { useOrdersContext } from "../context/OrdersContext";

export type OrdersTabKey = "today" | "tomorrow" | "all" | "completed" | "archive";

export type StatusFilterKey =
  | "all"
  | "new"
  | "accepted"
  | "delivering"
  | "completed";

export function useOrders(activeTab: OrdersTabKey, status: StatusFilterKey) {
  const { orders, advanceOrderStatus } = useOrdersContext();

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const filteredOrders = useMemo(() => {
    const now = Date.now();

    const isArchived = (order: Order) => {
      if (order.status !== "completed") return false;
      const ready = new Date(order.readyTime).getTime();
      return now - ready > 24 * 60 * 60 * 1000;
    };

    const isCompletedToday = (order: Order) => {
      if (order.status !== "completed") return false;
      const t = new Date(order.readyTime);
      return (
        t >= startOfDay(today) &&
        t <= endOfDay(today)
      );
    };

    const priority = (order: Order) => {
      if (isArchived(order)) return 3;
      if (order.status !== "completed") return 0; // active
      if (isCompletedToday(order)) return 1;
      return 2;
    };

    const sorted = [...orders].sort((a, b) => {
      const pa = priority(a);
      const pb = priority(b);
      if (pa !== pb) return pa - pb;
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    let byDay: Order[] = [];

    if (activeTab === "archive") {
      byDay = sorted.filter((order) => isArchived(order));
    } else {
      const nonArchived = sorted.filter((order) => !isArchived(order));

      if (activeTab === "completed") {
        byDay = nonArchived.filter((order) => order.status === "completed");
      } else if (activeTab === "today" || activeTab === "tomorrow") {
        byDay = nonArchived.filter((order) => {
          const time = new Date(order.readyTime).getTime();
          if (activeTab === "today") {
            return (
              time >= startOfDay(today).getTime() &&
              time <= endOfDay(today).getTime()
            );
          }
          if (activeTab === "tomorrow") {
            return (
              time >= startOfDay(tomorrow).getTime() &&
              time <= endOfDay(tomorrow).getTime()
            );
          }
          return true;
        });
      } else {
        // "all"
        byDay = nonArchived;
      }
    }

    const byStatus = byDay.filter((order) => {
      if (status === "all") return true;
      if (status === "completed") return order.status === "completed";
      if (status === "new") return order.status === "accepted";
      if (status === "accepted") return order.status === "assembled";
      if (status === "delivering") return order.status === "delivery";
      return true;
    });

    return byStatus;
  }, [activeTab, orders, status, today, tomorrow]);

  const todayOrders = useMemo(() => {
    const start = startOfDay(today).getTime();
    const end = endOfDay(today).getTime();
    return orders.filter((order) => {
      const time = new Date(order.readyTime).getTime();
      return time >= start && time <= end;
    });
  }, [orders, today]);

  const todayRevenue = useMemo(() => {
    return todayOrders.reduce((sum, order) => sum + order.orderPrice, 0);
  }, [todayOrders]);

  const completedToday = useMemo(
    () => todayOrders.filter((order) => order.status === "completed"),
    [todayOrders]
  );

  const completedTodayCount = completedToday.length;

  const averageOrderValue =
    completedTodayCount === 0 ? 0 : todayRevenue / completedTodayCount;

  return {
    orders,
    filteredOrders,
    advanceOrderStatus,
    todayOrdersCount: todayOrders.length,
    todayRevenue,
    completedTodayCount,
    averageOrderValue
  };
}

