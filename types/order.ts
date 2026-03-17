export type OrderStatus = "accepted" | "assembled" | "delivery" | "completed";

export type OrderType = "delivery" | "pickup";

export interface Order {
  id: string;
  number: number;
  type: OrderType;
  status: OrderStatus;
  description: string;
  readyTime: string; // ISO string
  createdAt: string; // ISO string
  customerName: string;
  phone: string;
  address: string;
  orderPrice: number;
  deliveryPrice: number;
  prepaymentAmount: number;
  totalPrice: number;
  imageUrl?: string | null;
}

export function getNextStatus(order: Order): OrderStatus {
  if (order.status === "completed") return "completed";

  if (order.type === "pickup") {
    if (order.status === "accepted") return "assembled";
    if (order.status === "assembled") return "completed";
    return "completed";
  }

  // delivery flow
  if (order.status === "accepted") return "assembled";
  if (order.status === "assembled") return "delivery";
  if (order.status === "delivery") return "completed";
  return "completed";
}

