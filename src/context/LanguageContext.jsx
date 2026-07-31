import { useEffect } from 'react'
import { initTranslations } from '../i18n'

export function I18nProvider({ children }) {
  useEffect(() => {
    initTranslations()
  }, [])
  return children
}
