import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import CartButton from './CartButton'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-embers-600' : 'text-hearth-700 hover:text-hearth-900'}`

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-hearth-900/10">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-display font-semibold tracking-tight">{t('brand.name')}</span>
        </Link>

        <Link
          to="/addresses"
          className="flex-1 max-w-xs truncate text-sm text-hearth-700 border border-hearth-900/15 rounded-full px-4 py-2 hover:border-hearth-900/30 transition-colors"
        >
          {t('home.where_deliver')}
        </Link>

        <Link
          to="/search"
          className="flex-1 max-w-sm text-sm text-hearth-700/70 border border-hearth-900/15 rounded-full px-4 py-2 hover:border-hearth-900/30 transition-colors"
        >
          {t('search.placeholder')}
        </Link>

        <nav className="flex items-center gap-6 shrink-0">
          <NavLink to="/menu" className={navLinkClass}>{t('nav.menu')}</NavLink>
          <NavLink to="/promotions" className={navLinkClass}>{t('nav.promotions')}</NavLink>
          <NavLink to="/restaurant" className={navLinkClass}>{t('nav.restaurant')}</NavLink>
          <NavLink to="/orders" className={navLinkClass}>{t('nav.orders')}</NavLink>
          <NavLink to="/account" className={navLinkClass}>{t('nav.account')}</NavLink>
        </nav>

        <LanguageSwitcher />
        <CartButton />
      </div>
    </header>
  )
}
