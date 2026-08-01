import { useSyncExternalStore } from 'react'
import api from './api/client'

const STORAGE_KEY = 'lang'
const CACHE_KEY = 'translations_v2'
const FLUSH_DELAY = 400

let lang = localStorage.getItem(STORAGE_KEY) || 'en'
let translations = {}
let version = 0
const listeners = new Set()
const pending = new Set()
let flushTimer = null

function emit() {
  version++
  for (const listener of listeners) listener()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return version
}

function applyParams(text, params) {
  if (!params) return text
  let out = text
  for (const [k, v] of Object.entries(params)) {
    out = out.split(`{${k}}`).join(v)
  }
  return out
}

function persist() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(translations))
  } catch {
    /* storage full/unavailable — in-memory translations still work */
  }
}

function merge(map) {
  let changed = false
  for (const [key, entry] of Object.entries(map)) {
    if (!entry || typeof entry !== 'object') continue
    if (translations[key] !== entry) {
      translations[key] = entry
      changed = true
    }
  }
  if (changed) persist()
  return changed
}

async function flush() {
  flushTimer = null
  const texts = [...pending]
  pending.clear()
  if (!texts.length) return
  try {
    const res = await api.post('/translations/sync', { texts })
    if (merge(res.data?.translations || {})) emit()
  } catch {
    /* backend unreachable — keep English until next attempt */
  }
}

function queueSync(key) {
  pending.add(key)
  if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_DELAY)
}

function translate(key, params) {
  const entry = translations[key]
  const text = entry?.[lang] || key
  if (!entry) queueSync(key)
  return applyParams(text, params)
}

export function setLanguage(next) {
  if (next === lang) return
  lang = next
  localStorage.setItem(STORAGE_KEY, next)
  document.documentElement.lang = next
  emit()
}

export function getLanguages() {
  return [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'uz', label: "O'zbek" },
  ]
}

export function useI18n() {
  useSyncExternalStore(subscribe, getSnapshot)
  return { t: translate, lang, setLanguage }
}

export async function initTranslations() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) merge(JSON.parse(cached))
  } catch {
    /* corrupt cache — ignore, server data will replace it */
  }
  try {
    const res = await api.get('/translations')
    if (merge(res.data?.translations || {})) emit()
  } catch {
    /* backend unreachable — translations already in memory are still usable */
  }
}
