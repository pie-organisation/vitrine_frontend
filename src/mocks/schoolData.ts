export type AccountType    = 'admin' | 'scolarite' | 'eleve'
export type InvoiceStatut  = 'presentee' | 'en_cours' | 'a_venir'
export type AccountStatut  = 'actif' | 'inactif'

export interface SchoolAccount {
  id: string
  type: AccountType
  nom: string
  prenom: string
  email: string
  licenceCubi: string
  statut: AccountStatut
  derniereConnexion: string
}

export interface SchoolInvoice {
  id: string
  reference: string
  date: string
  echeance: string
  montant: string
  statut: InvoiceStatut
}

export interface SchoolOrg {
  nom: string
  plan: string
  dateDebut: string
  dateExpiration: string
  montant: string
  nbLicences: number
  licencesUtilisees: number
}

export interface SchoolContact {
  nom: string
  prenom: string
  email: string
  boiteFacturation: string
  telephone: string
}

export interface SchoolActivity {
  id: string
  type: 'compte_cree' | 'compte_modifie' | 'compte_supprime' | 'connexion' | 'facture'
  description: string
  date: string
  actor?: string
}

export const mockSchoolOrg: SchoolOrg = {
  nom: 'Lycée Victor Hugo',
  plan: 'Licence Établissement',
  dateDebut: '01/09/2025',
  dateExpiration: '31/08/2026',
  montant: '249 €/mois',
  nbLicences: 50,
  licencesUtilisees: 46,
}

// Comble les champs pas encore alimentés par le backend (fin de contrat,
// quotas de licences) avec des valeurs de démonstration, sans écraser les
// vraies données quand elles existent.
export function withOrgMockFallbacks(org: SchoolOrg | null): SchoolOrg {
  if (!org) return mockSchoolOrg
  return {
    ...org,
    dateExpiration:    org.dateExpiration    || mockSchoolOrg.dateExpiration,
    nbLicences:        org.nbLicences        || mockSchoolOrg.nbLicences,
    licencesUtilisees: org.licencesUtilisees || mockSchoolOrg.licencesUtilisees,
  }
}

export const mockSchoolContact: SchoolContact = {
  nom: 'Dupont',
  prenom: 'Marie',
  email: 'marie.dupont@lycee-vhugo.fr',
  boiteFacturation: 'compta@lycee-vhugo.fr',
  telephone: '01 42 00 00 00',
}

// Nom/prénom/e-mail viennent du compte admin connecté (le référent par
// défaut) et sont réels dès qu'on est authentifié. La boîte de facturation
// et le téléphone ne sont pas encore forcément renseignés en base : on les
// mock tant qu'ils sont vides.
export function withContactMockFallbacks(contact: SchoolContact | null): SchoolContact {
  if (!contact) return mockSchoolContact
  return {
    ...contact,
    boiteFacturation: contact.boiteFacturation || mockSchoolContact.boiteFacturation,
    telephone:        contact.telephone        || mockSchoolContact.telephone,
  }
}

export const mockSchoolAccounts: SchoolAccount[] = [
  // Admins
  { id: 'a1', type: 'admin',     nom: 'Dupont',    prenom: 'Marie',    email: 'marie.dupont@lycee-vhugo.fr',     licenceCubi: 'CUBI-ADM-001', statut: 'actif',   derniereConnexion: 'Il y a 2h'       },
  { id: 'a2', type: 'admin',     nom: 'Moreau',    prenom: 'Jean',     email: 'jean.moreau@lycee-vhugo.fr',      licenceCubi: 'CUBI-ADM-002', statut: 'actif',   derniereConnexion: 'Hier'             },
  // Scolarité
  { id: 's1', type: 'scolarite', nom: 'Leroy',     prenom: 'Claire',   email: 'claire.leroy@lycee-vhugo.fr',     licenceCubi: 'CUBI-SCO-001', statut: 'actif',   derniereConnexion: 'Il y a 1h'       },
  { id: 's2', type: 'scolarite', nom: 'Bernard',   prenom: 'Thomas',   email: 'thomas.bernard@lycee-vhugo.fr',   licenceCubi: 'CUBI-SCO-002', statut: 'inactif', derniereConnexion: 'Il y a 14 jours' },
  { id: 's3', type: 'scolarite', nom: 'Petit',     prenom: 'Isabelle', email: 'isabelle.petit@lycee-vhugo.fr',   licenceCubi: 'CUBI-SCO-003', statut: 'actif',   derniereConnexion: 'Il y a 3 jours'  },
  // Élèves
  { id: 'e1',  type: 'eleve', nom: 'Martin',   prenom: 'Lucas',   email: 'lucas.martin@eleves-vhugo.fr',    licenceCubi: 'CUBI-ELV-001', statut: 'actif',   derniereConnexion: 'Il y a 30 min'   },
  { id: 'e2',  type: 'eleve', nom: 'Dubois',   prenom: 'Emma',    email: 'emma.dubois@eleves-vhugo.fr',     licenceCubi: 'CUBI-ELV-002', statut: 'actif',   derniereConnexion: 'Il y a 1h'       },
  { id: 'e3',  type: 'eleve', nom: 'Simon',    prenom: 'Nathan',  email: 'nathan.simon@eleves-vhugo.fr',    licenceCubi: 'CUBI-ELV-003', statut: 'actif',   derniereConnexion: 'Hier'             },
  { id: 'e4',  type: 'eleve', nom: 'Michel',   prenom: 'Léa',     email: 'lea.michel@eleves-vhugo.fr',      licenceCubi: 'CUBI-ELV-004', statut: 'actif',   derniereConnexion: 'Il y a 2 jours'  },
  { id: 'e5',  type: 'eleve', nom: 'Lefebvre', prenom: 'Hugo',    email: 'hugo.lefebvre@eleves-vhugo.fr',   licenceCubi: 'CUBI-ELV-005', statut: 'inactif', derniereConnexion: 'Il y a 21 jours' },
  { id: 'e6',  type: 'eleve', nom: 'Lefevre',  prenom: 'Zoé',     email: 'zoe.lefevre@eleves-vhugo.fr',     licenceCubi: 'CUBI-ELV-006', statut: 'actif',   derniereConnexion: 'Hier'             },
  { id: 'e7',  type: 'eleve', nom: 'Roux',     prenom: 'Antoine', email: 'antoine.roux@eleves-vhugo.fr',    licenceCubi: 'CUBI-ELV-007', statut: 'actif',   derniereConnexion: 'Il y a 4 jours'  },
  { id: 'e8',  type: 'eleve', nom: 'David',    prenom: 'Chloé',   email: 'chloe.david@eleves-vhugo.fr',     licenceCubi: 'CUBI-ELV-008', statut: 'inactif', derniereConnexion: 'Il y a 30 jours' },
  { id: 'e9',  type: 'eleve', nom: 'Bertrand', prenom: 'Louis',   email: 'louis.bertrand@eleves-vhugo.fr',  licenceCubi: 'CUBI-ELV-009', statut: 'actif',   derniereConnexion: 'Hier'             },
  { id: 'e10', type: 'eleve', nom: 'Morel',    prenom: 'Inès',    email: 'ines.morel@eleves-vhugo.fr',      licenceCubi: 'CUBI-ELV-010', statut: 'actif',   derniereConnexion: 'Il y a 5 jours'  },
  { id: 'e11', type: 'eleve', nom: 'Fournier', prenom: 'Maxime',  email: 'maxime.fournier@eleves-vhugo.fr', licenceCubi: 'CUBI-ELV-011', statut: 'actif',   derniereConnexion: 'Il y a 2h'       },
  { id: 'e12', type: 'eleve', nom: 'Girard',   prenom: 'Camille', email: 'camille.girard@eleves-vhugo.fr',  licenceCubi: 'CUBI-ELV-012', statut: 'actif',   derniereConnexion: 'Il y a 1 jour'   },
]

export const mockSchoolFactures: SchoolInvoice[] = [
  { id: 'f1', reference: 'FACT-2025-009', date: '01/09/2025', echeance: '15/09/2025', montant: '249 €', statut: 'presentee' },
  { id: 'f2', reference: 'FACT-2025-010', date: '01/10/2025', echeance: '15/10/2025', montant: '249 €', statut: 'presentee' },
  { id: 'f3', reference: 'FACT-2025-011', date: '01/11/2025', echeance: '15/11/2025', montant: '249 €', statut: 'presentee' },
  { id: 'f4', reference: 'FACT-2026-001', date: '01/01/2026', echeance: '15/01/2026', montant: '249 €', statut: 'presentee' },
  { id: 'f5', reference: 'FACT-2026-002', date: '01/02/2026', echeance: '15/02/2026', montant: '249 €', statut: 'en_cours'  },
  { id: 'f6', reference: 'FACT-2026-007', date: '01/07/2026', echeance: '15/07/2026', montant: '249 €', statut: 'a_venir'  },
  { id: 'f7', reference: 'FACT-2026-008', date: '01/08/2026', echeance: '15/08/2026', montant: '249 €', statut: 'a_venir'  },
]

export const mockSchoolActivity: SchoolActivity[] = [
  { id: 'act1', type: 'compte_cree',    description: '3 nouveaux comptes élèves créés via import',      date: 'Il y a 1h',       actor: 'Marie Dupont'  },
  { id: 'act2', type: 'connexion',      description: 'Lucas Martin s\'est connecté',                    date: 'Il y a 1h30'                             },
  { id: 'act3', type: 'facture',        description: 'Facture FACT-2026-002 disponible',                date: 'Hier'                                    },
  { id: 'act4', type: 'compte_modifie', description: 'Rôle de Thomas Bernard modifié → Inactif',        date: 'Hier',            actor: 'Jean Moreau'   },
  { id: 'act5', type: 'connexion',      description: 'Emma Dubois s\'est connectée',                    date: 'Il y a 2 jours'                          },
  { id: 'act6', type: 'compte_cree',    description: 'Compte admin Moreau Jean créé',                   date: 'Il y a 3 jours',  actor: 'Marie Dupont'  },
  { id: 'act7', type: 'compte_supprime',description: 'Compte élève Blanc Théo supprimé',                date: 'Il y a 5 jours',  actor: 'Claire Leroy'  },
]
