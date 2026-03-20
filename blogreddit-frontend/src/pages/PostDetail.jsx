import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import VoteButtons from '../components/VoteButtons'

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
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`/posts/${id}/`).then(r => r.data),
  })

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => api.get(`/posts/${id}/comments/`).then(r => r.data),
  })

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
      <div style={{ background:'#FDFCF8', border:'2px solid #C8C2B6', boxShadow:'5px 5px 0 #C8C2B6', padding:24 }}>
        <div className="skeleton" style={{ height:28,width:'65%',marginBottom:12 }}/>
        <div className="skeleton" style={{ height:14,width:'30%',marginBottom:20 }}/>
        <div className="skeleton" style={{ height:120,width:'100%' }}/>
      </div>
    </div>
  )

  const score = post.upvotes - post.downvotes

  return (
    <div style={{ maxWidth:760, margin:'24px auto', padding:'0 16px' }} className="slam">
      {/* Back */}
      <Link to="/" style={{
        display:'inline-flex', alignItems:'center', gap:8,
        fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700,
        color:'#9A9288', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.08em',
        marginBottom:16, padding:'6px 0',
      }}>← BACK TO FEED</Link>

      {/* Post */}
      <div style={{ background:'#FDFCF8', border:'2px solid #111008', boxShadow:'5px 5px 0 #111008', overflow:'hidden', marginBottom:16 }}>
        <div style={{ height:4, background:'#6DC800' }}/>
        <div style={{ display:'flex' }}>
          {/* Vote */}
          <div style={{ width:56, background:'#F2EFE8', borderRight:'2px solid #E8E4DC', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'16px 8px', flexShrink:0 }}>
            <VoteButtons score={score} onVote={handleVote} disabled={!user}/>
          </div>
          {/* Content */}
          <div style={{ padding:'18px 24px', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:28, height:28, background:'linear-gradient(135deg,#E8420A,#F0B800)', border:'2px solid #111008', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'#111008' }}>
                  {post.author?.[0]?.toUpperCase()}
                </span>
              </div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:'#3A3630' }}>{post.author}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#9A9288' }}>{timeAgo(post.created_at)}</span>
            </div>
            <h1 style={{ fontFamily:"'Lora',Georgia,serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(20px,3vw,26px)', color:'#111008', lineHeight:1.3, marginBottom:16 }}>
              {post.title}
            </h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#3A3630', lineHeight:1.75, whiteSpace:'pre-wrap' }}>
              {post.content}
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div style={{ background:'#FDFCF8', border:'2px solid #111008', boxShadow:'5px 5px 0 #111008', padding:24 }}>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, textTransform:'uppercase', letterSpacing:'0.06em', color:'#111008', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, background:'#6DC800', border:'2px solid #111008' }}/>
          {comments?.count ?? 0} COMMENTS
        </h2>

        {user ? (
          <div style={{ marginBottom:24 }}>
            <textarea rows={4} placeholder="// leave your mark..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width:'100%', padding:'12px 14px',
                background:'#F2EFE8', border:'2px solid #111008',
                fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#111008',
                outline:'none', resize:'vertical', lineHeight:1.6,
                transition:'box-shadow .15s, border-color .15s',
              }}
              onFocus={e=>{e.target.style.borderColor='#6DC800';e.target.style.boxShadow='3px 3px 0 #6DC800'}}
              onBlur={e=>{e.target.style.borderColor='#111008';e.target.style.boxShadow='none'}}
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
          {comments?.results?.length === 0 ? (
            <div style={{ padding:'24px 0', textAlign:'center' }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#9A9288', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                no comments yet
              </span>
            </div>
          ) : comments?.results?.map((c, i) => (
            <div key={c.id} className="slam" style={{
              borderTop: i===0 ? '2px solid #E8E4DC' : '1px solid #E8E4DC',
              padding:'16px 0',
              display:'flex', gap:14,
            }}>
              <div style={{ width:32, height:32, background:`linear-gradient(135deg, ${['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88'][i%5]}, #111008)`, border:'2px solid #111008', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:'#FDFCF8' }}>
                  {c.author?.[0]?.toUpperCase()}
                </span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:'#111008' }}>
                    {c.author}
                  </span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#9A9288' }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#3A3630', lineHeight:1.65 }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
