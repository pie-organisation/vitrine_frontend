import { Badge, type BadgeVariant } from '../ui/Badge'

interface StatutMeta { label: string; variant: BadgeVariant }

// Un statut absent de la table s'affiche tel quel en badge neutre : jamais de crash
// quand le back ajoute une valeur (c'était le cas avec `annulee` / `avoir`).
function StatusBadge({ map, statut, dot = true }: { map: Record<string, StatutMeta>; statut: string | null | undefined; dot?: boolean }) {
  const key = statut ?? ''
  const meta: StatutMeta = Object.prototype.hasOwnProperty.call(map, key)
    ? map[key]
    : { label: key ? key.replace(/_/g, ' ') : 'Inconnu', variant: 'neutral' }
  return <Badge variant={meta.variant} dot={dot}>{meta.label}</Badge>
}

export const CONTRAT_STATUTS: Record<string, StatutMeta> = {
  brouillon: { label: 'Brouillon', variant: 'neutral' },
  envoye:    { label: 'Envoyé',    variant: 'blue'    },
  signe:     { label: 'Signé',     variant: 'green'   },
  annule:    { label: 'Annulé',    variant: 'red'     },
  expire:    { label: 'Expiré',    variant: 'yellow'  },
}

export const FACTURE_STATUTS: Record<string, StatutMeta> = {
  payee:      { label: 'Payée',      variant: 'green'   },
  en_attente: { label: 'En attente', variant: 'yellow'  },
  impayee:    { label: 'Impayée',    variant: 'red'     },
  annulee:    { label: 'Annulée',    variant: 'neutral' },
  avoir:      { label: 'Avoir',      variant: 'violet'  },
}

export const INVOICE_STATUTS: Record<string, StatutMeta> = {
  presentee: { label: 'Réglée',    variant: 'green'   },
  en_cours:  { label: 'À régler',  variant: 'yellow'  },
  a_venir:   { label: 'À venir',   variant: 'neutral' },
  annulee:   { label: 'Annulée',   variant: 'neutral' },
  avoir:     { label: 'Avoir',     variant: 'violet'  },
}

export const ContratStatutBadge  = ({ statut }: { statut: string | null | undefined }) => <StatusBadge map={CONTRAT_STATUTS} statut={statut} />
export const FactureStatutBadge  = ({ statut }: { statut: string | null | undefined }) => <StatusBadge map={FACTURE_STATUTS} statut={statut} />
export const InvoiceStatutBadge  = ({ statut }: { statut: string | null | undefined }) => <StatusBadge map={INVOICE_STATUTS} statut={statut} />
export { StatusBadge }
