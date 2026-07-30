import { Link } from 'react-router-dom'
import { t } from '../i18n'

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4 dark:text-white">{t('home.title')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{t('home.subtitle')}</p>
      <Link to="/catalog" className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200">{t('home.shop_now')}</Link>
    </div>
  )
}
