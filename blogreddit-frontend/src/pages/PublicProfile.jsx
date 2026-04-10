import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { useTheme } from '../context/ThemeContext'

const PATTERN_BG = {
  none:'',
  grid:'repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 1px,transparent 1px 20px),repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 1px,transparent 1px 20px)',
  dots:'radial-gradient(circle,rgba(255,255,255,.08) 1px,transparent 1px)',
  lines:'repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 1px,transparent 1px 8px)',
  cross:'repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 1px,transparent 1px 12px),repeating-linear-gradient(-45deg,rgba(255,255,255,.04) 0 1px,transparent 1px 12px)',
}

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

const STRIP_COLORS = ['#6DC800','#1A6EC0','#E8420A','#F0B800','#0A9E88']

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

function PostCard({ post, index, username }) {
  const { t } = useTheme()
  const score = (post.upvotes || 0) - (post.downvotes || 0)
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/posts/${post.id}`} state={{ from: 'profile', username }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
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

function CommentCard({ comment, index, username }) {
  const { t } = useTheme()
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/posts/${comment.post_id}`} state={{ from: 'profile', username }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
      <article
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ border:`2px solid ${t.border}`, boxShadow: hov ? `6px 6px 0 ${t.shadow}` : `4px 4px 0 ${t.shadow}`, background:t.panelBg, display:'grid', gridTemplateColumns:'4px 1fr', transform: hov ? 'translate(-2px,-2px)' : 'none', transition:'all .1s' }}
      >
        <div style={{ background: STRIP_COLORS[(index + 2) % STRIP_COLORS.length] }} />
        <div style={{ padding:'14px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:t.textMuted, textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>
              // IN: {comment.post_title}
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

/* ── Public Profile Banner Component ── */
function PublicProfileBanner({ profile, userTheme }) {
  const { t } = useTheme()

  if (!profile) return null

  const bannerBg = userTheme
    ? (userTheme.has_custom_banner && userTheme.banner_image_url
        ? `url(${userTheme.banner_image_url}) center/cover`
        : userTheme.banner_gradient || '#F0B800')
    : '#F0B800'

  const bannerOpacity = userTheme ? userTheme.banner_opacity / 100 : 1
  const patternCss = userTheme ? (PATTERN_BG[userTheme.pattern] || '') : ''
  const accent = userTheme?.accent_color || t.accent
  const userFont = userTheme?.font || 'Space Grotesk'

  const rgb = accent && /^#[0-9A-Fa-f]{6}$/.test(accent)
    ? (() => { const h = accent.replace('#',''); return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}` })()
    : '163,230,53'

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 1200,
      margin: '0 auto 30px',
      height: 280,
      background: bannerBg,
      opacity: bannerOpacity,
      border: `2px solid ${t.border}`,
      boxShadow: `6px 6px 0 ${t.shadow}`,
      overflow: 'hidden',
    }}>
      {/* Pattern overlay */}
      {patternCss && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: patternCss,
          backgroundSize: userTheme?.pattern === 'dots' ? '12px 12px' : 'auto',
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

      {/* Content centered in banner */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        padding: 20,
      }}>
        {/* Username with custom font */}
        <h1 style={{
          fontFamily: `'${userFont}', monospace`,
          fontWeight: 700,
          fontSize: 48,
          color: accent,
          textShadow: userTheme?.glow_intensity > 0
            ? `0 0 ${userTheme.glow_intensity * 0.5}px rgba(${rgb},${userTheme.glow_intensity * 0.01})`
            : 'none',
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}>
          {profile?.username || 'username'}
        </h1>

        {/* Bio */}
        <p style={{
          fontFamily: "'Lora', serif",
          fontStyle: 'italic',
          fontSize: 16,
          color: '#fff',
          maxWidth: 600,
          textAlign: 'center',
          marginBottom: 16,
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        }}>
          {profile?.bio || 'No bio yet...'}
        </p>

        {/* Mood indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: accent,
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        }}>
          <div className="blinking-dot" style={{ background: accent }} />
          {userTheme?.mood || '// MEMBER'}
        </div>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function PublicProfile() {
  const { username } = useParams()
  const { t, isDark } = useTheme()
  const [tab, setTab] = useState('posts')

  const { data: profile, isLoading: profileLoading, isError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => api.get(`/users/${username}/`).then(r => r.data),
  })

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', profile?.id],
    queryFn: () => api.get(`/posts/?author=${profile.id}`).then(r => r.data),
    enabled: !!profile?.id,
  })

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['userComments', username],
    queryFn: () => api.get(`/users/${username}/comments/`).then(r => r.data),
    enabled: !!profile,
  })

  const { data: userTheme } = useQuery({
    queryKey: ['userTheme', username],
    queryFn: () => api.get(`/users/${username}/theme/`).then(r => r.data),
    enabled: !!profile,
    staleTime: 120_000,
  })

  /* Load the profile owner's custom font */
  useEffect(() => {
    if (!userTheme?.font) return
    const id  = `pub-font-${username}`
    const old = document.getElementById(id)
    if (old) old.remove()
    const link = document.createElement('link')
    link.id   = id
    link.rel  = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(userTheme.font)}:wght@400;700&display=swap`
    document.head.appendChild(link)
  }, [userTheme?.font, username])

  /* Load all fonts for banner display */
  const FONTS = [
    'JetBrains Mono','Space Mono','Fira Code','IBM Plex Mono',
    'Source Code Pro','Inconsolata','Courier Prime','Share Tech Mono',
    'VT323','Press Start 2P','Silkscreen','Pixelify Sans',
    'Orbitron','Rajdhani','Exo 2','Oxanium',
    'Audiowide','Chakra Petch','Major Mono Display',
  ]

  useEffect(() => {
    if (document.getElementById('public-profile-fonts')) return
    const link = document.createElement('link')
    link.id   = 'public-profile-fonts'
    link.rel  = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${
      FONTS.map(f=>`family=${encodeURIComponent(f)}:wght@400;700`).join('&')
    }&display=swap`
    document.head.appendChild(link)
  }, [])

  const posts    = Array.isArray(postsData)    ? postsData    : (postsData?.results    || [])
  const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.results || [])
  const rank     = getRank(profile?.karma)

  /* Derived theme values — all computed on frontend from scalar fields */
  const accent        = userTheme?.accent_color || t.accent
  const userFont      = userTheme?.font         || 'Space Grotesk'
  const bannerBg      = userTheme
    ? (userTheme.has_custom_banner && userTheme.banner_image_url
        ? `url(${userTheme.banner_image_url}) center/cover`
        : userTheme.banner_gradient || '#F0B800')
    : '#F0B800'
  const bannerOpacity = userTheme ? userTheme.banner_opacity / 100 : 1
  const patternCss    = userTheme ? (PATTERN_BG[userTheme.pattern] || '') : ''

  const moodDisplay = userTheme
    ? (MOODS.find ? MOODS.find(m => m[0] === userTheme.mood)?.[1] : null) || userTheme.mood || '// MEMBER'
    : '// MEMBER'

  // Compute CSS effect values from scalars
  const rgb = accent && /^#[0-9A-Fa-f]{6}$/.test(accent)
    ? (() => { const h = accent.replace('#',''); return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}` })()
    : '163,230,53'

  const glowStyle   = userTheme?.glow_intensity > 0
    ? { boxShadow: `0 0 ${userTheme.glow_intensity * .35}px rgba(${rgb},${userTheme.glow_intensity * .004})` } : {}
  const borderStyle = userTheme?.border_accent > 0
    ? { borderColor: `rgba(${rgb},${userTheme.border_accent/100})` } : {}

  const cssVars = userTheme ? {
    '--user-accent':      accent,
    '--user-accent-rgb':  rgb,
    '--user-accent-bg':   `rgba(${rgb},0.12)`,
    '--user-font':        `'${userFont}', monospace`,
  } : {}

  if (isError) return (
    <div style={{ background:t.pageBg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:'#E8420A' }}>
        &gt; USER NOT FOUND<span className="blinking-cursor"> █</span>
      </div>
    </div>
  )

  /* Inject CSS vars into a scope div so they only affect the profile */
  const scopeStyle = Object.keys(cssVars).length
    ? Object.fromEntries(Object.entries(cssVars).map(([k,v]) => [k,v]))
    : {}

  return (
    <div style={{ background:t.pageBg, minHeight:'100vh', padding:'20px 12px 60px' }}>
    <div className="profile-scope" style={{ ...scopeStyle }}>
      
      {/* ══ TOP CENTERED BANNER ══ */}
      <PublicProfileBanner profile={profile} userTheme={userTheme} />

      <div className="profile-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'320px 1fr', gap:40, alignItems:'start' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Avatar Panel */}
          <PanelBox title="// USER.EXE">
            <div className="avatar-area" style={{ background: `linear-gradient(135deg, ${t.borderMid}, ${t.pageBg})` }}>
              {profile?.avatar
                ? <img src={profile.avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', top:0, left:0, zIndex:1 }} />
                : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:80, color:t.text, position:'relative', zIndex:2 }}>
                    {username?.[0]?.toUpperCase() || '?'}
                  </span>
              }
            </div>
            <div style={{ padding:12, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ fontFamily:`'${userFont}',sans-serif`, fontWeight:700, fontSize:18, color:accent }}>
                {profileLoading ? '...' : profile?.username}
              </span>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:accent, borderLeft:`2px solid rgba(${rgb},.3)`, paddingLeft:6 }}>
                {moodDisplay}
              </div>
            </div>
          </PanelBox>

          {/* Stats Panel */}
          <PanelBox title="// SYSTEM.STATS">
            <div style={{ padding:15 }}>
              <StatLine label="POSTS"    value={profile?.posts_count    ?? 0} />
              <StatLine label="COMMENTS" value={profile?.comments_count ?? 0} />
              <StatLine label="KARMA"    value={profile?.karma          ?? 0} acid />
              <StatLine label="RANK"     value={rank.rango} />
              <StatLine label="LEVEL"    value={rank.nivel} />
              <div style={{ marginTop:15, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>
                <span>LEVEL {rank.label}</span>
                <div style={{ height:6, background:t.borderMid, marginTop:4 }}>
                  <div style={{ height:'100%', background:accent, width:`${Math.min(rank.progress,100)}%`, transition:'width 1s ease' }} />
                </div>
              </div>
            </div>
          </PanelBox>

          {/* Member since */}
          <PanelBox title="// INFO">
            <div style={{ padding:15, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#9A9288' }}>
              <span>Member since {fmtDate(profile?.created_at)}</span>
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
                  <h1 className="profile-h1" style={{ fontFamily:`'${userFont}',sans-serif`, fontWeight:700, fontSize:32, letterSpacing:'-0.02em', color:accent, marginBottom:10, ...glowStyle }}>
                    {profile?.username}
                  </h1>
                  <div style={{ marginBottom:8 }}>
                    {userTheme && (
                      <span style={{ display:'inline-block', fontFamily:"'JetBrains Mono',monospace", fontSize:10, padding:'2px 8px', background:`rgba(${userTheme.css_vars?.['--user-accent-rgb']||'163,230,53'},.12)`, color:accent, letterSpacing:'0.1em', marginBottom:8 }}>
                        {rank.rango} · LVL {rank.nivel}
                      </span>
                    )}
                  </div>
                  <div style={{ marginBottom:6 }}>
                    <span style={{ fontFamily:`'${userFont}',sans-serif`, fontStyle:'italic', fontSize:14, color:t.textMuted }}>
                      {profile?.bio || 'No bio yet.'}
                    </span>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted }}>
                    Member since {fmtDate(profile?.created_at)}
                  </span>
                </>
            }
          </header>

          {/* Tabs */}
          <div className="tab-bar" style={{ background:t.tabBg, border:`2px solid ${t.border}`, boxShadow:`4px 4px 0 ${t.shadow}`, display:'flex', overflowX:'auto' }}>
            {[{id:'posts',l:'POSTS'},{id:'comments',l:'COMMENTS'}].map((t,i,arr)=>(
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
                  : posts.map((p,i) => <PostCard key={p.id} post={p} index={i} username={username} />)
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
                  : comments.map((c,i) => <CommentCard key={c.id} comment={c} index={i} username={username} />)
              }
            </div>
          )}

        </div>
      </div>

      <style>{`
        .avatar-area {
          height: 200px;
          background: linear-gradient(135deg, ${t.borderMid}, ${t.pageBg});
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
        .blinking-cursor { animation: blink 1s steps(2, start) infinite; }
        @keyframes blink { to { visibility: hidden; } }

        @media (max-width: 860px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .profile-h1 {
            font-size: 24px !important;
          }
          .avatar-area {
            height: 160px;
          }
        }

        @media (max-width: 480px) {
          .profile-grid {
            gap: 14px !important;
          }
          .profile-h1 {
            font-size: 20px !important;
          }
        }
      `}</style>
    </div>
    </div>
  )
}
