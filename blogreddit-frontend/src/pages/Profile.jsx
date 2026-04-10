import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import AvatarCropModal from '../components/AvatarCropModal'
import { useTheme } from '../context/ThemeContext'

import api from '../api/axios'

/* ── helpers ── */
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
}
function relTime(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600)   return `${Math.round(diff / 60)} min ago`
  if (diff < 86400)  return `${Math.round(diff / 3600)} h ago`
  if (diff < 172800) return 'yesterday'
  return `${Math.round(diff / 86400)} d ago`
}
function readTime(content) {
  return Math.max(1, Math.round((content || '').trim().split(/\s+/).length / 200))
}
function getRank(karma = 0) {
  if (karma >= 500) return { rango:'VETERAN', nivel:'04', progress:100,                         label:'04 → MAX' }
  if (karma >= 200) return { rango:'REGULAR', nivel:'03', progress:Math.round((karma-200)/3),   label:'03 → 04' }
  if (karma >= 50)  return { rango:'ROOKIE',  nivel:'02', progress:Math.round((karma-50)/1.5),  label:'02 → 03' }
  return              { rango:'RECRUIT', nivel:'01', progress:Math.min(100,Math.round(karma*2)), label:'01 → 02' }
}

const STRIP_COLORS  = ['#6DC800','#1A6EC0','#E8420A','#F0B800','#0A9E88']
const ALLOWED_TYPES = ['image/jpeg','image/png','image/gif','image/webp']
const MAX_AVATAR_MB = 2

/* ── Theme editor constants ── */
const BANNER_PRESETS = {
  nebula:   'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  void:     'linear-gradient(135deg, #0d1117, #161b22, #21262d)',
  ember:    'linear-gradient(135deg, #1a0a0a, #2d1010, #3d1515)',
  matrix:   'linear-gradient(135deg, #0a1a0a, #102d10, #153d15)',
  solar:    'linear-gradient(135deg, #1a1a0a, #2d2d10, #3d3d15)',
  cyber:    'linear-gradient(45deg,  #0a0a1a, #1a0a2d, #2d0a3d)',
  deep_sea: 'linear-gradient(135deg, #0a1628, #162844, #1a3a5c)',
  phantom:  'linear-gradient(135deg, #1a0a28, #2a1040, #3a1858)',
  rust:     'linear-gradient(45deg,  #28100a, #402818, #584028)',
}
const ACCENT_PRESETS = [
  '#A3E635','#4ade4a','#00ff41','#39ff14',
  '#E8420A','#ff4500','#ff6b35',
  '#1A6EC0','#0ea5e9','#00bfff',
  '#F0B800','#ffd700','#ffb700',
  '#0A9E88','#00ced1','#40e0d0',
  '#e879f9','#c084fc','#ff79c6',
]
const FONTS = [
  'JetBrains Mono','Space Mono','Fira Code','IBM Plex Mono',
  'Source Code Pro','Inconsolata','Courier Prime','Share Tech Mono',
  'VT323','Press Start 2P','Silkscreen','Pixelify Sans',
  'Orbitron','Rajdhani','Exo 2','Oxanium',
  'Audiowide','Chakra Petch','Major Mono Display',
]
const MOODS = [
  ['online','// ONLINE'],['coding','// CODING'],['afk','// AFK'],
  ['creating','// CREATING'],['lurking','// LURKING'],['vibing','// VIBING'],
]
const PATTERNS = [['none','NONE'],['grid','GRID'],['dots','DOTS'],['lines','LINES'],['cross','CROSS']]
const PATTERN_BG = {
  none:'',
  grid:'repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 1px,transparent 1px 20px),repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 1px,transparent 1px 20px)',
  dots:'radial-gradient(circle,rgba(255,255,255,.08) 1px,transparent 1px)',
  lines:'repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 1px,transparent 1px 8px)',
  cross:'repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 1px,transparent 1px 12px),repeating-linear-gradient(-45deg,rgba(255,255,255,.04) 0 1px,transparent 1px 12px)',
}
function hexToRgb(hex) {
  const h = hex.replace('#','')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}

/* ── Sub-components ── */
function WindowControls() {
  return (
    <div style={{ display:'flex', gap:5 }}>
      {['#E8420A','#F0B800','#6DC800'].map((c,i) => (
        <div key={i} style={{ width:8, height:8, background:c }} />
      ))}
    </div>
  )
}

function PanelBox({ title, children }) {
  const { t, isDark } = useTheme()
  return (
    <div style={{ border:`2px solid ${t.border}`, boxShadow:`4px 4px 0 ${isDark ? t.border : '#111008'}`, background:t.panelBg }}>
      <div style={{ height:24, background:t.pageBg, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', borderBottom:`1px solid ${t.border}` }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.accent, textTransform:'uppercase' }}>{title}</span>
        <WindowControls />
      </div>
      {children}
    </div>
  )
}

function StatLine({ label, value, acid }) {
  const { t } = useTheme()
  return (
    <div style={{ display:'flex', fontFamily:"'JetBrains Mono',monospace", fontSize:12, lineHeight:1.8 }}>
      <span style={{ color:t.textMuted, textTransform:'uppercase', flexShrink:0 }}>{label}</span>
      <span style={{ color:t.borderMid, flex:1, overflow:'hidden', padding:'0 4px', whiteSpace:'nowrap' }}>{'................'.repeat(4)}</span>
      <span style={{ color: acid ? t.accent : t.text, fontWeight:700, textTransform:'uppercase', flexShrink:0 }}>{value}</span>
    </div>
  )
}

function TabBtn({ label, active, onClick, last }) {
  const { t } = useTheme()
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight: active ? 700 : 400,
        color: active ? t.accent : hov ? t.textSub : t.textMuted,
        background: active ? t.pageBg : hov ? t.panelBg : 'transparent',
        padding:'14px 24px', border:'none', cursor:'pointer',
        borderRight: last ? 'none' : `2px solid ${t.border}`,
        borderBottom: active ? `3px solid ${t.accent}` : '3px solid transparent',
        transition:'all .15s',
      }}
    >{label}</button>
  )
}

function PostCard({ post, index }) {
  const { t } = useTheme()
  const score = (post.upvotes || 0) - (post.downvotes || 0)
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/posts/${post.id}`} state={{ from: 'myprofile' }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
      <article
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ border:`2px solid ${t.border}`, boxShadow: hov ? `6px 6px 0 ${t.shadow}` : `4px 4px 0 ${t.shadow}`, background:t.panelBg, display:'grid', gridTemplateColumns:'4px 1fr', transform: hov ? 'translate(-2px,-2px)' : 'none', transition:'all .1s' }}
      >
        <div style={{ background: STRIP_COLORS[index % STRIP_COLORS.length] }} />
        <div style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted, textTransform:'uppercase' }}>// FEED</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted }}>{relTime(post.created_at)}</span>
          </div>
          <h2 style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontWeight:700, fontSize:17, lineHeight:1.3, color:t.text, marginBottom:8 }}>
            {post.title}
          </h2>
          {post.content && (
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:t.textMuted, lineHeight:1.5, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {post.content}
            </p>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:15, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textSub }}>
            <span style={{ color: score >= 0 ? t.accent : '#E8420A' }}>▲ {score > 0 ? '+' : ''}{score}</span>
            <span>⏱ {readTime(post.content)} min read</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function CommentCard({ comment, index }) {
  const { t } = useTheme()
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/posts/${comment.post_id}`} state={{ from: 'myprofile' }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
      <article
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ border:`2px solid ${t.border}`, boxShadow: hov ? `6px 6px 0 ${t.shadow}` : `4px 4px 0 ${t.shadow}`, background:t.panelBg, display:'grid', gridTemplateColumns:'4px 1fr', transform: hov ? 'translate(-2px,-2px)' : 'none', transition:'all .1s' }}
      >
        <div style={{ background: STRIP_COLORS[(index + 2) % STRIP_COLORS.length] }} />
        <div style={{ padding:'14px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted, textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>
              // EN: {comment.post_title}
            </span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted, flexShrink:0 }}>{relTime(comment.created_at)}</span>
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:t.textSub, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {comment.content}
          </p>
        </div>
      </article>
    </Link>
  )
}

function TerminalEmpty({ lines }) {
  const { t } = useTheme()
  return (
    <div style={{ padding:20, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:t.accent, lineHeight:1.8, borderTop:`2px dashed ${t.borderMid}`, marginTop:10 }}>
      {lines.map((l, i) => <p key={i}>&gt; {l}{i === lines.length-1 && <span className="blinking-cursor"> █</span>}</p>)}
    </div>
  )
}

/* ── Theme Editor Panel ── */
function ThemeEditorPanel({ profile }) {
  const { t } = useTheme()
  const qc = useQueryClient()
  const bannerFileRef = useRef(null)
  const [fontSearch, setFontSearch] = useState('')
  const [saving, setSaving]   = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const { data: themeData, isLoading: themeLoading } = useQuery({
    queryKey: ['myTheme'],
    queryFn: () => api.get('/users/me/theme/').then(r => r.data),
  })

  const DEFAULT_THEME = {
    accent_color:'#A3E635', banner_preset:'nebula', pattern:'none',
    font:'JetBrains Mono', banner_opacity:100, glow_intensity:25,
    border_accent:0, mood:'online',
    has_custom_banner:false, banner_image_url:null,
    banner_gradient: BANNER_PRESETS.nebula,
  }
  const [ts, setTs] = useState(DEFAULT_THEME)
  const update = (k, v) => setTs(p => ({ ...p, [k]: v }))

  useEffect(() => { if (themeData) setTs(DEFAULT_THEME => ({ ...DEFAULT_THEME, ...themeData })) }, [themeData])

  /* Load all preview fonts once */
  useEffect(() => {
    if (document.getElementById('theme-editor-fonts')) return
    const link = document.createElement('link')
    link.id   = 'theme-editor-fonts'
    link.rel  = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${
      FONTS.map(f=>`family=${encodeURIComponent(f)}:wght@400;700`).join('&')
    }&display=swap`
    document.head.appendChild(link)
  }, [])

  /* Derived preview values */
  const rgb = /^#[0-9A-Fa-f]{6}$/.test(ts.accent_color) ? hexToRgb(ts.accent_color) : '163,230,53'

  /* Banner: custom image > selected gradient */
  const bannerBg = ts.has_custom_banner && ts.banner_image_url
    ? `url(${ts.banner_image_url}?t=${ts.updated_at||''}) center/cover`
    : BANNER_PRESETS[ts.banner_preset] || BANNER_PRESETS.nebula

  const previewGlow   = ts.glow_intensity > 0
    ? { boxShadow:`0 0 ${ts.glow_intensity*.35}px rgba(${rgb},${ts.glow_intensity*.004})` } : {}
  const previewBorder = ts.border_accent > 0
    ? { borderColor:`rgba(${rgb},${ts.border_accent/100})` } : {}

  /* Save — only send scalar fields, server returns full theme back */
  const saveTheme = async () => {
    setSaving(true); setSaveErr('')
    try {
      const { data: saved } = await api.patch('/users/me/theme/', {
        accent_color:   ts.accent_color,
        banner_preset:  ts.banner_preset,
        pattern:        ts.pattern,
        font:           ts.font,
        banner_opacity: ts.banner_opacity,
        glow_intensity: ts.glow_intensity,
        border_accent:  ts.border_accent,
        mood:           ts.mood,
      })
      qc.setQueryData(['myTheme'], saved)
      setTs(p => ({ ...p, ...saved }))
      setSavedOk(true); setTimeout(() => setSavedOk(false), 2500)
    } catch(err) {
      console.error('Theme save error:', err.response?.data || err.message)
      const d = err.response?.data
      const msg = d ? Object.values(d).flat().join(' · ') : (err.message || 'network error')
      setSaveErr('// ERROR: ' + msg)
    } finally { setSaving(false) }
  }

  /* Banner upload — DELETE method to remove (v2 spec) */
  const uploadBanner = async (file) => {
    const fd = new FormData(); fd.append('banner_image', file)
    try {
      const { data } = await api.post('/users/me/theme/banner/', fd)
      setTs(p => ({ ...p, has_custom_banner: data.has_custom_banner, banner_image_url: data.banner_image_url, updated_at: data.updated_at }))
      qc.setQueryData(['myTheme'], (old) => ({ ...(old||{}), ...data }))
    } catch(err) {
      console.error('Banner upload error:', err.response?.data || err.message)
    }
  }
  const removeBanner = async () => {
    try {
      const { data } = await api.delete('/users/me/theme/banner/')
      setTs(p => ({ ...p, has_custom_banner: false, banner_image_url: null, ...data }))
      qc.setQueryData(['myTheme'], (old) => ({ ...(old||{}), ...data }))
    } catch(err) {
      console.error('Banner remove error:', err.response?.data || err.message)
    }
  }

  if (themeLoading) return (
    <div style={{ padding:40, textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:t.textMuted }}>
      // LOADING THEME...
    </div>
  )

  const SH = ({ children }) => (
    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:t.textMuted, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ color:ts.accent_color }}>//</span>{children}
    </div>
  )

  const filteredFonts = FONTS.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))

  return (
    <div style={{ border:`2px solid ${t.border}`, boxShadow:`6px 6px 0 ${t.shadow}`, background:t.panelBg }}>
      {/* Header bar */}
      <div style={{ height:24, background:t.pageBg, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', borderBottom:`1px solid ${t.border}` }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:ts.accent_color, textTransform:'uppercase' }}>// THEME_EDITOR</span>
        <WindowControls />
      </div>

      <div className="theme-editor-grid" style={{ display:'grid', gridTemplateColumns:'220px 1fr' }}>

        {/* ── LIVE PREVIEW ── */}
        <div style={{ borderRight:`2px solid ${t.border}`, padding:16, background:t.panelAlt, display:'flex', flexDirection:'column', gap:12, alignItems:'center' }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.16em', alignSelf:'flex-start' }}>// PREVIEW</div>

          {/* Preview card */}
          <div style={{ width:'100%', border:`2px solid ${t.border}`, overflow:'hidden', transition:'all .2s', ...previewGlow, ...previewBorder }}>
            {/* Banner */}
            <div style={{ height:72, background:bannerBg, opacity:ts.banner_opacity/100, position:'relative' }}>
              {PATTERN_BG[ts.pattern] && (
                <div style={{ position:'absolute', inset:0, background:PATTERN_BG[ts.pattern], backgroundSize: ts.pattern==='dots'?'12px 12px':'auto' }} />
              )}
            </div>
            {/* Info */}
            <div style={{ background:t.panelBg, padding:'10px 12px' }}>
              <div style={{ fontFamily:`'${ts.font}',monospace`, fontSize:10, color:ts.accent_color, borderLeft:`2px solid rgba(${rgb},.3)`, paddingLeft:6, marginBottom:6 }}>
                {MOODS.find(m=>m[0]===ts.mood)?.[1]||'// ONLINE'}
              </div>
              <div style={{ fontFamily:`'${ts.font}',monospace`, fontWeight:700, fontSize:15, color:ts.accent_color, marginBottom:4 }}>
                {profile?.username||'username'}
              </div>
              <div style={{ display:'inline-block', fontFamily:"'JetBrains Mono',monospace", fontSize:8, padding:'2px 6px', background:`rgba(${rgb},.12)`, color:ts.accent_color, letterSpacing:'0.1em', marginBottom:6 }}>
                RECRUIT · LVL 01
              </div>
              <div style={{ fontFamily:`'${ts.font}',monospace`, fontSize:10, color:t.textMuted, lineHeight:1.4, marginBottom:8 }}>
                {profile?.bio||'No bio yet...'}
              </div>
              <div style={{ display:'flex', gap:10, fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>
                <span><span style={{ color:ts.accent_color }}>{profile?.posts_count??0}</span> <span style={{ color:t.textMuted }}>POSTS</span></span>
                <span><span style={{ color:ts.accent_color }}>{profile?.karma??0}</span> <span style={{ color:t.textMuted }}>KARMA</span></span>
              </div>
            </div>
          </div>

          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted, alignSelf:'flex-start' }}>
            accent: <span style={{ color:ts.accent_color }}>{ts.accent_color}</span>
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:20, overflowY:'auto', maxHeight:580 }}>

          {/* ACCENT COLOR */}
          <div>
            <SH>ACCENT COLOR</SH>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
              {ACCENT_PRESETS.map(c => (
                <div key={c} onClick={() => update('accent_color', c)}
                  title={c}
                  style={{ width:20, height:20, background:c, cursor:'pointer', border:`2px solid ${ts.accent_color===c?t.text:'transparent'}`, boxSizing:'border-box', transition:'border-color .1s' }} />
              ))}
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(ts.accent_color)?ts.accent_color:'#A3E635'}
                onChange={e=>update('accent_color',e.target.value)}
                style={{ width:32, height:32, padding:2, border:`2px solid ${t.border}`, background:'none', cursor:'pointer' }} />
              <input type="text" value={ts.accent_color} maxLength={7}
                onChange={e=>{ const v=e.target.value; if(/^#?[0-9a-fA-F]{0,6}$/.test(v)) update('accent_color', v.startsWith('#')?v:'#'+v) }}
                onBlur={e=>{ if(!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) update('accent_color', themeData?.accent_color||'#A3E635') }}
                style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:t.text, background:t.panelAlt, border:`2px solid ${t.border}`, padding:'6px 10px', width:88, outline:'none' }} />
            </div>
          </div>

          {/* BANNER */}
          <div>
            <SH>BANNER</SH>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5, marginBottom:10 }}>
              {Object.entries(BANNER_PRESETS).map(([key,css]) => (
                <div key={key} onClick={()=>{ update('banner_preset',key); update('has_custom_banner',false) }}
                  style={{ height:32, background:css, cursor:'pointer', border:`2px solid ${ts.banner_preset===key&&!ts.has_custom_banner?ts.accent_color:t.border}`, position:'relative', transition:'border-color .1s' }}>
                  <span style={{ position:'absolute', bottom:2, left:3, fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{key.replace('_',' ')}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <button onClick={()=>bannerFileRef.current?.click()}
                style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', background:'transparent', color:t.textSub, border:`2px solid ${t.border}`, padding:'6px 12px', cursor:'pointer' }}>
                📷 UPLOAD IMAGE
              </button>
              {ts.has_custom_banner && (
                <button onClick={removeBanner}
                  style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#E8420A', background:'none', border:'1px solid #E8420A', padding:'5px 10px', cursor:'pointer' }}>
                  REMOVE
                </button>
              )}
              <input ref={bannerFileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display:'none' }}
                onChange={e=>{ if(e.target.files[0]) uploadBanner(e.target.files[0]) }} />
            </div>
          </div>

          {/* PATTERN */}
          <div>
            <SH>PATTERN OVERLAY</SH>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {PATTERNS.map(([key,label]) => (
                <button key={key} onClick={()=>update('pattern',key)}
                  style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:ts.pattern===key?700:400, color:ts.pattern===key?t.pageBg:t.textSub, background:ts.pattern===key?ts.accent_color:'transparent', border:`2px solid ${ts.pattern===key?ts.accent_color:t.border}`, padding:'5px 10px', cursor:'pointer', transition:'all .1s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* FONT */}
          <div>
            <SH>PROFILE FONT</SH>
            <input type="text" placeholder="🔍 search fonts..." value={fontSearch}
              onChange={e=>setFontSearch(e.target.value)}
              style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.text, background:t.panelAlt, border:`2px solid ${t.border}`, padding:'6px 10px', width:'100%', outline:'none', marginBottom:8, boxSizing:'border-box' }} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, maxHeight:140, overflowY:'auto' }}>
              {filteredFonts.map(f => (
                <button key={f} onClick={()=>update('font',f)}
                  style={{ fontFamily:`'${f}',monospace`, fontSize:12, textAlign:'left', color:ts.font===f?t.pageBg:t.textSub, background:ts.font===f?ts.accent_color:'transparent', border:`1px solid ${ts.font===f?ts.accent_color:t.border}`, padding:'6px 10px', cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'all .1s' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* EFFECTS */}
          <div>
            <SH>EFFECTS</SH>
            {[
              { key:'banner_opacity', label:'BANNER OPACITY', min:20, max:100 },
              { key:'glow_intensity', label:'GLOW',           min:0,  max:100 },
              { key:'border_accent',  label:'BORDER ACCENT',  min:0,  max:100 },
            ].map(({key,label,min,max}) => (
              <div key={key} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted, marginBottom:4 }}>
                  <span>{label}</span>
                  <span style={{ color:ts.accent_color }}>{ts[key]}%</span>
                </div>
                <input type="range" min={min} max={max} value={ts[key]}
                  onChange={e=>update(key,parseInt(e.target.value))}
                  style={{ width:'100%', accentColor:ts.accent_color }} />
              </div>
            ))}
          </div>

          {/* MOOD */}
          <div>
            <SH>MOOD STATUS</SH>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {MOODS.map(([key,label]) => (
                <button key={key} onClick={()=>update('mood',key)}
                  style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:ts.mood===key?700:400, color:ts.mood===key?t.pageBg:t.textSub, background:ts.mood===key?ts.accent_color:'transparent', border:`2px solid ${ts.mood===key?ts.accent_color:t.border}`, padding:'5px 10px', cursor:'pointer', transition:'all .1s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* SAVE */}
          <div style={{ display:'flex', alignItems:'center', gap:14, paddingTop:8, borderTop:`1px solid ${t.borderMid}` }}>
            <button onClick={saveTheme} disabled={saving}
              style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em', background:saving?t.borderMid:ts.accent_color, color:t.pageBg, border:`2px solid ${saving?t.borderMid:ts.accent_color}`, boxShadow:saving?'none':`4px 4px 0 ${t.border}`, padding:'10px 28px', cursor:saving?'not-allowed':'pointer', transition:'all .15s' }}>
              {saving ? 'SAVING...' : '[ SAVE_THEME ]'}
            </button>
            {savedOk && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#0A9E88' }}>// saved ✓</span>}
            {saveErr && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#E8420A' }}>{saveErr}</span>}
          </div>

        </div>
      </div>
    </div>
  )
}

/* ── Banner Editor Panel Component ── */
function BannerEditorPanel({ theme, setTheme, onLiveChange, onClose }) {
  const { t } = useTheme()
  const qc = useQueryClient()
  const bannerFileRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const [localTheme, setLocalTheme] = useState(theme)
  const update = (k, v) => {
    setLocalTheme(p => ({ ...p, [k]: v }))
    if (onLiveChange) onLiveChange({ [k]: v })
  }

  useEffect(() => { setLocalTheme(theme) }, [theme])

  /* Load selected font dynamically */
  useEffect(() => {
    if (!localTheme.font) return
    const fontId = `banner-font-${localTheme.font.replace(/\s+/g, '-')}`
    if (document.getElementById(fontId)) return
    
    const link = document.createElement('link')
    link.id = fontId
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(localTheme.font)}:wght@400;700&display=swap`
    document.head.appendChild(link)
  }, [localTheme.font])

  /* Load all fonts once */
  useEffect(() => {
    if (document.getElementById('banner-editor-fonts')) return
    const link = document.createElement('link')
    link.id = 'banner-editor-fonts'
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${
      FONTS.map(f => `family=${encodeURIComponent(f)}:wght@400;700`).join('&')
    }&display=swap`
    document.head.appendChild(link)
  }, [])

  /* Derived preview values */
  const rgb = /^#[0-9A-Fa-f]{6}$/.test(localTheme.accent_color) ? hexToRgb(localTheme.accent_color) : '163,230,53'

  /* Banner: custom image > selected gradient */
  const bannerBg = localTheme.has_custom_banner && localTheme.banner_image_url
    ? `url(${localTheme.banner_image_url}?t=${localTheme.updated_at||''}) center/cover`
    : BANNER_PRESETS[localTheme.banner_preset] || BANNER_PRESETS.nebula

  const previewGlow = localTheme.glow_intensity > 0
    ? { boxShadow:`0 0 ${localTheme.glow_intensity*.35}px rgba(${rgb},${localTheme.glow_intensity*.004})` } : {}
  const previewBorder = localTheme.border_accent > 0
    ? { borderColor:`rgba(${rgb},${localTheme.border_accent/100})` } : {}

  /* Save theme changes to backend */
  const saveTheme = async () => {
    setSaving(true); setSaveErr('')
    try {
      const { data: saved } = await api.patch('/users/me/theme/', {
        accent_color:   localTheme.accent_color,
        banner_preset:  localTheme.banner_preset,
        pattern:        localTheme.pattern,
        font:           localTheme.font,
        banner_opacity: localTheme.banner_opacity,
        glow_intensity: localTheme.glow_intensity,
        border_accent:  localTheme.border_accent,
        mood:           localTheme.mood,
      })
      qc.setQueryData(['myTheme'], saved)
      setTheme(saved)
      setSavedOk(true); setTimeout(() => setSavedOk(false), 2500)
      setTimeout(() => onClose(), 1000)
    } catch(err) {
      console.error('Theme save error:', err.response?.data || err.message)
      const d = err.response?.data
      const msg = d ? Object.values(d).flat().join(' · ') : (err.message || 'network error')
      setSaveErr('// ERROR: ' + msg)
    } finally { setSaving(false) }
  }

  /* Banner upload */
  const uploadBanner = async (file) => {
    const fd = new FormData(); fd.append('banner_image', file)
    try {
      const { data } = await api.post('/users/me/theme/banner/', fd)
      setLocalTheme(p => ({ ...p, has_custom_banner: data.has_custom_banner, banner_image_url: data.banner_image_url, updated_at: data.updated_at }))
      qc.setQueryData(['myTheme'], (old) => ({ ...(old||{}), ...data }))
      setTheme(data)
    } catch(err) {
      console.error('Banner upload error:', err.response?.data || err.message)
    }
  }

  const removeBanner = async () => {
    try {
      const { data } = await api.delete('/users/me/theme/banner/')
      setLocalTheme(p => ({ ...p, has_custom_banner: false, banner_image_url: null, ...data }))
      qc.setQueryData(['myTheme'], (old) => ({ ...(old||{}), ...data }))
      setTheme(data)
    } catch(err) {
      console.error('Banner remove error:', err.response?.data || err.message)
    }
  }

  const SH = ({ children }) => (
    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:t.textMuted, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ color:localTheme.accent_color }}>//</span>{children}
    </div>
  )

  return (
    <div style={{ border:`2px solid ${t.border}`, boxShadow:`6px 6px 0 ${t.shadow}`, background:t.panelBg }}>
      {/* Header bar */}
      <div style={{ height:32, background:t.pageBg, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px', borderBottom:`1px solid ${t.border}` }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:localTheme.accent_color, textTransform:'uppercase' }}>// BANNER_EDITOR</span>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={onClose} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted, background:'none', border:'none', cursor:'pointer' }}>
            [CLOSE]
          </button>
          <div style={{ display:'flex', gap:5 }}>
            {['#E8420A','#F0B800','#6DC800'].map((c,i) => (
              <div key={i} style={{ width:8, height:8, background:c }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:20, display:'flex', flexDirection:'column', gap:20 }}>

        {/* LIVE PREVIEW */}
        <div>
          <SH>LIVE PREVIEW</SH>
          <div style={{ width:'100%', height:180, background:bannerBg, opacity:localTheme.banner_opacity/100, position:'relative', border:`2px solid ${t.border}`, overflow:'hidden', transition:'all .2s', ...previewGlow, ...previewBorder }}>
            {localTheme.pattern && localTheme.pattern !== 'none' && (
              <div style={{ position:'absolute', inset:0, background:PATTERN_BG[localTheme.pattern]||'', backgroundSize: localTheme.pattern==='dots'?'12px 12px':'auto', zIndex:1, pointerEvents:'none' }} />
            )}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:3 }}>
              <span style={{ fontFamily:`'${localTheme.font}',monospace`, fontWeight:700, fontSize:36, color:localTheme.accent_color }}>
                USERNAME
              </span>
            </div>
          </div>
        </div>

        {/* BANNER PRESETS */}
        <div>
          <SH>BANNER GRADIENT</SH>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
            {Object.entries(BANNER_PRESETS).map(([key,css]) => (
              <div key={key} onClick={()=>{ update('banner_preset',key); update('has_custom_banner',false) }}
                style={{ height:40, background:css, cursor:'pointer', border:`2px solid ${localTheme.banner_preset===key&&!localTheme.has_custom_banner?localTheme.accent_color:t.border}`, position:'relative', transition:'border-color .1s' }}>
                <span style={{ position:'absolute', bottom:3, left:4, fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{key.replace('_',' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UPLOAD BANNER IMAGE */}
        <div>
          <SH>UPLOAD IMAGE</SH>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={()=>bannerFileRef.current?.click()}
              style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', background:'transparent', color:t.textSub, border:`2px solid ${t.border}`, padding:'8px 16px', cursor:'pointer' }}>
              📷 CHOOSE IMAGE
            </button>
            {localTheme.has_custom_banner && (
              <button onClick={removeBanner}
                style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#E8420A', background:'none', border:'1px solid #E8420A', padding:'7px 12px', cursor:'pointer' }}>
                REMOVE
              </button>
            )}
            <input ref={bannerFileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display:'none' }}
              onChange={e=>{ if(e.target.files[0]) uploadBanner(e.target.files[0]) }} />
          </div>
        </div>

        {/* PATTERN OVERLAY */}
        <div>
          <SH>PATTERN OVERLAY</SH>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {PATTERNS.map(([key,label]) => (
              <button key={key} onClick={()=>update('pattern',key)}
                style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:localTheme.pattern===key?700:400, color:localTheme.pattern===key?t.pageBg:t.textSub, background:localTheme.pattern===key?localTheme.accent_color:'transparent', border:`2px solid ${localTheme.pattern===key?localTheme.accent_color:t.border}`, padding:'6px 12px', cursor:'pointer', transition:'all .1s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* FONT SELECTOR */}
        <div>
          <SH>USERNAME FONT</SH>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:4, maxHeight:160, overflowY:'auto' }}>
            {FONTS.map(f => (
              <button key={f} onClick={()=>update('font',f)}
                style={{ fontFamily:`'${f}',monospace`, fontSize:12, textAlign:'left', color:localTheme.font===f?t.pageBg:t.textSub, background:localTheme.font===f?localTheme.accent_color:'transparent', border:`1px solid ${localTheme.font===f?localTheme.accent_color:t.border}`, padding:'8px 12px', cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'all .1s' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* EFFECTS SLIDERS */}
        <div>
          <SH>EFFECTS</SH>
          {[
            { key:'banner_opacity', label:'BANNER OPACITY', min:20, max:100 },
            { key:'glow_intensity', label:'GLOW INTENSITY', min:0, max:100 },
            { key:'border_accent', label:'BORDER ACCENT', min:0, max:100 },
          ].map(({key,label,min,max}) => (
            <div key={key} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted, marginBottom:4 }}>
                <span>{label}</span>
                <span style={{ color:localTheme.accent_color }}>{localTheme[key]}%</span>
              </div>
              <input type="range" min={min} max={max} value={localTheme[key]}
                onChange={e=>update(key,parseInt(e.target.value))}
                style={{ width:'100%', accentColor:localTheme.accent_color }} />
            </div>
          ))}
        </div>

        {/* MOOD STATUS */}
        <div>
          <SH>MOOD STATUS</SH>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {MOODS.map(([key,label]) => (
              <button key={key} onClick={()=>update('mood',key)}
                style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:localTheme.mood===key?700:400, color:localTheme.mood===key?t.pageBg:t.textSub, background:localTheme.mood===key?localTheme.accent_color:'transparent', border:`2px solid ${localTheme.mood===key?localTheme.accent_color:t.border}`, padding:'6px 12px', cursor:'pointer', transition:'all .1s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div style={{ display:'flex', alignItems:'center', gap:14, paddingTop:12, borderTop:`1px solid ${t.borderMid}` }}>
          <button onClick={saveTheme} disabled={saving}
            style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em', background:saving?t.borderMid:localTheme.accent_color, color:t.pageBg, border:`2px solid ${saving?t.borderMid:localTheme.accent_color}`, boxShadow:saving?'none':`4px 4px 0 ${t.border}`, padding:'12px 32px', cursor:saving?'not-allowed':'pointer', transition:'all .15s' }}>
            {saving ? 'SAVING...' : '[ SAVE ALL ]'}
          </button>
          {savedOk && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#0A9E88' }}>// saved ✓</span>}
          {saveErr && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#E8420A' }}>{saveErr}</span>}
        </div>

      </div>
    </div>
  )
}

/* ── Profile Banner Component ── */
function ProfileBanner({ theme, onEditBanner }) {
  const { t } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  if (!theme) return null

  const bannerBg = theme.has_custom_banner && theme.banner_image_url
    ? `url(${theme.banner_image_url}?t=${theme.updated_at||''}) center/cover`
    : BANNER_PRESETS[theme.banner_preset] || BANNER_PRESETS.nebula

  const patternBg = theme.pattern && theme.pattern !== 'none' ? PATTERN_BG[theme.pattern] : ''

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto 30px',
        height: 200,
        background: bannerBg,
        opacity: theme.banner_opacity ? theme.banner_opacity / 100 : 1,
        border: `2px solid ${t.border}`,
        boxShadow: `6px 6px 0 ${t.shadow}`,
        overflow: 'hidden',
        transition: 'all .2s',
      }}
    >
      {/* Pattern overlay */}
      {patternBg && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: patternBg,
          backgroundSize: theme.pattern === 'dots' ? '12px 12px' : 'auto',
          zIndex: 1,
          pointerEvents: 'none',
        }} />
      )}

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Edit overlay on hover - solo botón */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          transition: 'opacity .2s',
        }}>
          <button
            onClick={onEditBanner}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: theme.accent_color || t.accent,
              color: '#000',
              border: 'none',
              padding: '12px 32px',
              cursor: 'pointer',
              boxShadow: `4px 4px 0 ${t.border}`,
              transition: 'all .15s',
            }}
          >
            [ EDIT BANNER ]
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main ── */
export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { t, isDark } = useTheme()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const fileRef   = useRef(null)

  const [tab,         setTab]         = useState('posts')
  const [username,    setUsername]    = useState('')
  const [bio,         setBio]         = useState('')
  const [email,       setEmail]       = useState('')
  const [avatarFile,  setAvatarFile]  = useState(null)
  const [avatarPrev,  setAvatarPrev]  = useState(null)
  const [avatarError, setAvatarError] = useState('')
  const [cropSrc,     setCropSrc]     = useState(null)   // raw src for crop modal
  const [cropMime,    setCropMime]    = useState('image/jpeg')
  const [saved,       setSaved]       = useState(false)
  const [saveError,   setSaveError]   = useState('')
  const [bannerEditMode, setBannerEditMode] = useState(false)  // toggle banner edit panel

  useEffect(() => { if (!user) navigate('/login') }, [user, navigate])

  /* ── Queries ── */
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me/').then(r => r.data),
    enabled: !!user,
    staleTime: 60_000,
  })

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['myPosts', profile?.id],
    queryFn: () => api.get(`/posts/?author=${profile.id}`).then(r => r.data),
    enabled: !!profile?.id,
    staleTime: 30_000,
  })

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['myComments'],
    queryFn: () => api.get('/users/me/comments/').then(r => r.data),
    enabled: !!user,
    staleTime: 30_000,
  })

  const { data: myTheme } = useQuery({
    queryKey: ['myTheme'],
    queryFn: () => api.get('/users/me/theme/').then(r => r.data),
    enabled: !!user,
    staleTime: 60_000,
  })

  /* Sync form when profile loads */
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBio(profile.bio || '')
      setEmail(profile.email || '')
    }
  }, [profile])

  /* Load all profile fonts on mount */
  useEffect(() => {
    if (document.getElementById('profile-all-fonts')) return
    const link = document.createElement('link')
    link.id = 'profile-all-fonts'
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${
      FONTS.map(f => `family=${encodeURIComponent(f)}:wght@400;700`).join('&')
    }&display=swap`
    document.head.appendChild(link)
  }, [])

  /* ── Avatar validation → open crop modal ── */
  const handleAvatarFile = (file) => {
    if (!file) return
    setAvatarError('')
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError(`Only JPEG · PNG · GIF · WEBP`)
      return
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setAvatarError(`Maximum ${MAX_AVATAR_MB} MB`)
      return
    }
    // GIFs lose animation when drawn on canvas — skip crop and use as-is
    if (file.type === 'image/gif') {
      setAvatarFile(file)
      setAvatarPrev(URL.createObjectURL(file))
      return
    }
    setCropMime(file.type)
    setCropSrc(URL.createObjectURL(file))
  }

  const handleCropConfirm = (blob) => {
    const file = new File([blob], 'avatar.jpg', { type: cropMime })
    setAvatarFile(file)
    setAvatarPrev(URL.createObjectURL(blob))
    setCropSrc(null)
  }

  /* ── Save mutation ── */
  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('bio', bio)
      if (avatarFile) fd.append('avatar', avatarFile)
      return api.patch('/users/me/', fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      refreshUser()
      setAvatarFile(null)
      setSaved(true)
      setSaveError('')
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      const d = err.response?.data
      setSaveError(d ? Object.values(d).flat().join(' · ') : 'Error saving')
    },
  })

  const posts    = Array.isArray(postsData)    ? postsData    : (postsData?.results    || [])
  const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.results || [])
  const rank     = getRank(profile?.karma)

  /* Current avatar src: prefer live preview, then API URL, then null */
  const avatarSrc = avatarPrev || profile?.avatar || null

  if (!user) return null

  return (
    <div style={{ background:t.pageBg, minHeight:'100vh', padding:'20px 12px 60px' }}>

      {/* ══ TOP BANNER (solo fondo editable) ══ */}
      <ProfileBanner 
        theme={myTheme} 
        onEditBanner={() => setBannerEditMode(!bannerEditMode)} 
      />

      {/* ══ BANNER EDIT PANEL (when toggled) ══ */}
      {bannerEditMode && myTheme && (
        <div style={{ maxWidth:1200, margin:'0 auto 30px' }}>
          <BannerEditorPanel
            theme={myTheme}
            onLiveChange={(updates) => {
              qc.setQueryData(['myTheme'], (old) => ({ ...(old||{}), ...updates }))
            }}
            setTheme={(updates) => {
              qc.setQueryData(['myTheme'], (old) => ({ ...(old||{}), ...updates }))
            }}
            onClose={() => setBannerEditMode(false)}
          />
        </div>
      )}

      <div className="profile-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'320px 1fr', gap:40, alignItems:'start' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Avatar Panel */}
          <PanelBox title="// USER.EXE">
            <div className="avatar-area" style={{
              background: myTheme
                ? (myTheme.has_custom_banner && myTheme.banner_image_url
                    ? `url(${myTheme.banner_image_url}?t=${myTheme.updated_at||''}) center/cover`
                    : myTheme.banner_gradient || '#F0B800')
                : `linear-gradient(135deg, ${t.borderMid}, ${t.pageBg})`,
              opacity: myTheme?.banner_opacity ? myTheme.banner_opacity / 100 : 1,
            }}>
              {/* Pattern overlay */}
              {myTheme?.pattern && myTheme.pattern !== 'none' && (
                <div style={{ position:'absolute', inset:0, background:PATTERN_BG[myTheme.pattern]||'', backgroundSize: myTheme.pattern==='dots'?'12px 12px':'auto', zIndex:0, pointerEvents:'none' }} />
              )}
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', top:0, left:0, zIndex:1 }} />
                : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:80, color:'#fff', position:'relative', zIndex:2 }}>
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
              }
            </div>
            <div style={{ padding:12, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              {/* USERNAME CON FUENTE MODIFICABLE */}
              <span style={{ 
                fontFamily: `'${myTheme?.font || 'Space Grotesk'}', sans-serif`, 
                fontWeight:700, 
                fontSize:20, 
                color: myTheme?.accent_color || t.text 
              }}>
                {profileLoading ? '...' : profile?.username}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:myTheme?.accent_color||t.accent }}>
                <div className="blinking-dot" style={{ background:myTheme?.accent_color||t.accent }} />
                {MOODS.find(m => m[0] === myTheme?.mood)?.[1] || '// ONLINE'}
              </div>
            </div>
          </PanelBox>

          {/* Stats Panel */}
          <PanelBox title="// SYSTEM.STATS">
            <div style={{ padding:15 }}>
              <StatLine label="POSTS"       value={profile?.posts_count    ?? 0} />
              <StatLine label="COMMENTS" value={profile?.comments_count ?? 0} />
              <StatLine label="KARMA"       value={profile?.karma          ?? 0} acid />
              <StatLine label="RANK"        value={rank.rango} />
              <StatLine label="LEVEL"       value={rank.nivel} />
              <div style={{ marginTop:15, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>
                <span>LEVEL {rank.label}</span>
                <div style={{ height:6, background:t.borderMid, marginTop:4 }}>
                  <div style={{ height:'100%', background:t.accent, width:`${Math.min(rank.progress,100)}%`, transition:'width 1s ease' }} />
                </div>
              </div>
            </div>
          </PanelBox>

          {/* Tags Panel */}
          <PanelBox title="// INTERESTS">
            <div style={{ padding:15 }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {[{t:'#feed',c:'#E8420A'},{t:'#blog',c:'#1A6EC0'},{t:'#decay84',c:'#6DC800'},{t:'#community',c:'#0A9E88'}].map(({t,c})=>(
                  <span key={t} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, padding:'2px 8px', background:c, color:c==='#6DC800'?'#111008':'#fff' }}>{t}</span>
                ))}
              </div>
            </div>
          </PanelBox>

        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:30 }}>

          {/* Identity header */}
          <header>
            {profileLoading
              ? <div style={{ height:40, background:'#E8E4DC', width:240, marginBottom:10 }} />
              : <>
                  <h1 style={{ fontFamily:`'${myTheme?.font || 'Space Grotesk'}',sans-serif`, fontWeight:700, fontSize:32, letterSpacing:'-0.02em', color:myTheme?.accent_color||t.text, marginBottom:10 }}>
                    {profile?.username}
                  </h1>
                  <div style={{ marginBottom:6 }}>
                    <span style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:14, color:t.textMuted }}>
                      {profile?.bio || 'No bio yet...'}
                    </span>
                    <button onClick={()=>setTab('settings')} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.text, background:'none', border:'none', cursor:'pointer', marginLeft:8, textDecoration:'underline', padding:0 }}>
                      [EDIT PROFILE]
                    </button>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>
                    Member since {fmtDate(profile?.created_at)}
                  </span>
                </>
            }
          </header>

          {/* Tabs */}
          <div className="tab-bar" style={{ background:t.tabBg, border:`2px solid ${t.border}`, boxShadow:`4px 4px 0 ${t.shadow}`, display:'flex', overflowX:'auto' }}>
            {[{id:'posts',l:'POSTS'},{id:'comments',l:'COMMENTS'},{id:'settings',l:'SETTINGS'},{id:'theme',l:' THEME'}].map((t,i,arr)=>(
              <TabBtn key={t.id} label={t.l} active={tab===t.id} onClick={()=>setTab(t.id)} last={i===arr.length-1} />
            ))}
          </div>

          {/* ── Tab: POSTS ── */}
          {tab === 'posts' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {postsLoading
                ? [1,2,3].map(i => <div key={i} style={{ height:120, border:`2px solid ${t.border}`, background:t.panelBg }} />)
                : posts.length === 0
                  ? <TerminalEmpty lines={['RUNNING SEARCH...','// 0 RESULTS','// END OF TRANSMISSION']} />
                  : posts.map((p,i) => <PostCard key={p.id} post={p} index={i} />)
              }
            </div>
          )}

          {/* ── Tab: COMMENTS ── */}
          {tab === 'comments' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {commentsLoading
                ? [1,2,3].map(i => <div key={i} style={{ height:90, border:`2px solid ${t.border}`, background:t.panelBg }} />)
                : comments.length === 0
                  ? <TerminalEmpty lines={['SEARCHING COMMENTS...','// 0 RESULTS','// END OF TRANSMISSION']} />
                  : comments.map((c,i) => <CommentCard key={c.id} comment={c} index={i} />)
              }
            </div>
          )}

          {/* ── Tab: THEME ── */}
          {tab === 'theme' && (
            <ThemeEditorPanel profile={profile} />
          )}

          {/* ── Tab: SETTINGS ── */}
          {tab === 'settings' && (
            <div style={{ border:`2px solid ${t.border}`, boxShadow:`6px 6px 0 ${t.shadow}`, background:t.panelBg }}>
              <div style={{ height:24, background:t.pageBg, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', borderBottom:`1px solid ${t.border}` }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.accent, textTransform:'uppercase' }}>// EDIT PROFILE</span>
                <WindowControls />
              </div>
              <div className="settings-panel-body" style={{ padding:'20px 24px' }}>

                {/* Avatar upload */}
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6A6258', display:'block', marginBottom:10 }}>// AVATAR</label>
                  <div className="settings-avatar-row" style={{ display:'flex', alignItems:'center', gap:16 }}>
                    {/* Preview */}
                    <div style={{ width:64, height:64, border:`2px solid ${t.border}`, boxShadow:`3px 3px 0 ${t.shadow}`, overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#E8420A,#F0B800)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {avatarSrc
                        ? <img src={avatarSrc} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, color:'#111008' }}>{user.username?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <button onClick={()=>fileRef.current?.click()} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', background:'transparent', color:t.text, border:`2px solid ${t.border}`, boxShadow:`3px 3px 0 ${t.shadow}`, padding:'6px 14px', cursor:'pointer', marginBottom:6, display:'block' }}>
                        CHANGE AVATAR
                      </button>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color: avatarError ? '#E8420A' : '#9A9288' }}>
                        {avatarError || `JPEG · PNG · GIF · WEBP · max ${MAX_AVATAR_MB} MB`}
                      </span>
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display:'none' }} onChange={e=>handleAvatarFile(e.target.files[0])} />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6A6258', display:'block', marginBottom:8 }}>// BIO</label>
                  <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} placeholder="Tell us something about you..."
                    style={{ width:'100%', border:`2px solid ${t.borderMid}`, background:t.panelAlt, outline:'none', padding:'10px 14px', fontFamily:"'DM Sans',sans-serif", fontSize:14, color:t.text, lineHeight:1.6, resize:'vertical', transition:'border-color .15s', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=t.accent} onBlur={e=>e.target.style.borderColor=t.borderMid} />
                </div>

                {/* Save error */}
                {saveError && (
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#E8420A', marginBottom:12, letterSpacing:'0.06em' }}>
                    // ERROR: {saveError}
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <button onClick={()=>save()} disabled={saving}
                    style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em', background:saving?t.borderMid:t.accent, color:t.pageBg, border:`2px solid ${saving?t.borderMid:t.accent}`, boxShadow:saving?'none':`4px 4px 0 ${t.border}`, padding:'10px 28px', cursor:saving?'not-allowed':'pointer', transition:'all .15s' }}>
                    {saving ? 'SAVING...' : 'SAVE'}
                  </button>
                  {saved && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#0A9E88', letterSpacing:'0.1em' }}>// saved ✓</span>}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {cropSrc && (
        <AvatarCropModal
          src={cropSrc}
          mimeType={cropMime}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <style>{`
        .theme-editor-grid { min-height: 500px; }
        @media (max-width: 700px) {
          .theme-editor-grid { grid-template-columns: 1fr !important; }
          .theme-editor-grid > *:first-child { border-right: none !important; border-bottom: 2px solid; }
        }
        .avatar-area {
          height: 200px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .avatar-area::before {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px,
            transparent 1px, transparent 3px
          );
          z-index: 3;
          pointer-events: none;
        }
        .blinking-dot {
          width: 7px; height: 7px;
          background: #6DC800;
          animation: blink 1s steps(2, start) infinite;
        }
        .blinking-cursor { animation: blink 1s steps(2, start) infinite; }
        @keyframes blink { to { visibility: hidden; } }
        @media (max-width: 860px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .avatar-area { height: 160px !important; }
          .settings-avatar-row { flex-wrap: wrap !important; }
          .settings-panel-body { padding: 14px 16px !important; }
          .tab-bar { overflow-x: auto !important; }
          .tab-bar button { padding: 12px 16px !important; font-size: 10px !important; white-space: nowrap; }
        }
        @media (max-width: 480px) {
          .profile-grid { gap: 14px !important; }
          .settings-panel-body { padding: 12px !important; }
        }
      `}</style>
    </div>
  )
}
