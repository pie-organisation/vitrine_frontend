import { Badge, type BadgeVariant } from '../ui/Badge'

const STATUTS: Record<string, { label: string; variant: BadgeVariant }> = {
  running:      { label: 'Allumée',      variant: 'green'   },
  stopped:      { label: 'Éteinte',      variant: 'neutral' },
  starting:     { label: 'Démarrage',    variant: 'blue'    },
  stopping:     { label: 'Arrêt',        variant: 'blue'    },
  provisioning: { label: 'Préparation',  variant: 'blue'    },
  creating:     { label: 'Création',     variant: 'blue'    },
  paused:       { label: 'En pause',     variant: 'yellow'  },
  error:        { label: 'En erreur',    variant: 'red'     },
}

/** Statut inconnu : affiché tel quel en neutre, jamais de crash. */
export function VmStatusBadge({ status, vmid }: { status: string | null | undefined; vmid?: number }) {
  const meta = STATUTS[status ?? ''] ?? { label: status || 'Inconnu', variant: 'neutral' as const }
  return <Badge variant={meta.variant} dot>{vmid !== undefined ? `${vmid} · ` : ''}{meta.label}</Badge>
}
