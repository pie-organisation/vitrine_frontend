export type ColumnKey = "nom_complet_ecole" | "nom_classe" | "nom" | "prenom" | "email" | "mot_de_passe_temporaire" | "role";

export interface UserChoices {
  ecoles: string[];
  classes: string[];
  roles: string[];
}

export interface TemplateColumn {
  key: ColumnKey;
  header: string;
  width?: number;
  options?: string[]; // si présent → liste déroulante
}

export interface GenerateXlsxOptions {
  maxRows?: number;
}