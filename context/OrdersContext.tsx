"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { getNextStatus, type Order, type OrderStatus } from "../types/order";

interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "number" | "totalPrice">) => Order;
  advanceOrderStatus: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

const INITIAL_ORDERS: Order[] = [
  {
    id: "1",
    number: 1,
    type: "delivery",
    status: "accepted",
    description: "3x Margherita pizza\n2x Cola",
    readyTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    customerName: "Alice",
    phone: "+1 555 000 111",
    address: "123 Main St, City",
    orderPrice: 45,
    deliveryPrice: 5,
    prepaymentAmount: 0,
    totalPrice: 50
  },
  {
    id: "2",
    number: 2,
    type: "pickup",
    status: "assembled",
    description:
      'Birthday cake with chocolate frosting\nAdd "Happy Birthday" text',
    readyTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    customerName: "Bob",
    phone: "+1 555 222 333",
    address: "456 Market Ave, City",
    orderPrice: 30,
    deliveryPrice: 0,
    prepaymentAmount: 10,
    totalPrice: 30
  },
  {
    id: "3",
    number: 3,
    type: "delivery",
    status: "completed",
    description: "Weekly grocery box\nOrganic vegetables only",
    readyTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    customerName: "Carol",
    phone: "+1 555 444 555",
    address: "789 Park Blvd, City",
    orderPrice: 80,
    deliveryPrice: 8,
    prepaymentAmount: 0,
    totalPrice: 88
  }
];

function computeNextNumber(existing: Order[]): number {
  if (existing.length === 0) return 1;
  const maxNumber = existing.reduce(
    (max, order) => Math.max(max, order.number),
    0
  );
  const next = maxNumber + 1;
  return next > 200 ? 1 : next;
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not configured, using local state");
      return;
    }

    let cancelled = false;

    const load = async () => {
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      const client = supabase;
      if (!client) return;

      const { data, error } = await client
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        console.error("SUPABASE ERROR:", JSON.stringify(error, null, 2));
        return;
      }

      console.log("Orders loaded:", data);
      setOrders(withComputedNumbers((data ?? []).map(mapDbToOrder)));
    };

    void load();

    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => {
            if (payload.eventType === "INSERT") {
              const created = mapDbToOrder(payload.new as DbOrder);
              return withComputedNumbers([...prev, created]);
            }
            if (payload.eventType === "UPDATE") {
              const updated = mapDbToOrder(payload.new as DbOrder);
              return withComputedNumbers(
                prev.map((o) => (o.id === updated.id ? updated : o))
              );
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id?: string };
              if (!oldRow?.id) return prev;
              return withComputedNumbers(prev.filter((o) => o.id !== oldRow.id));
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void client.removeChannel(channel);
    };
  }, []);

  const value: OrdersContextValue = useMemo(
    () => ({
      orders,
      addOrder: (partial) => {
        const number = computeNextNumber(orders);
        const totalPrice = partial.orderPrice + partial.deliveryPrice;
        const order: Order = {
          ...partial,
          id: crypto.randomUUID(),
          number,
          createdAt: new Date().toISOString(),
          totalPrice
        };
        setOrders((prev) => [...prev, order]);

        if (supabase) {
          void supabase.from("orders").insert(mapOrderToDb(order));
        }
        return order;
      },
      advanceOrderStatus: (order) => {
        const nextStatus = getNextStatus(order);
        setOrders((prev) =>
          prev.map((item) =>
            item.id === order.id ? { ...item, status: nextStatus } : item
          )
        );

        if (supabase) {
          void supabase
            .from("orders")
            .update({ status: mapStatusToDb(nextStatus) })
            .eq("id", order.id);
        }
      },
      updateOrderStatus: (id, status) => {
        setOrders((prev) =>
          prev.map((order) => (order.id === id ? { ...order, status } : order))
        );

        if (supabase) {
          void supabase
            .from("orders")
            .update({ status: mapStatusToDb(status) })
            .eq("id", id);
        }
      },
      deleteOrder: (id) => {
        setOrders((prev) => prev.filter((order) => order.id !== id));

        if (supabase) {
          void supabase.from("orders").delete().eq("id", id);
        }
      },
      getOrderById: (id) => orders.find((order) => order.id === id)
    }),
    [orders]
  );

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrdersContext must be used within OrdersProvider");
  }
  return ctx;
}

type DbOrderStatus = "new" | "ready" | "delivering" | "completed";
type DbOrderType = "delivery" | "pickup";
type DbOrderDate = "today" | "tomorrow";

interface DbOrder {
  id: string;
  created_at: string;
  type: DbOrderType;
  customer_name: string | null;
  customer_phone: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  address: string | null;
  order_price: number | string | null;
  delivery_price: number | string | null;
  prepayment: number | string | null;
  items: string | null;
  status: DbOrderStatus;
  date: DbOrderDate;
  ready_time: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function mapStatusFromDb(status: DbOrderStatus): OrderStatus {
  if (status === "new") return "accepted";
  if (status === "ready") return "assembled";
  if (status === "delivering") return "delivery";
  return "completed";
}

function mapStatusToDb(status: OrderStatus): DbOrderStatus {
  if (status === "accepted") return "new";
  if (status === "assembled") return "ready";
  if (status === "delivery") return "delivering";
  return "completed";
}

function mapDbToOrder(row: DbOrder): Order {
  const orderPrice = toNumber(row.order_price);
  const deliveryPrice = toNumber(row.delivery_price);
  const prepaymentAmount = toNumber(row.prepayment);

  return {
    id: row.id,
    number: 0, // will be computed client-side below
    type: row.type,
    status: mapStatusFromDb(row.status),
    description: row.items ?? "",
    readyTime: row.ready_time ?? row.created_at,
    createdAt: row.created_at,
    customerName: row.customer_name ?? row.recipient_name ?? "Unknown",
    phone: row.customer_phone ?? row.recipient_phone ?? "",
    address: row.address ?? "",
    orderPrice,
    deliveryPrice,
    prepaymentAmount,
    totalPrice: orderPrice + deliveryPrice,
    imageUrl: null
  };
}

function mapOrderToDb(order: Order): Partial<DbOrder> {
  const date = inferDateBucket(order.readyTime);
  return {
    id: order.id,
    created_at: order.createdAt,
    type: order.type,
    customer_name: order.customerName,
    customer_phone: order.phone,
    recipient_name: order.customerName,
    recipient_phone: order.phone,
    address: order.address,
    order_price: order.orderPrice,
    delivery_price: order.deliveryPrice,
    prepayment: order.prepaymentAmount,
    items: order.description,
    status: mapStatusToDb(order.status),
    date,
    ready_time: order.readyTime
  };
}

function inferDateBucket(readyTimeIso: string): DbOrderDate {
  const ready = new Date(readyTimeIso);
  const today = new Date();
  const startToday = new Date(today);
  startToday.setHours(0, 0, 0, 0);
  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);
  const startDayAfter = new Date(startTomorrow);
  startDayAfter.setDate(startDayAfter.getDate() + 1);

  if (ready >= startTomorrow && ready < startDayAfter) return "tomorrow";
  return "today";
}

function withComputedNumbers(list: Order[]): Order[] {
  const sorted = [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sorted.map((order, idx) => ({
    ...order,
    number: (idx % 200) + 1
  }));
}

