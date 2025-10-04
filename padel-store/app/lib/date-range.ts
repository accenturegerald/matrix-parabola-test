export type RangeKey = 'today' | 'week' | 'month'

export function getRange(key: RangeKey): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  switch (key) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'week': {
      const start = new Date(now)
      const day = start.getDay() // 0 Sun..6 Sat
      const diffToMonday = (day + 6) % 7
      start.setDate(start.getDate() - diffToMonday)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'month':
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end }
    }
  }
}

export function getPreviousRange(key: RangeKey): { start: Date; end: Date } {
  const now = new Date()
  switch (key) {
    case 'today': {
      const end = new Date(now)
      end.setDate(end.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      const start = new Date(end)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'week': {
      const current = getRange('week')
      const end = new Date(current.start)
      end.setMilliseconds(-1)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'month':
    default: {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
  }
}
