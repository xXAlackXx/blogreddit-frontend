const VARIANTS = {
  acid:  { bg: '#6DC800', color: '#111008' },
  rust:  { bg: '#E8420A', color: '#fff' },
  amber: { bg: '#F0B800', color: '#111008' },
  steel: { bg: '#1A6EC0', color: '#fff' },
  teal:  { bg: '#0A9E88', color: '#fff' },
  plain: { bg: '#E8E4DC', color: '#6A6258' },
}

const VARIANT_LIST = ['acid','rust','amber','steel','teal','plain']

export function getTagVariant(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return VARIANT_LIST[Math.abs(hash) % VARIANT_LIST.length]
}

export default function TagBadge({ label, variant }) {
  const v = VARIANTS[variant] || VARIANTS.plain
  return (
    <span style={{
      display: 'inline-block',
      background: v.bg,
      color: v.color,
      border: '2px solid #111008',
      boxShadow: '2px 2px 0 #111008',
      padding: '1px 8px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderRadius: 2,
      transform: `rotate(${(Math.random() - 0.5) * 2}deg)`,
    }}>
      {label}
    </span>
  )
}
