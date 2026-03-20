import { useEffect, useRef } from 'react'

const COLORS = ['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88']

export default function ParticleCanvas() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -999, y: -999 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let W, H

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    })

    // Build particles
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() > 0.6 ? 3 : 2,
      square: Math.random() > 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.04 + Math.random() * 0.07,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      particles.forEach(p => {
        // Repel from cursor
        const dx = p.x - mx, dy = p.y - my
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 100) {
          const force = (100 - dist) / 100
          p.vx += (dx / dist) * force * 0.5
          p.vy += (dy / dist) * force * 0.5
        }
        // Friction
        p.vx *= 0.98; p.vy *= 0.98
        p.x += p.vx; p.y += p.vy
        // Wrap
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0

        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        if (p.square) {
          ctx.fillRect(p.x, p.y, p.size, p.size)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', width: '100%', height: '100%'
      }}
    />
  )
}
