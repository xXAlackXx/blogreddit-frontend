import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const TABS = ['NEW', 'TOP', 'HOT']

export default function SortTabs({ count }) {
  const { t } = useTheme()
  const [active, setActive] = useState(0)

  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
      <div style={{ display:'flex' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            style={{
              padding: '7px 16px',
              border: `2px solid ${t.border}`,
              borderLeft: i === 0 ? `2px solid ${t.border}` : 'none',
              background: active === i ? '#111008' : t.panelBg,
              color: active === i ? '#6DC800' : t.textFaint,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all .15s',
              borderRadius: i === 0 ? '2px 0 0 2px' : i === TABS.length-1 ? '0 2px 2px 0' : 0,
            }}
          >{tab}</button>
        ))}
      </div>
      {count != null && (
        <span style={{
          padding: '5px 12px',
          background: t.tabBg,
          border: `2px solid ${t.borderMid}`,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 700, color: t.textFaint,
          borderRadius: 2,
        }}>
          {count} posts
        </span>
      )}
    </div>
  )
}
