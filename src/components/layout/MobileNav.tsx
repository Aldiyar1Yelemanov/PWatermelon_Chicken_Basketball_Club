import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../lib/format'
import type { Lang } from '../../lib/types'

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[11px] font-medium ${
    isActive ? 'text-embers-600' : 'text-hearth-700/70'
  }`

export default function MobileNav() {
  const { t, i18n } = useTranslation()
  const { itemCount, subtotal } = useCart()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'

  return (
    <>
      {itemCount > 0 && (
        <Link
          to="/cart"
          className="md:hidden fixed bottom-20 left-4 right-4 z-40 flex items-center justify-between rounded-full bg-embers-600 text-cream px-5 py-3.5 shadow-warm font-semibold"
        >
          <span>{t('cart.title')} · {itemCount}</span>
          <span>{formatCurrency(subtotal, lang)}</span>
        </Link>
      )}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream border-t border-hearth-900/10 flex">
        <NavLink to="/" end className={itemClass}>
          <span>🏠</span>{t('nav.home')}
        </NavLink>
        <NavLink to="/menu" className={itemClass}>
          <span>🍽️</span>{t('nav.menu')}
        </NavLink>
        <NavLink to="/search" className={itemClass}>
          <span>🔎</span>{t('nav.search')}
        </NavLink>
        <NavLink to="/orders" className={itemClass}>
          <span>🧾</span>{t('nav.orders')}
        </NavLink>
        <NavLink to="/account" className={itemClass}>
          <span>👤</span>{t('nav.account')}
        </NavLink>
      </nav>
    </>
  )
}
