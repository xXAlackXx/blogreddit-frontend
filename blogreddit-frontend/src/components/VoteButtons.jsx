import { useState } from 'react'

export default function VoteButtons({ score, onVote, disabled }) {
  const [active, setActive] = useState(null)

  const vote = async (type) => {
    if (disabled) return
    setActive(type)
    await onVote(type)
    setTimeout(() => setActive(null), 400)
  }

  const btnBase = {
    width: 32, height: 32,
    border: '2px solid #111008',
    boxShadow: '2px 2px 0 #111008',
    background: '#FDFCF8',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14,
    transition: 'all .1s',
    borderRadius: 2,
    fontFamily: 'inherit',
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <button
        onClick={() => vote('upvote')}
        style={{
          ...btnBase,
          background: active === 'upvote' ? '#6DC800' : '#FDFCF8',
          color: active === 'upvote' ? '#111008' : '#9A9288',
          transform: active === 'upvote' ? 'translate(-1px,-1px)' : 'none',
          boxShadow: active === 'upvote' ? '3px 3px 0 #111008' : '2px 2px 0 #111008',
        }}
      >▲</button>

      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 16, fontWeight: 700,
        color: score > 0 ? '#6DC800' : score < 0 ? '#E8420A' : '#111008',
        minWidth: 24, textAlign: 'center',
        lineHeight: 1,
      }}>{score}</span>

      <button
        onClick={() => vote('downvote')}
        style={{
          ...btnBase,
          background: active === 'downvote' ? '#E8420A' : '#FDFCF8',
          color: active === 'downvote' ? '#fff' : '#9A9288',
          transform: active === 'downvote' ? 'translate(-1px,-1px)' : 'none',
          boxShadow: active === 'downvote' ? '3px 3px 0 #111008' : '2px 2px 0 #111008',
        }}
      >▼</button>
    </div>
  )
}
