// Import d'élèves (repris de Site-Pie) : Excel (.xlsx/.xls) ou CSV/TSV, colonnes email, nom, prénom.
// En-têtes reconnus avec ou sans accents ; sans en-tête, l'ordre email | nom | prénom est supposé.

import type { MemberInput } from '../api/vdi'

function normHeader(h: string) {
  return h.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]/g, '')
}

function mapHeaders(headers: string[]) {
  const idx = { email: -1, nom: -1, prenom: -1 }
  headers.forEach((h, i) => {
    const n = normHeader(h)
    if (['email', 'mail', 'courriel', 'adresseemail', 'adressemail'].includes(n)) idx.email = i
    else if (['nom', 'lastname', 'name', 'familyname', 'nomdefamille'].includes(n)) idx.nom = i
    else if (['prenom', 'firstname', 'givenname', 'prenoms'].includes(n)) idx.prenom = i
  })
  return idx
}

function rowsToMembers(rows: string[][]): MemberInput[] {
  if (rows.length === 0) return []
  const idx = mapHeaders(rows[0] ?? [])
  const start = idx.email >= 0 ? 1 : 0
  const emailI = idx.email >= 0 ? idx.email : 0
  const nomI = idx.nom >= 0 ? idx.nom : 1
  const prenomI = idx.prenom >= 0 ? idx.prenom : 2
  const out: MemberInput[] = []
  for (let r = start; r < rows.length; r++) {
    const row = rows[r] ?? []
    const email = String(row[emailI] ?? '').trim()
    const nom = String(row[nomI] ?? '').trim()
    const prenom = String(row[prenomI] ?? '').trim()
    if (!email && !nom && !prenom) continue
    out.push({ email, nom, prenom })
  }
  return out
}

function parseCSV(text: string): string[][] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '')
  return lines.map((line) => {
    const cells: string[] = []
    let cur = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cur += '"'; i++ } else quoted = !quoted
        continue
      }
      if ((ch === ',' || ch === ';' || ch === '\t') && !quoted) { cells.push(cur); cur = ''; continue }
      cur += ch
    }
    cells.push(cur)
    return cells
  })
}

export async function parseMembersFile(file: File): Promise<MemberInput[]> {
  const name = file.name.toLowerCase()
  if (/\.(csv|tsv|txt)$/.test(name)) return rowsToMembers(parseCSV(await file.text()))
  if (/\.(xlsx|xls)$/.test(name)) {
    // Chargé à la demande : la lib n'alourdit pas le reste de l'application
    const XLSX = await import('xlsx')
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false })
    return rowsToMembers(rows.map((r) => (r ?? []).map((c) => String(c ?? ''))))
  }
  throw new Error('Formats acceptés : .xlsx, .xls, .csv')
}

export function parseMembersTextarea(text: string): MemberInput[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return []
  const rows = lines.map((l) => l.split(/[;,\t]/).map((c) => c.trim()))
  const looksHeader = (rows[0] ?? []).some((c) => /email|nom|prenom|mail/i.test(c))
  return rowsToMembers(looksHeader ? rows : [['email', 'nom', 'prenom'], ...rows])
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const invalidMembers = (members: MemberInput[]) => members.filter((m) => !EMAIL_RE.test(m.email))

/** Télécharge un CSV généré côté navigateur (UTF-8 avec BOM pour Excel). */
export function downloadCsv(filename: string, rows: string[][]) {
  const esc = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const csv = '﻿' + rows.map((r) => r.map(esc).join(';')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export const downloadTemplate = () =>
  downloadCsv('modele-groupe-cubi.csv', [['email', 'nom', 'prenom'], ['eleve1@ecole.fr', 'Dupont', 'Alice'], ['eleve2@ecole.fr', 'Martin', 'Bob']])
