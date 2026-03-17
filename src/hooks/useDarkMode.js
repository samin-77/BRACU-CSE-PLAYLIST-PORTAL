import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'brac_cse_portal_theme'

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

export function useDarkMode() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return useMemo(() => {
    function toggle() {
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    }
    return { theme, setTheme, toggle }
  }, [theme])
}

