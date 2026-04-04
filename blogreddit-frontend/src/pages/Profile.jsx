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
  const { t } = useTheme()
  return (
    <div style={{ border:`2px solid ${t.border}`, boxShadow:'6px 6px 0 #6DC800', background:t.panelBg }}>
      <div style={{ height:24, background:'#111008', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px' }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6DC800', textTransform:'uppercase' }}>{title}</span>
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
      <span style={{ color: acid ? '#6DC800' : t.text, fontWeight:700, textTransform:'uppercase', flexShrink:0 }}>{value}</span>
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
        color: active ? '#6DC800' : hov ? t.textSub : t.textMuted,
        background: active ? '#111008' : hov ? t.panelBg : 'transparent',
        padding:'14px 24px', border:'none', cursor:'pointer',
        borderRight: last ? 'none' : `2px solid ${t.border}`,
        borderBottom: active ? '3px solid #6DC800' : '3px solid transparent',
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
            <span style={{ color: score >= 0 ? '#6DC800' : '#E8420A' }}>▲ {score > 0 ? '+' : ''}{score}</span>
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
    <div style={{ padding:20, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#6DC800', lineHeight:1.8, borderTop:`2px dashed ${t.borderMid}`, marginTop:10 }}>
      {lines.map((l, i) => <p key={i}>&gt; {l}{i === lines.length-1 && <span className="blinking-cursor"> █</span>}</p>)}
    </div>
  )
}

/* ── Main ── */
export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { t } = useTheme()
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

  /* Sync form when profile loads */
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBio(profile.bio || '')
      setEmail(profile.email || '')
    }
  }, [profile])

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
      <div className="profile-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'320px 1fr', gap:40, alignItems:'start' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Avatar Panel */}
          <PanelBox title="// USER.EXE">
            <div className="avatar-area">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', top:0, left:0, zIndex:1 }} />
                : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:80, color:'#fff', position:'relative', zIndex:2 }}>
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
              }
            </div>
            <div style={{ padding:12, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:t.text }}>
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
              <StatLine label="COMMENTS" value={profile?.comments_count ?? 0} />
              <StatLine label="KARMA"       value={profile?.karma          ?? 0} acid />
              <StatLine label="RANK"        value={rank.rango} />
              <StatLine label="LEVEL"       value={rank.nivel} />
              <div style={{ marginTop:15, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288' }}>
                <span>LEVEL {rank.label}</span>
                <div style={{ height:6, background:t.borderMid, marginTop:4 }}>
                  <div style={{ height:'100%', background:'#6DC800', width:`${Math.min(rank.progress,100)}%`, transition:'width 1s ease' }} />
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
                  <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:32, letterSpacing:'-0.02em', color:t.text, marginBottom:10 }}>
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
          <div className="tab-bar" style={{ background:t.tabBg, border:`2px solid ${t.border}`, boxShadow:`4px 4px 0 ${t.shadow}`, display:'flex' }}>
            {[{id:'posts',l:'POSTS'},{id:'comments',l:'COMMENTS'},{id:'settings',l:'SETTINGS'}].map((t,i,arr)=>(
              <TabBtn key={t.id} label={t.l} active={tab===t.id} onClick={()=>setTab(t.id)} last={i===arr.length-1} />
            ))}
          </div>

          {/* ── Tab: POSTS ── */}
          {tab === 'posts' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {postsLoading
                ? [1,2,3].map(i => <div key={i} style={{ height:120, border:'2px solid #111008', background:'#E8E4DC' }} />)
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
                ? [1,2,3].map(i => <div key={i} style={{ height:90, border:'2px solid #111008', background:'#E8E4DC' }} />)
                : comments.length === 0
                  ? <TerminalEmpty lines={['SEARCHING COMMENTS...','// 0 RESULTS','// END OF TRANSMISSION']} />
                  : comments.map((c,i) => <CommentCard key={c.id} comment={c} index={i} />)
              }
            </div>
          )}

          {/* ── Tab: SETTINGS ── */}
          {tab === 'settings' && (
            <div style={{ border:`2px solid ${t.border}`, boxShadow:`6px 6px 0 ${t.shadow}`, background:t.panelBg }}>
              <div style={{ height:24, background:'#111008', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px' }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6DC800', textTransform:'uppercase' }}>// EDIT PROFILE</span>
                <WindowControls />
              </div>
              <div className="settings-panel-body" style={{ padding:'20px 24px' }}>

                {/* Avatar upload */}
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6A6258', display:'block', marginBottom:10 }}>// AVATAR</label>
                  <div className="settings-avatar-row" style={{ display:'flex', alignItems:'center', gap:16 }}>
                    {/* Preview */}
                    <div style={{ width:64, height:64, border:'2px solid #111008', boxShadow:'3px 3px 0 #111008', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#E8420A,#F0B800)', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                    style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em', background:saving?'#C8C2B6':'#6DC800', color:'#111008', border:`2px solid ${saving?'#C8C2B6':'#6DC800'}`, boxShadow:saving?'none':'4px 4px 0 #111008', padding:'10px 28px', cursor:saving?'not-allowed':'pointer', transition:'all .15s' }}>
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
