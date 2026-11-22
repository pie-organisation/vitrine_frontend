import * as XLSX from 'xlsx'

export async function parseComptes(file: File): Promise<Record<string, string>[]> {
  const isCsv = file.name.toLowerCase().endsWith('.csv')

  const wb = isCsv
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' })

  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    blankrows: false,
  })

  const normalize = (k: string) =>
  k.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

  return rows
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [normalize(k), String(v ?? '').trim()])
      )
    )
    .filter((row) => Object.values(row).some((v) => v !== ''))
}