import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ── helpers ── */
function relTime(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 3600)   return `${Math.round(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

/* ── Confirmation Modal ── */
function PurgeModal({ item, type, onConfirm, onCancel }) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(10,10,6,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#0A0A06',
        border: '3px solid #E8420A',
        boxShadow: '8px 8px 0 #E8420A',
        maxWidth: 520, width: '100%',
        padding: 0,
      }}>
        {/* Header */}
        <div style={{
          background: '#E8420A', padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: '#0A0A06', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            ⚠ CONFIRMAR PURGA
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['#0A0A06', '#0A0A06', '#0A0A06'].map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, background: c }} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#E8420A', marginBottom: 16, letterSpacing: '0.05em' }}>
            &gt; OPERACIÓN IRREVERSIBLE. EL REGISTRO SERÁ ELIMINADO PERMANENTEMENTE.
          </p>
          <div style={{
            background: '#111008', border: '2px solid #3A3630',
            padding: '12px 16px', marginBottom: 24,
          }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6DC800', marginBottom: 6, textTransform: 'uppercase' }}>
              // {type === 'post' ? 'POST' : 'COMMENT'} ID:{item.id}
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#C8C2B6', lineHeight: 1.4 }}>
              {type === 'post' ? item.title : item.content?.slice(0, 120) + (item.content?.length > 120 ? '...' : '')}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6A6258', marginTop: 6 }}>
              AUTOR: {item.author}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onCancel} style={{
              background: 'none', border: '2px solid #3A3630', color: '#9A9288',
              fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              padding: '8px 20px', cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9A9288'; e.currentTarget.style.color = '#C8C2B6' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3A3630'; e.currentTarget.style.color = '#9A9288' }}
            >CANCELAR</button>
            <button onClick={onConfirm}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                background: hover ? '#FF5500' : '#E8420A',
                border: '2px solid #E8420A', color: '#0A0A06',
                fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                padding: '8px 24px', cursor: 'pointer', transition: 'all .15s',
                boxShadow: hover ? '4px 4px 0 #FF5500' : 'none',
              }}
            >⚡ EJECUTAR PURGA</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Post Row ── */
function PostRow({ post, onDelete, index }) {
  const [hov, setHov] = useState(false)
  const score = (post.upvotes || 0) - (post.downvotes || 0)
  const COLORS = ['#6DC800', '#E8420A', '#F0B800', '#1A6EC0', '#0A9E88']
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '4px 1fr auto',
        border: '1px solid #1A1A12',
        borderBottom: '1px solid #2A2A1E',
        background: hov ? '#111008' : 'transparent',
        transition: 'background .1s',
      }}
    >
      <div style={{ background: COLORS[index % COLORS.length] }} />
      <div style={{ padding: '12px 16px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Link to={`/posts/${post.id}`} target="_blank" style={{
            fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14,
            color: '#C8C2B6', textDecoration: 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#6DC800'}
          onMouseLeave={e => e.currentTarget.style.color = '#C8C2B6'}
          >{post.title}</Link>
        </div>
        <div style={{ display: 'flex', gap: 16, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6A6258' }}>
          <span style={{ color: '#9A9288' }}>@{post.author}</span>
          <span>{relTime(post.created_at)}</span>
          <span style={{ color: score >= 0 ? '#6DC800' : '#E8420A' }}>
            {score >= 0 ? '▲' : '▼'} {score > 0 ? '+' : ''}{score}
          </span>
          <span>ID:{post.id}</span>
        </div>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => onDelete(post)} style={{
          background: 'none', border: '1px solid #E8420A', color: '#E8420A',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '5px 12px', cursor: 'pointer', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#E8420A'; e.currentTarget.style.color = '#0A0A06' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#E8420A' }}
        >PURGAR</button>
      </div>
    </div>
  )
}

/* ── Comment Row ── */
function CommentRow({ comment, onDelete, index }) {
  const [hov, setHov] = useState(false)
  const COLORS = ['#1A6EC0', '#0A9E88', '#F0B800', '#6DC800', '#E8420A']
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '4px 1fr auto',
        border: '1px solid #1A1A12',
        borderBottom: '1px solid #2A2A1E',
        background: hov ? '#111008' : 'transparent',
        transition: 'background .1s',
      }}
    >
      <div style={{ background: COLORS[index % COLORS.length] }} />
      <div style={{ padding: '10px 16px', minWidth: 0 }}>
        <p style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#C8C2B6',
          lineHeight: 1.4, marginBottom: 4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{comment.content}</p>
        <div style={{ display: 'flex', gap: 16, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6A6258' }}>
          <span style={{ color: '#9A9288' }}>@{comment.author}</span>
          <span>{relTime(comment.created_at)}</span>
          <Link to={`/posts/${comment.post}`} target="_blank" style={{ color: '#6DC800', textDecoration: 'none' }}>
            EN: {comment.post_title?.slice(0, 40)}
          </Link>
        </div>
      </div>
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => onDelete(comment)} style={{
          background: 'none', border: '1px solid #E8420A', color: '#E8420A',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '5px 12px', cursor: 'pointer', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#E8420A'; e.currentTarget.style.color = '#0A0A06' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#E8420A' }}
        >PURGAR</button>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function AdminPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('posts')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [confirm, setConfirm] = useState(null) // { item, type }

  // Guard
  if (!user) { navigate('/login'); return null }
  if (user.role !== 'admin') { navigate('/'); return null }

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/admin/stats/').then(r => r.data),
  })

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['adminPosts', query],
    queryFn: () => api.get(`/admin/posts/?search=${encodeURIComponent(query)}&page_size=100`).then(r => r.data),
    enabled: tab === 'posts',
  })

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['adminComments', query],
    queryFn: () => api.get(`/admin/comments/?search=${encodeURIComponent(query)}&page_size=100`).then(r => r.data),
    enabled: tab === 'comments',
  })

  const posts    = Array.isArray(postsData)    ? postsData    : (postsData?.results    || [])
  const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.results || [])

  const deletePost = useMutation({
    mutationFn: (id) => api.delete(`/admin/posts/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setConfirm(null)
    },
  })

  const deleteComment = useMutation({
    mutationFn: (id) => api.delete(`/admin/comments/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminComments'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setConfirm(null)
    },
  })

  const handleConfirmDelete = () => {
    if (!confirm) return
    if (confirm.type === 'post') deletePost.mutate(confirm.item.id)
    else deleteComment.mutate(confirm.item.id)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search)
  }

  const STAT_ITEMS = [
    { label: 'POSTS TOTALES',     value: stats?.total_posts    ?? '—', color: '#6DC800' },
    { label: 'COMENTARIOS',       value: stats?.total_comments ?? '—', color: '#1A6EC0' },
    { label: 'USUARIOS',          value: stats?.total_users    ?? '—', color: '#F0B800' },
  ]

  return (
    <div style={{ background: '#0A0A06', minHeight: '100vh', padding: '32px 20px 60px' }}>
      {/* Ghost bg text */}
      <div style={{
        position: 'fixed', right: -20, top: 80, zIndex: 0,
        fontFamily: "'Space Grotesk',sans-serif", fontSize: 180, fontWeight: 800,
        color: 'transparent', WebkitTextStroke: '1px rgba(232,66,10,0.04)',
        userSelect: 'none', lineHeight: 1, pointerEvents: 'none',
      }}>CMD</div>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 4, height: 32, background: '#E8420A' }} />
            <h1 style={{
              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 28,
              color: '#fff', letterSpacing: '-0.02em', margin: 0,
            }}>COMANDO CENTRAL</h1>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#E8420A', letterSpacing: '0.2em', textTransform: 'uppercase', paddingLeft: 16 }}>
            // ACCESO NIVEL DIOS — MODO PURGA ACTIVO
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
          {STAT_ITEMS.map(s => (
            <div key={s.label} style={{
              border: `2px solid ${s.color}`,
              boxShadow: `4px 4px 0 ${s.color}`,
              background: '#111008',
              padding: '16px 20px',
            }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6A6258', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                // {s.label}
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 36, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div style={{ border: '2px solid #1A1A12', boxShadow: '6px 6px 0 #E8420A', background: '#0D0D09' }}>

          {/* Panel header bar */}
          <div style={{
            height: 36, background: '#111008',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', borderBottom: '2px solid #1A1A12',
          }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#E8420A', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              // PANEL DE CONTROL — ONYX ADMIN v1.0
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['#E8420A', '#F0B800', '#6DC800'].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, background: c }} />
              ))}
            </div>
          </div>

          {/* Tabs + Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 0 0 0', borderBottom: '2px solid #1A1A12', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex' }}>
              {[{ id: 'posts', label: 'POSTS' }, { id: 'comments', label: 'COMENTARIOS' }].map((t, i, arr) => (
                <button key={t.id} onClick={() => { setTab(t.id); setQuery(''); setSearch('') }} style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: tab === t.id ? 700 : 400,
                  color: tab === t.id ? '#E8420A' : '#6A6258',
                  background: tab === t.id ? '#111008' : 'transparent',
                  padding: '12px 24px', border: 'none', cursor: 'pointer',
                  borderRight: i < arr.length - 1 ? '1px solid #1A1A12' : 'none',
                  borderBottom: tab === t.id ? '3px solid #E8420A' : '3px solid transparent',
                  transition: 'all .15s',
                }}>{t.label}</button>
              ))}
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, padding: '8px 12px' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título o autor..."
                style={{
                  background: '#111008', border: '1px solid #3A3630', borderRight: 'none',
                  color: '#C8C2B6', fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                  padding: '6px 12px', outline: 'none', width: 240,
                }}
              />
              <button type="submit" style={{
                background: '#E8420A', border: '1px solid #E8420A', color: '#0A0A06',
                fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
                padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase',
              }}>BUSCAR</button>
            </form>
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '4px 1fr auto',
            background: '#111008', borderBottom: '1px solid #2A2A1E',
            padding: '0',
          }}>
            <div />
            <div style={{ padding: '8px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#6A6258', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {tab === 'posts' ? '// TÍTULO / AUTOR / FECHA / SCORE' : '// CONTENIDO / AUTOR / POST'}
            </div>
            <div style={{ padding: '8px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#6A6258', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              // ACCIÓN
            </div>
          </div>

          {/* List */}
          <div>
            {tab === 'posts' && (
              postsLoading
                ? [1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ height: 58, background: '#111008', borderBottom: '1px solid #1A1A12', opacity: 0.4 }} />
                  ))
                : posts.length === 0
                  ? <div style={{ padding: 32, textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#E8420A' }}>
                      &gt; 0 REGISTROS ENCONTRADOS
                    </div>
                  : posts.map((p, i) => (
                      <PostRow key={p.id} post={p} index={i} onDelete={item => setConfirm({ item, type: 'post' })} />
                    ))
            )}
            {tab === 'comments' && (
              commentsLoading
                ? [1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ height: 58, background: '#111008', borderBottom: '1px solid #1A1A12', opacity: 0.4 }} />
                  ))
                : comments.length === 0
                  ? <div style={{ padding: 32, textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#E8420A' }}>
                      &gt; 0 REGISTROS ENCONTRADOS
                    </div>
                  : comments.map((c, i) => (
                      <CommentRow key={c.id} comment={c} index={i} onDelete={item => setConfirm({ item, type: 'comment' })} />
                    ))
            )}
          </div>

          {/* Footer bar */}
          <div style={{
            borderTop: '1px solid #1A1A12',
            padding: '8px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#3A3630', letterSpacing: '0.1em' }}>
              // ONYX ADMIN — ACCESO AUTORIZADO: {user?.username?.toUpperCase()}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#3A3630', letterSpacing: '0.1em' }}>
              MODO: DIOS INTERGALÁCTICO
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirm && (
        <PurgeModal
          item={confirm.item}
          type={confirm.type}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
