-- Run this in the Supabase SQL editor.
-- Creates an `orders` table matching the app fields and enables realtime.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('delivery','pickup')),

  customer_name text,
  customer_phone text,
  recipient_name text,
  recipient_phone text,
  address text,

  order_price numeric not null default 0,
  delivery_price numeric not null default 0,
  prepayment numeric not null default 0,

  items text,

  status text not null check (status in ('new','ready','delivering','completed')),
  date text not null check (date in ('today','tomorrow')),

  -- Optional but used by the current UI (tabs + time display)
  ready_time timestamptz
);

alter publication supabase_realtime add table public.orders;

