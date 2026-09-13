export type Lang = 'ru' | 'kk' | 'en'

export interface Branch {
  id: string
  restaurant_id: string
  name: string
  city: string
  address_line: string
  opens_at: string | null
  closes_at: string | null
  is_open: boolean
  min_order_amount: number
}

export interface MenuCategory {
  id: string
  slug: string
  name_ru: string
  name_kk: string
  name_en: string
  sort_order: number
}

export interface ItemOption {
  id: string
  group_id: string
  name_ru: string
  name_kk: string
  name_en: string
  price_delta: number
  is_available: boolean
  sort_order: number
}

export interface ItemOptionGroup {
  id: string
  menu_item_id: string
  name_ru: string
  name_kk: string
  name_en: string
  is_required: boolean
  max_select: number
  sort_order: number
  item_options?: ItemOption[]
}

export interface MenuItem {
  id: string
  category_id: string
  name_ru: string
  name_kk: string
  name_en: string
  description_ru: string | null
  description_kk: string | null
  description_en: string | null
  ingredients_ru: string | null
  ingredients_kk: string | null
  ingredients_en: string | null
  price: number
  weight_grams: number | null
  volume_ml: number | null
  image_url: string | null
  is_available: boolean
  is_popular: boolean
  item_option_groups?: ItemOptionGroup[]
}

export interface CartOptionSelection {
  group_id: string
  group_name: Record<Lang, string>
  option_id: string
  option_name: Record<Lang, string>
  price_delta: number
}

export interface CartLine {
  key: string // unique per item + option combination
  menu_item_id: string
  name: Record<Lang, string>
  unit_price: number
  image_url: string | null
  quantity: number
  selected_options: CartOptionSelection[]
  comment?: string
}

export type OrderStatus =
  | 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COURIER_ASSIGNED'
  | 'PICKED_UP' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED'

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COURIER_ASSIGNED', 'PICKED_UP', 'DELIVERING', 'DELIVERED',
]
