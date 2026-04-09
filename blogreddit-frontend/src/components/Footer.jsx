import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: '#111008',
      borderTop: '2px solid #6DC800',
    }}>
      <div style={{ height:1, background:'linear-gradient(90deg,#6DC800,#E8420A,#F0B800,#1A6EC0,transparent)', opacity:0.4 }}/>
      <div style={{
        maxWidth:1100, margin:'0 auto', padding:'10px 16px',
        display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8,
      }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#3A3630', letterSpacing:'0.08em' }}>
          © 2026 ONYX BLOG — DECAY—84
        </span>
        <div style={{ display:'flex', gap:5 }}>
          {['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88'].map(c=>(
            <div key={c} style={{ width:7, height:7, background:c }}/>
          ))}
        </div>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          {[{label:'Feed',to:'/'},{label:'New Post',to:'/create'},{label:'Login',to:'/login'}].map(l=>(
            <Link key={l.to} to={l.to} style={{
              fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6A6258',
              textDecoration:'none', letterSpacing:'0.04em', transition:'color .15s',
            }}
            onMouseEnter={e=>e.currentTarget.style.color='#6DC800'}
            onMouseLeave={e=>e.currentTarget.style.color='#6A6258'}
            >{l.label}</Link>
          ))}
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#3A3630', letterSpacing:'0.08em' }}>
            REACT + DJANGO
          </span>
        </div>
      </div>
    </footer>
  )
}
