import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

/* Generates a cropped Blob from the source image and crop pixels */
async function getCroppedBlob(imageSrc, pixelCrop, mimeType = 'image/jpeg') {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width  = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  )

  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, 0.92)
  })
}

export default function AvatarCropModal({ src, mimeType, onConfirm, onCancel }) {
  const [crop,     setCrop]     = useState({ x: 0, y: 0 })
  const [zoom,     setZoom]     = useState(1)
  const [pixels,   setPixels]   = useState(null)

  const onCropComplete = useCallback((_, croppedPixels) => {
    setPixels(croppedPixels)
  }, [])

  const handleConfirm = async () => {
    if (!pixels) return
    const blob = await getCroppedBlob(src, pixels, mimeType)
    onConfirm(blob)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(17,16,8,0.85)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'#FDFCF8', border:'2px solid #111008',
        boxShadow:'8px 8px 0 #6DC800',
        width:'min(480px, 94vw)',
      }}>
        {/* Header */}
        <div style={{ height:28, background:'#111008', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6DC800', textTransform:'uppercase' }}>// CROP AVATAR</span>
          <div style={{ display:'flex', gap:5 }}>
            {['#E8420A','#F0B800','#6DC800'].map((c,i) => <div key={i} style={{ width:8, height:8, background:c }} />)}
          </div>
        </div>

        {/* Cropper area */}
        <div style={{ position:'relative', height:320, background:'#111008' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background:'#111008' },
              cropAreaStyle: { border:'2px solid #6DC800', boxShadow:'0 0 0 9999px rgba(17,16,8,0.7)' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div style={{ padding:'14px 20px 4px', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#9A9288', textTransform:'uppercase', flexShrink:0 }}>ZOOM</span>
          <input type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex:1, accentColor:'#6DC800', cursor:'pointer' }}
          />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#6DC800', width:32, textAlign:'right' }}>
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Hint */}
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#9A9288', textAlign:'center', padding:'4px 20px 14px' }}>
          drag to reposition · scroll or use slider to zoom
        </p>

        {/* Actions */}
        <div style={{ display:'flex', gap:0, borderTop:'2px solid #111008' }}>
          <button onClick={onCancel} style={{
            flex:1, padding:'12px 0',
            fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
            background:'#FDFCF8', color:'#9A9288', border:'none', borderRight:'2px solid #111008', cursor:'pointer',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='#E8E4DC'}
          onMouseLeave={e=>e.currentTarget.style.background='#FDFCF8'}
          >CANCEL</button>
          <button onClick={handleConfirm} style={{
            flex:1, padding:'12px 0',
            fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
            background:'#6DC800', color:'#111008', border:'none', cursor:'pointer',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='#5AB800'}
          onMouseLeave={e=>e.currentTarget.style.background='#6DC800'}
          >APPLY CROP</button>
        </div>
      </div>
    </div>
  )
}
