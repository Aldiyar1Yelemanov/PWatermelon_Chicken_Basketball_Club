import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { getMenuItem, getMyOrders } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/format'
import type { Lang } from '../lib/types'
import { SkeletonLine } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

export default function Orders() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const { user } = useAuth()
  const { addItem } = useCart()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getMyOrders(user.id).then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [user])

  if (!user) {
    return (
      <EmptyState
        emoji="🧾"
        message={t('orders.empty') as string}
        ctaLabel={t('auth.login') as string}
        ctaTo="/login"
      />
    )
  }

  const reorder = async (order: any) => {
    setNotice(null)
    let unavailableCount = 0
    for (const item of order.order_items ?? []) {
      if (!item.menu_item_id) {
        unavailableCount++
        continue
      }
      const current = await getMenuItem(item.menu_item_id)
      if (!current || !current.is_available) {
        unavailableCount++
        continue
      }
      addItem({
        menu_item_id: current.id,
        name: { ru: current.name_ru, kk: current.name_kk, en: current.name_en },
        unit_price: current.price,
        image_url: current.image_url,
        quantity: item.quantity,
        selected_options: item.selected_options ?? [],
      })
    }
    if (unavailableCount > 0) setNotice(t('orders.item_unavailable_notice') as string)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-display font-medium mb-6">{t('orders.title')}</h1>

      {notice && <p className="text-sm text-embers-700 bg-embers-50 rounded-xl px-3 py-2 mb-4">{notice}</p>}

      {loading ? (
        <div className="space-y-3">
          <SkeletonLine className="h-24 w-full rounded-card" />
          <SkeletonLine className="h-24 w-full rounded-card" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState emoji="🧾" message={t('orders.empty') as string} ctaLabel={t('orders.empty_cta') as string} ctaTo="/menu" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-card p-4 shadow-warm">
              <div className="flex items-start justify-between mb-1">
                <Link to={`/orders/${order.id}`} className="font-medium hover:underline">
                  {t('orders.order_number', { number: order.order_number })}
                </Link>
                <span className="text-xs rounded-full bg-hearth-900/5 px-2.5 py-1 font-medium">
                  {t(`orderStatus.${order.status}`)}
                </span>
              </div>
              <p className="text-xs text-hearth-700/60 mb-3">{formatDate(order.created_at, lang)}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-embers-700">{formatCurrency(order.total, lang)}</span>
                <div className="flex gap-2">
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-sm px-4 py-2 rounded-full border border-hearth-900/15 hover:border-hearth-900/30"
                  >
                    {t('orders.track')}
                  </Link>
                  <button
                    onClick={() => reorder(order)}
                    className="text-sm px-4 py-2 rounded-full bg-hearth-900 text-cream hover:bg-hearth-800"
                  >
                    {t('orders.order_again')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
