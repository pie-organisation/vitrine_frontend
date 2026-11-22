import type { TemplateColumn } from "./Types";
import { capitalize, normalizeEmail, EMAIL_RE } from "./Normalize";

export type Row = Record<string, string>;
export interface ConflictRow { row: Row; reason: string; line: number }

export function processRows(rawRows: Row[], columns: TemplateColumn[]) {
  const valid: Row[] = [];
  const conflicts: ConflictRow[] = [];
  const seenEmails = new Set<string>();

  rawRows.forEach((raw, idx) => {
    const line = idx + 2; // ligne Excel (1 = en-têtes)
    const row: Row = {};

    // 1. normalisation + champs vides
    for (const c of columns) {
      let v = (raw[c.key] ?? "").trim();
      if (c.key === "nom" || c.key === "prenom") v = capitalize(v);
      if (c.key === "email") v = normalizeEmail(v);
      row[c.key] = v;
    }

    const empty = columns.filter((c) => !row[c.key]).map((c) => c.header);
    if (empty.length) {
      return conflicts.push({ row, line, reason: `Champ(s) vide(s) : ${empty.join(", ")}` });
    }

    // 2. valeurs des listes (le collage contourne la validation Excel)
    for (const c of columns) {
      if (!c.options?.length) continue;
      const match = c.options.find((o) => o.toLowerCase() === row[c.key].toLowerCase());
      if (!match) {
        return conflicts.push({ row, line, reason: `Valeur invalide pour ${c.header}` });
      }
      row[c.key] = match; // remet la casse exacte de l'option
    }

    // 3. format email
    if (!EMAIL_RE.test(row.email)) {
      return conflicts.push({ row, line, reason: "Format d'email invalide" });
    }

    // 4. doublon dans le fichier : la 1re occurrence est gardée
    if (seenEmails.has(row.email)) {
      return conflicts.push({ row, line, reason: "Email en doublon dans le fichier" });
    }
    seenEmails.add(row.email);
    valid.push(row);
  });

  return { valid, conflicts };
}