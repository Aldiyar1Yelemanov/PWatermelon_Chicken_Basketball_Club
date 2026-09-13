import { useEffect, useRef, useState } from 'react'

const DEFAULT_CENTER: [number, number] = [57.1522, 50.2839]

interface MapPickerProps {
  coordinates: [number, number] | null
  onSelect: (coordinates: [number, number]) => void
}

export default function MapPicker({ coordinates, onSelect }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      const apiKey = import.meta.env.VITE_2GIS_API_KEY
      if (!apiKey || !containerRef.current) {
        setStatus('error')
        return
      }

      try {
        if (!window.mapgl) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector<HTMLScriptElement>('script[data-2gis-mapgl]')
            if (existing) {
              existing.addEventListener('load', () => resolve(), { once: true })
              existing.addEventListener('error', () => reject(new Error('2GIS script failed')), { once: true })
              return
            }
            const script = document.createElement('script')
            script.src = `https://mapgl.2gis.com/api/js/v1?key=${encodeURIComponent(apiKey)}`
            script.async = true
            script.dataset['2gisMapgl'] = 'true'
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('2GIS script failed'))
            document.head.appendChild(script)
          })
        }

        if (cancelled || !containerRef.current || !window.mapgl) return
        const mapgl = window.mapgl
        const initialCenter = coordinates ?? DEFAULT_CENTER
        const map = new mapgl.Map(containerRef.current, {
          center: initialCenter,
          zoom: coordinates ? 16 : 12,
          key: apiKey,
        })
        mapRef.current = map
        setStatus('ready')

        const placeMarker = (point: [number, number]) => {
          markerRef.current?.destroy()
          markerRef.current = new mapgl.Marker(map, { coordinates: point })
          onSelect(point)
        }

        map.on('click', (event: { lngLat: [number, number] }) => placeMarker(event.lngLat))
        if (coordinates) placeMarker(coordinates)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    initialize()
    return () => {
      cancelled = true
      markerRef.current?.destroy()
      mapRef.current?.destroy()
      markerRef.current = null
      mapRef.current = null
    }
  }, [])

  if (status === 'error') {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl bg-hearth-900/5 px-6 text-center text-sm text-hearth-700/70">
        Не удалось загрузить карту 2GIS. Проверьте ключ в файле .env.local.
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-hearth-900/10">
      <div ref={containerRef} className="h-72 w-full bg-hearth-900/5 md:h-80" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream/80 text-sm text-hearth-700/70">
          Загружаем карту 2GIS...
        </div>
      )}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs text-hearth-700 shadow-sm">
        Нажмите на карту, чтобы выбрать точку
      </div>
    </div>
  )
}
