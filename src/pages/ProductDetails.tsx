import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMenuItem } from '../lib/api'
import type { MenuItem, Lang, CartOptionSelection } from '../lib/types'
import { formatCurrency, localized } from '../lib/format'
import { useCart } from '../contexts/CartContext'
import { SkeletonLine } from '../components/ui/Skeleton'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const { addItem } = useCart()

  const [item, setItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [quantity, setQuantity] = useState(1)
  const [comment, setComment] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getMenuItem(id).then((data) => {
      setItem(data)
      setLoading(false)
      // pre-select single-choice required groups' first option
      const initial: Record<string, string[]> = {}
      data?.item_option_groups?.forEach((g) => {
        if (g.is_required && g.max_select === 1 && g.item_options?.[0]) {
          initial[g.id] = [g.item_options[0].id]
        }
      })
      setSelected(initial)
    })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <SkeletonLine className="h-72 w-full rounded-card" />
        <SkeletonLine className="h-8 w-1/2" />
        <SkeletonLine className="h-4 w-full" />
      </div>
    )
  }

  if (!item) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-hearth-700">{t('search.no_results')}</div>
  }

  const name = localized(item, 'name', lang)
  const description = localized(item, 'description', lang)
  const ingredients = localized(item, 'ingredients', lang)

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelected((prev) => {
      const current = prev[groupId] ?? []
      if (maxSelect === 1) return { ...prev, [groupId]: [optionId] }
      const has = current.includes(optionId)
      return { ...prev, [groupId]: has ? current.filter((o) => o !== optionId) : [...current, optionId] }
    })
  }

  const selectedOptions: CartOptionSelection[] = (item.item_option_groups ?? []).flatMap((g) =>
    (selected[g.id] ?? []).map((optId) => {
      const opt = g.item_options?.find((o) => o.id === optId)!
      return {
        group_id: g.id,
        group_name: { ru: g.name_ru, kk: g.name_kk, en: g.name_en },
        option_id: opt.id,
        option_name: { ru: opt.name_ru, kk: opt.name_kk, en: opt.name_en },
        price_delta: opt.price_delta,
      }
    })
  )

  const unitTotal = item.price + selectedOptions.reduce((s, o) => s + o.price_delta, 0)
  const requiredGroupsSatisfied = (item.item_option_groups ?? [])
    .filter((g) => g.is_required)
    .every((g) => (selected[g.id]?.length ?? 0) > 0)

  const handleAdd = () => {
    addItem({
      menu_item_id: item.id,
      name: { ru: item.name_ru, kk: item.name_kk, en: item.name_en },
      unit_price: item.price,
      image_url: item.image_url,
      quantity,
      selected_options: selectedOptions,
      comment: comment.trim() || undefined,
    })
    setJustAdded(true)
    setTimeout(() => navigate('/cart'), 550)
  }

  return (
    <div className="max-w-3xl mx-auto pb-32 md:pb-10">
      <div className="aspect-[4/3] md:aspect-[16/9] bg-embers-100">
        {item.image_url ? (
          <img src={item.image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">🍲</div>
        )}
      </div>

      <div className="px-4 md:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-medium">{name}</h1>
          {(item.weight_grams || item.volume_ml) && (
            <p className="text-sm text-hearth-700/60 mt-1">
              {item.weight_grams ? `${item.weight_grams} г` : `${item.volume_ml} мл`}
            </p>
          )}
          {description && <p className="text-hearth-700 mt-3">{description}</p>}
        </div>

        {ingredients && (
          <div>
            <h3 className="font-medium mb-1">{t('product.ingredients')}</h3>
            <p className="text-sm text-hearth-700/80">{ingredients}</p>
          </div>
        )}

        {(item.item_option_groups ?? []).map((group) => (
          <div key={group.id}>
            <h3 className="font-medium mb-2">
              {localized(group, 'name', lang)}
              {group.is_required && <span className="text-embers-600 ml-1">*</span>}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(group.item_options ?? []).map((opt) => {
                const isSelected = (selected[group.id] ?? []).includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(group.id, opt.id, group.max_select)}
                    disabled={!opt.is_available}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors disabled:opacity-40 ${
                      isSelected
                        ? 'bg-hearth-900 text-cream border-hearth-900'
                        : 'border-hearth-900/15 text-hearth-700 hover:border-hearth-900/30'
                    }`}
                  >
                    {localized(opt, 'name', lang)}
                    {opt.price_delta > 0 && ` +${formatCurrency(opt.price_delta, lang)}`}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div>
          <h3 className="font-medium mb-2">{t('product.special_instructions')}</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('product.special_instructions_placeholder') as string}
            rows={2}
            className="w-full rounded-2xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">{t('product.quantity')}</span>
          <div className="flex items-center gap-3 border border-hearth-900/15 rounded-full px-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 text-lg font-semibold text-hearth-700"
              aria-label="-"
            >
              −
            </button>
            <span className="w-6 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 text-lg font-semibold text-hearth-700"
              aria-label="+"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="fixed md:sticky bottom-16 md:bottom-0 left-0 right-0 bg-cream border-t border-hearth-900/10 p-4">
        <button
          onClick={handleAdd}
          disabled={!requiredGroupsSatisfied || !item.is_available}
          className="w-full rounded-full bg-embers-600 text-cream py-4 font-semibold text-base disabled:opacity-40 hover:bg-embers-700 transition-colors"
        >
          {justAdded ? t('product.added') : `${t('product.add_to_cart')} · ${formatCurrency(unitTotal * quantity, lang)}`}
        </button>
      </div>
    </div>
  )
}
