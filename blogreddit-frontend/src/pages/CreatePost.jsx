import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function CreatePost() {
  const { user } = useAuth()
  const [form, setForm] = useState({ title:'', content:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { const res = await api.post('/posts/', form); navigate(`/posts/${res.data.id}`) }
    catch (err) {
      const d = err.response?.data
      setError('// ERROR: ' + (d ? Object.values(d).flat().join(' ') : 'failed'))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth:760, margin:'24px auto', padding:'0 16px' }} className="slam">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <Link to="/" style={{ background:'#111008', border:'2px solid #111008', color:'#6DC800', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, flexShrink:0 }}>←</Link>
        <div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#111008', textTransform:'uppercase', letterSpacing:'0.04em' }}>New Post</h1>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288', textTransform:'uppercase', letterSpacing:'0.1em' }}>// SUBMIT TO FEED</span>
        </div>
      </div>

      <div style={{ background:'#FDFCF8', border:'2px solid #111008', boxShadow:'5px 5px 0 #111008', overflow:'hidden' }}>
        {/* Tab */}
        <div style={{ borderBottom:'2px solid #111008', display:'flex', background:'#111008' }}>
          <div style={{ padding:'10px 20px', fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#6DC800', borderBottom:'3px solid #6DC800', marginBottom:-2 }}>
            TEXT POST
          </div>
        </div>

        <div style={{ padding:24 }}>
          {error && (
            <div style={{ background:'#111008', border:'2px solid #E8420A', padding:'10px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#E8420A', marginBottom:18 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <input type="text" placeholder="TITLE — make it count" maxLength={255}
                value={form.title}
                onChange={e => setForm({...form,title:e.target.value})}
                style={{
                  width:'100%', padding:'12px 14px',
                  background:'#F2EFE8', border:'2px solid #111008',
                  fontFamily:"'Lora',Georgia,serif", fontStyle:'italic', fontWeight:700, fontSize:18, color:'#111008',
                  outline:'none', borderRadius:2, transition:'box-shadow .15s, border-color .15s',
                }}
                onFocus={e=>{e.target.style.borderColor='#6DC800';e.target.style.boxShadow='3px 3px 0 #6DC800'}}
                onBlur={e=>{e.target.style.borderColor='#111008';e.target.style.boxShadow='none'}}
              />
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:4 }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288' }}>
                  {form.title.length}/255
                </span>
              </div>
            </div>

            <div>
              <textarea rows={10} placeholder="tell your story..."
                value={form.content}
                onChange={e => setForm({...form,content:e.target.value})}
                style={{
                  width:'100%', padding:'12px 14px',
                  background:'#F2EFE8', border:'2px solid #111008',
                  fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#3A3630', lineHeight:1.7,
                  outline:'none', borderRadius:2, resize:'vertical',
                  transition:'box-shadow .15s, border-color .15s',
                }}
                onFocus={e=>{e.target.style.borderColor='#6DC800';e.target.style.boxShadow='3px 3px 0 #6DC800'}}
                onBlur={e=>{e.target.style.borderColor='#111008';e.target.style.boxShadow='none'}}
              />
            </div>

            {!user && (
              <div style={{ background:'#111008', border:'2px solid #F0B800', padding:'10px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#F0B800', marginTop:4 }}>
                // debes iniciar sesión para publicar —{' '}
                <Link to="/login" style={{ color:'#6DC800', fontWeight:700, textDecoration:'none' }}>LOGIN</Link>
                {' '}·{' '}
                <Link to="/register" style={{ color:'#6DC800', fontWeight:700, textDecoration:'none' }}>JOIN</Link>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'2px solid #E8E4DC' }}>
              <Link to="/" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:'#9A9288', textDecoration:'none', textTransform:'uppercase' }}>
                ← CANCEL
              </Link>
              <button type="submit" disabled={loading || !form.title.trim() || !user} style={{
                background: (loading || !form.title.trim() || !user) ? '#C8C2B6' : '#6DC800',
                color:'#111008', border:'2px solid #111008',
                boxShadow: (loading || !form.title.trim() || !user) ? 'none' : '4px 4px 0 #111008',
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14,
                textTransform:'uppercase', letterSpacing:'0.06em',
                padding:'9px 24px', cursor:(loading||!form.title.trim()||!user)?'not-allowed':'pointer', borderRadius:2,
              }}
              onMouseEnter={e=>{if(!loading&&form.title.trim()&&user){e.currentTarget.style.transform='translate(-2px,-2px)';e.currentTarget.style.boxShadow='6px 6px 0 #111008'}}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';if(!loading&&form.title.trim()&&user)e.currentTarget.style.boxShadow='4px 4px 0 #111008'}}
              >
                {loading ? 'PUBLISHING...' : 'PUBLISH →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
