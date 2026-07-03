// ── Types ─────────────────────────────────────────────────────────────────────

export type OrgType     = 'ecole' | 'groupe'
export type OrgStatus   = 'actif' | 'en_attente' | 'suspendu'
export type AlerteSev   = 'error' | 'warning' | 'info' | 'success'
export type HistoType   = 'info' | 'warning' | 'success'
export type PlanStatus  = 'actif' | 'brouillon' | 'archive'

export interface AdminUser {
  id: string
  nom: string
  prenom: string
  email: string
  role: string
}

export interface HistoriqueItem {
  id: string
  date: string
  evenement: string
  type: HistoType
}

export interface Organisation {
  id: string
  nom: string
  type: OrgType
  ville: string
  statut: OrgStatus
  plan: string
  nbUtilisateurs: number
  dateExpiration: string
  siret: string
  dateDebut: string
  montant: string
  admins: AdminUser[]
  historique: HistoriqueItem[]
  usage: { sessionsMois: number; heuresCumulees: number; tauxUtilisation: number }
}

export interface Plan {
  id: string
  nom: string
  description: string
  sessionsMin: number
  sessionsMax: number | null
  tarif: string
  nbOrganisations: number
  statut: PlanStatus
}

export interface Alerte {
  id: string
  severite: AlerteSev
  message: string
  date: string
}

export interface DashboardMetrics {
  organisationsActives: number
  utilisateursTotal: number
  sessionsEnCours: number
  tauxRenouvellement: string
  alertesTraitees: number
  alertesTotales: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const mockMetrics: DashboardMetrics = {
  organisationsActives: 47,
  utilisateursTotal: 3842,
  sessionsEnCours: 18,
  tauxRenouvellement: '94 %',
  alertesTraitees: 8,
  alertesTotales: 12,
}

export const mockOrganisations: Organisation[] = [
  {
    id: '1',
    nom: 'Lycée Jean Moulin',
    type: 'ecole',
    ville: 'Lyon',
    statut: 'actif',
    plan: 'Licence 2 — Standard',
    nbUtilisateurs: 124,
    dateExpiration: '31/12/2025',
    siret: '123 456 789 01234',
    dateDebut: '15/01/2024',
    montant: '2 988 €/an',
    admins: [
      { id: 'a1', nom: 'Martin',  prenom: 'Sophie',   email: 'sophie.martin@jmoulin.fr',  role: 'DAF' },
      { id: 'a2', nom: 'Dubois',  prenom: 'Marc',     email: 'marc.dubois@jmoulin.fr',    role: 'DSI' },
    ],
    historique: [
      { id: 'h1', date: '01/11/2024', evenement: 'Renouvellement du plan Licence 2',       type: 'success' },
      { id: 'h2', date: '15/09/2024', evenement: "Ajout de l'administrateur Marc Dubois",  type: 'info'    },
      { id: 'h3', date: '20/07/2024', evenement: 'Modification du SIRET école',            type: 'warning' },
      { id: 'h4', date: '15/01/2024', evenement: 'Création du compte',                     type: 'success' },
    ],
    usage: { sessionsMois: 87, heuresCumulees: 412, tauxUtilisation: 70 },
  },
  {
    id: '2',
    nom: 'École Supérieure du Numérique',
    type: 'ecole',
    ville: 'Paris',
    statut: 'actif',
    plan: 'Licence 3 — Sur-mesure',
    nbUtilisateurs: 342,
    dateExpiration: '30/06/2026',
    siret: '987 654 321 09876',
    dateDebut: '01/07/2023',
    montant: 'Devis personnalisé',
    admins: [
      { id: 'a3', nom: 'Fontaine', prenom: 'Alice',    email: 'alice.fontaine@esn.fr',  role: 'DAF'       },
      { id: 'a4', nom: 'Renard',   prenom: 'Jean-Paul',email: 'jp.renard@esn.fr',       role: 'Directeur' },
      { id: 'a5', nom: 'Lambert',  prenom: 'Emma',     email: 'emma.lambert@esn.fr',    role: 'IT'        },
    ],
    historique: [
      { id: 'h5', date: '10/11/2024', evenement: 'Passage au plan Licence 3',                     type: 'success' },
      { id: 'h6', date: '02/08/2024', evenement: "Ajout de l'administratrice Emma Lambert",        type: 'info'    },
      { id: 'h7', date: '01/07/2023', evenement: 'Création du compte',                            type: 'success' },
    ],
    usage: { sessionsMois: 298, heuresCumulees: 1847, tauxUtilisation: 87 },
  },
  {
    id: '3',
    nom: 'Groupe DigitalEduc',
    type: 'groupe',
    ville: 'Bordeaux',
    statut: 'en_attente',
    plan: 'Licence 1 — Découverte',
    nbUtilisateurs: 45,
    dateExpiration: '15/03/2025',
    siret: '456 123 789 05678',
    dateDebut: '15/03/2024',
    montant: '405 €/an',
    admins: [
      { id: 'a6', nom: 'Blanchard', prenom: 'Robert', email: 'r.blanchard@digitaledc.fr', role: 'DAF' },
    ],
    historique: [
      { id: 'h8',  date: '20/11/2024', evenement: 'Paiement en attente (30 jours)',  type: 'warning' },
      { id: 'h9',  date: '15/03/2024', evenement: 'Création du compte',              type: 'success' },
    ],
    usage: { sessionsMois: 32, heuresCumulees: 178, tauxUtilisation: 35 },
  },
  {
    id: '4',
    nom: 'PME Tech Solutions',
    type: 'groupe',
    ville: 'Nantes',
    statut: 'actif',
    plan: 'Licence 2 — Standard',
    nbUtilisateurs: 38,
    dateExpiration: '30/11/2025',
    siret: '789 012 345 07890',
    dateDebut: '01/12/2023',
    montant: '1 824 €/an',
    admins: [
      { id: 'a7', nom: 'Moreau',  prenom: 'Céline',  email: 'c.moreau@techsol.fr',  role: 'DRH' },
      { id: 'a8', nom: 'Garnier', prenom: 'Antoine', email: 'a.garnier@techsol.fr', role: 'DSI' },
    ],
    historique: [
      { id: 'h10', date: '01/12/2024', evenement: 'Renouvellement automatique du plan',          type: 'success' },
      { id: 'h11', date: '15/06/2024', evenement: "Ajout de l'administrateur Antoine Garnier",   type: 'info'    },
    ],
    usage: { sessionsMois: 54, heuresCumulees: 287, tauxUtilisation: 62 },
  },
  {
    id: '5',
    nom: 'Lycée Victor Hugo',
    type: 'ecole',
    ville: 'Nantes',
    statut: 'suspendu',
    plan: 'Licence 1 — Découverte',
    nbUtilisateurs: 89,
    dateExpiration: '31/08/2025',
    siret: '321 654 987 03210',
    dateDebut: '01/09/2023',
    montant: '801 €/an',
    admins: [
      { id: 'a9', nom: 'Petit', prenom: 'Hélène', email: 'h.petit@vhugo.fr', role: 'DAF' },
    ],
    historique: [
      { id: 'h12', date: '05/11/2024', evenement: 'Suspension — dépassement quota utilisation', type: 'warning' },
      { id: 'h13', date: '01/09/2023', evenement: 'Création du compte',                        type: 'success' },
    ],
    usage: { sessionsMois: 91, heuresCumulees: 456, tauxUtilisation: 97 },
  },
  {
    id: '6',
    nom: 'Institut de Formation Pro',
    type: 'ecole',
    ville: 'Marseille',
    statut: 'actif',
    plan: 'Licence 2 — Standard',
    nbUtilisateurs: 156,
    dateExpiration: '01/03/2026',
    siret: '654 987 321 06540',
    dateDebut: '01/03/2024',
    montant: '3 744 €/an',
    admins: [
      { id: 'a10', nom: 'Dupont',    prenom: 'François', email: 'f.dupont@ifpro.fr',     role: 'DAF' },
      { id: 'a11', nom: 'Simon',     prenom: 'Nathalie', email: 'n.simon@ifpro.fr',      role: 'DSI' },
      { id: 'a12', nom: 'Chevalier', prenom: 'Bruno',    email: 'b.chevalier@ifpro.fr',  role: 'RH'  },
    ],
    historique: [
      { id: 'h14', date: '15/10/2024', evenement: 'Mise à jour des informations de facturation', type: 'info'    },
      { id: 'h15', date: '01/03/2024', evenement: 'Création du compte',                          type: 'success' },
    ],
    usage: { sessionsMois: 121, heuresCumulees: 678, tauxUtilisation: 78 },
  },
]

export const mockPlans: Plan[] = [
  {
    id: 'p1',
    nom: 'Licence 1 — Découverte',
    description: 'De 0 à 99 sessions/mois · Idéal pour les petites structures et associations',
    sessionsMin: 0,
    sessionsMax: 99,
    tarif: '9 € / utilisateur / mois',
    nbOrganisations: 18,
    statut: 'actif',
  },
  {
    id: 'p2',
    nom: 'Licence 2 — Standard',
    description: 'De 100 à 500 sessions/mois · Pour les établissements scolaires et PME',
    sessionsMin: 100,
    sessionsMax: 500,
    tarif: '24 € / utilisateur / mois',
    nbOrganisations: 22,
    statut: 'actif',
  },
  {
    id: 'p3',
    nom: 'Licence 3 — Sur-mesure',
    description: 'Sessions illimitées · Support dédié · SLA 99,9 % garanti',
    sessionsMin: 500,
    sessionsMax: null,
    tarif: 'Devis personnalisé',
    nbOrganisations: 7,
    statut: 'actif',
  },
  {
    id: 'p4',
    nom: 'Licence Éducation Nationale',
    description: 'Tarification spéciale EN · Accès prioritaire · Conformité RGPD étendue',
    sessionsMin: 0,
    sessionsMax: null,
    tarif: 'Convention nationale',
    nbOrganisations: 0,
    statut: 'brouillon',
  },
]

export const mockAlertes: Alerte[] = [
  {
    id: 'al1',
    severite: 'error',
    message: 'Licence Lycée Jean Moulin expire dans 5 jours — renouvellement requis',
    date: '25/11/2024',
  },
  {
    id: 'al2',
    severite: 'warning',
    message: 'Paiement en attente — Groupe DigitalEduc (30 jours de retard)',
    date: '20/11/2024',
  },
  {
    id: 'al3',
    severite: 'info',
    message: "Nouvelle demande d'inscription — PME Innovatech SAS (Paris)",
    date: '18/11/2024',
  },
  {
    id: 'al4',
    severite: 'warning',
    message: "Taux d'utilisation > 90 % — Lycée Victor Hugo Nantes",
    date: '15/11/2024',
  },
  {
    id: 'al5',
    severite: 'info',
    message: 'Export mensuel généré avec succès — 47 organisations incluses',
    date: '10/11/2024',
  },
]

// ── Demandes ──────────────────────────────────────────────────────────────────

export type DemandeStatut = 'en_attente' | 'validee' | 'refusee'

export interface Demande {
  id: string
  nomEntite: string
  type: OrgType
  dateSubmission: string
  statut: DemandeStatut
  siret: string
  siretVerifie: boolean
  nomSiege: string
  nomDaf: string
  prenomDaf: string
  nomEcole: string
  adresse: string
  codePostal: string
  ville: string
  planDemande: string
  dureePlan: string
  nomContact: string
  prenomContact: string
  emailContact: string
  visaEcole?: string
}

export const mockDemandes: Demande[] = [
  {
    id: 'd1',
    nomEntite: 'Institut Catholique de Paris',
    type: 'ecole',
    dateSubmission: '28/11/2024',
    statut: 'en_attente',
    siret: '776 722 025 00013',
    siretVerifie: false,
    nomSiege: 'Institut Catholique de Paris',
    nomDaf: 'Lefebvre',
    prenomDaf: 'Christine',
    nomEcole: 'Institut Catholique de Paris',
    adresse: "21 rue d'Assas",
    codePostal: '75006',
    ville: 'Paris',
    planDemande: 'Licence 2 — Standard',
    dureePlan: '12 mois',
    nomContact: 'Lefebvre',
    prenomContact: 'Christine',
    emailContact: 'c.lefebvre@icp.fr',
  },
  {
    id: 'd2',
    nomEntite: 'Groupe FormaPro Sud',
    type: 'groupe',
    dateSubmission: '25/11/2024',
    statut: 'en_attente',
    siret: '532 891 044 00027',
    siretVerifie: true,
    nomSiege: 'Groupe FormaPro Sud',
    nomDaf: 'Ramirez',
    prenomDaf: 'Diego',
    nomEcole: 'FormaPro Montpellier',
    adresse: 'avenue Georges Clémenceau',
    codePostal: '34000',
    ville: 'Montpellier',
    planDemande: 'Licence 1 — Découverte',
    dureePlan: '6 mois',
    nomContact: 'Ramirez',
    prenomContact: 'Diego',
    emailContact: 'd.ramirez@formaprosud.fr',
    visaEcole: 'VA-2024-034892',
  },
  {
    id: 'd3',
    nomEntite: 'Lycée Henri Bergson',
    type: 'ecole',
    dateSubmission: '22/11/2024',
    statut: 'en_attente',
    siret: '200 072 562 00041',
    siretVerifie: false,
    nomSiege: 'Lycée Henri Bergson',
    nomDaf: 'Mounier',
    prenomDaf: 'Pascal',
    nomEcole: 'Lycée Henri Bergson',
    adresse: '5 rue des Charmes',
    codePostal: '93300',
    ville: 'Aubervilliers',
    planDemande: 'Licence 2 — Standard',
    dureePlan: '12 mois',
    nomContact: 'Mounier',
    prenomContact: 'Pascal',
    emailContact: 'p.mounier@lyceebergson.fr',
  },
  {
    id: 'd4',
    nomEntite: 'Association NumériqueEduc',
    type: 'groupe',
    dateSubmission: '15/11/2024',
    statut: 'validee',
    siret: '881 234 567 00018',
    siretVerifie: true,
    nomSiege: 'Association NumériqueEduc',
    nomDaf: 'Tremblay',
    prenomDaf: 'Marie',
    nomEcole: 'NumériqueEduc Bretagne',
    adresse: '3 place de la République',
    codePostal: '29000',
    ville: 'Quimper',
    planDemande: 'Licence 3 — Sur-mesure',
    dureePlan: '24 mois',
    nomContact: 'Tremblay',
    prenomContact: 'Marie',
    emailContact: 'm.tremblay@numeriqueeduc.fr',
    visaEcole: 'VA-2024-091234',
  },
  {
    id: 'd5',
    nomEntite: 'CFA Tech Avenir',
    type: 'ecole',
    dateSubmission: '10/11/2024',
    statut: 'refusee',
    siret: '123 000 999 00056',
    siretVerifie: false,
    nomSiege: 'CFA Tech Avenir',
    nomDaf: 'Fontaine',
    prenomDaf: 'Luc',
    nomEcole: 'CFA Tech Avenir',
    adresse: '87 boulevard de la Liberté',
    codePostal: '59000',
    ville: 'Lille',
    planDemande: 'Licence 1 — Découverte',
    dureePlan: '12 mois',
    nomContact: 'Fontaine',
    prenomContact: 'Luc',
    emailContact: 'l.fontaine@cfatechavenir.fr',
  },
]

// ── Sessions ──────────────────────────────────────────────────────────────────

export interface SessionActive {
  id: string
  nomUtilisateur: string
  organisation: string
  organisationId: string
  heureDebut: string
  duree: string
  statut: 'actif' | 'anomalie'
  ip: string
}

export const mockSessions: SessionActive[] = [
  { id: 's1', nomUtilisateur: 'Sophie Martin',   organisation: 'Lycée Jean Moulin',         organisationId: '1', heureDebut: '08:34', duree: '2h14', statut: 'actif',    ip: '91.198.174.12'  },
  { id: 's2', nomUtilisateur: 'Alice Fontaine',   organisation: 'École Supérieure du Num.',  organisationId: '2', heureDebut: '09:01', duree: '1h52', statut: 'actif',    ip: '185.220.101.3'  },
  { id: 's3', nomUtilisateur: 'Emma Lambert',     organisation: 'École Supérieure du Num.',  organisationId: '2', heureDebut: '09:15', duree: '1h38', statut: 'actif',    ip: '185.220.101.3'  },
  { id: 's4', nomUtilisateur: 'François Dupont',  organisation: 'Institut de Formation Pro', organisationId: '6', heureDebut: '07:58', duree: '3h07', statut: 'anomalie', ip: '81.23.45.111'   },
  { id: 's5', nomUtilisateur: 'Antoine Garnier',  organisation: 'PME Tech Solutions',        organisationId: '4', heureDebut: '10:02', duree: '0h47', statut: 'actif',    ip: '46.165.221.5'   },
  { id: 's6', nomUtilisateur: 'Nathalie Simon',   organisation: 'Institut de Formation Pro', organisationId: '6', heureDebut: '08:22', duree: '2h43', statut: 'actif',    ip: '81.23.45.112'   },
  { id: 's7', nomUtilisateur: 'Jean-Paul Renard', organisation: 'École Supérieure du Num.',  organisationId: '2', heureDebut: '10:30', duree: '0h25', statut: 'actif',    ip: '185.220.101.3'  },
]

// ── Facturation ───────────────────────────────────────────────────────────────

export type FactureStatut = 'payee' | 'en_attente' | 'impayee'

export interface Facture {
  id: string
  organisationId: string
  organisation: string
  plan: string
  montant: string
  echeance: string
  statut: FactureStatut
  reference: string
}

export const mockFactures: Facture[] = [
  { id: 'f1', organisationId: '1', organisation: 'Lycée Jean Moulin',             plan: 'Licence 2 — Standard',   montant: '2 988 €',  echeance: '31/12/2024', statut: 'payee',      reference: 'FAC-2024-0042' },
  { id: 'f2', organisationId: '2', organisation: 'École Supérieure du Numérique', plan: 'Licence 3 — Sur-mesure', montant: 'Sur devis', echeance: '30/11/2024', statut: 'en_attente', reference: 'FAC-2024-0043' },
  { id: 'f3', organisationId: '3', organisation: 'Groupe DigitalEduc',            plan: 'Licence 1 — Découverte', montant: '405 €',    echeance: '15/12/2024', statut: 'impayee',    reference: 'FAC-2024-0044' },
  { id: 'f4', organisationId: '4', organisation: 'PME Tech Solutions',            plan: 'Licence 2 — Standard',   montant: '1 824 €',  echeance: '30/11/2024', statut: 'payee',      reference: 'FAC-2024-0045' },
  { id: 'f5', organisationId: '6', organisation: 'Institut de Formation Pro',     plan: 'Licence 2 — Standard',   montant: '3 744 €',  echeance: '01/12/2024', statut: 'en_attente', reference: 'FAC-2024-0046' },
  { id: 'f6', organisationId: '1', organisation: 'Lycée Jean Moulin',             plan: 'Licence 2 — Standard',   montant: '2 988 €',  echeance: '31/12/2023', statut: 'payee',      reference: 'FAC-2023-0089' },
  { id: 'f7', organisationId: '2', organisation: 'École Supérieure du Numérique', plan: 'Licence 2 — Standard',   montant: '2 988 €',  echeance: '30/06/2024', statut: 'payee',      reference: 'FAC-2024-0012' },
]

// ── Logs ──────────────────────────────────────────────────────────────────────

export type LogType = 'connexion' | 'modification' | 'erreur' | 'securite'

export interface LogEntry {
  id: string
  type: LogType
  organisation: string
  utilisateur: string
  message: string
  horodatage: string
}

export const mockLogs: LogEntry[] = [
  { id: 'l1',  type: 'connexion',    organisation: 'Lycée Jean Moulin',         utilisateur: 'Sophie Martin',    message: 'Connexion réussie',                                          horodatage: '28/11/2024 11:34:02' },
  { id: 'l2',  type: 'securite',     organisation: 'Institut de Formation Pro', utilisateur: 'François Dupont',  message: 'Session multiple détectée et bloquée par session_guard',      horodatage: '28/11/2024 10:58:47' },
  { id: 'l3',  type: 'connexion',    organisation: 'École Supérieure du Num.',  utilisateur: 'Alice Fontaine',   message: 'Connexion réussie',                                          horodatage: '28/11/2024 09:01:15' },
  { id: 'l4',  type: 'erreur',       organisation: 'Groupe DigitalEduc',        utilisateur: 'Robert Blanchard', message: 'Échec de connexion — mot de passe incorrect (3e tentative)',  horodatage: '28/11/2024 08:47:22' },
  { id: 'l5',  type: 'modification', organisation: 'PME Tech Solutions',        utilisateur: 'Antoine Garnier',  message: 'Modification du SIRET organisation',                         horodatage: '27/11/2024 17:12:09' },
  { id: 'l6',  type: 'securite',     organisation: 'Lycée Victor Hugo',         utilisateur: 'Hélène Petit',     message: 'Tentative de connexion depuis IP non reconnue — bloquée',    horodatage: '27/11/2024 16:05:33' },
  { id: 'l7',  type: 'connexion',    organisation: 'Lycée Jean Moulin',         utilisateur: 'Marc Dubois',      message: 'Connexion réussie',                                          horodatage: '27/11/2024 14:28:57' },
  { id: 'l8',  type: 'modification', organisation: 'École Supérieure du Num.',  utilisateur: 'Jean-Paul Renard', message: 'Mise à jour plan : Licence 2 → Licence 3',                   horodatage: '27/11/2024 11:34:44' },
  { id: 'l9',  type: 'erreur',       organisation: 'CFA Tech Avenir',           utilisateur: 'Luc Fontaine',     message: 'Paiement refusé — carte expirée',                            horodatage: '26/11/2024 15:20:11' },
  { id: 'l10', type: 'connexion',    organisation: 'Institut de Formation Pro', utilisateur: 'Nathalie Simon',   message: 'Connexion réussie',                                          horodatage: '26/11/2024 09:00:38' },
  { id: 'l11', type: 'securite',     organisation: 'Groupe DigitalEduc',        utilisateur: 'Robert Blanchard', message: 'Compte suspendu après 5 tentatives échouées',                 horodatage: '25/11/2024 22:14:06' },
  { id: 'l12', type: 'modification', organisation: 'Lycée Jean Moulin',         utilisateur: 'Sophie Martin',    message: "Ajout de l'administrateur délégué",                          horodatage: '25/11/2024 10:45:29' },
]

// ── Équipe CUBI ───────────────────────────────────────────────────────────────

export type RoleEquipe = 'super_admin' | 'support' | 'lecture'

export interface MembreEquipe {
  id: string
  nom: string
  prenom: string
  email: string
  role: RoleEquipe
  dateAjout: string
}

export const mockEquipeCubi: MembreEquipe[] = [
  { id: 'm1', nom: 'Leduc',   prenom: 'Thomas',  email: 'thomas.leduc@cubi.fr',   role: 'super_admin', dateAjout: '01/01/2024' },
  { id: 'm2', nom: 'Mercier', prenom: 'Laure',   email: 'laure.mercier@cubi.fr',  role: 'super_admin', dateAjout: '01/01/2024' },
  { id: 'm3', nom: 'Girard',  prenom: 'Nicolas', email: 'n.girard@cubi.fr',       role: 'support',     dateAjout: '15/03/2024' },
  { id: 'm4', nom: 'Hamidi',  prenom: 'Yasmine', email: 'y.hamidi@cubi.fr',       role: 'support',     dateAjout: '15/03/2024' },
  { id: 'm5', nom: 'Perrot',  prenom: 'Élodie',  email: 'e.perrot@cubi.fr',       role: 'lecture',     dateAjout: '10/06/2024' },
]

export const mockCurrentAdmin = {
  initials: 'TL',
  prenom: 'Thomas',
  nom: 'Leduc',
  role: 'super_admin' as RoleEquipe,
  email: 'thomas.leduc@cubi.fr',
}

// ── Offres publiques ──────────────────────────────────────────────────────────

export type OffreStatut = 'publiee' | 'brouillon'

export interface Offre {
  id: string
  nom: string
  tagline: string
  prix: string
  statut: OffreStatut
  features: string[]
  populaire?: boolean
}

export const mockOffres: Offre[] = [
  {
    id: 'o1',
    nom: 'Licence Starter',
    tagline: "Idéal pour démarrer avec l'IA encadrée",
    prix: '99 €/mois',
    statut: 'publiee',
    features: [
      "Jusqu'à 99 sessions IA / mois",
      'Modèles éducatifs pré-configurés',
      'Tableau de bord administrateur',
      'Support par email',
      'Conformité RGPD incluse',
    ],
  },
  {
    id: 'o2',
    nom: 'Licence Établissement',
    tagline: "L'offre complète pour votre établissement",
    prix: '249 €/mois',
    statut: 'publiee',
    features: [
      "Jusqu'à 500 sessions IA / mois",
      'Multi-groupes et multi-classes',
      "Rapports d'usage avancés",
      'API & intégrations LMS',
      'Support prioritaire 5j/7',
      'Formation administrateur incluse',
    ],
    populaire: true,
  },
  {
    id: 'o3',
    nom: 'Licence Groupe',
    tagline: "Pour les réseaux d'établissements",
    prix: 'Sur devis',
    statut: 'publiee',
    features: [
      'Sessions illimitées',
      'Gestion multi-établissements',
      'SLA 99,9 % garanti',
      'CSM dédié',
      'Formations sur site',
      'Accès API complet',
    ],
  },
]

// ── Messages de contact ───────────────────────────────────────────────────────

export type MessageStatut = 'non_lu' | 'traite'

export interface Message {
  id: string
  expediteur: string
  email: string
  objet: string
  contenu: string
  date: string
  statut: MessageStatut
}

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    expediteur: 'Pierre Gautier',
    email: 'p.gautier@lycee-pasteur.fr',
    objet: 'Demande de démonstration CUBI',
    contenu:
      "Bonjour,\n\nJe suis directeur administratif au Lycée Pasteur de Strasbourg et nous cherchons une plateforme IA conforme RGPD pour nos 280 élèves.\n\nPouvez-vous organiser une démonstration ?\n\nCordialement,\nPierre Gautier",
    date: '28/11/2024 14h22',
    statut: 'non_lu',
  },
  {
    id: 'msg2',
    expediteur: 'Camille Roux',
    email: 'c.roux@esgi.fr',
    objet: 'Question sur le plan Groupe',
    contenu:
      'Bonjour,\n\nNous sommes un groupe de 3 écoles (ESGI, ECE, ISEP) et souhaitons une licence groupée. Avez-vous des tarifs spécifiques pour les consortiums scolaires ?\n\nMerci,\nCamille Roux',
    date: '27/11/2024 09h15',
    statut: 'non_lu',
  },
  {
    id: 'msg3',
    expediteur: 'Laurent Morin',
    email: 'l.morin@cfamorin.fr',
    objet: 'Bug — téléchargement de rapport impossible',
    contenu:
      "Bonjour,\n\nNous rencontrons un problème avec le téléchargement des rapports d'usage mensuel. Le bouton ne répond plus depuis la mise à jour du 20/11.\n\nLaurent Morin, responsable IT",
    date: '26/11/2024 16h40',
    statut: 'traite',
  },
  {
    id: 'msg4',
    expediteur: 'Aurélie Chassaing',
    email: 'a.chassaing@sfa-formation.com',
    objet: 'Intérêt pour CUBI — tarif personnalisé',
    contenu:
      'Bonjour,\n\nNotre organisme compte 450 apprenants sur 4 sites. Votre offre Groupe nous intéresse mais nous aimerions discuter un tarif adapté à notre structure.\n\nAurélie Chassaing, DAF',
    date: '25/11/2024 11h05',
    statut: 'traite',
  },
  {
    id: 'msg5',
    expediteur: 'Romain Berthier',
    email: 'r.berthier@univ-poitiers.fr',
    objet: 'Documentation RGPD requise par notre DPO',
    contenu:
      "Bonjour,\n\nNotre DPO exige une documentation complète sur la conformité RGPD de CUBI avant toute décision d'achat. Pouvez-vous nous transmettre votre registre de traitement ?\n\nRomain Berthier, Université de Poitiers",
    date: '24/11/2024 08h30',
    statut: 'non_lu',
  },
]

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface AnalyticsPeriod {
  evolutionOrgs:      Array<{ mois: string; orgs: number }>
  usageSessions:      Array<{ semaine: string; heures: number }>
  repartitionPlans:   Array<{ plan: string; orgs: number; couleur: string }>
  tauxRenouvellement: number
  churn:              number
}

export const mockAnalytics: AnalyticsPeriod = {
  evolutionOrgs: [
    { mois: 'Jan', orgs: 36 },
    { mois: 'Fév', orgs: 37 },
    { mois: 'Mar', orgs: 37 },
    { mois: 'Avr', orgs: 38 },
    { mois: 'Mai', orgs: 39 },
    { mois: 'Jun', orgs: 40 },
    { mois: 'Jul', orgs: 41 },
    { mois: 'Aoû', orgs: 41 },
    { mois: 'Sep', orgs: 43 },
    { mois: 'Oct', orgs: 45 },
    { mois: 'Nov', orgs: 47 },
  ],
  usageSessions: [
    { semaine: 'S38', heures: 820  },
    { semaine: 'S39', heures: 895  },
    { semaine: 'S40', heures: 847  },
    { semaine: 'S41', heures: 936  },
    { semaine: 'S42', heures: 982  },
    { semaine: 'S43', heures: 1024 },
    { semaine: 'S44', heures: 1091 },
    { semaine: 'S45', heures: 1158 },
  ],
  repartitionPlans: [
    { plan: 'Découverte', orgs: 18, couleur: '#38BDF8' },
    { plan: 'Standard',   orgs: 22, couleur: '#6B4FE0' },
    { plan: 'Sur-mesure', orgs: 7,  couleur: '#E879F9' },
  ],
  tauxRenouvellement: 94,
  churn: 6,
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotifType = 'demande' | 'paiement' | 'anomalie' | 'info'

export interface AppNotification {
  id: string
  type: NotifType
  message: string
  horodatage: string
  lu: boolean
}

export const mockNotifications: AppNotification[] = [
  { id: 'n1', type: 'demande',  message: 'Nouvelle demande — Institut Catholique de Paris',      horodatage: 'il y a 2h', lu: false },
  { id: 'n2', type: 'paiement', message: 'Impayé détecté — Groupe DigitalEduc (30 jours)',       horodatage: 'il y a 5h', lu: false },
  { id: 'n3', type: 'anomalie', message: 'Session anormale — François Dupont (IP non reconnue)', horodatage: 'il y a 8h', lu: false },
  { id: 'n4', type: 'demande',  message: 'Nouvelle demande — Lycée Henri Bergson',               horodatage: 'hier',       lu: true  },
  { id: 'n5', type: 'info',     message: 'Export mensuel généré — 47 organisations',             horodatage: 'il y a 2j',  lu: true  },
  { id: 'n6', type: 'paiement', message: 'Facture FAC-2024-0043 envoyée à ESN Paris',            horodatage: 'il y a 3j',  lu: true  },
]
