import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  addDays,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { he } from 'date-fns/locale'

export {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  addDays,
  startOfDay,
  endOfDay,
  he,
}

export const HEBREW_DAYS_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy')
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm')
}

export function formatMonthYear(date: Date): string {
  return `${HEBREW_MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function getCalendarDays(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month))
  const monthEnd = endOfMonth(monthStart)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  return eachDayOfInterval({ start: calStart, end: calEnd })
}

export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function isOverdue(dueDate: string): boolean {
  return parseISO(dueDate) < startOfDay(new Date())
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
