import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n'

export default function MapPicker({ lat, lon, onClose, onPick }) {
  const { t } = useI18n()
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !window.L) return
    const center = (lat && lon) ? [lat, lon] : [41.311081, 69.240562]
    const map = window.L.map(containerRef.current).setView(center, 13)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    const marker = window.L.marker(center, { draggable: true }).addTo(map)
    markerRef.current = marker
    map.on('click', (e) => marker.setLatLng(e.latlng))
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 50)
    return () => { map.remove() }
  }, [])

  const confirm = () => {
    const pos = markerRef.current?.getLatLng()
    if (!pos) return
    if (onPick) onPick(pos.lat, pos.lng)
    else if (onClose) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-bg rounded-2xl border border-border/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          <p className="font-display text-body-lg text-ink">{t("Select delivery location")}</p>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center text-ink-muted hover:text-ink transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div ref={containerRef} className="h-[420px] w-full" />
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border/10">
          <p className="text-body-sm text-ink-muted flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">place</span>
            {t("Drag the pin to your delivery location")}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost px-6 py-3">{t("Cancel")}</button>
            <button type="button" onClick={confirm} className="btn-primary px-8 py-3">{t("Use this location")}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}