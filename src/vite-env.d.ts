/// <reference types="vite/client" />

interface Window {
	mapgl?: {
		Map: new (container: HTMLElement, options: Record<string, unknown>) => any
		Marker: new (map: any, options: { coordinates: [number, number] }) => any
	}
}

