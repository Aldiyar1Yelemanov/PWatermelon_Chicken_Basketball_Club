import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCategories, getMenuItems } from '../lib/api'
import type { MenuCategory, MenuItem, Lang } from '../lib/types'
import { localized } from '../lib/format'
import CategoryChips from '../components/menu/CategoryChips'
import ProductCard from '../components/menu/ProductCard'
import { SkeletonGrid } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

export default function Menu() {
  const { category } = useParams<{ category?: string }>()
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    getMenuItems(category).then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [category])

  const activeCategory = categories.find((c) => c.slug === category)

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl md:text-3xl font-display font-medium mb-4">
        {activeCategory ? localized(activeCategory, 'name', lang) : t('menu.title')}
      </h1>
      <div className="mb-6">
        <CategoryChips categories={categories} />
      </div>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : items.length === 0 ? (
        <EmptyState message={t('search.no_results') as string} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
