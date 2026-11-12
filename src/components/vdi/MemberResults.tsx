import { Download, KeyRound } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { downloadCsv } from '../../lib/groupImport'
import type { MemberResult } from '../../api/vdi'

/**
 * Résultat d'une création ou d'un import : les mots de passe ne sont affichés qu'une fois,
 * d'où le téléchargement CSV proposé tout de suite.
 */
export function MemberResults({ results, filename }: { results: MemberResult[]; filename: string }) {
  if (!results.length) return null
  const withPassword = results.filter((r) => r.password)

  return (
    <div className="section-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display font-bold text-base flex items-center gap-2" style={{ color: '#1a1040' }}>
            <KeyRound size={16} style={{ color: '#6B4FE0' }} /> Comptes générés
          </h3>
          <p className="text-xs mt-1" style={{ color: '#b45309' }}>
            Les mots de passe ne seront plus affichés : téléchargez-les maintenant pour les transmettre aux élèves.
          </p>
        </div>
        {withPassword.length > 0 && (
          <button type="button" className="btn-action flex items-center gap-1.5"
            onClick={() => downloadCsv(filename, [['email', 'mot de passe'], ...withPassword.map((r) => [r.email, r.password ?? ''])])}>
            <Download size={14} /> Télécharger (CSV)
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
              <th className="font-semibold py-2 pr-3">E-mail</th>
              <th className="font-semibold py-2 pr-3">Résultat</th>
              <th className="font-semibold py-2">Mot de passe</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.email} style={{ borderTop: '1px solid rgba(107,79,224,0.07)', color: '#1a1040' }}>
                <td className="py-2 pr-3 break-all">{r.email}</td>
                <td className="py-2 pr-3">
                  {r.error ? <span className="text-xs" style={{ color: '#dc2626' }}>{r.error}</span>
                    : r.created ? <Badge variant="green">Créé</Badge>
                    : r.updated ? <Badge variant="blue">Rattaché</Badge>
                    : <Badge variant="neutral">—</Badge>}
                </td>
                <td className="py-2">
                  {r.password
                    ? <code className="ph-no-capture text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(107,79,224,0.07)' }}>{r.password}</code>
                    : <span style={{ color: 'rgba(30,15,70,0.45)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
