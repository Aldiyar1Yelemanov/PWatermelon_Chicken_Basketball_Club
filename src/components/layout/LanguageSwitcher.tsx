import { useTranslation } from 'react-i18next'
import type { Lang } from '../../lib/types'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
]

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation()
  const current = (i18n.language?.slice(0, 2) as Lang) || 'ru'

  return (
    <div className={`inline-flex items-center rounded-full bg-hearth-900/5 p-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => i18n.changeLanguage(l.code)}
          aria-pressed={current === l.code}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
            current === l.code ? 'bg-hearth-900 text-cream' : 'text-hearth-700 hover:text-hearth-900'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
