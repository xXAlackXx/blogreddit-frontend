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
  pageBg:      '#0D0D09',
  panelBg:     '#1A1A12',
  panelAlt:    '#131310',
  tabBg:       '#111108',
  text:        '#E8E4DC',
  textSub:     '#C0BAB0',
  textMuted:   '#6A6460',
  textFaint:   '#4A4840',
  border:      '#6DC800',
  borderMid:   '#2A2A1E',
  borderLight: '#252518',
  shadow:      '#6DC800',
  inputBg:     '#131310',
  skeletonBg:  '#1E1E14',
  accent:      '#6DC800',
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
