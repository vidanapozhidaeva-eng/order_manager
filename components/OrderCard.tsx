import { useEffect, useState } from "react";
import type { Order } from "../types/order";

interface OrderCardProps {
  order: Order;
  onNextStatus?: (order: Order) => void;
}

function getStatusUi(order: Order): {
  label: "New" | "Ready" | "Delivering" | "Completed";
  className: string;
} {
  if (order.status === "completed") {
    return { label: "Completed", className: "bg-emerald-50 text-emerald-700" };
  }
  if (order.status === "delivery") {
    return { label: "Delivering", className: "bg-blue-50 text-blue-700" };
  }
  if (order.status === "assembled") {
    return { label: "Ready", className: "bg-yellow-50 text-yellow-800" };
  }
  return { label: "New", className: "bg-slate-100 text-slate-600" };
}

export function OrderCard({ order, onNextStatus }: OrderCardProps) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const statusUi = getStatusUi(order);

  useEffect(() => {
    setMounted(true);
  }, []);

  const readyTime = new Date(order.readyTime);
  const readyLabel = mounted
    ? readyTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  const collapsedDescription = order.description
    .split("\n")
    .slice(0, 2)
    .join("\n");

  const remainingPayment =
    order.type === "pickup"
      ? Math.max(0, order.orderPrice - order.prepaymentAmount)
      : 0;

  const canAdvance = order.status !== "completed";

  const handleNextStatus = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canAdvance || !onNextStatus) return;
    onNextStatus(order);
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              #{order.number.toString().padStart(3, "0")}
            </span>
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                statusUi.className
              ].join(" ")}
            >
              {statusUi.label}
            </span>
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                order.type === "delivery"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-emerald-50 text-emerald-700"
              ].join(" ")}
            >
              {order.type === "delivery" ? "Delivery" : "Pickup"}
            </span>
          </div>
          {order.type === "delivery" ? (
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-900">
                {order.customerName}
              </p>
              {order.phone && <p>{order.phone}</p>}
              {order.address && <p>{order.address}</p>}
              <p className="mt-1">
                Order ${order.orderPrice.toFixed(2)} • Delivery $
                {order.deliveryPrice.toFixed(2)} •{" "}
                <span className="font-semibold text-slate-900">
                  Total ${order.totalPrice.toFixed(2)}
                </span>
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">
                Order #{order.number.toString().padStart(3, "0")}
              </p>
              <p>
                Order: ${order.orderPrice.toFixed(2)}
              </p>
              <p>
                Prepayment: ${order.prepaymentAmount.toFixed(2)}
              </p>
              <p className="font-semibold text-slate-900">
                Remaining: ${remainingPayment.toFixed(2)}
              </p>
            </div>
          )}

          {expanded && collapsedDescription && (
            <p className="whitespace-pre-line text-xs text-slate-500">
              {collapsedDescription}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="ml-2 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </header>

      <footer className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{mounted ? `Ready at ${readyLabel}` : " "}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">
            ${order.totalPrice.toFixed(2)}
          </span>
          {expanded && order.imageUrl && (
            <img
              src={order.imageUrl}
              alt="Order"
              className="h-10 w-10 rounded-md object-cover"
            />
          )}
          <button
            type="button"
            onClick={handleNextStatus}
            disabled={!canAdvance}
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              canAdvance
                ? "bg-slate-900 text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-400 cursor-default"
            ].join(" ")}
          >
            Next Status
          </button>
        </div>
      </footer>
    </article>
  );
  
}

