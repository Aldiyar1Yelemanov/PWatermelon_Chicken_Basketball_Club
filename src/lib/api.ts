import type { Branch, MenuCategory, MenuItem, CartLine } from './types'
import { mockBranch, mockCategories, mockDeliveryZones, mockMenuItems } from './mockData'

const ORDERS_KEY = 'ochag_orders_v1'

const readOrders = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

const writeOrders = (orders: any[]) => localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))

export async function getPrimaryBranch(): Promise<Branch> {
  return mockBranch
}

export async function getCategories(): Promise<MenuCategory[]> {
  return mockCategories
}

export async function getMenuItems(categorySlug?: string): Promise<MenuItem[]> {
  return mockMenuItems.filter((item) => !categorySlug || categorySlug === 'all' || item.category_id === `category-${categorySlug}`)
}

export async function getPopularItems(): Promise<MenuItem[]> {
  return mockMenuItems.filter((item) => item.is_popular)
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  return mockMenuItems.find((item) => item.id === id) ?? null
}

export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return []
  return mockMenuItems.filter((item) =>
    [item.name_ru, item.name_kk, item.name_en, item.description_ru, item.description_kk, item.description_en]
      .some((value) => value?.toLocaleLowerCase().includes(normalized)),
  )
}

export async function getDeliveryZones(_branchId: string) {
  return mockDeliveryZones
}

export async function getAddresses(_userId: string) {
  return []
}

export async function saveAddress(_userId: string, address: Record<string, any>) {
  return { data: address, error: null }
}

export interface PlaceOrderInput {
  userId: string | null
  branchId: string
  lines: CartLine[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  customerName: string
  customerPhone: string
  deliveryMethod: 'delivery' | 'pickup'
  city: string
  street: string
  house: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  addressComment?: string
  addressId?: string | null
  paymentMethod: 'KASPI' | 'CARD' | 'CASH'
  orderComment?: string
  promoCode?: string | null
  language: 'ru' | 'kk' | 'en'
}

export async function placeOrder(input: PlaceOrderInput) {
  const id = `order-${Date.now()}`
  const order = {
    id,
    order_number: id.slice(-6).toUpperCase(),
    created_at: new Date().toISOString(),
    status: 'NEW',
    user_id: input.userId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    delivery_city: input.city,
    delivery_street: input.street,
    delivery_house: input.house,
    delivery_apartment: input.apartment || null,
    delivery_method: input.deliveryMethod,
    payment_method: input.paymentMethod,
    payment_status: input.paymentMethod === 'CASH' ? 'cash' : 'pending',
    subtotal: input.subtotal,
    delivery_fee: input.deliveryFee,
    discount: input.discount,
    total: input.total,
    order_items: input.lines.map((line) => ({
      id: `${id}-${line.menu_item_id}`,
      order_id: id,
      menu_item_id: line.menu_item_id,
      name_ru: line.name.ru,
      name_kk: line.name.kk,
      name_en: line.name.en,
      unit_price: line.unit_price,
      quantity: line.quantity,
      selected_options: line.selected_options,
      line_total: (line.unit_price + line.selected_options.reduce((sum, option) => sum + option.price_delta, 0)) * line.quantity,
    })),
  }
  writeOrders([order, ...readOrders()])
  return { order, error: null }
}

export async function getOrder(orderId: string) {
  return readOrders().find((order) => order.id === orderId) ?? null
}

export async function getMyOrders(userId: string) {
  return readOrders().filter((order) => order.user_id === userId)
}
