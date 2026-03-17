"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrdersContext } from "../../../context/OrdersContext";
import type { OrderStatus } from "../../../types/order";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "accepted", label: "Accepted" },
  { value: "assembled", label: "Assembled" },
  { value: "delivery", label: "Delivering" },
  { value: "completed", label: "Completed" }
];

function getStatusUi(status: OrderStatus): {
  label: "New" | "Ready" | "Delivering" | "Completed";
  className: string;
} {
  if (status === "completed") {
    return { label: "Completed", className: "bg-emerald-50 text-emerald-700" };
  }
  if (status === "delivery") {
    return { label: "Delivering", className: "bg-blue-50 text-blue-700" };
  }
  if (status === "assembled") {
    return { label: "Ready", className: "bg-yellow-50 text-yellow-800" };
  }
  return { label: "New", className: "bg-slate-100 text-slate-600" };
}

export default function OrderDetailsPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { getOrderById, updateOrderStatus, deleteOrder } = useOrdersContext();
  const id = params?.id as string;
  const order = getOrderById(id);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back
          </button>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Order not found.
          </div>
        </div>
      </main>
    );
  }

  const totalLabel = `$${order.totalPrice.toFixed(2)}`;
  const statusUi = getStatusUi(order.status);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Order #{order.number.toString().padStart(3, "0")}
          </span>
        </header>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {order.customerName || "Order details"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {order.type === "delivery" ? "Delivery" : "Pickup"} • Ready at{" "}
                {mounted
                  ? new Date(order.readyTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : " "}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-500">Total</p>
              <p className="text-base font-semibold text-slate-900">
                {totalLabel}
              </p>
            </div>
          </div>

          <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>
              <p>{order.phone || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Address
              </p>
              <p>{order.address || "—"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Items
            </p>
            <p className="whitespace-pre-line text-sm text-slate-800">
              {order.description}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Order price
              </p>
              <p>${order.orderPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Delivery price
              </p>
              <p>${order.deliveryPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total price
              </p>
              <p className="font-semibold text-slate-900">{totalLabel}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="status"
                className="text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <span
                className={[
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                  statusUi.className
                ].join(" ")}
              >
                {statusUi.label}
              </span>
            </div>
            <select
              id="status"
              value={order.status}
              onChange={(event) =>
                updateOrderStatus(id, event.target.value as OrderStatus)
              }
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  "Delete this order? This cannot be undone."
                );
                if (!confirmed) return;
                deleteOrder(id);
                router.push("/");
              }}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Delete Order
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

