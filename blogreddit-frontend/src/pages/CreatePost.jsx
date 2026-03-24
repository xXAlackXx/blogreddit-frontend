import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

/* ── Compact Markdown Parser ── */
function parseMd(raw) {
  if (!raw.trim()) return ''
  const html = raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```([\s\S]*?)```/g, (_,c)=>`<pre><code>${c.trim()}</code></pre>`)
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/^---$/gm,'<hr/>')
    .replace(/^&gt; (.+)$/gm,'<blockquote><p>$1</p></blockquote>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/~~(.+?)~~/g,'<del>$1</del>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" style="color:#1A6EC0">$1</a>')
    .replace(/^(?!<[hbpuod]).+$/gm,'<p>$&</p>')
    .replace(/\n{2,}/g,'')
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['h1','h2','h3','p','strong','em','del','code','pre','blockquote','hr','a'], ALLOWED_ATTR: ['href','style'], ALLOW_DATA_ATTR: false })
}

const ALLOWED = ['image/jpeg','image/png','image/gif','image/webp']
const MAX_MB   = 5
const TAG_COLS = ['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88']

/* ── Toolbar Button ── */
function TB({ label, title: t, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={t} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
        color: hov ? '#6DC800' : '#3A3630',
        background: hov ? '#111008' : 'transparent',
        border:'none', borderRight:'1px solid #C8C2B6',
        padding:'0 14px', height:40, cursor:'pointer',
        display:'flex', alignItems:'center', gap:5,
        letterSpacing:'0.05em', whiteSpace:'nowrap', transition:'all .12s',
      }}
    >{label}</button>
  )
}

export default function CreatePost() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const bodyRef   = useRef(null)
  const fileRef   = useRef(null)

  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [tags,     setTags]     = useState([])
  const [tagInput, setTagInput] = useState('')
  const [img,      setImg]      = useState(null)   // { file, preview, error }
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const words    = body.trim() ? body.trim().split(/\s+/).length : 0
  const readTime = Math.max(1, Math.round(words / 200))
  const canPost  = user && title.trim() && !loading

  /* ── Toolbar helpers ── */
  const insert = (before, after = '') => {
    const ta = bodyRef.current; if (!ta) return
    const s = ta.selectionStart, e = ta.selectionEnd
    ta.setRangeText(before + (ta.value.substring(s,e) || 'text') + after, s, e, 'end')
    ta.focus(); setBody(ta.value)
  }
  const insertLine = (prefix) => {
    const ta = bodyRef.current; if (!ta) return
    const ls = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1
    ta.setRangeText(prefix, ls, ls, 'end')
    ta.focus(); setBody(ta.value)
  }

  /* ── Image validation ── */
  const handleImg = (file) => {
    if (!file) return
    if (!ALLOWED.includes(file.type))
      return setImg({ error: `// File type not allowed — only JPEG · PNG · GIF · WEBP` })
    if (file.size > MAX_MB * 1024 * 1024)
      return setImg({ error: `// Image too large — maximum ${MAX_MB} MB` })
    setImg({ file, preview: URL.createObjectURL(file), error: null })
  }

  /* ── Tags ── */
  const addTag = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const v = tagInput.trim().replace(/^#+/, '')
    if (v && !tags.includes(v)) setTags([...tags, v])
    setTagInput('')
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!canPost) return
    setError(''); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('content', body)
      if (img?.file) fd.append('image', img.file)
      const res = await api.post('/posts/', fd)
      navigate(`/posts/${res.data.id}`)
    } catch (err) {
      const d = err.response?.data
      setError('// ERROR: ' + (d ? Object.values(d).flat().join(' ') : 'failed'))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background:'#F2EFE8', minHeight:'100vh', paddingBottom:80 }}>
      <div style={{ maxWidth:1240, margin:'0 auto', padding:'28px 24px 0' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
          <Link to="/" style={{ width:36,height:36,border:'2px solid #111008',boxShadow:'3px 3px 0 #111008',background:'#FDFCF8',display:'flex',alignItems:'center',justifyContent:'center',color:'#111008',textDecoration:'none',fontWeight:700,fontSize:16,flexShrink:0 }}>←</Link>
          <div>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:22,letterSpacing:'-0.02em',lineHeight:1 }}>New Post</h1>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#9A9288',letterSpacing:'0.16em',textTransform:'uppercase',marginTop:4 }}>// submit to feed</div>
          </div>
        </div>

        {/* Errors / warnings */}
        {error && (
          <div style={{ background:'#111008',border:'2px solid #E8420A',padding:'10px 14px',fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'#E8420A',marginBottom:14 }}>
            {error}
          </div>
        )}
        {!user && (
          <div style={{ background:'#111008',border:'2px solid #F0B800',padding:'10px 14px',fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'#F0B800',marginBottom:14 }}>
            // You must be logged in to post —{' '}
            <Link to="/login"    style={{ color:'#6DC800',fontWeight:700,textDecoration:'none' }}>LOGIN</Link>{' '}·{' '}
            <Link to="/register" style={{ color:'#6DC800',fontWeight:700,textDecoration:'none' }}>JOIN</Link>
          </div>
        )}

        {/* ── Editor Card ── */}
        <div style={{ border:'2px solid #111008',boxShadow:'6px 6px 0 #111008',background:'#FDFCF8',overflow:'clip',marginBottom:16 }}>

          {/* Toolbar */}
          <div style={{ display:'flex',alignItems:'stretch',borderBottom:'2px solid #111008',background:'#E8E4DC',position:'sticky',top:56,zIndex:20 }}>
            <div style={{ display:'flex',alignItems:'stretch',borderRight:'2px solid #C8C2B6' }}>
              <TB label={<b>B</b>}    t="Bold"    onClick={()=>insert('**','**')} />
              <TB label={<i>I</i>}    t="Italic"  onClick={()=>insert('*','*')} />
              <TB label={<s>S</s>}    t="Strike"  onClick={()=>insert('~~','~~')} />
            </div>
            <div style={{ display:'flex',alignItems:'stretch',borderRight:'2px solid #C8C2B6' }}>
              <TB label="H1"  t="Heading 1" onClick={()=>insertLine('# ')} />
              <TB label="H2"  t="Heading 2" onClick={()=>insertLine('## ')} />
              <TB label="H3"  t="Heading 3" onClick={()=>insertLine('### ')} />
            </div>
            <div style={{ display:'flex',alignItems:'stretch',borderRight:'2px solid #C8C2B6' }}>
              <TB label={<>&#34;</>} t="Quote"      onClick={()=>insertLine('> ')} />
              <TB label="&lt;&gt;"   t="Code inline" onClick={()=>insert('`','`')} />
              <TB label="```"        t="Code block"  onClick={()=>insert('```\n','\n```')} />
              <TB label="—"          t="Divider"     onClick={()=>insertLine('---')} />
            </div>
            <div style={{ display:'flex',alignItems:'stretch',borderRight:'2px solid #C8C2B6' }}>
              <TB label="• LIST"  t="Unordered list" onClick={()=>insertLine('- ')} />
              <TB label="1. LIST" t="Ordered list"   onClick={()=>insertLine('1. ')} />
            </div>
            <div style={{ display:'flex',alignItems:'stretch' }}>
              <TB label="LINK" t="Link" onClick={()=>insert('[text](','url)')} />
            </div>
            {/* Stats */}
            <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:16,padding:'0 16px',fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#9A9288',borderLeft:'1px solid #C8C2B6' }}>
              <span>{words} words</span>
              <span>~{readTime} min</span>
            </div>
          </div>

          {/* Split: Write | Preview */}
          <div className="editor-split" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:420 }}>

            {/* Write */}
            <div style={{ borderRight:'2px solid #111008',display:'flex',flexDirection:'column' }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',padding:'10px 20px 8px',borderBottom:'1px solid #C8C2B6',color:'#3A3630' }}>
                // MARKDOWN
              </div>
              <input
                type="text" placeholder="TITLE — make it count" maxLength={255}
                value={title} onChange={e=>setTitle(e.target.value)}
                style={{ width:'100%',border:'none',borderBottom:'2px solid #C8C2B6',background:'transparent',outline:'none',fontFamily:"'Lora',serif",fontStyle:'italic',fontWeight:700,fontSize:26,color:'#111008',padding:'18px 20px 16px',transition:'border-color .15s' }}
                onFocus={e=>e.target.style.borderBottomColor='#111008'}
                onBlur={e=>e.target.style.borderBottomColor='#C8C2B6'}
              />
              <textarea
                ref={bodyRef}
                placeholder={"Write in Markdown...\n\n# Heading\nNormal paragraph.\n\n> Quote\n\n`code`"}
                value={body} onChange={e=>setBody(e.target.value)}
                style={{ flex:1,width:'100%',border:'none',background:'transparent',outline:'none',fontFamily:"'DM Sans',sans-serif",fontSize:15,color:'#111008',lineHeight:1.75,padding:'18px 20px',resize:'none',minHeight:340 }}
              />
              <div style={{ padding:'8px 20px',borderTop:'1px solid #C8C2B6',display:'flex',justifyContent:'flex-end' }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#9A9288' }}>{body.length} chars</span>
              </div>
            </div>

            {/* Preview */}
            <div className="editor-preview" style={{ background:'#E8E4DC',display:'flex',flexDirection:'column' }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',padding:'10px 20px 8px',borderBottom:'1px solid #C8C2B6',color:'#6DC800' }}>
                // PREVIEW
              </div>
              <div style={{ flex:1,padding:'18px 24px',overflowY:'auto' }}>
                {title && (
                  <div style={{ fontFamily:"'Lora',serif",fontStyle:'italic',fontWeight:700,fontSize:26,color:'#111008',marginBottom:16,borderBottom:'2px solid #C8C2B6',paddingBottom:14 }}>
                    {title}
                  </div>
                )}
                {body.trim()
                  ? <div className="md-preview" dangerouslySetInnerHTML={{ __html: parseMd(body) }} />
                  : <p style={{ fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:16,color:'#C8C2B6',marginTop:8 }}>your post will appear here...</p>
                }
              </div>
            </div>
          </div>
        </div>

        {/* ── Image Upload ── */}
        <div style={{ border:'2px solid #111008',boxShadow:'5px 5px 0 #111008',background:'#FDFCF8',padding:'16px 20px',marginBottom:16 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:'#3A3630',marginBottom:12,display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ color:'#6DC800' }}>//</span> IMAGE (optional)
          </div>

          {img?.preview ? (
            <div style={{ position:'relative',display:'inline-block' }}>
              <img src={img.preview} alt="preview" style={{ maxHeight:180,maxWidth:'100%',border:'2px solid #111008',display:'block' }} />
              <button onClick={()=>setImg(null)} style={{ position:'absolute',top:4,right:4,background:'#E8420A',border:'none',color:'#fff',width:24,height:24,cursor:'pointer',fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#6A6258',marginTop:6 }}>
                {img.file.name} · {(img.file.size/1024/1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <div
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='#6DC800'}}
              onDragLeave={e=>e.currentTarget.style.borderColor=img?.error?'#E8420A':'#C8C2B6'}
              onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='#C8C2B6';handleImg(e.dataTransfer.files[0])}}
              style={{ border:`2px dashed ${img?.error?'#E8420A':'#C8C2B6'}`,padding:'28px 20px',textAlign:'center',cursor:'pointer',transition:'border-color .15s' }}
              onMouseEnter={e=>{if(!img?.error) e.currentTarget.style.borderColor='#111008'}}
              onMouseLeave={e=>{if(!img?.error) e.currentTarget.style.borderColor='#C8C2B6'}}
            >
              {img?.error
                ? <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'#E8420A' }}>{img.error}</span>
                : <>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,color:'#3A3630',marginBottom:6 }}>Drag or click</div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'#9A9288' }}>JPEG · PNG · GIF · WEBP · max {MAX_MB} MB</div>
                  </>
              }
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display:'none' }} onChange={e=>handleImg(e.target.files[0])} />
            </div>
          )}
        </div>

        {/* ── Tags ── */}
        <div style={{ border:'2px solid #111008',boxShadow:'5px 5px 0 #111008',background:'#FDFCF8',padding:'16px 20px',marginBottom:24 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:'#3A3630',marginBottom:12,display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ color:'#6DC800' }}>//</span> TAGS
          </div>
          <div style={{ display:'flex',alignItems:'center',flexWrap:'wrap',gap:8 }}>
            {tags.map((t,i) => (
              <div key={t} style={{ display:'inline-flex',alignItems:'center',gap:6,fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,border:'2px solid #111008',boxShadow:'3px 3px 0 #111008',padding:'5px 10px',background:TAG_COLS[i%TAG_COLS.length],color:i%2===0?'#111008':'#fff',letterSpacing:'0.05em' }}>
                #{t}
                <button onClick={()=>setTags(tags.filter(x=>x!==t))} style={{ background:'none',border:'none',cursor:'pointer',fontSize:14,lineHeight:1,padding:0,color:'inherit',opacity:.7 }}>×</button>
              </div>
            ))}
            <input
              type="text" placeholder="#add tag… (Enter)"
              value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={addTag}
              style={{ border:'none',background:'transparent',outline:'none',fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'#111008',padding:'4px 2px',minWidth:180,letterSpacing:'0.05em' }}
            />
          </div>
        </div>

      </div>

      {/* ── Bottom Action Bar ── */}
      <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'#111008',borderTop:'2px solid #6DC800',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:50 }}>
        <div style={{ display:'flex',alignItems:'center',gap:20 }}>
          <Link to="/" style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'#9A9288',textDecoration:'none',letterSpacing:'0.12em',textTransform:'uppercase',transition:'color .15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#FDFCF8'}
            onMouseLeave={e=>e.currentTarget.style.color='#9A9288'}
          >← CANCEL</Link>
          {body.trim() && (
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#6A6258',display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:6,height:6,background:'#0A9E88',borderRadius:'50%',display:'inline-block',animation:'pulse 2s ease-in-out infinite' }}/>
              Active draft
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit} disabled={!canPost}
          style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',background:canPost?'#6DC800':'#C8C2B6',color:'#111008',border:`2px solid ${canPost?'#6DC800':'#C8C2B6'}`,boxShadow:canPost?'5px 5px 0 rgba(109,200,0,0.4)':'none',padding:'12px 32px',cursor:canPost?'pointer':'not-allowed',transition:'all .15s' }}
          onMouseEnter={e=>{if(canPost){e.currentTarget.style.transform='translate(-2px,-2px)';e.currentTarget.style.boxShadow='7px 7px 0 rgba(109,200,0,0.4)'}}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';if(canPost)e.currentTarget.style.boxShadow='5px 5px 0 rgba(109,200,0,0.4)'}}
        >{loading ? 'PUBLISHING...' : 'PUBLISH →'}</button>
      </div>

      <style>{`
        .md-preview h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;letter-spacing:-.02em;margin-bottom:12px;}
        .md-preview h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;margin:16px 0 8px;}
        .md-preview h3{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;margin:12px 0 6px;}
        .md-preview p{font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.75;margin-bottom:10px;color:#3A3630;}
        .md-preview blockquote{border-left:4px solid #6DC800;padding:8px 16px;margin:12px 0;background:rgba(109,200,0,0.06);}
        .md-preview blockquote p{font-family:'Lora',serif;font-style:italic;margin:0;}
        .md-preview code{font-family:'JetBrains Mono',monospace;font-size:13px;background:#C8C2B6;padding:2px 6px;}
        .md-preview pre{background:#111008;padding:14px 16px;margin:12px 0;overflow-x:auto;}
        .md-preview pre code{background:transparent;color:#6DC800;font-size:13px;line-height:1.6;padding:0;}
        .md-preview strong{font-weight:700;} .md-preview em{font-style:italic;} .md-preview del{text-decoration:line-through;}
        .md-preview ul,.md-preview ol{padding-left:20px;margin-bottom:10px;}
        .md-preview li{font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.7;color:#3A3630;margin-bottom:3px;}
        .md-preview hr{border:none;border-top:2px solid #C8C2B6;margin:16px 0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @media(max-width:720px){
          .editor-split{grid-template-columns:1fr !important;}
          .editor-preview{display:none !important;}
        }
      `}</style>
    </div>
  )
}
