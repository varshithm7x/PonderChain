import { useEffect, useRef } from 'react'

export default function InteractiveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let mouseX = -1000
    let mouseY = -1000

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    // Initial setup
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    // Grid configuration
    const spacing = 20
    const dotRadius = 1
    const interactionRadius = 100
    const maxDisplacement = 15

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Background color
      ctx.fillStyle = '#F7F9F9'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#050505'

      const cols = Math.ceil(canvas.width / spacing)
      const rows = Math.ceil(canvas.height / spacing)

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const originalX = i * spacing
          const originalY = j * spacing

          // Calculate distance to mouse
          const dx = mouseX - originalX
          const dy = mouseY - originalY
          const distance = Math.sqrt(dx * dx + dy * dy)

          let drawX = originalX
          let drawY = originalY

          if (distance < interactionRadius) {
            const force = (interactionRadius - distance) / interactionRadius
            const angle = Math.atan2(dy, dx)
            
            // Push away
            const displacement = force * maxDisplacement
            drawX -= Math.cos(angle) * displacement
            drawY -= Math.sin(angle) * displacement
          }

          ctx.beginPath()
          ctx.arc(drawX, drawY, dotRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
    />
  )
}
