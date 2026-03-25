import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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

function PostCard({ post, index, username }) {
  const score = (post.upvotes || 0) - (post.downvotes || 0)
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/posts/${post.id}`} state={{ from: 'profile', username }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
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
            <span>⏱ {readTime(post.content)} min read</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function CommentCard({ comment, index, username }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/posts/${comment.post_id}`} state={{ from: 'profile', username }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
      <article
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ border:'2px solid #111008', boxShadow: hov ? '6px 6px 0 #111008' : '4px 4px 0 #111008', background:'#FDFCF8', display:'grid', gridTemplateColumns:'4px 1fr', transform: hov ? 'translate(-2px,-2px)' : 'none', transition:'all .1s' }}
      >
        <div style={{ background: STRIP_COLORS[(index + 2) % STRIP_COLORS.length] }} />
        <div style={{ padding:'14px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#9A9288', textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>
              // IN: {comment.post_title}
            </span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#9A9288', flexShrink:0 }}>{relTime(comment.created_at)}</span>
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#3A3630', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {comment.content}
          </p>
        </div>
      </article>
    </Link>
  )
}

function TerminalEmpty({ lines }) {
  return (
    <div style={{ padding:20, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#6DC800', lineHeight:1.8, borderTop:'2px dashed #C8C2B6', marginTop:10 }}>
      {lines.map((l, i) => <p key={i}>&gt; {l}{i === lines.length-1 && <span className="blinking-cursor"> █</span>}</p>)}
    </div>
  )
}

/* ── Main ── */
export default function PublicProfile() {
  const { username } = useParams()
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

  const posts    = Array.isArray(postsData)    ? postsData    : (postsData?.results    || [])
  const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.results || [])
  const rank     = getRank(profile?.karma)

  if (isError) return (
    <div style={{ background:'#ECEAE2', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:'#E8420A' }}>
        &gt; USER NOT FOUND<span className="blinking-cursor"> █</span>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#ECEAE2', minHeight:'100vh', padding:'32px 20px 60px' }}>
      <div className="profile-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'320px 1fr', gap:40, alignItems:'start' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Avatar Panel */}
          <PanelBox title="// USER.EXE">
            <div className="avatar-area">
              {profile?.avatar
                ? <img src={profile.avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', top:0, left:0, zIndex:1 }} />
                : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:80, color:'#fff', position:'relative', zIndex:2 }}>
                    {username?.[0]?.toUpperCase() || '?'}
                  </span>
              }
            </div>
            <div style={{ padding:12, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#111008' }}>
                {profileLoading ? '...' : profile?.username}
              </span>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288' }}>
                // MEMBER
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
              <div style={{ marginTop:15, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288' }}>
                <span>LEVEL {rank.label}</span>
                <div style={{ height:6, background:'#C8C2B6', marginTop:4 }}>
                  <div style={{ height:'100%', background:'#6DC800', width:`${Math.min(rank.progress,100)}%`, transition:'width 1s ease' }} />
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
                  <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:32, letterSpacing:'-0.02em', color:'#111008', marginBottom:10 }}>
                    {profile?.username}
                  </h1>
                  <div style={{ marginBottom:6 }}>
                    <span style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:14, color:'#9A9288' }}>
                      {profile?.bio || 'No bio yet.'}
                    </span>
                  </div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288' }}>
                    Member since {fmtDate(profile?.created_at)}
                  </span>
                </>
            }
          </header>

          {/* Tabs */}
          <div style={{ background:'#E8E4DC', border:'2px solid #111008', boxShadow:'4px 4px 0 #111008', display:'flex' }}>
            {[{id:'posts',l:'POSTS'},{id:'comments',l:'COMMENTS'}].map((t,i,arr)=>(
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
                  : posts.map((p,i) => <PostCard key={p.id} post={p} index={i} username={username} />)
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
                  : comments.map((c,i) => <CommentCard key={c.id} comment={c} index={i} username={username} />)
              }
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
          z-index: 3;
          pointer-events: none;
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
