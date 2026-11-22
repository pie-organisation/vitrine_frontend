import { useState } from "react";
import { buildColumns } from "../features/import_template/TemplateColumns";
import { parseComptes } from "../features/import_template/ParseComptes";
import { processRows } from "../features/import_template/ProcessRows";
import { generateConflictsXlsx } from "../features/import_template/GenerateTemplate";
import { download } from "../features/import_template/Download";
import type { UserChoices } from "../features/import_template/Types";

export type Compte = Record<string, string>;

export function useImportUsers(userChoices: UserChoices) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // renvoie les comptes valides, ou null en cas d'erreur
  const readFile = async (file: File): Promise<Compte[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const columns = buildColumns(userChoices);
      const raw = await parseComptes(file);
      if (raw.length === 0) throw new Error("Le fichier est vide.");
      if (raw.length > 500) throw new Error("Maximum 500 lignes.");

      const { valid, conflicts } = processRows(raw, columns);

      if (conflicts.length > 0) {
        download(await generateConflictsXlsx(columns, conflicts), "utilisateurs_en_conflit.xlsx");
      }
      if (valid.length === 0) {
        throw new Error(`Aucun compte valide : ${conflicts.length} en conflit (le fichier récapitulatif a été téléchargé).`);
      }
      return valid;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Erreur lors de la lecture du fichier.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { readFile, loading, error };
}