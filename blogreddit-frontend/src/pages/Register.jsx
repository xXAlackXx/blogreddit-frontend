import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', password_confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await api.post('/users/register/', form); navigate('/login') }
    catch (err) {
      const d = err.response?.data
      setError('// ERROR: ' + (d ? Object.values(d).flat().join(' ') : 'registration failed'))
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width:'100%', padding:'10px 14px',
    background:'#F2EFE8', border:'2px solid #111008',
    fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'#111008',
    outline:'none', borderRadius:2, transition:'box-shadow .15s, border-color .15s',
  }

  const fields = [
    { key:'username', label:'HANDLE', type:'text', ph:'your_handle' },
    { key:'email', label:'EMAIL', type:'email', ph:'you@domain.com' },
    { key:'password', label:'PASSWORD', type:'password', ph:'min 8 chars' },
    { key:'password_confirm', label:'CONFIRM', type:'password', ph:'repeat password' },
  ]

  return (
    <div style={{ minHeight:'calc(100vh - 55px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'var(--wall)', paddingTop:32, paddingBottom:32 }}>
      <div style={{ width:'100%', maxWidth:380 }} className="slam">
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-block', marginBottom:14, background:'#111008', border:'3px solid #6DC800', boxShadow:'5px 5px 0 #6DC800', padding:'12px 24px' }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, color:'#fff', letterSpacing:'-0.5px' }}>
              BLOG<span style={{color:'#6DC800'}}>R</span>EDDIT
            </span>
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#9A9288', textTransform:'uppercase', letterSpacing:'0.12em' }}>
            // NEW MEMBER REGISTRATION
          </div>
        </div>

        <div style={{ background:'#FDFCF8', border:'2px solid #111008', boxShadow:'5px 5px 0 #111008', padding:24 }}>
          {error && (
            <div style={{ background:'#111008', border:'2px solid #E8420A', padding:'10px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#E8420A', marginBottom:16 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={{ display:'block', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:'#6A6258', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>
                  {f.label}
                </label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]}
                  onChange={e => setForm({...form,[f.key]:e.target.value})}
                  style={inputStyle}
                  onFocus={e=>{e.target.style.borderColor='#6DC800';e.target.style.boxShadow='3px 3px 0 #6DC800'}}
                  onBlur={e=>{e.target.style.borderColor='#111008';e.target.style.boxShadow='none'}}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              background: loading ? '#3A3630' : '#6DC800',
              color:'#111008', border:'2px solid #111008',
              boxShadow: loading ? 'none' : '4px 4px 0 #111008',
              fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15,
              textTransform:'uppercase', letterSpacing:'0.06em',
              padding:'11px', cursor: loading?'not-allowed':'pointer', borderRadius:2, marginTop:4,
            }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='translate(-2px,-2px)';e.currentTarget.style.boxShadow='6px 6px 0 #111008'}}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='4px 4px 0 #111008'}}
            >
              {loading ? 'REGISTERING...' : 'CREATE ACCOUNT →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#9A9288', marginTop:16 }}>
          already a member?{' '}
          <Link to="/login" style={{ color:'#6DC800', fontWeight:700, textDecoration:'none' }}>LOGIN</Link>
        </p>
      </div>
    </div>
  )
}
