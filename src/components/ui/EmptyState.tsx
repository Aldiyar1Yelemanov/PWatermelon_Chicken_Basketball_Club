import { Link } from 'react-router-dom'

export default function EmptyState({
  emoji = '🍽️',
  message,
  ctaLabel,
  ctaTo,
}: {
  emoji?: string
  message: string
  ctaLabel?: string
  ctaTo?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="text-5xl mb-4">{emoji}</div>
      <p className="text-hearth-700 mb-6 max-w-xs">{message}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="rounded-full bg-hearth-900 text-cream px-6 py-3 text-sm font-medium hover:bg-hearth-800 transition-colors">
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
