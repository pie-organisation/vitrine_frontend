import { useCallback, useEffect, useState } from 'react'
import { Download, ExternalLink, FileText } from 'lucide-react'
import { downloadPdf, openPdf } from '../../api/documents'

interface PdfPreviewProps {
  /** Charge le PDF (avec ou sans JWT selon la route). Doit être stable entre deux rendus. */
  fetchBlob: () => Promise<Blob>
  filename: string
  title?: string
  height?: number | string
  /** Change cette clé pour recharger l'aperçu (ex. après modification du brouillon). */
  reloadKey?: string | number
  openLabel?: string
}

/**
 * Aperçu PDF chargé en blob puis affiché via object URL : un iframe pointé directement sur
 * l'API serait bloqué (JWT absent, en-têtes du back). iOS n'affiche qu'une page dans un
 * iframe : le bouton « Ouvrir le contrat » reste toujours disponible en secours.
 */
export function PdfPreview({
  fetchBlob, filename, title = 'Aperçu du document', height = 600, reloadKey, openLabel = 'Ouvrir le PDF',
}: PdfPreviewProps) {
  const [url,     setUrl]     = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setLoading(true)
    setError(null)
    fetchBlob()
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' }))
        setUrl(objectUrl)
      })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "Le document n'a pas pu être chargé.") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setUrl(null)
    }
  }, [fetchBlob, reloadKey, attempt])

  const [busy, setBusy] = useState<'open' | 'download' | null>(null)
  const run = useCallback(async (kind: 'open' | 'download') => {
    setBusy(kind)
    try {
      if (kind === 'open') await openPdf(fetchBlob, filename)
      else await downloadPdf(fetchBlob, filename)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Le document n'a pas pu être chargé.")
    } finally {
      setBusy(null)
    }
  }, [fetchBlob, filename])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-action flex items-center gap-1.5" onClick={() => run('open')} disabled={busy !== null}>
          <ExternalLink size={14} /> {busy === 'open' ? 'Ouverture…' : openLabel}
        </button>
        <button type="button" className="btn-action flex items-center gap-1.5" onClick={() => run('download')} disabled={busy !== null}>
          <Download size={14} /> {busy === 'download' ? 'Téléchargement…' : 'Télécharger'}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden relative"
        style={{ height, background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.14)' }}>
        {url && !error && (
          <iframe src={url} title={title} className="w-full h-full border-0" />
        )}
        {(loading || error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {loading ? (
              <>
                <div className="w-7 h-7 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
                <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>Chargement du document…</span>
              </>
            ) : (
              <>
                <FileText size={22} style={{ color: '#dc2626' }} />
                <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
                <button type="button" className="btn-action" onClick={() => setAttempt((n) => n + 1)}>Réessayer</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
