import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import SignaturePad from 'signature_pad'
import { Eraser } from 'lucide-react'

// Contraintes du back (README, « Limites ») : PNG 200 Ko max, 100–3000 px de large,
// 40–1500 px de haut, 2000 × 1000 px au plus. On vise plus serré pour garder de la marge.
const MAX_W = 2000
const MAX_H = 1000
const MIN_W = 100
const MIN_H = 40
const MAX_BYTES = 190 * 1024
const PADDING = 12

export interface SignatureCanvasHandle {
  isEmpty: () => boolean
  clear: () => void
  /** PNG (data URL) recadré sur le tracé, fond transparent ; null si le pad est vide. */
  toCroppedPng: () => string | null
}

/** Taille décodée approximative d'une data URL base64. */
const dataUrlBytes = (dataUrl: string) => Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4)

function boundingBox(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const { width, height } = canvas
  const data = ctx.getImageData(0, 0, width, height).data
  let minX = width, minY = height, maxX = -1, maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY }
}

function cropAndEncode(source: HTMLCanvasElement): string | null {
  const box = boundingBox(source)
  if (!box) return null
  const sx = Math.max(0, box.minX - PADDING)
  const sy = Math.max(0, box.minY - PADDING)
  const sw = Math.min(source.width, box.maxX + PADDING + 1) - sx
  const sh = Math.min(source.height, box.maxY + PADDING + 1) - sy

  // Réduction pour tenir dans 2000 × 1000, puis tant que le PNG dépasse le poids max
  let scale = Math.min(1, MAX_W / sw, MAX_H / sh)
  for (let attempt = 0; attempt < 8; attempt++) {
    const drawW = Math.max(1, Math.round(sw * scale))
    const drawH = Math.max(1, Math.round(sh * scale))
    const out = document.createElement('canvas')
    // Un trait très court reste valide : on complète jusqu'aux dimensions minimales du back
    out.width  = Math.max(MIN_W, drawW)
    out.height = Math.max(MIN_H, drawH)
    const ctx = out.getContext('2d')
    if (!ctx) return null
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(source, sx, sy, sw, sh, (out.width - drawW) / 2, (out.height - drawH) / 2, drawW, drawH)
    const png = out.toDataURL('image/png')
    if (dataUrlBytes(png) <= MAX_BYTES) return png
    scale *= 0.75
  }
  return null
}

interface SignatureCanvasProps {
  disabled?: boolean
  onChange?: (empty: boolean) => void
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  function SignatureCanvas({ disabled, onChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const padRef    = useRef<SignaturePad | null>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const pad = new SignaturePad(canvas, {
        penColor: '#1a1040',
        backgroundColor: 'rgba(0,0,0,0)',
        minWidth: 0.8,
        maxWidth: 2.6,
      })
      padRef.current = pad
      const notify = () => onChangeRef.current?.(pad.isEmpty())
      pad.addEventListener('endStroke', notify)

      // Canvas net sur écrans haute densité ; le tracé est conservé au redimensionnement
      const resize = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        const data = pad.toData()
        canvas.width  = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio
        canvas.getContext('2d')?.scale(ratio, ratio)
        pad.clear()
        if (data.length) pad.fromData(data)
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(canvas)

      return () => {
        observer.disconnect()
        pad.removeEventListener('endStroke', notify)
        pad.off()
        padRef.current = null
      }
    }, [])

    useEffect(() => {
      const pad = padRef.current
      if (!pad) return
      if (disabled) pad.off()
      else pad.on()
    }, [disabled])

    useImperativeHandle(ref, () => ({
      isEmpty: () => padRef.current?.isEmpty() ?? true,
      clear: () => { padRef.current?.clear(); onChangeRef.current?.(true) },
      toCroppedPng: () => {
        const pad = padRef.current
        const canvas = canvasRef.current
        if (!pad || !canvas || pad.isEmpty()) return null
        return cropAndEncode(canvas)
      },
    }), [])

    return (
      <div className="flex flex-col gap-2">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: '#fff',
            border: `1.5px dashed ${disabled ? 'rgba(107,79,224,0.2)' : 'rgba(107,79,224,0.45)'}`,
            opacity: disabled ? 0.55 : 1,
          }}
        >
          {/* Masqué des outils d'enregistrement de session : c'est une signature manuscrite */}
          <canvas
            ref={canvasRef}
            className="block w-full ph-no-capture"
            data-clarity-mask="true"
            style={{ height: 200, touchAction: 'none', cursor: disabled ? 'not-allowed' : 'crosshair' }}
            aria-label="Zone de signature : signez avec le doigt, un stylet ou la souris"
            role="img"
          />
          <div className="absolute left-4 right-4 bottom-10 h-px pointer-events-none" style={{ background: 'rgba(107,79,224,0.18)' }} />
          <span className="absolute left-4 bottom-3 text-[11px] pointer-events-none" style={{ color: 'rgba(30,15,70,0.45)' }}>
            Signez au-dessus de la ligne
          </span>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="btn-action flex items-center gap-1.5"
            onClick={() => { padRef.current?.clear(); onChangeRef.current?.(true) }}
            disabled={disabled}
          >
            <Eraser size={14} /> Effacer
          </button>
        </div>
      </div>
    )
  },
)
