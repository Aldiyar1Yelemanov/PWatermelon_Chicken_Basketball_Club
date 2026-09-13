import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getOrder } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/format'
import { ORDER_STATUS_SEQUENCE, type Lang, type OrderStatus } from '../lib/types'
import { SkeletonLine } from '../components/ui/Skeleton'

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getOrder(id).then((data) => {
      setOrder(data)
      setLoading(false)
    })

  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <SkeletonLine className="h-8 w-1/2" />
        <SkeletonLine className="h-40 w-full rounded-card" />
      </div>
    )
  }

  if (!order) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-hearth-700">{t('errors.generic')}</div>
  }

  const isCancelled = order.status === 'CANCELLED'
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status as OrderStatus)

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-16">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-display font-medium">{t('orders.order_number', { number: order.order_number })}</h1>
        <span className="text-sm text-hearth-700/60 shrink-0">{formatDate(order.created_at, lang)}</span>
      </div>
      <p className="text-hearth-700/70 mb-6">{t('orders.delivery_to')}: {order.delivery_street} {order.delivery_house}</p>

      {/* Status timeline */}
      <div className={`rounded-card p-5 mb-6 ${isCancelled ? 'bg-red-50' : 'bg-white shadow-warm'}`}>
        {isCancelled ? (
          <p className="font-medium text-red-700">{t('orderStatus.CANCELLED')}</p>
        ) : (
          <ol className="space-y-0">
            {ORDER_STATUS_SEQUENCE.map((status, i) => {
              const done = i <= currentIndex
              const isLast = i === ORDER_STATUS_SEQUENCE.length - 1
              return (
                <li key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${done ? 'bg-embers-600' : 'bg-hearth-900/15'}`}
                    />
                    {!isLast && <div className={`w-px flex-1 min-h-[24px] ${done ? 'bg-embers-600' : 'bg-hearth-900/15'}`} />}
                  </div>
                  <span className={`text-sm pb-6 ${done ? 'text-hearth-900 font-medium' : 'text-hearth-700/50'}`}>
                    {t(`orderStatus.${status}`)}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {order.estimated_delivery_at && (
        <p className="text-sm text-hearth-700 mb-6">
          {t('orders.estimated_delivery')}: {formatDate(order.estimated_delivery_at, lang)}
        </p>
      )}

      {/* Items */}
      <div className="bg-white rounded-card p-5 shadow-warm space-y-3 mb-6">
        <h2 className="font-medium mb-1">{t('orders.details')}</h2>
        {order.order_items?.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.quantity} × {item[`name_${lang}`] || item.name_ru}
            </span>
            <span className="text-hearth-700">{formatCurrency(item.line_total, lang)}</span>
          </div>
        ))}
        <div className="border-t border-hearth-900/10 pt-3 flex justify-between font-semibold">
          <span>{t('cart.total')}</span>
          <span className="text-embers-700">{formatCurrency(order.total, lang)}</span>
        </div>
      </div>

      <div className="bg-white rounded-card p-5 shadow-warm text-sm space-y-1">
        <p className="text-hearth-700">
          <span className="font-medium text-hearth-900">{t('orders.payment')}: </span>
          {order.payment_method} · {order.payment_status}
        </p>
        <p className="text-hearth-700">
          <span className="font-medium text-hearth-900">{t('orders.courier')}: </span>
          {t('orders.courier_unassigned')}
        </p>
      </div>
    </div>
  )
}
