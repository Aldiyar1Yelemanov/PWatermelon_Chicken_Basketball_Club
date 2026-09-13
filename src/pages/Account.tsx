import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import LanguageSwitcher from '../components/layout/LanguageSwitcher'

export default function Account() {
  const { t } = useTranslation()
  const { user, signOut, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-display font-medium mb-6">{t('nav.account')}</h1>
      <p className="text-hearth-700 mb-8">{user.email}</p>

      <div className="space-y-3">
        <Link to="/orders" className="block bg-white rounded-card p-4 shadow-warm hover:-translate-y-0.5 transition-transform">
          {t('nav.orders')}
        </Link>
        <Link to="/addresses" className="block bg-white rounded-card p-4 shadow-warm hover:-translate-y-0.5 transition-transform">
          {t('nav.address')}
        </Link>
        <div className="bg-white rounded-card p-4 shadow-warm flex items-center justify-between">
          <span>{t('nav.address')} · Язык</span>
          <LanguageSwitcher compact />
        </div>
        <button
          onClick={() => signOut()}
          className="w-full text-left bg-white rounded-card p-4 shadow-warm text-embers-700 font-medium"
        >
          {t('auth.logout')}
        </button>
      </div>
    </div>
  )
}
