'use client'

import * as React from 'react'

type Lang = 'ar' | 'en'

interface LangContextValue {
  lang: Lang
  toggleLang: () => void
  t: (ar: string, en: string) => string
  isAr: boolean
}

const LangContext = React.createContext<LangContextValue>({
  lang: 'ar',
  toggleLang: () => {},
  t: (ar) => ar,
  isAr: true,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>('ar')
  const [mounted, setMounted] = React.useState(false)

  // After mount: load stored preference
  React.useEffect(() => {
    const stored = localStorage.getItem('pronurse-lang') as Lang | null
    if (stored === 'ar' || stored === 'en') setLang(stored)
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    localStorage.setItem('pronurse-lang', lang)
    const html = document.documentElement
    html.setAttribute('lang', lang === 'ar' ? 'ar' : 'en')
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  }, [lang, mounted])

  const toggleLang = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en)

  // Before mount always expose 'ar' so server + first client render match
  const effectiveLang: Lang = mounted ? lang : 'ar'

  return (
    <LangContext.Provider value={{ lang: effectiveLang, toggleLang, t, isAr: effectiveLang === 'ar' }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return React.useContext(LangContext)
}
