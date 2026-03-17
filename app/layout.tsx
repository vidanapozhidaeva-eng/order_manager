import type { Metadata } from "next";
import "./globals.css";
import { OrdersProvider } from "../context/OrdersContext";

export const metadata: Metadata = {
  title: "Order Manager",
  description: "Order management app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <OrdersProvider>{children}</OrdersProvider>
      </body>
    </html>
  );
}

