import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const C = {
  ink:'#111008', acid:'#6DC800', rust:'#E8420A', amber:'#F0B800',
  steel:'#1A6EC0', teal:'#0A9E88', wall:'#ECEAE2', paper:'#FDFCF8',
  board:'#E8E4DC', crack:'#C8C2B6', smudge:'#3A3630', dust:'#6A6258', fade:'#9A9288',
}

const WORDS = [
  { text:'HUSTLE', size:'clamp(38px,5.4vw,68px)', style:'outline', color:'acid' },
  { text:'GRIND', size:'clamp(20px,3.0vw,38px)', style:'outline', color:'acid' },
  { text:'NO SLEEP', size:'clamp(26px,3.8vw,48px)', style:'outline', color:'acid' },
  { text:'GUTTER', size:'clamp(32px,4.6vw,58px)', style:'outline', color:'acid' },
  { text:'CONCRETE', size:'clamp(16px,2.4vw,30px)', style:'outline', color:'acid' },
  { text:'REPRESENT', size:'clamp(38px,5.4vw,68px)', style:'filled', color:'acid' },
  { text:'CERTIFIED', size:'clamp(26px,3.8vw,48px)', style:'outline', color:'acid' },
  { text:'STATIC', size:'clamp(20px,3.0vw,38px)', style:'outline', color:'acid' },
  { text:'PRESSURE', size:'clamp(32px,4.6vw,58px)', style:'outline', color:'acid' },
  { text:'LOCKED IN', size:'clamp(16px,2.4vw,30px)', style:'outline', color:'acid' },
  { text:'HEAT', size:'clamp(26px,3.8vw,48px)', style:'outline', color:'rust' },
  { text:'SIGNAL', size:'clamp(32px,4.6vw,58px)', style:'outline', color:'amber' },
]

function LeftWord({ text, size, style, color }) {
  const strokeColor = color === 'rust' ? C.rust : color === 'amber' ? C.amber : C.acid
  const isFilled = style === 'filled'
  return (
    <div style={{
      fontFamily:"'Space Grotesk',sans-serif", fontWeight:700,
      fontSize:size, lineHeight:1.06, letterSpacing:'-0.04em',
      textTransform:'uppercase', whiteSpace:'nowrap',
      color: isFilled ? C.acid : 'transparent',
      WebkitTextStroke: isFilled ? '0' : `1.5px ${strokeColor}`,
    }}>
      {text}<span style={{ color: isFilled ? C.ink : strokeColor, WebkitTextStroke:0, opacity:0.26, marginLeft:4, fontSize:'0.75em', verticalAlign:'middle' }}>/</span>
    </div>
  )
}

function FcTag({ bg, color='#111008', children }) {
  return (
    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', padding:'2px 7px', border:`2px solid ${C.ink}`, display:'inline-block', marginBottom:8, background:bg, color }}>
      {children}
    </div>
  )
}
function FcTitle({ children }) {
  return <div style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontWeight:700, fontSize:12, lineHeight:1.35, color:C.ink, marginBottom:5 }}>{children}</div>
}
function FcMeta({ children }) {
  return <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.fade }}>{children}</div>
}
function FcVotes({ color=C.acid, count }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
      <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20" style={{ color }}><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/></svg>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color }}>{count}</span>
    </div>
  )
}

export default function AuthPage({ initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab)
  const [loginForm, setLoginForm] = useState({ username:'', password:'' })
  const [regForm, setRegForm] = useState({ username:'', email:'', password:'' })
  const [loginError, setLoginError] = useState('')
  const [regError, setRegError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [showRegPass, setShowRegPass] = useState(false)
  const canvasRef = useRef(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Sync tab with route prop
  useEffect(() => { setTab(initialTab) }, [initialTab])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Particles
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const colors = [C.acid, C.rust, C.amber, C.steel, C.teal]
    let W, H, pts = [], rafId, mx = 9999, my = 9999

    function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight }
    function init() {
      pts = []
      const half = W / 2
      for (let i = 0; i < 40; i++) pts.push({
        x: half + Math.random() * (W - half), y: Math.random() * H,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.8 + .5,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * .18 + .04,
      })
    }
    function draw() {
      ctx.clearRect(0, 0, W, H)
      const half = W / 2
      pts.forEach(p => {
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 110 && d > 0) { const f = ((110 - d) / 110) * .7; p.vx += dx / d * f; p.vy += dy / d * f }
        p.vx *= .97; p.vy *= .97; p.x += p.vx; p.y += p.vy
        if (p.x < half) p.x = W; if (p.x > W) p.x = half
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1
      })
      rafId = requestAnimationFrame(draw)
    }
    const onMove = e => { mx = e.clientX; my = e.clientY }
    const onResize = () => { resize(); init() }
    window.addEventListener('resize', onResize)
    document.addEventListener('mousemove', onMove)
    resize(); init(); draw()
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  // Parallax cards
  useEffect(() => {
    const defs = [
      { sel:'.fc-1', dx:.016, dy:.010 },
      { sel:'.fc-2', dx:-.020, dy:.014 },
      { sel:'.fc-3', dx:.012, dy:-.018 },
      { sel:'.fc-4', dx:-.018, dy:-.012 },
      { sel:'.fc-5', dx:.024, dy:.016 },
      { sel:'.fc-6', dx:-.014, dy:.020 },
      { sel:'.fc-7', dx:.010, dy:-.016 },
      { sel:'.fc-8', dx:-.018, dy:.010 },
    ]
    let rafId, tx = 0, ty = 0, cx = 0, cy = 0
    const onMove = e => { tx = e.clientX - window.innerWidth / 2; ty = e.clientY - window.innerHeight / 2 }
    document.addEventListener('mousemove', onMove)
    let started = false
    const timer = setTimeout(() => {
      started = true
      function tick() {
        cx += (tx - cx) * .055; cy += (ty - cy) * .055
        defs.forEach(d => {
          const el = document.querySelector(d.sel)
          if (el) el.style.transform = `translate(${cx * d.dx}px,${cy * d.dy}px)`
        })
        rafId = requestAnimationFrame(tick)
      }
      tick()
    }, 800)
    return () => {
      clearTimeout(timer)
      if (rafId) cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove', onMove)
    }
  }, [])

  const handleLogin = async e => {
    e.preventDefault()
    if (!loginForm.username || !loginForm.password) return
    setLoginError(''); setLoginLoading(true)
    try { await login(loginForm.username, loginForm.password); navigate('/') }
    catch { setLoginError('// ERROR: invalid credentials') }
    finally { setLoginLoading(false) }
  }

  const handleRegister = async e => {
    e.preventDefault()
    if (!regForm.username || !regForm.email || !regForm.password) return
    setRegError(''); setRegLoading(true)
    try {
      await api.post('/users/register/', { ...regForm, password_confirm: regForm.password })
      await login(regForm.username, regForm.password)
      navigate('/')
    } catch (err) {
      const d = err.response?.data
      setRegError('// ERROR: ' + (d ? Object.values(d).flat().join(' ') : 'registration failed'))
    } finally { setRegLoading(false) }
  }

  const inputBase = { width:'100%', background:C.board, border:`2px solid ${C.crack}`, padding:'15px 16px', fontFamily:"'DM Sans',sans-serif", fontSize:16, color:C.ink, outline:'none', transition:'border-color .15s,box-shadow .15s' }

  const EyeIcon = () => (
    <svg fill="none" stroke="currentColor" width="16" height="16" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  )

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden' }}>
      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1 }}/>

      {/* LEFT DARK PANEL */}
      <div style={{ position:'fixed', top:0, left:0, width:'50%', height:'100%', background:C.ink, zIndex:2, overflow:'hidden' }}>
        {/* Acid dot */}
        <div style={{ position:'absolute', top:28, left:44, width:7, height:7, background:C.acid, opacity:.65 }}/>
        {/* Corner TR */}
        <div style={{ position:'absolute', top:26, right:22, width:22, height:22, borderTop:`2px solid ${C.acid}`, borderRight:`2px solid ${C.acid}`, opacity:.35 }}/>
        {/* Corner BL */}
        <div style={{ position:'absolute', bottom:58, left:42, width:16, height:16, borderBottom:`2px solid ${C.rust}`, borderLeft:`2px solid ${C.rust}`, opacity:.28 }}/>
        {/* Tag */}
        <div style={{ position:'absolute', bottom:24, left:44, fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:C.amber, letterSpacing:'0.26em', textTransform:'uppercase', opacity:.72 }}>// DECAY—84</div>
        {/* Words */}
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'52px 36px 80px 44px', gap:1, overflow:'hidden' }}>
          {WORDS.map((w, i) => <LeftWord key={i} {...w} />)}
        </div>
      </div>

      {/* RIGHT LIGHT PANEL */}
      <div style={{ position:'fixed', top:0, right:0, width:'50%', height:'100%', background:C.wall, zIndex:2 }}/>

      {/* ACID DIVIDER */}
      <div style={{ position:'fixed', top:0, left:'50%', width:4, height:'100%', background:C.acid, zIndex:12, transform:'translateX(-50%)', boxShadow:`0 0 20px rgba(109,200,0,0.3)` }}/>

      {/* Right panel SVG halos */}
      <svg style={{ position:'fixed', top:0, right:0, width:'50%', height:'100%', pointerEvents:'none', zIndex:3, overflow:'hidden' }} viewBox="0 0 720 900" fill="none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="bh1" cx="50%" cy="50%"><stop offset="0%" stopColor="#6DC800" stopOpacity="0.11"/><stop offset="100%" stopColor="#6DC800" stopOpacity="0"/></radialGradient>
          <radialGradient id="bh2" cx="50%" cy="50%"><stop offset="0%" stopColor="#E8420A" stopOpacity="0.09"/><stop offset="100%" stopColor="#E8420A" stopOpacity="0"/></radialGradient>
          <radialGradient id="bh3" cx="50%" cy="50%"><stop offset="0%" stopColor="#1A6EC0" stopOpacity="0.07"/><stop offset="100%" stopColor="#1A6EC0" stopOpacity="0"/></radialGradient>
        </defs>
        <ellipse cx="620" cy="820" rx="320" ry="250" fill="url(#bh2)"/>
        <ellipse cx="560" cy="110" rx="260" ry="200" fill="url(#bh3)"/>
        <ellipse cx="90" cy="460" rx="190" ry="170" fill="url(#bh1)"/>
      </svg>

      {/* bg-scratch texture */}
      <div style={{ position:'fixed', top:0, right:0, width:'50%', height:'100%', pointerEvents:'none', zIndex:3,
        background:'repeating-linear-gradient(87deg,transparent 0,transparent 42px,rgba(17,16,8,0.012) 43px,rgba(17,16,8,0.012) 44px),repeating-linear-gradient(3deg,transparent 0,transparent 88px,rgba(17,16,8,0.008) 89px,rgba(17,16,8,0.008) 90px)'
      }}/>

      {/* Ghost 84 */}
      <div style={{ position:'fixed', bottom:-15, right:-10, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'clamp(160px,20vw,310px)', color:'transparent', WebkitTextStroke:'2px rgba(17,16,8,0.045)', pointerEvents:'none', userSelect:'none', zIndex:3, lineHeight:1, letterSpacing:'-0.06em' }}>84</div>

      {/* Accent stripes */}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${C.acid},${C.teal},${C.steel},${C.rust})`, zIndex:50 }}/>
      <div style={{ position:'fixed', top:0, left:0, width:4, height:'100%', background:`linear-gradient(180deg,${C.acid},${C.teal} 50%,${C.rust})`, zIndex:50 }}/>

      {/* ── FLOATING CARDS ── */}
      {/* fc-1 */}
      <div className="fc fc-1" style={{ padding:12 }}>
        <div style={{ height:3, background:C.acid }}/>
        <div style={{ padding:'11px 13px' }}>
          <FcTag bg={C.acid}>Django</FcTag>
          <FcTitle>Por qué GraphQL cambia todo en proyectos medianos</FcTitle>
          <FcMeta>maría.c · hace 4h</FcMeta>
          <FcVotes color={C.acid} count={342}/>
        </div>
      </div>

      {/* fc-2: dark art card */}
      <div className="fc fc-2">
        <svg viewBox="0 0 228 138" style={{ display:'block', width:228 }}>
          <rect width="228" height="138" fill="#111008"/>
          <defs>
            <radialGradient id="sg1" cx="30%" cy="40%"><stop offset="0%" stopColor="#6DC800" stopOpacity="0.26"/><stop offset="100%" stopColor="#6DC800" stopOpacity="0"/></radialGradient>
            <radialGradient id="sg2" cx="75%" cy="65%"><stop offset="0%" stopColor="#E8420A" stopOpacity="0.20"/><stop offset="100%" stopColor="#E8420A" stopOpacity="0"/></radialGradient>
          </defs>
          <ellipse cx="68" cy="56" rx="106" ry="78" fill="url(#sg1)"/>
          <ellipse cx="176" cy="93" rx="88" ry="63" fill="url(#sg2)"/>
          <text x="11" y="79" fontFamily="Space Grotesk,sans-serif" fontWeight="700" fontSize="49" fill="none" stroke="#6DC800" strokeWidth="1.5" opacity="0.9" letterSpacing="-3">DCY</text>
          <rect x="11" y="88" width="36" height="4" fill="#E8420A" opacity="0.9"/>
          <text x="140" y="123" fontFamily="Space Grotesk,sans-serif" fontWeight="700" fontSize="44" fill="none" stroke="#F0B800" strokeWidth="1" opacity="0.7" letterSpacing="-2">84</text>
          <rect x="0" y="0" width="228" height="5" fill="#6DC800" opacity="0.85"/>
          <path d="M176 24 L194 13 M185 13 L194 13 L194 24" stroke="#F0B800" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </div>

      {/* fc-3: amber smiley */}
      <div className="fc fc-3">
        <svg viewBox="0 0 158 112" style={{ display:'block', width:158 }}>
          <rect width="158" height="112" fill="#F0B800"/>
          <rect x="0" y="0" width="158" height="6" fill="#111008"/>
          <circle cx="79" cy="52" r="28" fill="none" stroke="#111008" strokeWidth="3" opacity="0.7"/>
          <circle cx="69" cy="47" r="6" fill="#111008" opacity="0.6"/>
          <circle cx="91" cy="47" r="6" fill="#111008" opacity="0.6"/>
          <path d="M65 67 Q79 80 93 67" stroke="#111008" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round"/>
          <text x="79" y="103" fontFamily="Space Grotesk,sans-serif" fontWeight="700" fontSize="9" fill="#111008" textAnchor="middle" letterSpacing="3" opacity="0.7">STAY RAW</text>
        </svg>
      </div>

      {/* fc-4 */}
      <div className="fc fc-4">
        <div style={{ height:3, background:C.steel }}/>
        <div style={{ padding:'11px 13px' }}>
          <FcTag bg={C.steel} color="#fff">Tutorial</FcTag>
          <FcTitle>JWT Auth con DRF paso a paso</FcTitle>
          <FcMeta>josé.p · hace 2d</FcMeta>
          <FcVotes color={C.acid} count={98}/>
        </div>
      </div>

      {/* fc-5: STR vertical */}
      <div className="fc fc-5" style={{ background:C.paper }}>
        <svg viewBox="0 0 136 168" style={{ display:'block', width:136, height:168 }}>
          <rect width="136" height="168" fill="#FDFCF8"/>
          <rect x="0" y="0" width="5" height="168" fill="#E8420A"/>
          <text x="76" y="52" fontFamily="Space Grotesk,sans-serif" fontWeight="700" fontSize="34" fill="none" stroke="#111008" strokeWidth="1.5" textAnchor="middle" opacity="0.8">S</text>
          <text x="76" y="94" fontFamily="Space Grotesk,sans-serif" fontWeight="700" fontSize="34" fill="none" stroke="#6DC800" strokeWidth="1.5" textAnchor="middle" opacity="0.8">T</text>
          <text x="76" y="136" fontFamily="Space Grotesk,sans-serif" fontWeight="700" fontSize="34" fill="none" stroke="#E8420A" strokeWidth="1.5" textAnchor="middle" opacity="0.8">R</text>
          <path d="M68 154 Q66 162 68 167" stroke="#111008" strokeWidth="2" fill="none" opacity="0.3"/>
        </svg>
      </div>

      {/* fc-6: Debate */}
      <div className="fc fc-6" style={{ padding:10 }}>
        <div style={{ height:3, background:C.rust, margin:'-10px -10px 9px -10px' }}/>
        <FcTag bg={C.rust} color="#fff">Debate</FcTag>
        <FcTitle>¿Tailwind mata el CSS?</FcTitle>
        <FcVotes color={C.acid} count={112}/>
      </div>

      {/* fc-7: teal WRITE */}
      <div className="fc fc-7">
        <svg viewBox="0 0 148 80" style={{ display:'block', width:148 }}>
          <rect width="148" height="80" fill="#0A9E88"/>
          <rect x="0" y="0" width="148" height="5" fill="#111008"/>
          <text x="74" y="45" fontFamily="Space Grotesk,sans-serif" fontWeight="700" fontSize="24" fill="none" stroke="#FDFCF8" strokeWidth="1.5" textAnchor="middle" opacity="0.85" letterSpacing="-1">WRITE</text>
          <text x="74" y="68" fontFamily="JetBrains Mono,monospace" fontWeight="700" fontSize="8" fill="#FDFCF8" textAnchor="middle" letterSpacing="4" opacity="0.6">YOUR STORY</text>
        </svg>
      </div>

      {/* fc-8 */}
      <div className="fc fc-8">
        <div style={{ height:3, background:C.amber }}/>
        <div style={{ padding:'9px 11px' }}>
          <FcTag bg={C.amber}>React</FcTag>
          <FcTitle>Server Components y el TTFB bajó 60%</FcTitle>
          <FcMeta>andrés.l · 6h</FcMeta>
        </div>
      </div>

      {/* ── AUTH FORM ── */}
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:20, pointerEvents:'none' }}>
        <div className="auth-pop" style={{ width:'100%', maxWidth:520, padding:'0 20px', pointerEvents:'all', filter:'drop-shadow(0 20px 48px rgba(17,16,8,0.32))' }}>

          {/* Logo */}
          <div style={{ marginBottom:28, textAlign:'center' }}>
            <div className="auth-glitch" style={{ display:'inline-block', background:C.ink, color:C.paper, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:34, letterSpacing:'-0.02em', padding:'12px 28px', border:`2px solid ${C.ink}`, boxShadow:`6px 6px 0 ${C.acid}`, lineHeight:1, marginBottom:12 }}>
              BLOG<span style={{ color:C.acid }}>R</span>EDDIT
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:C.fade, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <span style={{ color:C.acid, fontWeight:700 }}>//</span> ACCESS TERMINAL
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', border:`2px solid ${C.ink}`, boxShadow:`5px 5px 0 ${C.ink}` }}>
            <button onClick={() => setTab('login')} style={{
              flex:1, padding:15, fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.2em', cursor:'pointer', transition:'all .15s',
              borderRight:`2px solid ${C.ink}`, border:'none', borderRight:`2px solid ${C.ink}`,
              background: tab === 'login' ? C.paper : C.board,
              color: tab === 'login' ? C.ink : C.fade,
              borderBottom: tab === 'login' ? `3px solid ${C.acid}` : 'none',
              position:'relative',
            }}>LOGIN</button>
            <button onClick={() => setTab('register')} style={{
              flex:1, padding:15, fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.2em', cursor:'pointer', transition:'all .15s',
              border:'none',
              background: tab === 'register' ? C.ink : C.smudge,
              color: tab === 'register' ? C.acid : C.fade,
              borderBottom: tab === 'register' ? `3px solid ${C.rust}` : 'none',
            }}>REGISTER</button>
          </div>

          {/* Card */}
          <div className="auth-card-bar" style={{ background:C.paper, border:`2px solid ${C.ink}`, borderTop:'none', boxShadow:`8px 8px 0 ${C.ink}`, padding:'36px 36px 30px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:`linear-gradient(90deg,${C.acid},${C.teal},${C.steel})` }}/>

            {/* LOGIN PANE */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {loginError && (
                  <div style={{ background:C.ink, border:`2px solid ${C.rust}`, padding:'10px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:C.rust, marginBottom:16 }}>
                    {loginError}
                  </div>
                )}
                <div style={{ marginBottom:18 }}>
                  <label style={{ display:'block', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:C.smudge, marginBottom:7 }}>Username</label>
                  <input className="auth-input" type="text" placeholder="your_handle" value={loginForm.username}
                    onChange={e => setLoginForm(f => ({ ...f, username:e.target.value }))}
                    style={inputBase} autoComplete="username"/>
                </div>
                <div style={{ marginBottom:6 }}>
                  <label style={{ display:'block', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:C.smudge, marginBottom:7 }}>Password</label>
                  <div style={{ position:'relative' }}>
                    <input className="auth-input" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password:e.target.value }))}
                      style={{ ...inputBase, paddingRight:42 }} autoComplete="current-password"/>
                    <button type="button" onClick={() => setShowLoginPass(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.fade, opacity: showLoginPass ? .4 : 1, padding:0 }}>
                      <EyeIcon/>
                    </button>
                  </div>
                </div>
                <a href="#" style={{ display:'block', textAlign:'right', fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.steel, textDecoration:'none', letterSpacing:'0.08em', marginTop:4, marginBottom:16, transition:'color .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.rust}
                  onMouseLeave={e=>e.currentTarget.style.color=C.steel}
                >¿Olvidaste tu contraseña?</a>
                <button type="submit" disabled={loginLoading} className="auth-btn-dark">
                  {loginLoading ? 'AUTHENTICATING...' : 'ACCESS →'}
                </button>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.fade, textAlign:'center', marginTop:14, letterSpacing:'0.08em' }}>
                  no account?{' '}
                  <button type="button" onClick={() => setTab('register')} style={{ background:'none', border:'none', color:C.steel, fontWeight:700, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", fontSize:11, padding:0 }}>REGISTER</button>
                </div>
              </form>
            )}

            {/* REGISTER PANE */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {regError && (
                  <div style={{ background:C.ink, border:`2px solid ${C.rust}`, padding:'10px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:C.rust, marginBottom:16 }}>
                    {regError}
                  </div>
                )}
                <div style={{ marginBottom:18 }}>
                  <label style={{ display:'block', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:C.smudge, marginBottom:7 }}>Username</label>
                  <input className="auth-input" type="text" placeholder="your_handle" value={regForm.username}
                    onChange={e => setRegForm(f => ({ ...f, username:e.target.value }))}
                    style={inputBase} autoComplete="username"/>
                </div>
                <div style={{ marginBottom:18 }}>
                  <label style={{ display:'block', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:C.smudge, marginBottom:7 }}>Email</label>
                  <input className="auth-input" type="email" placeholder="tu@email.com" value={regForm.email}
                    onChange={e => setRegForm(f => ({ ...f, email:e.target.value }))}
                    style={inputBase} autoComplete="email"/>
                </div>
                <div style={{ marginBottom:6 }}>
                  <label style={{ display:'block', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.22em', color:C.smudge, marginBottom:7 }}>Password</label>
                  <div style={{ position:'relative' }}>
                    <input className="auth-input" type={showRegPass ? 'text' : 'password'} placeholder="mín. 8 caracteres" value={regForm.password}
                      onChange={e => setRegForm(f => ({ ...f, password:e.target.value }))}
                      style={{ ...inputBase, paddingRight:42 }} autoComplete="new-password"/>
                    <button type="button" onClick={() => setShowRegPass(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.fade, opacity: showRegPass ? .4 : 1, padding:0 }}>
                      <EyeIcon/>
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom:0 }}/>
                <button type="submit" disabled={regLoading} className="auth-btn-acid">
                  {regLoading ? 'JOINING...' : 'JOIN THE WALL →'}
                </button>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.fade, textAlign:'center', marginTop:14, letterSpacing:'0.08em' }}>
                  already in?{' '}
                  <button type="button" onClick={() => setTab('login')} style={{ background:'none', border:'none', color:C.steel, fontWeight:700, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", fontSize:11, padding:0 }}>LOGIN</button>
                </div>
              </form>
            )}
          </div>

          {/* Continue as guest */}
          <div style={{ marginTop:14, textAlign:'center' }}>
            <Link to="/" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.steel, textDecoration:'none', letterSpacing:'0.12em', textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:8, transition:'color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=C.rust}
              onMouseLeave={e=>e.currentTarget.style.color=C.steel}
            >
              <span style={{ display:'inline-block', width:5, height:5, border:`2px solid ${C.steel}` }}/>
              Continuar sin cuenta — solo lectura
            </Link>
          </div>
        </div>
      </div>

      {/* Back to feed */}
      <Link to="/" className="auth-fade-up" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.fade, textDecoration:'none', letterSpacing:'0.15em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6, zIndex:30, transition:'color .15s' }}
        onMouseEnter={e=>e.currentTarget.style.color=C.ink}
        onMouseLeave={e=>e.currentTarget.style.color=C.fade}
      >← Volver al feed</Link>
    </div>
  )
}
