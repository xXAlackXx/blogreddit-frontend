import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useRef, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import VoteButtons from './VoteButtons'

function timeAgo(date) {
  const diff = Date.now() - new Date(date)
  const m = Math.floor(diff / 60000)
  if (m < 1) return '0m ago'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

const PAINT_COLORS = ['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88']
const ROTATIONS = [0.5, -0.7, 0.3, -0.5, 0.8, -0.3]
const MARGINS   = [0, 12, -8, 6, -4, 10]

const TAG_COLORS = {
  tech:    { bg:'#1a3a14', border:'#2d5a24', color:'#9eeb9e' },
  art:     { bg:'#3a1414', border:'#5a2424', color:'#ff8a8a' },
  music:   { bg:'#3a2614', border:'#5a3a1f', color:'#f5b478' },
  life:    { bg:'#142a3a', border:'#1f3d5a', color:'#7ab8e8' },
  random:  { bg:'#143a32', border:'#1f5a4a', color:'#5fd8c0' },
  news:    { bg:'transparent', border:'#2a312a', color:'#8a9488' },
  general: { bg:'#1a3a14', border:'#2d5a24', color:'#9eeb9e' },
}

export default function PostCard({ post, onVote, index = 0, featured = false }) {
  const { user } = useAuth()
  const { t, isDark } = useTheme()
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  const rot = ROTATIONS[index % ROTATIONS.length]
  const ml  = MARGINS[index % MARGINS.length]
  const paintColor = PAINT_COLORS[index % PAINT_COLORS.length]
  const serialNum = String(index + 1).padStart(2, '0')

  const handleVote = async (type) => {
    if (!user) return
    await api.post(`/posts/${post.id}/vote/`, { vote_type: type })
    onVote?.()
  }

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    card.style.transform = `rotate(${rot}deg) perspective(600px) rotateY(${x*6}deg) rotateX(${-y*4}deg) translate(-2px,-2px)`
  }
  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = `rotate(${rot}deg)`
    setHovered(false)
  }

  const darkCardStyle = isDark ? {
    border: featured ? `2px solid #4ade4a` : `2px solid ${t.border}`,
    boxShadow: hovered ? `5px 5px 0 ${t.border}` : `4px 4px 0 ${t.border}`,
  } : {
    border: `2px solid ${t.border}`,
    boxShadow: hovered ? `8px 8px 0 ${t.shadow}` : `5px 5px 0 ${t.shadow}`,
  }

  return (
    <div
      ref={cardRef}
      className="post-card"
      onClick={() => navigate(`/posts/${post.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor:'pointer',
        background: t.panelBg,
        ...darkCardStyle,
        borderRadius: 2,
        overflow: 'hidden',
        transform: `rotate(${rot}deg)`,
        marginLeft: ml,
        transition: 'box-shadow .15s',
        position: 'relative',
        willChange: 'transform',
      }}
    >
      {featured && (
        <div style={{ background: isDark ? '#0a1a10' : '#111008', padding:'4px 12px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:'#00ff88', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            ★ FEATURED POST
          </span>
        </div>
      )}
      {!isDark && <div style={{ height: 4, background: paintColor }} />}

      <div className="post-card-serial" style={{
        position:'absolute', top:8, right:10,
        fontFamily:"'Space Grotesk',sans-serif", fontSize:44, fontWeight:800,
        color: isDark ? t.textMuted : (hovered ? 'rgba(109,200,0,0.25)' : 'rgba(17,16,8,0.06)'),
        userSelect:'none', lineHeight:1, pointerEvents:'none',
        transition:'color .2s',
      }}>{serialNum}</div>

      {hovered && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:3,
          background:'linear-gradient(90deg, #6DC800, #0A9E88, #1A6EC0)',
        }}/>
      )}

      <div style={{ display:'flex' }}>
        <div onClick={e => e.stopPropagation()} style={{
          width:54, display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'flex-start', padding:'16px 8px 16px',
          background: t.panelAlt, borderRight:`1px solid ${t.borderLight}`, flexShrink:0,
        }}>
          <VoteButtons score={post.upvotes - post.downvotes} onVote={handleVote} disabled={!user} />
        </div>

        <div className="post-card-content" style={{ padding:'12px 44px 12px 14px', flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <Link to={`/u/${post.author}`} onClick={e => e.stopPropagation()} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: isDark ? '#00ff88' : t.textSub, fontWeight:700, textDecoration:'none' }}
              onMouseEnter={e=>{ if (!isDark) e.currentTarget.style.color='#6DC800' }}
              onMouseLeave={e=>{ if (!isDark) e.currentTarget.style.color=t.textSub }}
            >
              {post.author}
            </Link>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.textMuted }}>
              {timeAgo(post.created_at)}
            </span>
          </div>

          <Link to={`/posts/${post.id}`} style={{ textDecoration:'none' }}>
            <h2 style={{
              fontFamily:"'Lora',Georgia,serif", fontStyle:'italic', fontWeight:700,
              fontSize:19, color:t.text, lineHeight:1.3, marginBottom:8,
              transition:'color .15s',
            }}
            onMouseEnter={e=>e.currentTarget.style.color='#E8420A'}
            onMouseLeave={e=>e.currentTarget.style.color=t.text}
            >{post.title}</h2>
          </Link>

          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:13, color:t.textFaint, lineHeight:1.65,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
            marginBottom:10,
          }}>{post.content}</p>

          {/* Hashtag category */}
          {post.hashtag && (
            <div style={{ marginBottom:8 }}>
              <Link
                to={`/?hashtag=${post.hashtag}`}
                onClick={e => e.stopPropagation()}
                style={{
                  display:'inline-block',
                  fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700,
                  letterSpacing:'0.06em', padding:'3px 8px',
                  background: isDark ? TAG_COLORS[post.hashtag]?.bg || '#0d1f14' : '#111008',
                  border: `1px solid ${isDark ? TAG_COLORS[post.hashtag]?.border || '#1a6e34' : '#6DC800'}`,
                  color: isDark ? TAG_COLORS[post.hashtag]?.color || '#6DC800' : '#6DC800',
                  textDecoration:'none', borderRadius:2,
                  transition:'all .12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6DC800'; e.currentTarget.style.color = '#111008' }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? TAG_COLORS[post.hashtag]?.bg || '#0d1f14' : '#111008'; e.currentTarget.style.color = isDark ? TAG_COLORS[post.hashtag]?.color || '#6DC800' : '#6DC800' }}
              >#{post.hashtag}</Link>
            </div>
          )}

          <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
            <Link to={`/posts/${post.id}`} onClick={e => e.stopPropagation()} style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background: 'transparent', border:'none',
              padding:'4px 0', textDecoration:'none',
              fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
              color: isDark ? t.textFaint : t.textFaint,
              transition:'all .15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.color= isDark ? '#00ff88' : '#E8420A'}}
            onMouseLeave={e=>{e.currentTarget.style.color=t.textFaint}}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              REPLY
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
