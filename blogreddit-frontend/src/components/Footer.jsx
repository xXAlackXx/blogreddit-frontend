import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: '#111008',
      borderTop: '3px solid #6DC800',
      marginTop: 64,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ghost text bg */}
      <div style={{
        position:'absolute', left:-16, bottom:-20,
        fontFamily:"'Space Grotesk',sans-serif", fontSize:120, fontWeight:800,
        color:'transparent', WebkitTextStroke:'1.5px rgba(109,200,0,0.05)',
        userSelect:'none', lineHeight:1, letterSpacing:'-4px', pointerEvents:'none',
      }}>DECAY</div>

      {/* Top bar accent */}
      <div style={{ height:1, background:'linear-gradient(90deg,#6DC800,#E8420A,#F0B800,#1A6EC0,transparent)', opacity:0.4 }}/>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 16px 28px', position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:32, marginBottom:32 }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom:10 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#fff', letterSpacing:'-0.5px' }}>
                BLOG<span style={{ color:'#6DC800' }}>R</span>EDDIT
              </span>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6A6258', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>
              // EST. 2025 / DECAY—84
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#6A6258', lineHeight:1.7, maxWidth:240, margin:0 }}>
              A brutalist community platform for ideas, discourse, and leaving your mark on the wall.
            </p>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:'#6DC800', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:14 }}>
              // NAVIGATE
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[{label:'Feed', to:'/'},{label:'New Post',to:'/create'},{label:'Login',to:'/login'},{label:'Register',to:'/register'}].map(l=>(
                <Link key={l.to} to={l.to} style={{
                  fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#9A9288',
                  textDecoration:'none', letterSpacing:'0.04em',
                  transition:'color .15s',
                }}
                onMouseEnter={e=>e.currentTarget.style.color='#6DC800'}
                onMouseLeave={e=>e.currentTarget.style.color='#9A9288'}
                >→ {l.label}</Link>
              ))}
            </div>
          </div>

          {/* Author */}
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:'#6DC800', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:14 }}>
              // AUTHOR
            </div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:10,
              background:'#1A1A12', border:'2px solid #3A3630',
              boxShadow:'4px 4px 0 #6DC800',
              padding:'10px 16px',
            }}>
              <div style={{
                width:36, height:36,
                background:'linear-gradient(135deg,#E8420A,#F0B800)',
                border:'2px solid #6DC800',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'#111008' }}>X</span>
              </div>
              <div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'#fff', letterSpacing:'-0.3px' }}>
                  @xXlAlackXx
                </div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6DC800', letterSpacing:'0.08em' }}>
                  BUILDER / DEV
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'#1A1A12', marginBottom:20 }}/>

        {/* Bottom bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#3A3630', letterSpacing:'0.08em' }}>
            © 2025 BLOGREDDIT — DECAY—84 EDITION
          </span>
          <div style={{ display:'flex', gap:6 }}>
            {['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88'].map(c=>(
              <div key={c} style={{ width:8, height:8, background:c, border:'1px solid #3A3630' }}/>
            ))}
          </div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#3A3630', letterSpacing:'0.08em' }}>
            BUILT WITH REACT + DJANGO
          </span>
        </div>
      </div>
    </footer>
  )
}
