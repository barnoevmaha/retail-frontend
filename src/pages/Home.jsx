import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useI18n } from '../i18n'

const ARTICLES = [
  {
    tag: 'Style',
    title: 'Mastering the Monochrome',
    subtitle: 'The tonal palette, decoded.',
    desc: 'Discover the art of tonal dressing. How varying textures and subtle shifts in shade elevate a single-color palette from simple to profound.',
    cta: 'Read Editorial',
    icon: 'contrast',
  },
  {
    tag: 'Craft',
    title: 'The Anatomy of a Shirt',
    subtitle: 'Collar roll, placket, and the seams that hold.',
    desc: 'From collar roll to cuff, a closer look at the construction details that separate a good shirt from a great one.',
    cta: 'Read Article',
    icon: 'checkroom',
  },
  {
    tag: 'Edit',
    title: 'Wardrobe, Edited',
    subtitle: 'Fewer pieces. Better judgement.',
    desc: 'A capsule approach to dressing — fewer, better pieces that work together across seasons, occasions, and moods.',
    cta: 'Explore Collection',
    icon: 'auto_awesome',
  },
  {
    tag: 'Tailoring',
    title: 'The Art of the Quiet Suit',
    subtitle: 'Cut for stillness, worn with intent.',
    desc: 'The restrained silhouette of the modern suit — where shoulders are soft, drape is generous, and detail lives in the seam.',
    cta: 'Read Editorial',
    icon: 'taunt',
  },
  {
    tag: 'Fabric',
    title: 'A Study in Wool',
    subtitle: 'From fleece to fell to finish.',
    desc: 'Wool is the fabric of character. We trace the journey of a single bolt — spinning, weaving, and the hand that finally shapes it.',
    cta: 'Read Article',
    icon: 'texture',
  },
]

export default function Home() {
  const { t } = useI18n()
  const [imgs, setImgs] = useState([])
  const [visible, setVisible] = useState({})
  const refs = useRef([])

  useEffect(() => {
    api.get('/products/', { params: { limit: 100 } })
      .then((r) => setImgs((r.data.items || []).flatMap((p) => p.images?.[0]?.image_url ? [p.images[0].image_url] : [])))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((v) => ({ ...v, [e.target.dataset.i]: true }))
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    refs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
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
      <section className="py-24 md:py-40">
        <div className="max-w-2xl mb-24 md:mb-36">
          <p className="eyebrow text-accent mb-4">{t("Editorial")}</p>
          <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-ink">{t("The Journal")}</h2>
        </div>

        <div className="flex flex-col gap-[100px] md:gap-[160px]">
          {ARTICLES.map((a, i) => {
            const flip = i % 2 === 1
            const img = imgs[i]
            return (
              <section
                key={a.title}
                data-i={i}
                ref={(el) => (refs.current[i] = el)}
                className={`grid grid-cols-1 md:grid-cols-12 gap-gutter md:gap-16 items-start reveal-scroll ${visible[i] ? 'in-view' : ''}`}
              >
                <div
                  className={`md:col-span-5 md:row-start-1 ${flip ? 'md:col-start-8' : 'md:col-start-1'} order-2 md:order-none self-start`}
                >
                  <p className="eyebrow text-accent mb-4">{t(a.tag)}</p>
                  <h3 className="font-display text-headline-lg-mobile md:text-headline-lg text-ink mb-3">{t(a.title)}</h3>
                  <p className="font-display text-headline-md text-ink-muted mb-5">{t(a.subtitle)}</p>
                  <p className="text-body-md text-ink-muted leading-relaxed mb-10">{t(a.desc)}</p>
                  <Link to="/catalog" className="btn-ghost">{t(a.cta)}</Link>
                </div>
                <div className={`md:col-span-6 md:row-start-1 ${flip ? 'md:col-start-1' : 'md:col-start-7'} order-1 md:order-none self-start`}>
                  <div className="relative aspect-[3/4] w-full bg-surface-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {img ? (
                      <img src={img} alt={t(a.title)} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[64px] text-ink-muted/25">{a.icon}</span>
                    )}
                  </div>
                </div>
              </section>
            )
          })}
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