import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) setError(error)
    else setSent(true)
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-display font-medium mb-6">{t('auth.forgot_password')}</h1>
      {sent ? (
        <p className="text-sm text-hearth-700 bg-embers-50 rounded-xl px-4 py-3">{t('auth.reset_sent')}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email') as string}
            className="w-full rounded-xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-hearth-900 text-cream py-3.5 font-semibold disabled:opacity-40">
            {t('auth.reset_button')}
          </button>
        </form>
      )}
      <Link to="/login" className="block text-center text-sm text-embers-700 mt-6 hover:underline">
        {t('auth.login')}
      </Link>
    </div>
  )
}
