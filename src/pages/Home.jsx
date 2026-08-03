import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useI18n } from '../i18n'

export default function Home() {
  const { t } = useI18n()
  const [hero, setHero] = useState(null)

  useEffect(() => {
    api.get('/products/', { params: { limit: 12 } })
      .then((r) => setHero((r.data.items || []).find((p) => p.images?.[0]?.image_url) || null))
      .catch(() => {})
  }, [])
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden -mx-mobile-margin md:-mx-section-padding-h">
        <div className="absolute inset-0 ambient-glow pointer-events-none" />
        <div className="relative z-10 text-center px-mobile-margin max-w-3xl mx-auto">
          <p className="eyebrow text-accent mb-6 reveal-up">{t("The Heritage")}</p>
          <h1 className="font-display text-display-lg text-ink mb-6 reveal-up delay-100">
            {t("The Timeless")}
            <br />
            {t("Collection")}
          </h1>
          <p className="text-body-lg text-ink-muted max-w-2xl mx-auto mb-10 reveal-up delay-300">
            {t("An exploration of enduring style. Precision tailoring meets modern sensibility in our latest curation of essential menswear.")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal-up delay-500">
            <Link to="/catalog" className="btn-primary">{t("Explore Collection")}</Link>
            <Link to="/market" className="btn-ghost">{t("New Arrivals")}</Link>
          </div>
        </div>
      </section>

      {/* Editorial: The Journal */}
      <section className="py-24 md:py-section-padding-v">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-5 md:col-start-2 pt-12 md:pt-0 reveal-up">
            <h2 className="font-display text-headline-lg text-ink mb-6">{t("The Journal")}</h2>
            <h3 className="font-display text-headline-md text-ink mb-4">{t("Mastering the Monochrome")}</h3>
            <p className="text-body-lg text-ink-muted mb-8">
              {t("Discover the art of tonal dressing. Our latest editorial explores how varying textures and subtle shifts in shade can elevate a single-color palette from simple to profound.")}
            </p>
            <Link to="/catalog" className="btn-ghost">{t("Read Editorial")}</Link>
          </div>
          <div className="md:col-span-5 md:col-start-8 order-first md:order-none">
            <div className="relative aspect-[3/4] w-full bg-surface-muted rounded-lg overflow-hidden flex items-center justify-center">
              {hero ? (
                <img src={hero.images[0].image_url} alt={hero.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[48px] text-ink-muted/40">auto_awesome</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Craft manifesto strip */}
      <section className="border-y border-border/10 py-24 md:py-section-padding-v text-center">
        <p className="eyebrow text-accent mb-6 reveal-up">{t("The Craft")}</p>
        <p className="font-display text-headline-md text-ink max-w-2xl mx-auto leading-relaxed reveal-up delay-300">
          {t("True luxury is found in what is left unsaid — form, proportion, and the intrinsic quality of raw materials.")}
        </p>
      </section>
    </div>
  )
}
