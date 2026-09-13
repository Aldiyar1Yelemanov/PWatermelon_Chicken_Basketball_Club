import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { searchMenuItems } from '../lib/api'
import type { MenuItem } from '../lib/types'
import ProductCard from '../components/menu/ProductCard'
import { SkeletonGrid } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

const RECENT_KEY = 'ochag_recent_searches'
const POPULAR_SEARCHES = ['Пицца', 'Бургер', 'Сет', 'Салат', 'Суп']

export default function Search() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      searchMenuItems(query).then((data) => {
        setResults(data)
        setLoading(false)
      })
    }, 300)
    return () => clearTimeout(handle)
  }, [query])

  const runSearch = (q: string) => {
    setQuery(q)
    if (q.trim()) {
      const next = [q, ...recent.filter((r) => r !== q)].slice(0, 6)
      setRecent(next)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <div className="relative mb-6">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
          placeholder={t('search.placeholder') as string}
          className="w-full rounded-full border border-hearth-900/15 px-5 py-3.5 text-base focus:outline-none focus:border-embers-500"
        />
      </div>

      {!query.trim() && (
        <div className="space-y-6">
          {recent.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-hearth-700/70 mb-2">{t('search.recent')}</h3>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => runSearch(r)}
                    className="px-4 py-2 rounded-full bg-hearth-900/5 text-sm hover:bg-hearth-900/10"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-hearth-700/70 mb-2">{t('search.popular')}</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((r) => (
                <button
                  key={r}
                  onClick={() => runSearch(r)}
                  className="px-4 py-2 rounded-full bg-hearth-900/5 text-sm hover:bg-hearth-900/10"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {query.trim() && (
        <div>
          <p className="text-sm text-hearth-700/70 mb-4">
            {t('search.results_for', { query })}
          </p>
          {loading ? (
            <SkeletonGrid count={6} />
          ) : results.length === 0 ? (
            <EmptyState message={t('search.no_results') as string} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
