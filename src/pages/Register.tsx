import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signUp(email, password, fullName, phone)
    setLoading(false)
    if (error) setError(error)
    else navigate('/account', { replace: true })
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-display font-medium mb-6">{t('auth.register')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('auth.full_name') as string}
          className="w-full rounded-xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500" />
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('auth.phone') as string}
          className="w-full rounded-xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500" />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email') as string}
          className="w-full rounded-xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password') as string}
          className="w-full rounded-xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-hearth-900 text-cream py-3.5 font-semibold disabled:opacity-40">
          {t('auth.register_button')}
        </button>
      </form>
      <div className="flex justify-between mt-4 text-sm">
        <Link to="/login" className="text-embers-700 hover:underline">{t('auth.have_account')}</Link>
      </div>
      <Link to="/menu" className="block text-center text-sm text-hearth-700/70 mt-6 hover:underline">
        {t('auth.continue_as_guest')}
      </Link>
    </div>
  )
}
