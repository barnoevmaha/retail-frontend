import { Link } from 'react-router-dom'
import { t } from '../i18n'

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4 text-ink">{t('home.title')}</h1>
      <p className="text-ink-muted mb-8">{t('home.subtitle')}</p>
      <Link to="/catalog" className="inline-block bg-accent text-accent-ink px-8 py-3 rounded-control font-medium hover:bg-accent-hover transition-colors">{t('home.shop_now')}</Link>
    </div>
  )
}