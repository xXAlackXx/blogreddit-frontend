import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import VoteButtons from '../components/VoteButtons'
import { useTheme } from '../context/ThemeContext'

function timeAgo(date) {
  const d = Date.now() - new Date(date)
  const m = Math.floor(d/60000)
  if(m<1) return '0m ago'
  if(m<60) return `${m}m ago`
  const h = Math.floor(m/60)
  if(h<24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useTheme()
  const queryClient = useQueryClient()
  const location = useLocation()
  const from = location.state?.from  // 'profile' | 'myprofile' | undefined
  const fromUser = location.state?.username
  const backTo   = from === 'profile'   ? `/u/${fromUser}`
                 : from === 'myprofile' ? '/profile'
                 : '/'
  const backLabel = from === 'profile'   ? `← BACK TO ${fromUser?.toUpperCase()}'S PROFILE`
                  : from === 'myprofile' ? '← BACK TO MY PROFILE'
                  : '← BACK TO FEED'
  const [comment, setComment] = useState('')
  const [allComments, setAllComments] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`/posts/${id}/`).then(r => r.data),
  })

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => api.get(`/posts/${id}/comments/`).then(r => r.data),
  })

  // Accumulate paginated comments
  useEffect(() => {
    if (comments) setAllComments(comments)
  }, [comments])

  const loadMore = async () => {
    if (!allComments?.next || loadingMore) return
    setLoadingMore(true)
    try {
      const res = await api.get(allComments.next)
      setAllComments(prev => ({
        ...prev,
        results: [...prev.results, ...res.data.results],
        next: res.data.next,
        count: res.data.count,
      }))
    } finally {
      setLoadingMore(false)
    }
  }

  const commentMutation = useMutation({
    mutationFn: () => api.post(`/posts/${id}/comments/`, { content: comment }),
    onSuccess: () => { setComment(''); refetchComments() },
  })

  const handleVote = async (type) => {
    await api.post(`/posts/${id}/vote/`, { vote_type: type })
    queryClient.invalidateQueries(['post', id])
  }

  if (isLoading) return (
    <div style={{ maxWidth:760, margin:'24px auto', padding:'0 16px' }}>
      <div style={{ background:t.panelBg, border:`2px solid ${t.borderMid}`, boxShadow:`5px 5px 0 ${t.borderMid}`, padding:24 }}>
        <div className="skeleton" style={{ height:28,width:'65%',marginBottom:12 }}/>
        <div className="skeleton" style={{ height:14,width:'30%',marginBottom:20 }}/>
        <div className="skeleton" style={{ height:120,width:'100%' }}/>
      </div>
    </div>
  )

  const score = post.upvotes - post.downvotes

  return (
    <div style={{ maxWidth:760, margin:'24px auto', padding:'0 16px' }} className="slam post-detail-wrap">
      {/* Back */}
      <Link to={backTo} style={{
        display:'inline-flex', alignItems:'center', gap:8,
        fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700,
        color:'#9A9288', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.08em',
        marginBottom:16, padding:'6px 0',
      }}>{backLabel}</Link>

      {/* Post */}
      <div style={{ background:t.panelBg, border:`2px solid ${t.border}`, boxShadow:`5px 5px 0 ${t.shadow}`, overflow:'hidden', marginBottom:16 }}>
        <div style={{ height:4, background:'#6DC800' }}/>
        <div style={{ display:'flex' }}>
          {/* Vote */}
          <div className="post-detail-vote" style={{ width:56, background:t.panelAlt, borderRight:`2px solid ${t.borderLight}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'16px 8px', flexShrink:0 }}>
            <VoteButtons score={score} onVote={handleVote} disabled={!user}/>
          </div>
          {/* Content */}
          <div className="post-detail-content" style={{ padding:'18px 24px', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <Link to={`/u/${post.author}`} style={{ textDecoration:'none', flexShrink:0 }}>
                <div style={{ width:28, height:28, background:'linear-gradient(135deg,#E8420A,#F0B800)', border:`2px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {post.author_avatar
                    ? <img src={post.author_avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'#111008' }}>{post.author?.[0]?.toUpperCase()}</span>
                  }
                </div>
              </Link>
              <Link to={`/u/${post.author}`} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:t.textSub, textDecoration:'none' }}
                onMouseEnter={e=>e.currentTarget.style.color='#6DC800'}
                onMouseLeave={e=>e.currentTarget.style.color=t.textSub}
              >{post.author}</Link>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.textMuted }}>{timeAgo(post.created_at)}</span>
            </div>
            <h1 style={{ fontFamily:"'Lora',Georgia,serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(20px,3vw,26px)', color:t.text, lineHeight:1.3, marginBottom:16 }}>
              {post.title}
            </h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:t.textSub, lineHeight:1.75, whiteSpace:'pre-wrap' }}>
              {post.content}
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="post-detail-comments" style={{ background:t.panelBg, border:`2px solid ${t.border}`, boxShadow:`5px 5px 0 ${t.shadow}`, padding:24 }}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, textTransform:'uppercase', letterSpacing:'0.06em', color:t.text, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, background:'#6DC800', border:`2px solid ${t.border}` }}/>
          {comments?.count ?? 0} COMMENTS
        </h2>

        {user ? (
          <div style={{ marginBottom:24 }}>
            <textarea rows={4} placeholder="// leave your mark..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width:'100%', padding:'12px 14px',
                background:t.panelAlt, border:`2px solid ${t.border}`,
                fontFamily:"'DM Sans',sans-serif", fontSize:14, color:t.text,
                outline:'none', resize:'vertical', lineHeight:1.6,
                transition:'box-shadow .15s, border-color .15s',
              }}
              onFocus={e=>{e.target.style.borderColor='#6DC800';e.target.style.boxShadow='3px 3px 0 #6DC800'}}
              onBlur={e=>{e.target.style.borderColor=t.border;e.target.style.boxShadow='none'}}
            />
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
              <button
                onClick={() => commentMutation.mutate()}
                disabled={!comment.trim() || commentMutation.isPending}
                style={{
                  background: (!comment.trim()||commentMutation.isPending) ? '#C8C2B6' : '#6DC800',
                  color:'#111008', border:'2px solid #111008',
                  boxShadow: (!comment.trim()||commentMutation.isPending) ? 'none' : '3px 3px 0 #111008',
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
                  textTransform:'uppercase', letterSpacing:'0.06em',
                  padding:'8px 18px', cursor:(!comment.trim()||commentMutation.isPending)?'not-allowed':'pointer',
                }}
              >REPLY →</button>
            </div>
          </div>
        ) : (
          <div style={{ background:'#111008', border:'2px solid #6DC800', padding:'12px 16px', marginBottom:20 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#9A9288' }}>
              <Link to="/login" style={{ color:'#6DC800', fontWeight:700, textDecoration:'none' }}>LOGIN</Link>
              {' '}to leave a comment
            </span>
          </div>
        )}

        {/* Comment list */}
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {allComments?.results?.length === 0 ? (
            <div style={{ padding:'24px 0', textAlign:'center' }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#9A9288', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                no comments yet
              </span>
            </div>
          ) : allComments?.results?.map((c, i) => (
            <div key={c.id} className="slam" style={{
              borderTop: i===0 ? `2px solid ${t.borderLight}` : `1px solid ${t.borderLight}`,
              padding:'16px 0',
              display:'flex', gap:14,
            }}>
              <Link to={`/u/${c.author}`} style={{ textDecoration:'none', flexShrink:0 }}>
                <div style={{ width:32, height:32, background:`linear-gradient(135deg, ${['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88'][i%5]}, #111008)`, border:`2px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {c.author_avatar
                    ? <img src={c.author_avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'#FDFCF8' }}>{c.author?.[0]?.toUpperCase()}</span>
                  }
                </div>
              </Link>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <Link to={`/u/${c.author}`} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:t.text, textDecoration:'none' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#6DC800'}
                    onMouseLeave={e=>e.currentTarget.style.color=t.text}
                  >{c.author}</Link>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:t.textMuted }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:t.textSub, lineHeight:1.65 }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}

          {/* Load More button */}
          {allComments?.next && (
            <div style={{ display:'flex', justifyContent:'center', padding:'16px 0' }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  background: loadingMore ? '#C8C2B6' : 'transparent',
                  color: loadingMore ? '#111008' : t.textSub,
                  border: `2px solid ${loadingMore ? '#C8C2B6' : t.borderMid}`,
                  boxShadow: loadingMore ? 'none' : `3px 3px 0 ${t.borderMid}`,
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
                  textTransform:'uppercase', letterSpacing:'0.06em',
                  padding:'8px 18px', cursor: loadingMore ? 'not-allowed' : 'pointer',
                }}
              >{loadingMore ? 'LOADING...' : 'LOAD MORE COMMENTS →'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
