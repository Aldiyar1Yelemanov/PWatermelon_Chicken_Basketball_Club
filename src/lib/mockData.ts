import type { Branch, ItemOptionGroup, MenuCategory, MenuItem } from './types'

export const mockBranch: Branch = {
  id: 'branch-ochag',
  restaurant_id: 'restaurant-ochag',
  name: 'Ochag на Тургенева',
  city: 'Актобе',
  address_line: 'ул. Тургенева, 91А',
  opens_at: '10:00',
  closes_at: '23:00',
  is_open: true,
  min_order_amount: 3000,
}

export const mockCategories: MenuCategory[] = [
  ['pizza', 'Пицца', 'Пицца', 'Pizza'],
  ['burgers', 'Бургеры', 'Бургерлер', 'Burgers'],
  ['sets', 'Сеты', 'Жинақтар', 'Sets'],
  ['salads', 'Салаты', 'Салаттар', 'Salads'],
  ['hot', 'Горячие блюда', 'Ыстық тағамдар', 'Hot dishes'],
  ['drinks', 'Напитки', 'Сусындар', 'Drinks'],
].map(([slug, name_ru, name_kk, name_en], index) => ({
  id: `category-${slug}`,
  slug,
  name_ru,
  name_kk,
  name_en,
  sort_order: index + 1,
}))

const pizzaOptions: ItemOptionGroup[] = [
  {
    id: 'size-pizza-ochag',
    menu_item_id: 'pizza-ochag',
    name_ru: 'Размер',
    name_kk: 'Өлшемі',
    name_en: 'Size',
    is_required: true,
    max_select: 1,
    sort_order: 1,
    item_options: [
      { id: 'size-30', group_id: 'size-pizza-ochag', name_ru: '30 см', name_kk: '30 см', name_en: '30 cm', price_delta: 0, is_available: true, sort_order: 1 },
      { id: 'size-40', group_id: 'size-pizza-ochag', name_ru: '40 см', name_kk: '40 см', name_en: '40 cm', price_delta: 900, is_available: true, sort_order: 2 },
    ],
  },
]

const product = (
  id: string,
  category_id: string,
  names: [string, string, string],
  descriptions: [string, string, string],
  price: number,
  is_popular = false,
  item_option_groups?: ItemOptionGroup[],
): MenuItem => ({
  id,
  category_id: `category-${category_id}`,
  name_ru: names[0],
  name_kk: names[1],
  name_en: names[2],
  description_ru: descriptions[0],
  description_kk: descriptions[1],
  description_en: descriptions[2],
  ingredients_ru: null,
  ingredients_kk: null,
  ingredients_en: null,
  price,
  weight_grams: null,
  volume_ml: null,
  image_url: null,
  is_available: true,
  is_popular,
  item_option_groups,
})

export const mockMenuItems: MenuItem[] = [
  product('pizza-ochag', 'pizza', ['Пицца «Очаг»', 'Очаг пиццасы', 'Ochag pizza'], ['Томатный соус, моцарелла, говядина, печёный перец, копчёный сыр.', 'Қызанақ тұздығы, моцарелла, сиыр еті, пісірілген бұрыш, ысталған ірімшік.', 'Tomato sauce, mozzarella, beef, roasted pepper, smoked cheese.'], 4200, true, pizzaOptions),
  product('pizza-pepperoni', 'pizza', ['Пепперони', 'Пепперони', 'Pepperoni'], ['Томатный соус, моцарелла, пикантная пепперони.', 'Қызанақ тұздығы, моцарелла, ащы пепперони.', 'Tomato sauce, mozzarella, spicy pepperoni.'], 3900, true),
  product('burger-ochag', 'burgers', ['Бургер «Очаг»', 'Очаг бургері', 'Ochag burger'], ['Говяжья котлета на углях, чеддер, соус очаг, маринованные огурцы.', 'Көмірде пісірілген сиыр котлеті, чеддер, очаг тұздығы, маринадталған қияр.', 'Charcoal-grilled beef patty, cheddar, hearth sauce, pickles.'], 2600, true),
  product('set-family', 'sets', ['Сет «Семейный»', '«Отбасылық» жинағы', 'Family set'], ['Пицца «Очаг», 2 бургера, картофель фри, соус, напиток 1 л.', '«Очаг» пиццасы, 2 бургер, картоп, тұздық, 1 л сусын.', 'Ochag pizza, 2 burgers, fries, sauce, 1L drink.'], 9800, true),
  product('salad-warm', 'salads', ['Салат «Тёплый очаг»', 'Жылы очаг салаты', 'Warm hearth salad'], ['Печёные овощи, куриное филе гриль, руккола, соус на йогурте.', 'Пісірілген көкөністер, гриль тауық еті, руккола, йогурт тұздығы.', 'Roasted vegetables, grilled chicken breast, arugula, yogurt dressing.'], 2400),
  product('hot-beshbarmak', 'hot', ['Бешбармак «Очаг»', '«Очаг» бешбармағы', 'Ochag beshbarmak'], ['Домашняя лапша, говядина и конина, бульон, лук.', 'Үй кеспесі, сиыр және жылқы еті, сорпа, пияз.', 'Homemade noodles, beef and horse meat, broth, onion.'], 3600),
  product('drink-lemonade', 'drinks', ['Домашний лимонад', 'Үй лимонады', 'Homemade lemonade'], ['Лимон, мята и газированная вода.', 'Лимон, жалбыз және газдалған су.', 'Lemon, mint and sparkling water.'], 900),
]

export const mockDeliveryZones = [{ delivery_fee: 700, min_order_amount: 3000 }]
