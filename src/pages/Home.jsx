import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function Home() {
  const { t } = useI18n()
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
        <div className="grid grid-cols-12 gap-gutter items-end mb-14">
          <div className="col-span-12 md:col-span-7">
            <p className="eyebrow text-accent mb-4">{t("Editorial")}</p>
            <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-ink">{t("The Journal")}</h2>
          </div>
          <div className="col-span-12 md:col-span-5 md:text-right">
            <Link to="/catalog" className="btn-ghost">{t("Read Editorial")}</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[
            {
              icon: 'contrast',
              tag: t('Style'),
              title: t('Mastering the Monochrome'),
              excerpt: t('Discover the art of tonal dressing. How varying textures and subtle shifts in shade elevate a single-color palette from simple to profound.'),
            },
            {
              icon: 'checkroom',
              tag: t('Craft'),
              title: t('The Anatomy of a Shirt'),
              excerpt: t('From collar roll to cuff, a closer look at the construction details that separate a good shirt from a great one.'),
            },
            {
              icon: 'auto_awesome',
              tag: t('Edit'),
              title: t('Wardrobe, Edited'),
              excerpt: t('A capsule approach to dressing — fewer, better pieces that work together across seasons, occasions, and moods.'),
            },
          ].map((a) => (
            <article key={a.title} className="group reveal-up">
              <div className="relative aspect-[3/4] bg-surface-muted rounded-lg overflow-hidden flex items-center justify-center mb-6 group-hover:bg-ink/5 transition-colors duration-700">
                <span className="material-symbols-outlined text-[64px] text-ink-muted/25 transition-transform duration-700 group-hover:scale-110">{a.icon}</span>
                <span className="absolute top-4 left-4 eyebrow text-accent">{a.tag}</span>
              </div>
              <h3 className="font-display text-headline-md text-ink mb-3 group-hover:text-accent transition-colors duration-300">{a.title}</h3>
              <p className="text-body-md text-ink-muted">{a.excerpt}</p>
              <span className="inline-flex items-center gap-2 mt-5 text-body-md text-accent">
                {t('Read')}
                <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
              </span>
            </article>
          ))}
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
