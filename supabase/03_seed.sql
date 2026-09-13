-- =========================================================================
-- OCHAG — Seed data. Safe to re-run (uses upserts keyed on slug).
-- Replace image_url placeholders with real photography before launch.
-- =========================================================================

insert into public.restaurants (id, slug, name, description_ru, description_kk, description_en, phone, is_active)
values (
  '11111111-1111-1111-1111-111111111111',
  'ochag',
  'Ochag',
  'Очаг — тёплая кухня и доставка еды в Актобе. Домашние блюда, приготовленные с душой.',
  'Очаг — Ақтөбедегі жылы дәмхана және тағам жеткізу. Жанашырлықпен дайындалған үй тағамдары.',
  'Ochag — warm home-style cooking and food delivery in Aktobe.',
  '+7 700 000 00 00',
  true
)
on conflict (slug) do nothing;

insert into public.branches (id, restaurant_id, name, city, address_line, opens_at, closes_at, is_open, min_order_amount)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Ochag — Тургенева 91А',
  'Актобе',
  'ул. Тургенева, 91А',
  '10:00', '23:00', true, 3000
)
on conflict (id) do nothing;

insert into public.delivery_zones (branch_id, name, delivery_fee, min_order_amount, eta_minutes_min, eta_minutes_max, is_active)
values
  ('22222222-2222-2222-2222-222222222222', 'Центр Актобе', 700, 3000, 30, 50, true),
  ('22222222-2222-2222-2222-222222222222', 'Остальной город', 1200, 3000, 45, 75, true)
on conflict do nothing;

-- CATEGORIES --------------------------------------------------------------
insert into public.menu_categories (restaurant_id, slug, name_ru, name_kk, name_en, sort_order) values
('11111111-1111-1111-1111-111111111111','pizza','Пицца','Пицца','Pizza',1),
('11111111-1111-1111-1111-111111111111','burgers','Бургеры','Бургерлер','Burgers',2),
('11111111-1111-1111-1111-111111111111','sets','Сеты','Жинақтар','Sets',3),
('11111111-1111-1111-1111-111111111111','salads','Салаты','Салаттар','Salads',4),
('11111111-1111-1111-1111-111111111111','appetizers','Закуски','Тартымдықтар','Appetizers',5),
('11111111-1111-1111-1111-111111111111','hot','Горячие блюда','Ыстық тағамдар','Hot dishes',6),
('11111111-1111-1111-1111-111111111111','soups','Супы','Көже/сорпа','Soups',7),
('11111111-1111-1111-1111-111111111111','desserts','Десерты','Десерттер','Desserts',8),
('11111111-1111-1111-1111-111111111111','drinks','Напитки','Сусындар','Drinks',9),
('11111111-1111-1111-1111-111111111111','sauces','Соусы','Тұздықтар','Sauces',10)
on conflict (restaurant_id, slug) do nothing;

-- MENU ITEMS ----------------------------------------------------------------
-- Pizza
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Пицца «Очаг»', 'Очаг пиццасы', 'Ochag pizza',
  'Томатный соус, моцарелла, говядина, печёный перец, копчёный сыр.',
  'Қызанақ тұздығы, моцарелла, сиыр еті, пісірілген бұрыш, ыстауыш ірімшік.',
  'Tomato sauce, mozzarella, beef, roasted pepper, smoked cheese.',
  4200, 520, '/images/pizza-ochag.jpg', true, true, 1
from public.menu_categories c where c.slug='pizza' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Пепперони', 'Пепперони', 'Pepperoni',
  'Томатный соус, моцарелла, пикантная пепперони.',
  'Қызанақ тұздығы, моцарелла, ащы пепперони.',
  'Tomato sauce, mozzarella, spicy pepperoni.',
  3900, 500, '/images/pizza-pepperoni.jpg', true, true, 2
from public.menu_categories c where c.slug='pizza' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Burgers
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Бургер «Очаг»', 'Очаг бургері', 'Ochag burger',
  'Говяжья котлета на углях, чеддер, соус очаг, маринованные огурцы.',
  'Көмірде пісірілген сиыр котлеті, чеддер, очаг тұздығы, маринадталған қияр.',
  'Charcoal-grilled beef patty, cheddar, hearth sauce, pickles.',
  2600, 320, '/images/burger-ochag.jpg', true, true, 1
from public.menu_categories c where c.slug='burgers' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Sets
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Сет «Семейный»', '«Отбасылық» жинағы', 'Family set',
  'Пицца «Очаг», 2 бургера, картофель фри, соус, напиток 1 л.',
  '«Очаг» пиццасы, 2 бургер, қуырылған картоп, тұздық, сусын 1 л.',
  'Ochag pizza, 2 burgers, fries, sauce, 1L drink.',
  9800, 1800, '/images/set-family.jpg', true, true, 1
from public.menu_categories c where c.slug='sets' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Salads
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Салат «Тёплый очаг»', 'Жылы очаг салаты', 'Warm hearth salad',
  'Печёные овощи, куриное филе гриль, руккола, соус на йогурте.',
  'Пісірілген көкөністер, грильде пісірілген тауық филеі, руккола, йогурт тұздығы.',
  'Roasted vegetables, grilled chicken breast, arugula, yogurt dressing.',
  2400, 280, '/images/salad-warm.jpg', true, false, 1
from public.menu_categories c where c.slug='salads' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Appetizers
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Сырные шарики', 'Ірімшік шарлары', 'Cheese balls',
  'Моцарелла в хрустящей панировке, соус на выбор.',
  'Қытырлақ панировкадағы моцарелла, тұздық таңдау бойынша.',
  'Mozzarella in crispy breading, choice of sauce.',
  2100, 180, '/images/cheese-balls.jpg', true, false, 1
from public.menu_categories c where c.slug='appetizers' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Hot dishes
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Бешбармак «Очаг»', '«Очаг» бешбармағы', 'Ochag beshbarmak',
  'Домашняя лапша, говядина и конина, бульон, лук.',
  'Үй кеспесі, сиыр және жылқы еті, сорпа, пияз.',
  'Home-made noodles, beef and horse meat, broth, onion.',
  3600, 450, '/images/beshbarmak.jpg', true, true, 1
from public.menu_categories c where c.slug='hot' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Soups
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Сорпа', 'Сорпа', 'Sorpa broth',
  'Наваристый мясной бульон с зеленью.',
  'Көкөністермен дайындалған қою ет сорпасы.',
  'Rich meat broth with fresh herbs.',
  1800, 350, '/images/sorpa.jpg', true, false, 1
from public.menu_categories c where c.slug='soups' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Desserts
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, weight_grams, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Баурсаки с мёдом', 'Балды бауырсақ', 'Baursaks with honey',
  'Тёплые баурсаки, мёд, орехи.',
  'Жылы бауырсақ, бал, жаңғақ.',
  'Warm baursaks, honey, nuts.',
  1500, 200, '/images/baursaks.jpg', true, false, 1
from public.menu_categories c where c.slug='desserts' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Drinks
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, volume_ml, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Морс домашний', 'Үй жасаған морс', 'Home-made fruit drink',
  'Клюквенный морс собственного приготовления.',
  'Өзіміз дайындаған мүкжидек морсы.',
  'House-made cranberry fruit drink.',
  1200, 500, '/images/mors.jpg', true, false, 1
from public.menu_categories c where c.slug='drinks' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Sauces
insert into public.menu_items (restaurant_id, category_id, name_ru, name_kk, name_en, description_ru, description_kk, description_en, price, volume_ml, image_url, is_available, is_popular, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id,
  'Соус «Очаг»', '«Очаг» тұздығы', 'Ochag sauce',
  'Фирменный копчёный соус на томатной основе.',
  'Қызанақ негізіндегі фирмалық ыстауыш тұздық.',
  'Signature smoked tomato-based sauce.',
  400, 50, '/images/sauce-ochag.jpg', true, false, 1
from public.menu_categories c where c.slug='sauces' and c.restaurant_id='11111111-1111-1111-1111-111111111111'
on conflict do nothing;

-- Example option group for the Ochag pizza: size choice
insert into public.item_option_groups (menu_item_id, name_ru, name_kk, name_en, is_required, max_select, sort_order)
select mi.id, 'Размер', 'Өлшемі', 'Size', true, 1, 1
from public.menu_items mi where mi.name_en = 'Ochag pizza'
on conflict do nothing;

insert into public.item_options (group_id, name_ru, name_kk, name_en, price_delta, sort_order)
select g.id, '25 см', '25 см', '25 cm', 0, 1
from public.item_option_groups g join public.menu_items mi on mi.id = g.menu_item_id
where mi.name_en = 'Ochag pizza'
union all
select g.id, '35 см', '35 см', '35 cm', 1500, 2
from public.item_option_groups g join public.menu_items mi on mi.id = g.menu_item_id
where mi.name_en = 'Ochag pizza';
