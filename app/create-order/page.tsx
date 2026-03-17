"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderType } from "../../types/order";
import { useOrdersContext } from "../../context/OrdersContext";

export default function CreateOrderPage() {
  const router = useRouter();
  const [type, setType] = useState<OrderType>("delivery");
  const [readyTime, setReadyTime] = useState("");
  const [description, setDescription] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [prepayment, setPrepayment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { addOrder } = useOrdersContext();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!readyTime || !description.trim()) return;

    const parsedOrderPrice = parseFloat(orderPrice) || 0;
    const parsedDeliveryPrice =
      type === "delivery" ? parseFloat(deliveryPrice) || 0 : 0;
    const parsedPrepayment =
      type === "pickup" ? parseFloat(prepayment) || 0 : 0;

    setSubmitting(true);
    try {
      addOrder({
        type,
        status: "accepted",
        description,
        readyTime: new Date(readyTime).toISOString(),
        customerName: customerName || "Unknown customer",
        phone: phone || "",
        address: type === "delivery" ? address || "" : "",
        orderPrice: parsedOrderPrice,
        deliveryPrice: parsedDeliveryPrice,
        prepaymentAmount: parsedPrepayment,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : null
      });
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Create Order
            </h1>
            <p className="text-sm text-slate-500">
              Add a new order to your queue.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Cancel
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Order Type
            </label>
            <div className="inline-flex gap-2 rounded-full bg-slate-50 p-1">
              {(["delivery", "pickup"] as OrderType[]).map((option) => {
                const active = type === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={[
                      "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    ].join(" ")}
                  >
                    {option === "delivery" ? "Delivery" : "Pickup"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="readyTime"
              className="text-sm font-medium text-slate-700"
            >
              Ready Time
            </label>
            <input
              id="readyTime"
              type="datetime-local"
              value={readyTime}
              onChange={(event) => setReadyTime(event.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="customerName"
              className="text-sm font-medium text-slate-700"
            >
              Customer name
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
              placeholder="Customer name"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-slate-700"
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
              placeholder="+1 ..."
            />
          </div>

          <div className="space-y-2">
            {type === "delivery" && (
              <>
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-slate-700"
                >
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                  placeholder="Street, city"
                />
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="orderPrice"
                className="text-sm font-medium text-slate-700"
              >
                Order price
              </label>
              <input
                id="orderPrice"
                type="number"
                min="0"
                step="0.01"
                value={orderPrice}
                onChange={(event) => setOrderPrice(event.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
              />
            </div>

            {type === "delivery" ? (
              <div className="space-y-2">
                <label
                  htmlFor="deliveryPrice"
                  className="text-sm font-medium text-slate-700"
                >
                  Delivery price
                </label>
                <input
                  id="deliveryPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryPrice}
                  onChange={(event) => setDeliveryPrice(event.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="prepayment"
                  className="text-sm font-medium text-slate-700"
                >
                  Prepayment amount
                </label>
                <input
                  id="prepayment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={prepayment}
                  onChange={(event) => setPrepayment(event.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            )}
          </div>

          <div className="space-y-1 text-sm text-slate-600">
            {type === "delivery" ? (
              <p>
                Total price:{" "}
                <span className="font-semibold text-slate-900">
                  $
                  {(
                    (parseFloat(orderPrice) || 0) +
                    (parseFloat(deliveryPrice) || 0)
                  ).toFixed(2)}
                </span>
              </p>
            ) : (
              <p>
                Remaining payment:{" "}
                <span className="font-semibold text-slate-900">
                  $
                  {(
                    (parseFloat(orderPrice) || 0) -
                    (parseFloat(prepayment) || 0)
                  ).toFixed(2)}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="block w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
              placeholder="What is in this order?"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="photo"
              className="text-sm font-medium text-slate-700"
            >
              Photo
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
            />
            {imageFile && (
              <p className="text-xs text-slate-500">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

