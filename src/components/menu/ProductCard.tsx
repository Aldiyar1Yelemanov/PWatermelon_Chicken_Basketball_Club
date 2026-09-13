import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MenuItem, Lang } from '../../lib/types'
import { formatCurrency, localized } from '../../lib/format'
import { useCart } from '../../contexts/CartContext'

export default function ProductCard({ item }: { item: MenuItem }) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const { addItem } = useCart()

  const name = localized(item, 'name', lang)
  const description = localized(item, 'description', lang)
  const hasOptions = (item.item_option_groups?.length ?? 0) > 0

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasOptions) return // options must be chosen on the product page
    addItem({
      menu_item_id: item.id,
      name: { ru: item.name_ru, kk: item.name_kk, en: item.name_en },
      unit_price: item.price,
      image_url: item.image_url,
      quantity: 1,
      selected_options: [],
    })
  }

  return (
    <Link
      to={`/product/${item.id}`}
      className="group rounded-card bg-white overflow-hidden shadow-warm hover:-translate-y-0.5 transition-transform"
    >
      <div className="aspect-[4/3] bg-embers-100 relative overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍲</div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-hearth-900/60 flex items-center justify-center text-cream text-sm font-medium">
            {t('menu.unavailable')}
          </div>
        )}
        {item.is_available && (
          <button
            onClick={quickAdd}
            aria-label={t('product.add_to_cart') as string}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-embers-600 text-cream text-xl font-semibold flex items-center justify-center shadow-warm hover:bg-embers-700"
          >
            +
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-medium leading-snug">{name}</h3>
        {description && <p className="text-sm text-hearth-700/70 mt-1 line-clamp-2">{description}</p>}
        <div className="mt-3 font-semibold text-embers-700">
          {hasOptions && <span className="text-hearth-700/60 font-normal">{t('menu.from')} </span>}
          {formatCurrency(item.price, lang)}
        </div>
      </div>
    </Link>
  )
}
