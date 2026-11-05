import { useMemo, useState } from "react";
import { buildColumns } from "../../features/import_template/TemplateColumns";
import { generateCsv, generateXlsx } from "../../features/import_template/GenerateTemplate";
import type { UserChoices } from "../../features/import_template/Types";
import { download } from "../../features/import_template/Download";

interface TemplateDownloadProps {
  userChoices: UserChoices;
}

export default function TemplateDownload({ userChoices }: TemplateDownloadProps) {
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

  return (
    <div>
        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
            onClick={handleXlsx} disabled={loading}>
            {loading ? "Génération…" : "Télécharger en Excel"}
        </button>
        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
            onClick={handleCsv}>
            Télécharger en CSV
        </button>
    </div>
  );
}