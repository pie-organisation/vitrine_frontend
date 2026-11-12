import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { downloadPdf } from '../../api/documents'

interface PdfButtonProps {
  fetchBlob: () => Promise<Blob>
  filename: string
  label?: string
  /** Bouton icône seule (listes) plutôt que bouton texte. */
  iconOnly?: boolean
  onError?: (message: string) => void
}

/** Téléchargement d'un PDF authentifié (fetch + JWT → blob), avec état de chargement. */
export function PdfButton({ fetchBlob, filename, label = 'Télécharger le PDF', iconOnly, onError }: PdfButtonProps) {
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setBusy(true)
    setError(null)
    try {
      await downloadPdf(fetchBlob, filename)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Téléchargement impossible.'
      setError(msg)
      onError?.(msg)
    } finally {
      setBusy(false)
    }
  }

  const Icon = busy ? Loader2 : Download

  if (iconOnly) {
    return (
      <button
        type="button"
        title={error ?? label}
        aria-label={label}
        onClick={handleClick}
        disabled={busy}
        className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer shrink-0"
        style={{
          background: error ? 'rgba(239,68,68,0.08)' : 'rgba(107,79,224,0.07)',
          color: error ? '#dc2626' : '#6B4FE0',
        }}
      >
        <Icon size={14} className={busy ? 'animate-spin' : undefined} />
      </button>
    )
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" className="btn-action flex items-center gap-1.5" onClick={handleClick} disabled={busy}>
        <Icon size={14} className={busy ? 'animate-spin' : undefined} />
        {busy ? 'Téléchargement…' : label}
      </button>
      {error && !onError && <span className="text-xs" style={{ color: '#dc2626' }}>{error}</span>}
    </span>
  )
}
