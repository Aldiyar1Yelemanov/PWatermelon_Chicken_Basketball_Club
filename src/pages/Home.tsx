import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCategories, getPopularItems, getPrimaryBranch } from '../lib/api'
import type { MenuCategory, MenuItem, Branch, Lang } from '../lib/types'
import CategoryChips from '../components/menu/CategoryChips'
import ProductCard from '../components/menu/ProductCard'
import { SkeletonGrid, SkeletonLine } from '../components/ui/Skeleton'

export default function Home() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [popular, setPopular] = useState<MenuItem[]>([])
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([getCategories(), getPopularItems(), getPrimaryBranch()]).then(([cats, pop, b]) => {
      if (!alive) return
      setCategories(cats)
      setPopular(pop)
      setBranch(b)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div>
      {/* Hero — one deliberate warm-glow moment, not repeated elsewhere */}
      <section className="relative hearth-glow px-4 md:px-6 pt-8 pb-10 md:pt-16 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium text-embers-700 mb-3">{t('brand.name')} · {branch?.city ?? 'Актобе'}</p>
          <h1 className="text-4xl md:text-6xl font-display font-medium max-w-2xl leading-[1.05]">
            {t('home.hero_title')}
          </h1>
          <p className="text-hearth-700/80 mt-4 max-w-md text-lg">{t('home.hero_subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Link
              to="/menu"
              className="rounded-full bg-hearth-900 text-cream px-7 py-3.5 font-medium text-center hover:bg-hearth-800 transition-colors"
            >
              {t('home.order_food')}
            </Link>
            <Link
              to="/addresses"
              className="rounded-full border border-hearth-900/20 px-7 py-3.5 font-medium text-center hover:border-hearth-900/40 transition-colors"
            >
              {t('home.where_deliver')}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-10 pb-10">
        {/* Categories */}
        <section>
          <h2 className="text-xl font-medium mb-3">{t('home.categories')}</h2>
          {loading ? <SkeletonLine className="h-10 w-full" /> : <CategoryChips categories={categories} />}
        </section>

        {/* Popular */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-medium">{t('home.popular')}</h2>
            <Link to="/menu" className="text-sm text-embers-700 font-medium hover:underline">
              {t('home.view_full_menu')}
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : popular.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popular.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </section>

        {/* Restaurant info */}
        <section className="rounded-card bg-hearth-900 text-cream p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 justify-between">
          <div>
            <h2 className="text-xl font-display font-medium mb-1">{t('home.restaurant_info')}</h2>
            <p className="text-cream/70 text-sm">
              Ochag Café · {t('restaurant.address')}
            </p>
          </div>
          <Link
            to="/restaurant"
            className="shrink-0 rounded-full bg-cream text-hearth-900 px-6 py-3 font-medium text-sm hover:bg-embers-50 transition-colors text-center"
          >
            {t('restaurant.title')}
          </Link>
        </section>
      </div>
    </div>
  )
}
