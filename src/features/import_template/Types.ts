export type ColumnKey = "nom" | "prenom" | "email" | "mot_de_passe_temporaire" | "role";

export interface UserChoices {
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