export default function HeroStrip({ count }) {
  return (
    <div style={{
      background: '#111008',
      borderBottom: '4px solid #6DC800',
      padding: '52px 0 48px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Spray halos */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:-80, left:'5%', width:420, height:420,
          background:'radial-gradient(circle, rgba(109,200,0,.10) 0%, transparent 65%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', top:-30, right:'10%', width:320, height:320,
          background:'radial-gradient(circle, rgba(232,66,10,.08) 0%, transparent 65%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:-100, left:'45%', width:260, height:260,
          background:'radial-gradient(circle, rgba(26,110,192,.09) 0%, transparent 65%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', top:'20%', left:'55%', width:180, height:180,
          background:'radial-gradient(circle, rgba(240,184,0,.06) 0%, transparent 65%)', borderRadius:'50%' }}/>
      </div>

      {/* Ghost number */}
      <div style={{
        position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)',
        fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(120px,18vw,200px)', fontWeight:800,
        color:'transparent', WebkitTextStroke:'2px rgba(109,200,0,0.07)',
        userSelect:'none', lineHeight:1, letterSpacing:'-8px',
        pointerEvents:'none',
      }}>84</div>

      {/* Horizontal scratch line */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:1,
        background:'linear-gradient(90deg, transparent, rgba(109,200,0,0.15) 30%, rgba(109,200,0,0.15) 70%, transparent)',
        pointerEvents:'none',
      }}/>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 16px', position:'relative' }}>
        {/* Eyebrow */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
          <div style={{ width:40, height:2, background:'#6DC800' }}/>
          <span style={{
            fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
            color:'#6DC800', textTransform:'uppercase', letterSpacing:'0.18em'
          }}>// COMMUNITY FEED</span>
          <div style={{ width:8, height:8, background:'#6DC800', border:'2px solid #6DC800', opacity:0.6 }}/>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily:"'Lora',Georgia,serif", fontStyle:'italic', fontWeight:700,
          fontSize:'clamp(32px,5vw,58px)', color:'#FDFCF8', lineHeight:1.15,
          marginBottom:0, letterSpacing:'-0.5px',
        }}>
          Every idea deserves
        </h1>
        <h1 style={{
          fontFamily:"'Lora',Georgia,serif", fontStyle:'italic', fontWeight:700,
          fontSize:'clamp(32px,5vw,58px)', lineHeight:1.15,
          marginBottom:20, letterSpacing:'-0.5px',
          color:'transparent',
          WebkitTextStroke:'2px #6DC800',
          display:'inline-block',
          position:'relative',
        }}>
          a wall.
          <span style={{
            content:'""', position:'absolute', bottom:4, left:0, right:0,
            height:3, background:'#6DC800', opacity:0.35, display:'block',
          }}/>
        </h1>

        {/* Sub line */}
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'#6A6258', lineHeight:1.6, margin:0,
          }}>
            Share posts. Vote. Comment. Leave your mark.
          </p>
          {count != null && (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:'rgba(109,200,0,0.08)', border:'1px solid rgba(109,200,0,0.2)',
              padding:'3px 10px',
            }}>
              <div style={{ width:6, height:6, background:'#6DC800', borderRadius:'50%' }}/>
              <span style={{
                fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#6DC800',
                fontWeight:700, letterSpacing:'0.08em'
              }}>{count} POSTS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
