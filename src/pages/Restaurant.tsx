import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPrimaryBranch } from '../lib/api'
import type { Branch } from '../lib/types'
import { SkeletonLine } from '../components/ui/Skeleton'

export default function Restaurant() {
  const { t } = useTranslation()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPrimaryBranch().then((b) => {
      setBranch(b)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <div className="aspect-[16/9] rounded-card bg-embers-100 flex items-center justify-center text-6xl mb-6">
        🔥
      </div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-3xl font-display font-medium">{t('restaurant.title')}</h1>
        {loading ? (
          <SkeletonLine className="h-6 w-20" />
        ) : (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              branch?.is_open ? 'bg-embers-100 text-embers-700' : 'bg-hearth-900/10 text-hearth-700'
            }`}
          >
            {branch?.is_open ? t('restaurant.open') : t('restaurant.closed')}
          </span>
        )}
      </div>
      <p className="text-hearth-700 mb-8">{t('restaurant.address')}</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="rounded-card bg-white p-5 shadow-warm">
          <h3 className="font-medium mb-1">{t('restaurant.hours')}</h3>
          {loading ? (
            <SkeletonLine className="h-4 w-32" />
          ) : (
            <p className="text-hearth-700 text-sm">
              {branch?.opens_at ?? '10:00'} – {branch?.closes_at ?? '23:00'}
            </p>
          )}
        </div>
        <div className="rounded-card bg-white p-5 shadow-warm">
          <h3 className="font-medium mb-1">{t('restaurant.phone')}</h3>
          <p className="text-hearth-700 text-sm">+7 700 000 00 00</p>
        </div>
        <div className="rounded-card bg-white p-5 shadow-warm sm:col-span-2">
          <h3 className="font-medium mb-1">{t('restaurant.pickup_available')}</h3>
          <p className="text-hearth-700 text-sm">
            {branch?.address_line ?? 'ул. Тургенева, 91А'}, {branch?.city ?? 'Актобе'}
          </p>
        </div>
      </div>
    </div>
  )
}
