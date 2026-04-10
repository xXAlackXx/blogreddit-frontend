import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav style={{
      background: '#111008',
      borderBottom: '3px solid #6DC800',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 16px', height: 52,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration:'none', flexShrink:0, display:'flex', flexDirection:'column', lineHeight:1, gap:2 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 90" height="22" style={{ display:'block' }}>
            <text x="200" y="68" fontFamily="'Impact', 'Arial Black', sans-serif" fontSize="70" fontWeight="900" letterSpacing="14" textAnchor="middle" fill="none" stroke="#7CB342" strokeWidth="2">ONYX</text>
          </svg>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, color: '#6A6258', letterSpacing:'0.12em', textTransform:'uppercase'
          }}>EST. 2026 / DECAY—84</span>
        </Link>

        {/* Spacer */}
        <div style={{ flex:1 }}/>

        {/* Nav links */}
        <div className="nav-links" style={{ display:'flex', gap:4, alignItems:'center' }}>
          {[{label:'FEED', to:'/'}, {label:'POST', to:'/create'}].map(item => (
            <Link key={item.to} to={item.to} style={{
              fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.08em',
              color:'#9A9288', textDecoration:'none',
              padding:'5px 10px', borderRadius:2,
              transition:'all .15s'
            }}
            onMouseEnter={e=>{e.currentTarget.style.background='#6DC800';e.currentTarget.style.color='#111008'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#9A9288'}}
            >{item.label}</Link>
          ))}
        </div>

        {/* Theme toggle */}
        <button onClick={toggle} title={isDark ? 'Switch to light' : 'Switch to dark'} style={{
          background:'none', border:'1px solid #3A3630', color:'#9A9288',
          width:30, height:30, borderRadius:2, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0, transition:'all .15s',
        }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='#6DC800';e.currentTarget.style.color='#6DC800'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='#3A3630';e.currentTarget.style.color='#9A9288'}}
        >
          {isDark ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5"/>
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          {user ? (
            <>
              <Link to="/create" className="nav-post-btn" style={{
                background:'#6DC800', color:'#111008',
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
                textTransform:'uppercase', letterSpacing:'0.04em',
                padding:'7px 16px', border:'2px solid #6DC800', borderRadius:2,
                textDecoration:'none', transition:'all .15s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='#111008';e.currentTarget.style.color='#6DC800'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#6DC800';e.currentTarget.style.color='#111008'}}
              >+ POST</Link>
              {/* Avatar */}
              <Link to="/profile" style={{ textDecoration:'none', flexShrink:0 }}>
                <div style={{
                  width:32, height:32,
                  background:'linear-gradient(135deg,#E8420A,#F0B800)',
                  border:'2px solid #6A6258', borderRadius:2,
                  overflow:'hidden',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer',
                }}
                onMouseEnter={e=>e.currentTarget.style.border='2px solid #6DC800'}
                onMouseLeave={e=>e.currentTarget.style.border='2px solid #6A6258'}
                >
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:'#111008' }}>
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                  }
                </div>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin-panel" style={{
                  background: '#E8420A', color: '#0A0A06',
                  fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '5px 10px', borderRadius: 2, textDecoration: 'none',
                  border: '2px solid #E8420A', transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#E8420A' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#E8420A'; e.currentTarget.style.color = '#0A0A06' }}
                >⚡ CMD</Link>
              )}
              <button onClick={handleLogout} className="nav-exit" style={{
                background:'none', border:'1px solid #6A6258',
                color:'#9A9288', padding:'6px 12px', borderRadius:2,
                fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
                textTransform:'uppercase', cursor:'pointer',
                transition:'all .15s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#E8420A';e.currentTarget.style.color='#E8420A'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#6A6258';e.currentTarget.style.color='#9A9288'}}
              >EXIT</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                border:'1px solid #6A6258', color:'#9A9288',
                fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.05em',
                padding:'6px 12px', borderRadius:2, textDecoration:'none',
                transition:'all .15s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#6DC800';e.currentTarget.style.color='#6DC800'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#6A6258';e.currentTarget.style.color='#9A9288'}}
              >LOGIN</Link>
              <Link to="/register" style={{
                background:'#6DC800', color:'#111008',
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13,
                textTransform:'uppercase', letterSpacing:'0.04em',
                padding:'7px 16px', borderRadius:2, textDecoration:'none',
                border:'2px solid #6DC800',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6DC800'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#6DC800';e.currentTarget.style.color='#111008'}}
              >JOIN</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
