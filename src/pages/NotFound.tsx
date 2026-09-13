import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="text-5xl mb-4">🔥</div>
      <p className="text-hearth-700 mb-6">404</p>
      <Link to="/" className="rounded-full bg-hearth-900 text-cream px-6 py-3 text-sm font-medium">
        {t('nav.home')}
      </Link>
    </div>
  )
}
