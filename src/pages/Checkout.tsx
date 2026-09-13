import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/format'
import type { Lang } from '../lib/types'
import { getPrimaryBranch, getDeliveryZones, placeOrder } from '../lib/api'
import EmptyState from '../components/ui/EmptyState'

type PaymentMethod = 'KASPI' | 'CARD' | 'CASH'

export default function Checkout() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const navigate = useNavigate()
  const { lines, subtotal, clear } = useCart()
  const { user } = useAuth()

  const [branchId, setBranchId] = useState<string | null>(null)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [minOrder, setMinOrder] = useState(0)

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Актобе')
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')
  const [apartment, setApartment] = useState('')
  const [entrance, setEntrance] = useState('')
  const [floor, setFloor] = useState('')
  const [intercom, setIntercom] = useState('')
  const [addressComment, setAddressComment] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('KASPI')
  const [orderComment, setOrderComment] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPrimaryBranch().then(async (branch) => {
      if (!branch) return
      setBranchId(branch.id)
      setMinOrder(branch.min_order_amount)
      // TODO: once addresses carry coordinates, match the entered address
      // against delivery_zones by polygon/radius instead of always using
      // the first active zone. See README "Notes on production-readiness".
      const zones = await getDeliveryZones(branch.id)
      if (zones.length > 0) {
        setDeliveryFee(zones[0].delivery_fee)
        setMinOrder(Math.max(branch.min_order_amount, zones[0].min_order_amount))
      }
    })
  }, [])

  if (lines.length === 0) {
    return <EmptyState emoji="🛒" message={t('cart.empty') as string} ctaLabel={t('cart.empty_cta') as string} ctaTo="/menu" />
  }

  const fee = deliveryMethod === 'pickup' ? 0 : deliveryFee
  const total = subtotal + fee
  const belowMinimum = deliveryMethod === 'delivery' && subtotal < minOrder
  const canSubmit =
    fullName.trim() &&
    /^[0-9+()\s-]{7,}$/.test(phone) &&
    (deliveryMethod === 'pickup' || (street.trim() && house.trim())) &&
    !belowMinimum &&
    branchId

  const handleSubmit = async () => {
    if (!canSubmit || !branchId) return
    setSubmitting(true)
    setError(null)

    const { order, error: orderError } = await placeOrder({
      userId: user?.id ?? null,
      branchId,
      lines,
      subtotal,
      deliveryFee: fee,
      discount: 0,
      total,
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      deliveryMethod,
      city,
      street: street.trim(),
      house: house.trim(),
      apartment: apartment.trim(),
      entrance: entrance.trim(),
      floor: floor.trim(),
      intercom: intercom.trim(),
      addressComment: addressComment.trim(),
      paymentMethod,
      orderComment: orderComment.trim(),
      language: lang,
    })

    setSubmitting(false)

    if (orderError || !order) {
      setError(t('errors.order_failed') as string)
      return
    }

    clear()
    navigate(`/orders/${order.id}`, { replace: true })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-40">
      <h1 className="text-2xl font-display font-medium mb-1">{t('checkout.title')}</h1>
      {!user && <p className="text-sm text-hearth-700/70 mb-6">{t('checkout.guest_notice')}</p>}

      <div className="space-y-6">
        {/* Delivery method */}
        <section className="bg-white rounded-card p-5 shadow-warm">
          <h2 className="font-medium mb-3">{t('checkout.step_delivery')}</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setDeliveryMethod('delivery')}
              className={`flex-1 py-3 rounded-2xl border font-medium text-sm ${
                deliveryMethod === 'delivery' ? 'bg-hearth-900 text-cream border-hearth-900' : 'border-hearth-900/15 text-hearth-700'
              }`}
            >
              {t('checkout.delivery')}
            </button>
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex-1 py-3 rounded-2xl border font-medium text-sm ${
                deliveryMethod === 'pickup' ? 'bg-hearth-900 text-cream border-hearth-900' : 'border-hearth-900/15 text-hearth-700'
              }`}
            >
              {t('checkout.pickup')}
            </button>
          </div>
        </section>

        {/* Address */}
        {deliveryMethod === 'delivery' && (
          <section className="bg-white rounded-card p-5 shadow-warm space-y-3">
            <h2 className="font-medium">{t('checkout.step_address')}</h2>
            {belowMinimum && (
              <p className="text-sm text-embers-700 bg-embers-50 rounded-xl px-3 py-2">
                {t('checkout.below_minimum', { amount: formatCurrency(minOrder, lang) })}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('checkout.city') as string} value={city} onChange={setCity} className="col-span-2" />
              <Field label={t('checkout.street') as string} value={street} onChange={setStreet} className="col-span-2" required />
              <Field label={t('checkout.house') as string} value={house} onChange={setHouse} required />
              <Field label={t('checkout.apartment') as string} value={apartment} onChange={setApartment} />
              <Field label={t('checkout.entrance') as string} value={entrance} onChange={setEntrance} />
              <Field label={t('checkout.floor') as string} value={floor} onChange={setFloor} />
              <Field label={t('checkout.intercom') as string} value={intercom} onChange={setIntercom} className="col-span-2" />
            </div>
            <textarea
              value={addressComment}
              onChange={(e) => setAddressComment(e.target.value)}
              placeholder={t('checkout.address_comment') as string}
              rows={2}
              className="w-full rounded-2xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500"
            />
          </section>
        )}

        {/* Contact */}
        <section className="bg-white rounded-card p-5 shadow-warm space-y-3">
          <h2 className="font-medium">{t('checkout.step_contact')}</h2>
          <Field label={t('checkout.full_name') as string} value={fullName} onChange={setFullName} required />
          <Field label={t('checkout.phone') as string} value={phone} onChange={setPhone} required placeholder="+7 700 000 00 00" />
        </section>

        {/* Payment */}
        <section className="bg-white rounded-card p-5 shadow-warm">
          <h2 className="font-medium mb-3">{t('checkout.payment_method')}</h2>
          <div className="grid grid-cols-3 gap-2">
            {(['KASPI', 'CARD', 'CASH'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-3 rounded-2xl border text-sm font-medium ${
                  paymentMethod === m ? 'bg-hearth-900 text-cream border-hearth-900' : 'border-hearth-900/15 text-hearth-700'
                }`}
              >
                {m === 'KASPI' ? t('checkout.pay_kaspi') : m === 'CARD' ? t('checkout.pay_card') : t('checkout.pay_cash')}
              </button>
            ))}
          </div>
        </section>

        {/* Order comment */}
        <section className="bg-white rounded-card p-5 shadow-warm">
          <h2 className="font-medium mb-2">{t('checkout.order_comment')}</h2>
          <textarea
            value={orderComment}
            onChange={(e) => setOrderComment(e.target.value)}
            rows={2}
            className="w-full rounded-2xl border border-hearth-900/15 px-4 py-3 text-sm focus:outline-none focus:border-embers-500"
          />
        </section>

        {/* Totals */}
        <section className="bg-white rounded-card p-5 shadow-warm space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-hearth-700">{t('cart.subtotal')}</span>
            <span>{formatCurrency(subtotal, lang)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hearth-700">{t('cart.delivery_fee')}</span>
            <span>{formatCurrency(fee, lang)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-hearth-900/10 mt-2">
            <span>{t('cart.total')}</span>
            <span className="text-embers-700">{formatCurrency(total, lang)}</span>
          </div>
        </section>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
      </div>

      <div className="fixed md:sticky bottom-16 md:bottom-0 left-0 right-0 bg-cream border-t border-hearth-900/10 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full rounded-full bg-embers-600 text-cream py-4 font-semibold disabled:opacity-40 hover:bg-embers-700 transition-colors"
          >
            {submitting ? t('checkout.placing_order') : t('checkout.place_order', { amount: formatCurrency(total, lang) })}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-hearth-700/70 mb-1 block">
        {label}
        {required && <span className="text-embers-600"> *</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-hearth-900/15 px-3 py-2.5 text-sm focus:outline-none focus:border-embers-500"
      />
    </label>
  )
}
