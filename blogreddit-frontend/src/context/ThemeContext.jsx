import { createContext, useContext, useState, useEffect } from 'react'

const light = {
  pageBg:      '#ECEAE2',
  panelBg:     '#FDFCF8',
  panelAlt:    '#F2EFE8',
  tabBg:       '#E8E4DC',
  text:        '#111008',
  textSub:     '#3A3630',
  textMuted:   '#9A9288',
  textFaint:   '#6A6258',
  border:      '#111008',
  borderMid:   '#C8C2B6',
  borderLight: '#E8E4DC',
  shadow:      '#111008',
  inputBg:     '#FDFCF8',
  skeletonBg:  '#E8E4DC',
  accent:      '#6DC800',
}

const dark = {
  pageBg:      '#0a0c0a',   // --onyx-bg-base
  panelBg:     '#0c100c',   // --onyx-bg-elevated
  panelAlt:    '#080a08',   // --onyx-bg-deep
  tabBg:       '#080a08',   // --onyx-bg-deep
  text:        '#e8ede6',   // --onyx-text-primary
  textSub:     '#c8d1c4',   // --onyx-text-body
  textMuted:   '#8a9488',   // --onyx-text-muted
  textFaint:   '#5a6358',   // --onyx-text-faint
  border:      '#1f2a1d',   // --onyx-border-subtle
  borderMid:   '#2a312a',   // --onyx-border-muted
  borderLight: '#2d3a2d',   // --onyx-border-accent
  shadow:      '#1f2a1d',   // --onyx-border-subtle
  inputBg:     '#0a0c0a',   // --onyx-bg-base
  skeletonBg:  '#1a201c',
  accent:      '#4ade4a',   // --onyx-green
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggle = () => setIsDark(d => {
    const next = !d
    localStorage.setItem('theme', next ? 'dark' : 'light')
    return next
  })

  return (
    <ThemeContext.Provider value={{ isDark, toggle, t: isDark ? dark : light }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
