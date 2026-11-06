import { useMemo, useState } from "react";
import { buildColumns } from "../features/import_template/TemplateColumns";
import { generateCsv, generateXlsx } from "../features/import_template/GenerateTemplate";
import type { UserChoices } from "../features/import_template/Types";
import { download } from "../features/import_template/Download";

export function useTemplateDownload(userChoices: UserChoices) {
  const [loading, setLoading] = useState<boolean>(false);
  const columns = useMemo(() => buildColumns(userChoices), [userChoices]);

  const handleXlsx = async (): Promise<void> => {
    setLoading(true);
    try {
      download(await generateXlsx(columns), "template-import-CUBI.xlsx");
    } finally {
      setLoading(false);
    }
  };

  const handleCsv = (): void =>
    //download(generateCsv(columns, { nom: "Dupont" }), "template-import.csv");
    download(generateCsv(columns), "template-import-CUBI.csv");

  return { handleXlsx, handleCsv, loading };
}