-- Leemah Cakes N More: initial schema
-- Orders + coupon redemption tracking, replacing the Netlify Blobs stores
-- (`leemah-orders`, `leemah-coupon-usage`) used by the legacy static site.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  stripe_session_id text not null unique,
  payment_status text not null default 'paid',
  status text not null default 'received'
    check (status in ('received', 'confirmed', 'preparing', 'ready', 'completed')),
  customer_name text not null default '',
  customer_email text not null,
  customer_phone text not null default '',
  fulfilment text not null default '',
  delivery_address text not null default '',
  order_summary text not null default '',
  order_note text not null default '',
  total_jars integer not null default 0,
  estimated_weight_kg numeric(5, 2) not null default 0,
  amount_total integer not null default 0, -- pence
  currency text not null default 'gbp',
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_email_idx on public.orders (lower(customer_email));
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  stripe_session_id text not null,
  redeemed_at timestamptz not null default now(),
  unique (code, stripe_session_id)
);

create index if not exists coupon_redemptions_code_idx on public.coupon_redemptions (code);

-- RLS: all access to these tables goes through server-side route handlers
-- using the service-role key. No anon/authenticated policies are defined,
-- so RLS blocks every client-side request by default.
alter table public.orders enable row level security;
alter table public.coupon_redemptions enable row level security;

-- Keep updated_at current on every write.
-- Pin the search path so Supabase's database linter does not report this
-- function as vulnerable to object shadowing.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();
