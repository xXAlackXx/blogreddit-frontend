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
  pageBg:      '#0f1115',
  panelBg:     '#141a16',
  panelAlt:    '#0f1410',
  tabBg:       '#0d1210',
  text:        '#e5e5e5',
  textSub:     '#6b7280',
  textMuted:   '#374151',
  textFaint:   '#4b5563',
  border:      '#1c2420',
  borderMid:   '#1c2420',
  borderLight: '#161c18',
  shadow:      '#1c2420',
  inputBg:     '#0f1410',
  skeletonBg:  '#1a201c',
  accent:      '#00ff88',
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
