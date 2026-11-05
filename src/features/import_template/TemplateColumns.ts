import type { TemplateColumn, UserChoices } from "./Types";

export const buildColumns = (userChoices: UserChoices): TemplateColumn[] => [
  {
    key: "nom_complet_ecole",
    header: "nom_complet_ecole",
    width: 20,
    options: userChoices.ecoles,
  },
  {
    key: "nom_classe",
    header: "nom_classe",
    width: 20,
    options: userChoices.classes,
  },
  { key: "nom", header: "nom", width: 25 },
  { key: "prenom", header: "prenom", width: 30 },
  { key: "email", header: "email", width: 30 },
  { key: "mot_de_passe_temporaire", header: "mot de passe temporaire", width: 30 },
  {
    key: "role",
    header: "role",
    width: 20,
    options: userChoices.roles,
  },
];