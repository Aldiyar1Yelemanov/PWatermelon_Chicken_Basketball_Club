-- =========================================================================
-- OCHAG — Row Level Security
-- Public catalog data (restaurants, branches, menu, delivery zones) is
-- readable by anyone, including guests. Orders/addresses/favorites are
-- private to their owner. Guest orders (user_id is null) are looked up by
-- id only — the checkout flow returns the new order's id/order_number to
-- the client and that link is the "ticket" a guest uses to track it.
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.branches enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.item_option_groups enable row level security;
alter table public.item_options enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.favorites enable row level security;

-- PROFILES --------------------------------------------------------------
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- PUBLIC CATALOG (read-only for everyone, including anon/guests) --------
create policy "restaurants: public read" on public.restaurants
  for select using (is_active = true);
create policy "branches: public read" on public.branches
  for select using (true);
create policy "delivery_zones: public read" on public.delivery_zones
  for select using (is_active = true);
create policy "menu_categories: public read" on public.menu_categories
  for select using (is_active = true);
create policy "menu_items: public read" on public.menu_items
  for select using (is_available = true);
create policy "item_option_groups: public read" on public.item_option_groups
  for select using (true);
create policy "item_options: public read" on public.item_options
  for select using (is_available = true);

-- ADDRESSES ---------------------------------------------------------------
create policy "addresses: read own" on public.addresses
  for select using (auth.uid() = user_id);
create policy "addresses: insert own" on public.addresses
  for insert with check (auth.uid() = user_id);
create policy "addresses: update own" on public.addresses
  for update using (auth.uid() = user_id);
create policy "addresses: delete own" on public.addresses
  for delete using (auth.uid() = user_id);

-- ORDERS --------------------------------------------------------------
-- Authenticated users see their own orders. Guests can still create an
-- order (user_id = null) and read/track it because the id is unguessable
-- (uuid) and shared only via the confirmation redirect/link.
create policy "orders: read own or guest-by-id" on public.orders
  for select using (
    auth.uid() = user_id or user_id is null
  );

create policy "orders: create own or guest" on public.orders
  for insert with check (
    (auth.uid() = user_id) or (user_id is null)
  );

-- Customers cannot edit an order after placing it (status changes are an
-- admin/courier action performed with the service role from the backend).
-- No update/delete policy is created for the anon/authenticated roles.

create policy "order_items: read via parent order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

create policy "order_items: insert via parent order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

create policy "order_status_history: read via parent order" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- FAVORITES ---------------------------------------------------------------
create policy "favorites: read own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites: insert own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites: delete own" on public.favorites
  for delete using (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
