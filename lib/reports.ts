export interface DateRange {
  start: string // ISO YYYY-MM-DD
  end: string   // ISO YYYY-MM-DD
}

function parse(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fmt(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// Semana de segunda a domingo que contém `todayISO`
export function weekRange(todayISO: string): DateRange {
  const d = parse(todayISO)
  const day = d.getUTCDay() // 0=domingo ... 6=sábado
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(d)
  start.setUTCDate(d.getUTCDate() + diffToMonday)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  return { start: fmt(start), end: fmt(end) }
}

// Primeiro ao último dia do mês de `todayISO`
export function monthRange(todayISO: string): DateRange {
  const d = parse(todayISO)
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
  return { start: fmt(start), end: fmt(end) }
}

export function inRange(dateISO: string, range: DateRange): boolean {
  const d = dateISO.slice(0, 10)
  return d >= range.start && d <= range.end
}
