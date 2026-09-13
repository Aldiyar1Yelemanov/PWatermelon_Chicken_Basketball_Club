import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../lib/format'
import type { Lang } from '../../lib/types'

export default function CartButton() {
  const { itemCount, subtotal } = useCart()
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'

  if (itemCount === 0) {
    return (
      <Link
        to="/cart"
        className="flex items-center gap-2 rounded-full bg-hearth-900 text-cream px-5 py-2.5 text-sm font-medium hover:bg-hearth-800 transition-colors"
      >
        {t('nav.cart')}
      </Link>
    )
  }

  return (
    <Link
      to="/cart"
      className="flex items-center gap-2 rounded-full bg-embers-600 text-cream px-5 py-2.5 text-sm font-semibold shadow-warm hover:bg-embers-700 transition-colors"
    >
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cream text-embers-700 text-xs font-bold">
        {itemCount}
      </span>
      {formatCurrency(subtotal, lang)}
    </Link>
  )
}
