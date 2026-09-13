import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirectTo = (location.state as any)?.from ?? '/account'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
    else navigate(redirectTo, { replace: true })
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-display font-medium mb-6">{t('auth.login')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.email') as string}
          className="w-full rounded-xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500"
        />
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.password') as string}
          className="w-full rounded-xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-hearth-900 text-cream py-3.5 font-semibold disabled:opacity-40">
          {t('auth.login_button')}
        </button>
      </form>
      <div className="flex justify-between mt-4 text-sm">
        <Link to="/forgot-password" className="text-embers-700 hover:underline">{t('auth.forgot_password')}</Link>
        <Link to="/register" className="text-embers-700 hover:underline">{t('auth.no_account')}</Link>
      </div>
      <Link to="/menu" className="block text-center text-sm text-hearth-700/70 mt-6 hover:underline">
        {t('auth.continue_as_guest')}
      </Link>
    </div>
  )
}
