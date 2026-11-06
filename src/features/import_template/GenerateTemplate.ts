import type { GenerateXlsxOptions, TemplateColumn } from "./Types";

export async function generateXlsx(
  columns: TemplateColumn[],
  { maxRows = 500 }: GenerateXlsxOptions = {}
): Promise<Blob> {
  const { default: ExcelJS } = await import("exceljs"); // chargé à la demande

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Import");
  const ref = wb.addWorksheet("Referentiel");

  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 20,
  }));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  let refCol = 1;

  columns.forEach((c, i) => {
    ws.getColumn(i + 1).numFmt = "@"; // format texte

    if (!c.options?.length) return;

    const refColumn = ref.getColumn(refCol);
    refColumn.values = [c.header, ...c.options];
    const range = `Referentiel!$${refColumn.letter}$2:$${refColumn.letter}$${
      c.options.length + 1
    }`;
    refCol++;

    for (let r = 2; r <= maxRows; r++) {
      ws.getCell(r, i + 1).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [range],
        showErrorMessage: true,
        errorStyle: "stop",
        errorTitle: "Valeur invalide",
        error: "Veuillez choisir une valeur dans la liste.",
      };
    }
  });

  ref.state = "hidden";
  //ws.addRow({ nom: "Dupont", email: "dupont@exemple.fr" });
  console.log(columns.map((c) => ({ key: c.key, options: c.options })));

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function generateCsv(
  columns: TemplateColumn[],
  //exampleRow: Record<string, string> = {}
): Blob {
  const SEP = ";";
  const esc = (v: string = ""): string => `"${v.replace(/"/g, '""')}"`;

  const header = columns.map((c) => esc(c.header)).join(SEP);
  //const example = columns.map((c) => esc(exampleRow[c.key])).join(SEP);

  //return new Blob(["\uFEFF" + header + "\n" + example], {
  return new Blob(["\uFEFF" + header + "\n"], {
    type: "text/csv;charset=utf-8;",
  });
}