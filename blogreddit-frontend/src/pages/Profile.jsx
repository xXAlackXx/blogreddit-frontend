import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ── helpers ── */
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).toUpperCase()
}

function relTime(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600)   return `hace ${Math.round(diff / 60)} min`
  if (diff < 86400)  return `hace ${Math.round(diff / 3600)} horas`
  if (diff < 172800) return 'ayer'
  return `hace ${Math.round(diff / 86400)} días`
}

function readTime(content) {
  return Math.max(1, Math.round((content || '').trim().split(/\s+/).length / 200))
}

function getRank(karma = 0) {
  if (karma >= 500) return { rango:'VETERAN', nivel:'04', progress:100, label:'04 → MAX' }
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
  return (
    <div style={{ border:'2px solid #111008', boxShadow:'6px 6px 0 #6DC800', background:'#FDFCF8' }}>
      <div style={{ height:24, background:'#111008', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px' }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6DC800', textTransform:'uppercase' }}>{title}</span>
        <WindowControls />
      </div>
      {children}
    </div>
  )
}

function StatLine({ label, value, acid }) {
  return (
    <div style={{ display:'flex', fontFamily:"'JetBrains Mono',monospace", fontSize:12, lineHeight:1.8 }}>
      <span style={{ color:'#9A9288', textTransform:'uppercase', flexShrink:0 }}>{label}</span>
      <span style={{ color:'#C8C2B6', flex:1, overflow:'hidden', padding:'0 4px', whiteSpace:'nowrap' }}>{'................'.repeat(4)}</span>
      <span style={{ color: acid ? '#6DC800' : '#111008', fontWeight:700, textTransform:'uppercase', flexShrink:0 }}>{value}</span>
    </div>
  )
}

function TabBtn({ label, active, onClick, last }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight: active ? 700 : 400,
        color: active ? '#6DC800' : hov ? '#3A3630' : '#9A9288',
        background: active ? '#111008' : hov ? '#FDFCF8' : 'transparent',
        padding:'14px 24px', border:'none', cursor:'pointer',
        borderRight: last ? 'none' : '2px solid #111008',
        borderBottom: active ? '3px solid #6DC800' : '3px solid transparent',
        transition:'all .15s',
      }}
    >{label}</button>
  )
}

function PostCard({ post, index }) {
  const score = (post.upvotes || 0) - (post.downvotes || 0)
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/posts/${post.id}`} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
      <article
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ border:'2px solid #111008', boxShadow: hov ? '6px 6px 0 #111008' : '4px 4px 0 #111008', background:'#FDFCF8', display:'grid', gridTemplateColumns:'4px 1fr', transform: hov ? 'translate(-2px,-2px)' : 'none', transition:'all .1s' }}
      >
        <div style={{ background: STRIP_COLORS[index % STRIP_COLORS.length] }} />
        <div style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#9A9288', textTransform:'uppercase' }}>// FEED</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#9A9288' }}>{relTime(post.created_at)}</span>
          </div>
          <h2 style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontWeight:700, fontSize:17, lineHeight:1.3, color:'#111008', marginBottom:8 }}>
            {post.title}
          </h2>
          {post.content && (
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#9A9288', lineHeight:1.5, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {post.content}
            </p>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:15, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#3A3630' }}>
            <span style={{ color: score >= 0 ? '#6DC800' : '#E8420A' }}>▲ {score > 0 ? '+' : ''}{score}</span>
            <span>⏱ {readTime(post.content)} min lectura</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

/* ── Main ── */
export default function Profile() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  const [tab,   setTab]   = useState('posts')
  const [bio,   setBio]   = useState('')
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (!user) navigate('/login') }, [user, navigate])

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

  useEffect(() => {
    if (profile) { setBio(profile.bio || ''); setEmail(profile.email || '') }
  }, [profile])

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => api.patch('/users/me/', { bio, email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const posts = Array.isArray(postsData) ? postsData : (postsData?.results || [])
  const rank  = getRank(profile?.karma)

  if (!user) return null

  return (
    <div style={{ background:'#ECEAE2', minHeight:'100vh', padding:'32px 20px 60px' }}>
      <div className="profile-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'320px 1fr', gap:40, alignItems:'start' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Avatar Panel */}
          <PanelBox title="// USER.EXE">
            <div className="avatar-area">
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:80, color:'#fff', position:'relative', zIndex:2 }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ padding:12, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#111008' }}>
                {profileLoading ? '...' : profile?.username}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6DC800' }}>
                <div className="blinking-dot" />
                // ONLINE
              </div>
            </div>
          </PanelBox>

          {/* Stats Panel */}
          <PanelBox title="// SYSTEM.STATS">
            <div style={{ padding:15 }}>
              <StatLine label="POSTS"       value={profile?.posts_count    ?? 0} />
              <StatLine label="COMENTARIOS" value={profile?.comments_count ?? 0} />
              <StatLine label="KARMA"       value={profile?.karma          ?? 0} acid />
              <StatLine label="RANGO"       value={rank.rango} />
              <StatLine label="NIVEL"       value={rank.nivel} />
              <div style={{ marginTop:15, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288' }}>
                <span>NIVEL {rank.label}</span>
                <div style={{ height:6, background:'#C8C2B6', marginTop:4 }}>
                  <div style={{ height:'100%', background:'#6DC800', width:`${Math.min(rank.progress,100)}%`, transition:'width 1s ease' }} />
                </div>
              </div>
            </div>
          </PanelBox>

          {/* Tags Panel */}
          <PanelBox title="// INTERESES">
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
            {profileLoading ? (
              <div style={{ height:40, background:'#E8E4DC', width:240, marginBottom:10 }} />
            ) : (
              <>
                <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:32, letterSpacing:'-0.02em', color:'#111008', marginBottom:10 }}>
                  {profile?.username}
                </h1>
                <div style={{ marginBottom:6 }}>
                  <span style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:14, color:'#9A9288' }}>
                    {profile?.bio || 'Sin bio aún...'}
                  </span>
                  <button onClick={()=>setTab('settings')} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#111008', background:'none', border:'none', cursor:'pointer', marginLeft:8, textDecoration:'underline', padding:0 }}>
                    [EDITAR PERFIL]
                  </button>
                </div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288' }}>
                  Miembro desde {fmtDate(profile?.created_at)}
                </span>
              </>
            )}
          </header>

          {/* Tabs */}
          <div style={{ background:'#E8E4DC', border:'2px solid #111008', boxShadow:'4px 4px 0 #111008', display:'flex' }}>
            {[{id:'posts',l:'POSTS'},{id:'comments',l:'COMENTARIOS'},{id:'settings',l:'AJUSTES'}].map((t,i,arr)=>(
              <TabBtn key={t.id} label={t.l} active={tab===t.id} onClick={()=>setTab(t.id)} last={i===arr.length-1} />
            ))}
          </div>

          {/* ── Tab: POSTS ── */}
          {tab === 'posts' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {postsLoading
                ? [1,2,3].map(i=><div key={i} style={{ height:120, border:'2px solid #111008', background:'#E8E4DC' }} />)
                : posts.length === 0
                  ? (
                    <div style={{ padding:20, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#6DC800', lineHeight:1.8, borderTop:'2px dashed #C8C2B6', marginTop:10 }}>
                      <p>&gt; // EJECUTANDO BÚSQUEDA...</p>
                      <p>&gt; // 0 RESULTADOS</p>
                      <p>&gt; // FIN DE TRANSMISIÓN <span className="blinking-cursor">█</span></p>
                    </div>
                  )
                  : posts.map((p,i) => <PostCard key={p.id} post={p} index={i} />)
              }
            </div>
          )}

          {/* ── Tab: COMENTARIOS ── */}
          {tab === 'comments' && (
            <div style={{ padding:20, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#6DC800', lineHeight:1.8, borderTop:'2px dashed #C8C2B6', marginTop:10 }}>
              <p>&gt; // MÓDULO NO DISPONIBLE...</p>
              <p>&gt; // PRÓXIMAMENTE <span className="blinking-cursor">█</span></p>
            </div>
          )}

          {/* ── Tab: AJUSTES ── */}
          {tab === 'settings' && (
            <div style={{ border:'2px solid #111008', boxShadow:'6px 6px 0 #111008', background:'#FDFCF8' }}>
              <div style={{ height:24, background:'#111008', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px' }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6DC800', textTransform:'uppercase' }}>// EDITAR PERFIL</span>
                <WindowControls />
              </div>
              <div style={{ padding:'20px 24px', maxWidth:480 }}>
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6A6258', display:'block', marginBottom:8 }}>// BIO</label>
                  <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} placeholder="Cuéntanos algo sobre ti..."
                    style={{ width:'100%', border:'2px solid #C8C2B6', background:'#F2EFE8', outline:'none', padding:'10px 14px', fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#111008', lineHeight:1.6, resize:'vertical', transition:'border-color .15s', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor='#111008'} onBlur={e=>e.target.style.borderColor='#C8C2B6'} />
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6A6258', display:'block', marginBottom:8 }}>// EMAIL</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"
                    style={{ width:'100%', border:'2px solid #C8C2B6', background:'#F2EFE8', outline:'none', padding:'10px 14px', fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#111008', transition:'border-color .15s', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor='#111008'} onBlur={e=>e.target.style.borderColor='#C8C2B6'} />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <button onClick={()=>save()} disabled={saving}
                    style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em', background:saving?'#C8C2B6':'#6DC800', color:'#111008', border:`2px solid ${saving?'#C8C2B6':'#6DC800'}`, boxShadow:saving?'none':'4px 4px 0 #111008', padding:'10px 28px', cursor:saving?'not-allowed':'pointer', transition:'all .15s' }}>
                    {saving ? 'GUARDANDO...' : 'GUARDAR'}
                  </button>
                  {saved && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#0A9E88', letterSpacing:'0.1em' }}>// guardado ✓</span>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .avatar-area {
          height: 200px;
          background: #F0B800;
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
          z-index: 1;
        }
        .blinking-dot {
          width: 7px; height: 7px;
          background: #6DC800;
          animation: blink 1s steps(2, start) infinite;
        }
        .blinking-cursor { animation: blink 1s steps(2, start) infinite; }
        @keyframes blink { to { visibility: hidden; } }
        @media (max-width: 860px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
