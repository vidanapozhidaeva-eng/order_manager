"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderCard } from "../components/OrderCard";
import {
  useOrders,
  type OrdersTabKey,
  type StatusFilterKey
} from "../hooks/useOrders";

const TABS: { key: OrdersTabKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "all", label: "All orders" },
  { key: "completed", label: "Completed" },
  { key: "archive", label: "Archive" }
];

const STATUS_FILTERS: { key: StatusFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "delivering", label: "Delivering" },
  { key: "completed", label: "Completed" }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<OrdersTabKey>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("all");
  const {
    filteredOrders,
    advanceOrderStatus,
    todayOrdersCount,
    todayRevenue,
    completedTodayCount,
    averageOrderValue
  } = useOrders(
    activeTab,
    statusFilter
  );

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Orders
            </h1>
            <p className="text-sm text-slate-500">
              Manage and review your orders
            </p>
          </div>
        </div>
      </header>

      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Today revenue
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                ${todayRevenue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Orders
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {todayOrdersCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Completed
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {completedTodayCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Average order
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                ${averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <nav className="flex gap-2" aria-label="Order filters">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "relative px-4 py-3 text-sm font-medium transition-colors",
                    "border-b-2",
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 pb-3">
            {STATUS_FILTERS.map((filter) => {
              const isActive = filter.key === statusFilter;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-3">
          {filteredOrders.length === 0 ? (
            <EmptyState activeTab={activeTab} />
          ) : (
            filteredOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <OrderCard order={order} onNextStatus={advanceOrderStatus} />
              </Link>
            ))
          )}
        </div>
      </section>

      <Link
        href="/create-order"
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
      >
        <span className="text-lg leading-none">＋</span>
        <span>Create Order</span>
      </Link>
    </main>
  );
}

function EmptyState({ activeTab }: { activeTab: OrdersTabKey }) {
  const titleMap: Record<OrdersTabKey, string> = {
    today: "Today's orders",
    tomorrow: "Tomorrow's orders",
    all: "All orders",
    completed: "Completed orders",
    archive: "Archived orders"
  };

  const descriptionMap: Record<OrdersTabKey, string> = {
    today: "You don't have any orders scheduled for today yet.",
    tomorrow: "You don't have any orders scheduled for tomorrow yet.",
    all: "You don't have any orders yet. Create your first order to get started.",
    completed: "Completed orders will appear here and stay stored in history.",
    archive: "Older completed orders will appear here."
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <h2 className="text-base font-semibold text-slate-900">
        {titleMap[activeTab]}
      </h2>
      <p className="max-w-md text-sm text-slate-500">
        {descriptionMap[activeTab]}
      </p>
    </div>
  );
}

