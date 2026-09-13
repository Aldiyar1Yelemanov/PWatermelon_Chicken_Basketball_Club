import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { getAddresses, saveAddress } from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

export default function Addresses() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getAddresses(user.id).then((data) => {
      setAddresses(data)
      setLoading(false)
    })
  }, [user])

  if (!user) {
    return <EmptyState emoji="📍" message={t('checkout.guest_notice') as string} ctaLabel={t('auth.login') as string} ctaTo="/login" />
  }

  const handleAdd = async () => {
    if (!street.trim() || !house.trim()) return
    const { data } = await saveAddress(user.id, { street: street.trim(), house: house.trim(), city: 'Актобе' })
    if (data) setAddresses((prev) => [...prev, data])
    setStreet('')
    setHouse('')
    setAdding(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-display font-medium mb-6">{t('nav.address')}</h1>

      {loading ? null : addresses.length === 0 && !adding ? (
        <p className="text-hearth-700 mb-6">—</p>
      ) : (
        <div className="space-y-3 mb-6">
          {addresses.map((a) => (
            <div key={a.id} className="bg-white rounded-card p-4 shadow-warm text-sm">
              {a.street}, {a.house}{a.apartment ? `, кв. ${a.apartment}` : ''}
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="bg-white rounded-card p-4 shadow-warm space-y-3">
          <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder={t('checkout.street') as string}
            className="w-full rounded-xl border border-hearth-900/15 px-3 py-2.5 text-sm" />
          <input value={house} onChange={(e) => setHouse(e.target.value)} placeholder={t('checkout.house') as string}
            className="w-full rounded-xl border border-hearth-900/15 px-3 py-2.5 text-sm" />
          <button onClick={handleAdd} className="w-full rounded-full bg-hearth-900 text-cream py-3 font-medium">
            {t('common.save')}
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="rounded-full border border-hearth-900/15 px-5 py-2.5 text-sm font-medium">
          + {t('checkout.step_address')}
        </button>
      )}
    </div>
  )
}
