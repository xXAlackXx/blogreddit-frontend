import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const blockStyle = (rot = 0) => ({
  background: '#FDFCF8',
  border: '2px solid #111008',
  boxShadow: '4px 4px 0 #111008',
  borderRadius: 2,
  overflow: 'hidden',
  transform: `rotate(${rot}deg)`,
  marginBottom: 20,
})

const headerStyle = (dotColor) => ({
  padding: '10px 14px',
  borderBottom: '2px solid #111008',
  display: 'flex', alignItems: 'center', gap: 8,
  background: '#F2EFE8',
})

function BlockHeader({ color, children }) {
  return (
    <div style={headerStyle()}>
      <div style={{ width:8, height:8, background:color, border:'2px solid #111008', flexShrink:0 }}/>
      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#111008' }}>
        {children}
      </span>
    </div>
  )
}

function ProfileBlock({ user }) {
  if (!user) return null
  return (
    <div style={blockStyle(-0.4)}>
      <BlockHeader color="#6DC800">PERFIL</BlockHeader>
      <div style={{ padding:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div style={{
            width:44, height:44, flexShrink:0,
            background:'linear-gradient(135deg,#E8420A,#F0B800)',
            border:'2px solid #111008', boxShadow:'2px 2px 0 #111008',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#111008' }}>
              {user.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:'#111008' }}>
              {user.username}
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288', textTransform:'uppercase' }}>
              member
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[{label:'POSTS',val:0},{label:'CMTS',val:0},{label:'KARMA',val:0,acid:true}].map(s=>(
            <div key={s.label} style={{
              padding:'8px 6px', textAlign:'center',
              background: s.acid ? '#6DC800' : '#E8E4DC',
              border:'2px solid #111008',
            }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:'#111008' }}>{s.val}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, color: s.acid?'#111008':'#9A9288', textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuoteBlock() {
  return (
    <div style={{
      background:'#111008',
      border:'2px solid #111008',
      boxShadow:'4px 4px 0 #6DC800',
      borderRadius:2, padding:16,
      transform:'rotate(-0.8deg)',
      marginBottom:20,
    }}>
      <p style={{ fontFamily:"'Lora',Georgia,serif", fontStyle:'italic', fontSize:13, color:'#9A9288', lineHeight:1.7, marginBottom:10 }}>
        "The only way to do great work is to love what you do."
      </p>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:'#6DC800', textTransform:'uppercase', letterSpacing:'0.12em' }}>
        — DECAY—84 ZINE
      </span>
    </div>
  )
}

function TagCloud() {
  const tags = [
    {label:'#TECH',v:'acid'},{label:'#ART',v:'rust'},{label:'#MUSIC',v:'amber'},
    {label:'#LIFE',v:'steel'},{label:'#RANDOM',v:'teal'},{label:'#NEWS',v:'plain'},
  ]
  const COLORS = { acid:{bg:'#6DC800',c:'#111008'}, rust:{bg:'#E8420A',c:'#fff'}, amber:{bg:'#F0B800',c:'#111008'}, steel:{bg:'#1A6EC0',c:'#fff'}, teal:{bg:'#0A9E88',c:'#fff'}, plain:{bg:'#E8E4DC',c:'#6A6258'} }
  return (
    <div style={blockStyle(0.3)}>
      <BlockHeader color="#F0B800">TAGS</BlockHeader>
      <div style={{ padding:14, display:'flex', flexWrap:'wrap', gap:8 }}>
        {tags.map(t=>{
          const c = COLORS[t.v]
          return (
            <span key={t.label} style={{
              background:c.bg, color:c.c,
              border:'2px solid #111008', boxShadow:'2px 2px 0 #111008',
              padding:'3px 10px', fontFamily:"'JetBrains Mono',monospace",
              fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em',
              cursor:'pointer', transition:'all .15s',
              transform:'rotate(-1deg)',
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform='rotate(1deg) translate(-1px,-1px)';e.currentTarget.style.boxShadow='3px 3px 0 #111008'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='rotate(-1deg)';e.currentTarget.style.boxShadow='2px 2px 0 #111008'}}
            >{t.label}</span>
          )
        })}
      </div>
    </div>
  )
}

function CommunityBlock({ user, count }) {
  return (
    <div style={blockStyle(-0.3)}>
      <div style={{ height:56, background:'linear-gradient(135deg, #111008 0%, #3A3630 100%)', borderBottom:'2px solid #6DC800', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:8, bottom:-8, fontFamily:"'Space Grotesk',sans-serif", fontSize:56, fontWeight:800, color:'rgba(109,200,0,0.12)', lineHeight:1, userSelect:'none' }}>84</div>
        <div style={{ padding:'12px 14px' }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:'#6DC800', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            // COMMUNITY
          </span>
        </div>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ display:'flex', gap:20, marginBottom:14, paddingBottom:12, borderBottom:'1px solid #E8E4DC' }}>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#111008' }}>{count ?? '—'}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288', textTransform:'uppercase' }}>POSTS</div>
          </div>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, color:'#111008' }}>1</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#9A9288', textTransform:'uppercase' }}>MEMBERS</div>
          </div>
        </div>
        {user ? (
          <Link to="/create" style={{
            display:'block', textAlign:'center',
            background:'#6DC800', color:'#111008', border:'2px solid #111008',
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14,
            textTransform:'uppercase', padding:'9px', textDecoration:'none',
            letterSpacing:'0.04em',
          }}>+ CREATE POST</Link>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Link to="/register" style={{ display:'block', textAlign:'center', background:'#6DC800', color:'#111008', border:'2px solid #111008', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', padding:'8px', textDecoration:'none' }}>JOIN</Link>
            <Link to="/login" style={{ display:'block', textAlign:'center', background:'transparent', color:'#111008', border:'2px solid #111008', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:12, textTransform:'uppercase', padding:'7px', textDecoration:'none' }}>LOGIN</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ count }) {
  const { user } = useAuth()
  return (
    <div style={{ width:280, flexShrink:0 }}>
      <ProfileBlock user={user} />
      <CommunityBlock user={user} count={count} />
      <TagCloud />
      <QuoteBlock />
    </div>
  )
}
