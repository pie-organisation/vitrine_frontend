// Contrats, factures et signature électronique : types alignés sur le README du back
// (sections « Facturation » et « Contrats et signature électronique ») et fonctions d'appel.

import { api, publicApi, ENDPOINTS } from './client'

// ── Statuts ───────────────────────────────────────────────────────────────────
// Les unions listent les valeurs connues ; `(string & {})` garde l'autocomplétion tout en
// acceptant une valeur nouvelle du back sans casser le typage (affichée en badge neutre).

type Open<T extends string> = T | (string & {})

export type ContratStatut       = Open<'brouillon' | 'envoye' | 'signe' | 'annule' | 'expire'>
export type FactureStatut       = Open<'payee' | 'en_attente' | 'impayee' | 'annulee' | 'avoir'>
export type InvoiceStatut       = Open<'presentee' | 'en_cours' | 'a_venir' | 'annulee' | 'avoir'>
export type FactureType         = Open<'facture' | 'avoir'>
export type StatutFactureBrut   = Open<'emise' | 'payee' | 'annulee_par_avoir'>

// ── Contrats ──────────────────────────────────────────────────────────────────

export interface ContratEtablissement {
  ecoleId: string
  nom: string
  siret: string | null
  quantite: number
  prixUnitaireCentimes: number
}

export interface Signataire {
  nom: string | null
  fonction: string | null
  email: string | null
}

export interface Contrat {
  id: string
  numero: string
  statut: ContratStatut
  organisation: string
  type: 'ecole' | 'groupe'
  ecoleId: string | null
  groupeId: string | null
  offre: string
  quantiteTotale: number
  prixUnitaireCentimes: number
  etablissements: ContratEtablissement[]
  dateDebut: string | null
  dateEffet?: string | null
  dureeMois: number
  signataire: Signataire
  sha256Original: string | null
  sha256Signe: string | null
  dateSignatureCubi: string | null
  dateSignatureClient: string | null
  dateCreation: string
  dateModification: string | null
  /** Absent de la réponse actuelle du back (adresse figée dans contrat.donnees.client). */
  adresseClient?: string | null
}

export interface ContratEvenement {
  id: string | number
  horodatage: string
  type: string
  acteur: string | null
  ip: string | null
  meta: Record<string, unknown> | null
}

export interface DemandeSignature {
  id: string
  statut: string
  expireLe: string | null
  otpTentatives: number
  preuveId: string | null
  ip: string | null
  dateCreation: string
  dateFin: string | null
}

export interface ContratDetail extends Contrat {
  evenements: ContratEvenement[]
  demandesSignature: DemandeSignature[]
}

export interface ContratsPage {
  items: Contrat[]
  page: number
  parPage: number
  total: number
}

export interface ContratPatch {
  signataire?: { nom?: string; fonction?: string; email?: string }
  adresseClient?: string
  quantites?: { ecoleId: string; quantite: number }[]
  dateDebut?: string
  dureeMois?: number
}

export interface ActivationResult {
  message: string
  dejaActive: boolean
  invitations?: unknown
  conflits?: unknown
}

/** Contrat vu par l'école (hors brouillons). */
export interface SchoolContrat {
  id: string
  numero: string
  statut: ContratStatut
  offre: string
  quantiteTotale: number
  dateDebut: string | null
  dureeMois: number
  signataire: Signataire
  dateSignature: string | null
  pdfDisponible: boolean
}

// ── Factures ──────────────────────────────────────────────────────────────────

/** Champs détaillés communs aux vues admin et école. */
interface FactureChampsCommuns {
  type?: FactureType
  statutFacture?: StatutFactureBrut
  dateEmission?: string | null
  dateEcheance?: string | null
  datePaiement?: string | null
  periodeDebut?: string | null
  periodeFin?: string | null
  totalHtCentimes?: number
  totalTvaCentimes?: number
  totalTtcCentimes?: number
  factureOrigineId?: string | null
  /** Numéro de la facture corrigée, pour un avoir. */
  factureOrigine?: string | null
  contratNumero?: string | null
}

/** Facture (vue admin) : forme historique des mocks + champs détaillés. */
export interface Facture extends FactureChampsCommuns {
  id: string
  organisationId: string
  organisation: string
  plan: string
  montant: string
  echeance: string
  statut: FactureStatut
  reference: string
  contratId?: string
}

/** Ligne au format des templates PDF. */
export interface FactureLigne {
  label: string
  description?: string | null
  quantity: number
  unitPriceCents: number
  vatRate: number
  totalHtCents: number
}

export interface FactureDetail extends Facture {
  lignes: FactureLigne[]
  ventilationTva: unknown
  client: { name?: string; address?: string; siret?: string | null; billingContact?: string } | null
  emetteur: unknown
  sha256: string | null
  avoirs?: Facture[]
}

/** Facture vue par l'école. */
export interface SchoolInvoice extends FactureChampsCommuns {
  id: string
  reference: string
  date: string
  echeance: string
  montant: string
  statut: InvoiceStatut
}

export interface AvoirLigneInput {
  label: string
  quantite?: number
  prixUnitaireHtCentimes: number
  tauxTva?: number
}

// ── Demandes d'inscription ────────────────────────────────────────────────────
// Le type Demande reste dans mocks/data.ts (utilisé ailleurs) ; ces champs s'y ajoutent.

export interface ValidationDemandeBody {
  statut: 'validee' | 'refusee'
  nbLicences?: number
  etablissements?: { siret: string; quantite: number }[]
}

export interface ValidationDemandeResult {
  message: string
  contrat?: { id: string; numero: string }
}

// ── Paliers (type_licence) ────────────────────────────────────────────────────

export interface Palier {
  id: string
  nom: string
  sessionsMin: number
  sessionsMax: number | null
  /** Prix mensuel HT par utilisateur, en euros. */
  prixUnitaire: number
  actif?: boolean
}

/** Même règle que src/services/palier.js du back : premier palier actif qui couvre la quantité. */
export function calculerPalier(paliers: Palier[], quantite: number): Palier | null {
  if (!Number.isInteger(quantite) || quantite <= 0) return null
  return [...paliers]
    .filter((p) => p.actif !== false)
    .sort((a, b) => a.sessionsMin - b.sessionsMin)
    .find((p) => quantite >= p.sessionsMin && (p.sessionsMax === null || quantite <= p.sessionsMax)) ?? null
}

// ── Signature publique ────────────────────────────────────────────────────────

export interface SignatureInfo {
  statut: Open<'a_signer' | 'signe'>
  contrat: { numero: string; offre: string; dateDebut: string | null; dureeMois: number }
  organisation: string
  signataire: { nom: string; fonction: string | null; emailMasque: string }
  expireLe: string | null
  preuveId?: string | null
  dateSignature?: string | null
}

export interface OtpResult { message: string; expireDansSecondes: number }
export interface SignerResult { message: string; numero: string; preuveId: string }

export const MENTION_SIGNATURE = 'Lu et approuvé'

// ── Appels ────────────────────────────────────────────────────────────────────

const qs = (params: Record<string, string | number | null | undefined>) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== undefined && v !== '') p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const contratsApi = {
  list:    (statut?: string, page = 1) => api.get<ContratsPage>(ENDPOINTS.contrats + qs({ statut, page })),
  get:     (id: string)                => api.get<ContratDetail>(ENDPOINTS.contrat(id)),
  update:  (id: string, body: ContratPatch) => api.patch<Contrat>(ENDPOINTS.contrat(id), body),
  envoyer: (id: string) => api.post<{ message: string; expireLe: string }>(ENDPOINTS.contratAction(id, 'envoyer')),
  renvoyer:(id: string) => api.post<{ message: string; expireLe: string }>(ENDPOINTS.contratAction(id, 'renvoyer')),
  annuler: (id: string) => api.post<{ message: string }>(ENDPOINTS.contratAction(id, 'annuler')),
  activer: (id: string) => api.post<ActivationResult>(ENDPOINTS.contratAction(id, 'activer')),
  pdf:     (id: string) => api.blob(ENDPOINTS.contratPdf(id)),
}

export const facturesApi = {
  /** Sans `page` : tout (1 000 max). Avec `page` : 50 par page, total dans X-Total-Count. */
  list:     (f: { statut?: string; organisation?: string; page?: number } = {}) =>
              api.getWithTotal<Facture[]>(ENDPOINTS.factures + qs(f)),
  get:      (id: string) => api.get<FactureDetail>(ENDPOINTS.facture(id)),
  pdf:      (id: string) => api.blob(ENDPOINTS.facturePdf(id)),
  payer:    (id: string, datePaiement: string) => api.post<Facture>(ENDPOINTS.facturePayer(id), { datePaiement }),
  avoir:    (id: string, motif: string, lignes?: AvoirLigneInput[]) =>
              api.post<FactureDetail>(ENDPOINTS.factureAvoir(id), lignes ? { motif, lignes } : { motif }),
  renvoyer: (id: string) => api.post<{ message: string }>(ENDPOINTS.factureRenvoyer(id)),
  emettre:  (body: { contratId: string; periodeDebut: string; periodeFin: string }) =>
              api.post<FactureDetail>(ENDPOINTS.factureEmettre, body),
}

export const organisationsApi = {
  suspendre: (id: string) => api.post<{ message: string }>(ENDPOINTS.organisationSuspendre(id)),
  reactiver: (id: string) => api.post<{ message: string }>(ENDPOINTS.organisationReactiver(id)),
}

export const demandesApi = {
  traiter: (id: string, body: ValidationDemandeBody) =>
    api.patch<ValidationDemandeResult>(ENDPOINTS.demande(id), body),
  paliers: () => api.get<Palier[]>(ENDPOINTS.plans),
}

export const schoolDocumentsApi = {
  contrats:   () => api.get<SchoolContrat[]>(ENDPOINTS.schoolContrats),
  contratPdf: (id: string) => api.blob(ENDPOINTS.schoolContratPdf(id)),
  factures:   () => api.get<SchoolInvoice[]>(ENDPOINTS.schoolFactures),
  facturePdf: (id: string) => api.blob(ENDPOINTS.schoolFacturePdf(id)),
}

export const signatureApi = {
  get:    (token: string) => publicApi.get<SignatureInfo>(ENDPOINTS.signature(token)),
  pdf:    (token: string) => publicApi.blob(ENDPOINTS.signaturePdf(token)),
  otp:    (token: string) => publicApi.post<OtpResult>(ENDPOINTS.signatureOtp(token)),
  signer: (token: string, otp: string, signaturePng: string) =>
    publicApi.post<SignerResult>(ENDPOINTS.signatureSigner(token), {
      otp, signaturePng, mention: MENTION_SIGNATURE, acceptation: true,
    }),
}

// ── PDF : blob → object URL ───────────────────────────────────────────────────

/** Force le type PDF (certains proxys renvoient application/octet-stream). */
function asPdf(blob: Blob): Blob {
  return blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })
}

/** Télécharge le PDF sous un nom propre (FAC-2026-0001.pdf) puis révoque l'URL. */
export async function downloadPdf(fetchBlob: () => Promise<Blob>, filename: string): Promise<void> {
  const url = URL.createObjectURL(asPdf(await fetchBlob()))
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    // Laisse au navigateur le temps de démarrer le téléchargement avant de libérer le blob
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}

/**
 * Ouvre le PDF dans un nouvel onglet. L'onglet est ouvert AVANT l'appel réseau, sinon le
 * navigateur (Safari iOS surtout) le bloque comme pop-up : le clic n'est plus « utilisateur ».
 */
export async function openPdf(fetchBlob: () => Promise<Blob>, filename: string): Promise<void> {
  const win = window.open('', '_blank')
  let blob: Blob
  try {
    blob = asPdf(await fetchBlob())
  } catch (e) {
    win?.close()
    throw e
  }
  // Pop-up bloquée : on retombe sur le téléchargement
  if (!win) return downloadPdf(() => Promise.resolve(blob), filename)
  const url = URL.createObjectURL(blob)
  win.location.href = url
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// ── Formatage ─────────────────────────────────────────────────────────────────

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
export const formatCentimes = (c: number | null | undefined) => (typeof c === 'number' ? eur.format(c / 100) : '—')
export const formatEuros    = (e: number | null | undefined) => (typeof e === 'number' ? eur.format(e) : '—')

/** 'YYYY-MM-DD' ou ISO → 'JJ/MM/AAAA' (heure de Paris). */
export function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d.split('-').reverse().join('/')
  const date = new Date(d)
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
}

export function formatDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  const date = new Date(d)
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'medium' })
}

/** Date du jour à Paris, au format YYYY-MM-DD. */
export const aujourdhuiIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date())
