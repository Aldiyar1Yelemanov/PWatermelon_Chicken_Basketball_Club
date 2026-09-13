import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MenuCategory, Lang } from '../../lib/types'
import { localized } from '../../lib/format'

export default function CategoryChips({ categories }: { categories: MenuCategory[] }) {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
      <NavLink
        to="/menu"
        end
        className={({ isActive }) =>
          `shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            isActive ? 'bg-hearth-900 text-cream border-hearth-900' : 'border-hearth-900/15 text-hearth-700 hover:border-hearth-900/30'
          }`
        }
      >
        {t('menu.all')}
      </NavLink>
      {categories.map((c) => (
        <NavLink
          key={c.id}
          to={`/menu/${c.slug}`}
          className={({ isActive }) =>
            `shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              isActive ? 'bg-hearth-900 text-cream border-hearth-900' : 'border-hearth-900/15 text-hearth-700 hover:border-hearth-900/30'
            }`
          }
        >
          {localized(c, 'name', lang)}
        </NavLink>
      ))}
    </div>
  )
}
