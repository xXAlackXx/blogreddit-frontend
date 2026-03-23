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

function Skeleton({ h = 20, w = '100%', mb = 8 }) {
  return (
    <div style={{
      height: h, width: w, marginBottom: mb,
      background: 'linear-gradient(90deg,#E8E4DC 25%,#D8D4CC 50%,#E8E4DC 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

/* ── Tab button ── */
function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.14em',
      padding: '10px 24px', cursor: 'pointer',
      background: active ? '#111008' : 'transparent',
      color: active ? '#6DC800' : '#9A9288',
      border: 'none',
      borderBottom: active ? '2px solid #6DC800' : '2px solid transparent',
      transition: 'all .15s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#FDFCF8' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#9A9288' }}
    >{label}</button>
  )
}

/* ── Compact post row ── */
function PostRow({ post }) {
  const score = (post.upvotes || 0) - (post.downvotes || 0)
  return (
    <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        border: '2px solid #111008', boxShadow: '3px 3px 0 #111008',
        background: '#FDFCF8', padding: '12px 16px',
        marginBottom: 10, transition: 'transform .12s, box-shadow .12s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111008' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #111008' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#111008', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.title}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#9A9288', marginTop: 4, letterSpacing: '0.08em' }}>
            {fmtDate(post.created_at)}
          </div>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700,
          color: score > 0 ? '#6DC800' : score < 0 ? '#E8420A' : '#9A9288',
          flexShrink: 0,
        }}>
          {score > 0 ? '+' : ''}{score}
        </div>
      </div>
    </Link>
  )
}

/* ── Main ── */
export default function Profile() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  const [tab,    setTab]    = useState('posts')
  const [bio,    setBio]    = useState('')
  const [email,  setEmail]  = useState('')
  const [saved,  setSaved]  = useState(false)

  /* Guard */
  useEffect(() => { if (!user) navigate('/login') }, [user, navigate])

  /* Data */
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

  /* Sync form when profile loads */
  useEffect(() => {
    if (profile) { setBio(profile.bio || ''); setEmail(profile.email || '') }
  }, [profile])

  /* Save mutation */
  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => api.patch('/users/me/', { bio, email }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); setSaved(true); setTimeout(() => setSaved(false), 2500) },
  })

  const posts = Array.isArray(postsData) ? postsData : postsData?.results || []

  if (!user) return null

  return (
    <div style={{ background: '#F2EFE8', minHeight: '100vh', padding: '32px 24px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ── Profile Header ── */}
        <div style={{ border: '2px solid #111008', boxShadow: '6px 6px 0 #111008', background: '#FDFCF8', padding: '28px 32px', marginBottom: 20, display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Avatar */}
          <div style={{
            width: 80, height: 80, flexShrink: 0,
            background: 'linear-gradient(135deg,#E8420A,#F0B800)',
            border: '3px solid #111008', boxShadow: '4px 4px 0 #111008',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 32, color: '#111008' }}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            {profileLoading ? (
              <>
                <Skeleton h={28} w={180} mb={10} />
                <Skeleton h={14} w={260} mb={14} />
                <Skeleton h={32} w={300} />
              </>
            ) : (
              <>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', color: '#111008', margin: 0, lineHeight: 1 }}>
                  {profile?.username}
                </h1>
                <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 15, color: profile?.bio ? '#3A3630' : '#9A9288', margin: '10px 0 16px' }}>
                  {profile?.bio || 'Sin bio aún...'}
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'POSTS',    value: profile?.posts_count    ?? 0 },
                    { label: 'COMMENTS', value: profile?.comments_count ?? 0 },
                    { label: 'KARMA',    value: profile?.karma          ?? 0, acid: true },
                  ].map(s => (
                    <div key={s.label} style={{ border: '2px solid #111008', boxShadow: '3px 3px 0 #111008', background: s.acid ? '#6DC800' : '#E8E4DC', padding: '6px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: '#111008', lineHeight: 1 }}>{s.value}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9,  fontWeight: 700, color: '#6A6258', letterSpacing: '0.16em', marginTop: 2 }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Join date */}
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#9A9288', letterSpacing: '0.12em', marginTop: 12 }}>
                  // DESDE: {fmtDate(profile?.created_at)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ border: '2px solid #111008', boxShadow: '6px 6px 0 #111008', background: '#FDFCF8', overflow: 'hidden' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '2px solid #111008', background: '#E8E4DC' }}>
            {[{id:'posts', label:'POSTS'}, {id:'comments', label:'COMENTARIOS'}, {id:'settings', label:'AJUSTES'}].map(t => (
              <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '20px 24px' }}>

            {/* POSTS */}
            {tab === 'posts' && (
              postsLoading ? (
                <>{[1,2,3].map(i => <Skeleton key={i} h={60} mb={10} />)}</>
              ) : posts.length === 0 ? (
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#9A9288', letterSpacing: '0.1em', padding: '20px 0' }}>
                  // sin publicaciones todavía
                </div>
              ) : (
                posts.map(p => <PostRow key={p.id} post={p} />)
              )
            )}

            {/* COMENTARIOS */}
            {tab === 'comments' && (
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#9A9288', letterSpacing: '0.1em', padding: '20px 0' }}>
                // próximamente
              </div>
            )}

            {/* AJUSTES */}
            {tab === 'settings' && (
              <div style={{ maxWidth: 480 }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6A6258', display: 'block', marginBottom: 8 }}>
                    // BIO
                  </label>
                  <textarea
                    value={bio} onChange={e => setBio(e.target.value)} rows={4}
                    placeholder="Cuéntanos algo sobre ti..."
                    style={{ width: '100%', border: '2px solid #C8C2B6', background: '#F2EFE8', outline: 'none', padding: '10px 14px', fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#111008', lineHeight: 1.6, resize: 'vertical', transition: 'border-color .15s', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#111008'}
                    onBlur={e  => e.target.style.borderColor = '#C8C2B6'}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6A6258', display: 'block', marginBottom: 8 }}>
                    // EMAIL
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    style={{ width: '100%', border: '2px solid #C8C2B6', background: '#F2EFE8', outline: 'none', padding: '10px 14px', fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#111008', transition: 'border-color .15s', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#111008'}
                    onBlur={e  => e.target.style.borderColor = '#C8C2B6'}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    onClick={() => save()} disabled={saving}
                    style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', background: saving ? '#C8C2B6' : '#6DC800', color: '#111008', border: `2px solid ${saving ? '#C8C2B6' : '#6DC800'}`, boxShadow: saving ? 'none' : '4px 4px 0 #111008', padding: '10px 28px', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #111008' } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; if (!saving) e.currentTarget.style.boxShadow = '4px 4px 0 #111008' }}
                  >
                    {saving ? 'GUARDANDO...' : 'GUARDAR'}
                  </button>
                  {saved && (
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#0A9E88', letterSpacing: '0.1em' }}>
                      // cambios guardados
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}
