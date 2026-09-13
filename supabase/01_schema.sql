-- =========================================================================
-- OCHAG — Database schema (Phase: customer ordering flow through checkout
-- and tracking). Run this in the Supabase SQL editor, or via the CLI:
--   supabase db push
-- Extend with admin/courier-specific tables (couriers, courier_orders,
-- promocodes, ratings, notifications, feedback) in a later migration —
-- this file intentionally covers only what the customer flow needs so it
-- stays reviewable.
-- =========================================================================

create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text not null default 'ru' check (preferred_language in ('ru','kk','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- RESTAURANTS / BRANCHES
-- Ochag supports multiple future branches; "restaurants" is the brand,
-- "branches" are physical locations (only Turgeneva 91A exists today).
-- -------------------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null default 'Ochag',
  description_ru text,
  description_kk text,
  description_en text,
  phone text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  city text not null default 'Актобе',
  address_line text not null,           -- e.g. "ул. Тургенева, 91А"
  latitude double precision,
  longitude double precision,
  opens_at time,
  closes_at time,
  is_open boolean not null default true,
  min_order_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- DELIVERY ZONES — determine whether an address is deliverable and at
-- what fee. A simple polygon/radius model; store as GeoJSON for future
-- map integration, keep a flat fee/eta for now.
-- -------------------------------------------------------------------------
create table if not exists public.delivery_zones (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  name text not null,
  polygon_geojson jsonb,               -- nullable until map integration lands
  delivery_fee numeric(10,2) not null default 0,
  min_order_amount numeric(10,2) not null default 0,
  eta_minutes_min int not null default 30,
  eta_minutes_max int not null default 60,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- MENU
-- -------------------------------------------------------------------------
create table if not exists public.menu_categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  slug text not null,                  -- e.g. "pizza", used in /menu/:category
  name_ru text not null,
  name_kk text not null,
  name_en text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  unique (restaurant_id, slug)
);

create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  name_ru text not null,
  name_kk text not null,
  name_en text not null,
  description_ru text,
  description_kk text,
  description_en text,
  ingredients_ru text,
  ingredients_kk text,
  ingredients_en text,
  price numeric(10,2) not null check (price >= 0),
  weight_grams int,
  volume_ml int,
  image_url text,
  is_available boolean not null default true,
  is_popular boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_menu_items_category on public.menu_items(category_id);
create index if not exists idx_menu_items_search_ru on public.menu_items using gin (to_tsvector('russian', coalesce(name_ru,'') || ' ' || coalesce(description_ru,'') || ' ' || coalesce(ingredients_ru,'')));
create index if not exists idx_menu_items_search_en on public.menu_items using gin (to_tsvector('english', coalesce(name_en,'') || ' ' || coalesce(description_en,'') || ' ' || coalesce(ingredients_en,'')));

-- Option groups (e.g. "Size", "Crust") and their choices (e.g. "30cm +1500₸")
create table if not exists public.item_option_groups (
  id uuid primary key default uuid_generate_v4(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  name_ru text not null,
  name_kk text not null,
  name_en text not null,
  is_required boolean not null default false,
  max_select int not null default 1,   -- 1 = single choice, >1 = multi (extras)
  sort_order int not null default 0
);

create table if not exists public.item_options (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.item_option_groups(id) on delete cascade,
  name_ru text not null,
  name_kk text not null,
  name_en text not null,
  price_delta numeric(10,2) not null default 0,
  is_available boolean not null default true,
  sort_order int not null default 0
);

-- -------------------------------------------------------------------------
-- ADDRESSES
-- -------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade, -- null for guest, kept via order snapshot instead
  label text,                          -- "Дом", "Офис"
  city text not null default 'Актобе',
  street text not null,
  house text not null,
  apartment text,
  entrance text,
  floor text,
  intercom text,
  comment text,
  latitude double precision,
  longitude double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- -------------------------------------------------------------------------
-- ORDERS
-- -------------------------------------------------------------------------
create type public.order_status as enum (
  'NEW','ACCEPTED','PREPARING','READY','COURIER_ASSIGNED',
  'PICKED_UP','DELIVERING','DELIVERED','CANCELLED'
);

create type public.payment_method as enum ('KASPI','CARD','CASH');
create type public.payment_status as enum ('pending','paid','cash','failed');

create sequence if not exists public.order_number_seq start 1000;

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique default ('OCH-' || nextval('public.order_number_seq')::text),
  user_id uuid references auth.users(id) on delete set null,  -- null for guest orders
  branch_id uuid not null references public.branches(id),
  status public.order_status not null default 'NEW',

  -- contact + delivery snapshot (kept even if the address/profile changes later)
  customer_name text not null,
  customer_phone text not null,
  delivery_city text not null default 'Актобе',
  delivery_street text not null,
  delivery_house text not null,
  delivery_apartment text,
  delivery_entrance text,
  delivery_floor text,
  delivery_intercom text,
  delivery_comment text,
  address_id uuid references public.addresses(id) on delete set null,

  delivery_method text not null default 'delivery' check (delivery_method in ('delivery','pickup')),
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',

  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,

  promo_code text,
  order_comment text,
  language text not null default 'ru' check (language in ('ru','kk','en')),

  estimated_delivery_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_branch on public.orders(branch_id);
create index if not exists idx_orders_status on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  -- snapshot fields so historical orders stay correct even if the menu item changes later
  name_ru text not null,
  name_kk text not null,
  name_en text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  selected_options jsonb not null default '[]',  -- [{group, option, price_delta}]
  item_comment text,
  line_total numeric(10,2) not null
);

create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_status_history_order on public.order_status_history(order_id);

-- keep updated_at fresh + log every status change automatically
create or replace function public.handle_order_status_change()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into public.order_status_history (order_id, status)
    values (new.id, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_status_insert on public.orders;
create trigger trg_order_status_insert
  after insert on public.orders
  for each row execute function public.handle_order_status_change();

drop trigger if exists trg_order_status_update on public.orders;
create trigger trg_order_status_update
  before update on public.orders
  for each row execute function public.handle_order_status_change();

-- -------------------------------------------------------------------------
-- FAVORITES (small, but the product page's heart button needs it)
-- -------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, menu_item_id)
);

-- realtime: allow clients to subscribe to their own order's status changes
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_status_history;
