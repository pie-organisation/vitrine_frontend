import type { TemplateColumn, UserChoices } from "./Types";

export const buildColumns = (userChoices: UserChoices): TemplateColumn[] => [
  { key: "nom", header: "NOM", width: 25 },
  { key: "prenom", header: "PRENOM", width: 30 },
  { key: "email", header: "EMAIL", width: 30 },
  { key: "mot_de_passe_temporaire", header: "MOT DE PASSE TEMPORAIRE", width: 30 },
  {
    key: "role",
    header: "ROLE",
    width: 20,
    options: userChoices.roles,
  },
];