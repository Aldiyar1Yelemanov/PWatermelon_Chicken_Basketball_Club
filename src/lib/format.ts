import type { Lang } from './types'

const localeMap: Record<Lang, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US' }

export function formatCurrency(amount: number, lang: Lang = 'ru'): string {
  // KZT formatting per Kazakhstan conventions; tenge sign with no decimals.
  const formatted = new Intl.NumberFormat(localeMap[lang] ?? 'ru-RU', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} ₸`
}

export function formatDate(iso: string, lang: Lang = 'ru'): string {
  return new Intl.DateTimeFormat(localeMap[lang] ?? 'ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function localized<T extends Record<string, any>>(
  obj: T,
  field: string,
  lang: Lang
): string {
  // language fallback: selected -> ru -> first non-empty -> ''
  return obj[`${field}_${lang}`] || obj[`${field}_ru`] || obj[`${field}_en`] || obj[`${field}_kk`] || ''
}
