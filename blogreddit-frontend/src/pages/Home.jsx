import { useQuery } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import PostCard from '../components/PostCard'
import SortTabs from '../components/SortTabs'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../context/ThemeContext'

function SkeletonCard({ rot = 0 }) {
  return (
    <div style={{
      background:'#FDFCF8', border:'2px solid #C8C2B6', boxShadow:'5px 5px 0 #C8C2B6',
      borderRadius:2, overflow:'hidden', transform:`rotate(${rot}deg)`, marginBottom:2,
    }}>
      <div style={{ height:4, background:'#E8E4DC' }}/>
      <div style={{ display:'flex' }}>
        <div style={{ width:54, background:'#F2EFE8', borderRight:'2px solid #E8E4DC', padding:'16px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div className="skeleton" style={{ width:28,height:28 }}/>
          <div className="skeleton" style={{ width:20,height:14 }}/>
          <div className="skeleton" style={{ width:28,height:28 }}/>
        </div>
        <div style={{ padding:'14px', flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <div className="skeleton" style={{ height:12,width:'35%' }}/>
          <div className="skeleton" style={{ height:20,width:'75%' }}/>
          <div className="skeleton" style={{ height:13,width:'90%' }}/>
          <div className="skeleton" style={{ height:13,width:'55%' }}/>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeHashtag = searchParams.get('hashtag') || ''
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['posts', debouncedSearch, activeHashtag],
    queryFn: () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (activeHashtag) params.set('hashtag', activeHashtag)
      return api.get(`/posts/?${params.toString()}`).then(r => r.data)
    },
  })

  const rots = [0.5, -0.7, 0.3, -0.5, 0.8]

  return (
    <div style={{ position:'relative', zIndex:1 }}>
      <div className="feed-container" style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px', display:'flex', gap:28, alignItems:'flex-start' }}>

        {/* Feed */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Search */}
          <div style={{ position:'relative', marginBottom:16 }}>
            <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9A9288', zIndex:1 }}
              width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="search_posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:'100%', paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10,
                background: t.inputBg, border:`2px solid ${t.border}`, borderRadius:2,
                fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:t.text,
                outline:'none', boxShadow:`3px 3px 0 ${t.shadow}`,
                transition:'box-shadow .15s',
              }}
              onFocus={e=>{e.target.style.boxShadow='4px 4px 0 #6DC800';e.target.style.borderColor='#6DC800'}}
              onBlur={e=>{e.target.style.boxShadow=`3px 3px 0 ${t.shadow}`;e.target.style.borderColor=t.border}}
            />
          </div>

          {activeHashtag && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                filtrando:
              </span>
              <span style={{
                display:'inline-flex', alignItems:'center', gap:6,
                fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
                background:'#111008', border:'1px solid #6DC800', color:'#6DC800',
                padding:'3px 10px', borderRadius:2,
              }}>
                #{activeHashtag}
                <button
                  onClick={() => setSearchParams({})}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#E8420A', fontWeight:700, fontSize:14, padding:0, lineHeight:1 }}
                  title="Quitar filtro"
                >×</button>
              </span>
            </div>
          )}

          <SortTabs count={data?.count} />

          {/* Posts */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {isError ? (
              <div style={{
                background:'#111008', border:'2px solid #E8420A', boxShadow:'4px 4px 0 #E8420A',
                padding:'16px 20px', fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'#E8420A',
              }}>
                // ERROR: could not load feed —{' '}
                <button onClick={refetch} style={{ background:'none', border:'none', color:'#6DC800', fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, cursor:'pointer', padding:0 }}>retry</button>
              </div>
            ) : isLoading ? (
              [0,1,2,3].map(i => <SkeletonCard key={i} rot={rots[i%rots.length]}/>)
            ) : data?.results?.length === 0 ? (
              <div style={{
                background: t.panelBg, border:`2px solid ${t.border}`, boxShadow:`5px 5px 0 ${t.shadow}`,
                padding:48, textAlign:'center',
              }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:48, fontWeight:800, color:'transparent', WebkitTextStroke:`2px ${t.borderMid}`, marginBottom:12 }}>VOID</div>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:t.textMuted, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  no posts yet — be first
                </p>
              </div>
            ) : (
              data?.results?.map((post, i) => (
                <div key={post.id} className={`slam slam-${Math.min(i+1,5)}`}>
                  <PostCard post={post} onVote={refetch} index={i} featured={i===0} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar — hidden on mobile via inline media */}
        <div className="sidebar-wrapper">
          <Sidebar count={data?.count} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrapper { display: none !important; }
        }
      `}</style>
    </div>
  )
}
