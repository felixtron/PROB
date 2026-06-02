"use client"

import { useEffect, useRef, useState } from "react"

export type SignaturePadProps = {
  onChange?: (dataUrl: string | null) => void
  height?: number
}

export function SignaturePad({ onChange, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const hasInkRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const [empty, setEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const setupCtx = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "#0b1220"
      // White background so signature stays visible when image is exported.
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, rect.width, rect.height)
    }
    setupCtx()
    window.addEventListener("resize", setupCtx)
    return () => window.removeEventListener("resize", setupCtx)
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      const t = e.touches[0] ?? e.changedTouches[0]
      if (!t) return null
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function emitChange() {
    const canvas = canvasRef.current
    if (!canvas || !onChange) return
    onChange(hasInkRef.current ? canvas.toDataURL("image/png") : null)
  }

  function onStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const p = getPos(e)
    if (!p) return
    drawingRef.current = true
    lastPosRef.current = p
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    if (!drawingRef.current) return
    e.preventDefault()
    const p = getPos(e)
    const last = lastPosRef.current
    if (!p || !last) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastPosRef.current = p
    if (!hasInkRef.current) {
      hasInkRef.current = true
      setEmpty(false)
    }
  }

  function onEnd() {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastPosRef.current = null
    emitChange()
  }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, w, h)
    hasInkRef.current = false
    setEmpty(true)
    onChange?.(null)
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div
        style={{
          background: "#ffffff",
          borderRadius: 8,
          border: "1px solid var(--border)",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
          style={{
            width: "100%",
            height,
            display: "block",
            borderRadius: 8,
            touchAction: "none",
            cursor: "crosshair",
          }}
        />
        {empty ? (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#94a3b8",
              fontSize: 13,
              pointerEvents: "none",
            }}
          >
            Firma aquí con el dedo o el mouse
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={clear}
          className="button secondary"
          style={{ padding: "6px 12px", fontSize: 12 }}
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
