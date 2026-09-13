import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../contexts/CartContext'
import { formatCurrency, localized } from '../lib/format'
import type { Lang } from '../lib/types'
import EmptyState from '../components/ui/EmptyState'

export default function Cart() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.language?.slice(0, 2) as Lang) || 'ru'
  const navigate = useNavigate()
  const { lines, subtotal, updateQuantity, removeItem, setComment } = useCart()

  if (lines.length === 0) {
    return (
      <EmptyState
        emoji="🛒"
        message={t('cart.empty') as string}
        ctaLabel={t('cart.empty_cta') as string}
        ctaTo="/menu"
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-40">
      <h1 className="text-2xl font-display font-medium mb-6">{t('cart.title')}</h1>

      <div className="space-y-4">
        {lines.map((line) => {
          const name = localized({ name_ru: line.name.ru, name_kk: line.name.kk, name_en: line.name.en }, 'name', lang)
          const optionsTotal = line.selected_options.reduce((s, o) => s + o.price_delta, 0)
          const lineTotal = (line.unit_price + optionsTotal) * line.quantity
          return (
            <div key={line.key} className="flex gap-4 bg-white rounded-card p-4 shadow-warm">
              <div className="w-20 h-20 rounded-2xl bg-embers-100 shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                {line.image_url ? <img src={line.image_url} alt={name} className="w-full h-full object-cover" /> : '🍲'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug">{name}</h3>
                  <button
                    onClick={() => removeItem(line.key)}
                    className="text-xs text-hearth-700/50 hover:text-embers-600 shrink-0"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
                {line.selected_options.length > 0 && (
                  <p className="text-xs text-hearth-700/60 mt-0.5">
                    {line.selected_options.map((o) => o.option_name[lang]).join(', ')}
                  </p>
                )}
                {line.comment && <p className="text-xs text-hearth-700/60 italic mt-0.5">«{line.comment}»</p>}
                {!line.comment && (
                  <button
                    onClick={() => {
                      const c = window.prompt(t('cart.comment_placeholder') as string) ?? ''
                      if (c.trim()) setComment(line.key, c.trim())
                    }}
                    className="text-xs text-embers-700 mt-1 hover:underline"
                  >
                    {t('cart.add_comment')}
                  </button>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 border border-hearth-900/15 rounded-full px-1">
                    <button
                      onClick={() => updateQuantity(line.key, line.quantity - 1)}
                      className="w-7 h-7 text-hearth-700 font-semibold"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{line.quantity}</span>
                    <button
                      onClick={() => updateQuantity(line.key, line.quantity + 1)}
                      className="w-7 h-7 text-hearth-700 font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold text-embers-700">{formatCurrency(lineTotal, lang)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed md:sticky bottom-16 md:bottom-0 left-0 right-0 bg-cream border-t border-hearth-900/10 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-hearth-700 mb-1">
            <span>{t('cart.subtotal')}</span>
            <span>{formatCurrency(subtotal, lang)}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full mt-2 rounded-full bg-embers-600 text-cream py-4 font-semibold hover:bg-embers-700 transition-colors"
          >
            {t('cart.checkout_for', { amount: formatCurrency(subtotal, lang) })}
          </button>
        </div>
      </div>
    </div>
  )
}
