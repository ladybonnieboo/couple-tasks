import { useState } from 'react'
import { useEvents } from '../../hooks/useEvents'
import { useAuthStore } from '../../stores/authStore'
import { format } from '../../lib/dates'
import type { CalendarEvent } from '../../types'

const BOTH = '__both__'

interface Props {
  event?: CalendarEvent
  defaultDate?: Date
  onDone: () => void
}

const EVENT_COLORS = [
  { hex: '#4f46e5', name: 'כחול' },
  { hex: '#e11d48', name: 'אדום' },
  { hex: '#059669', name: 'ירוק' },
  { hex: '#d97706', name: 'כתום' },
  { hex: '#7c3aed', name: 'סגול' },
  { hex: '#0284c7', name: 'תכלת' },
]

const REMINDERS = [
  { value: 0, label: 'ללא תזכורת' },
  { value: 15, label: '15 דקות לפני' },
  { value: 30, label: '30 דקות לפני' },
  { value: 60, label: 'שעה לפני' },
  { value: 1440, label: 'יום לפני' },
]

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

const WEEKDAYS = [
  { key: 'SU', label: 'א' },
  { key: 'MO', label: 'ב' },
  { key: 'TU', label: 'ג' },
  { key: 'WE', label: 'ד' },
  { key: 'TH', label: 'ה' },
  { key: 'FR', label: 'ו' },
  { key: 'SA', label: 'ש' },
]

function toLocalDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export default function EventForm({ event, defaultDate, onDone }: Props) {
  const { profile, partner } = useAuthStore()
  const { createEvent, updateEvent } = useEvents()

  const defaultD = defaultDate ?? new Date()
  const defaultDateStr = event
    ? event.start_datetime.split('T')[0]
    : toLocalDateStr(defaultD)

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [location, setLocation] = useState(event?.location ?? '')
  const [date, setDate] = useState(defaultDateStr)
  const [startTime, setStartTime] = useState(
    event ? format(new Date(event.start_datetime), 'HH:mm') : '09:00'
  )
  const [endTime, setEndTime] = useState(
    event ? format(new Date(event.end_datetime), 'HH:mm') : '10:00'
  )
  const [allDay, setAllDay] = useState(event?.all_day ?? false)
  const [assignedTo, setAssignedTo] = useState<string>(
    event?.assigned_to ?? BOTH
  )
  const [color, setColor] = useState(event?.color ?? '#4f46e5')
  const [reminder, setReminder] = useState<number>(event?.reminder_minutes ?? 0)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')
  const [customDays, setCustomDays] = useState<string[]>([])
  const [recurrenceEnd, setRecurrenceEnd] = useState(event?.recurrence_end_date ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buildRRule = (): string | undefined => {
    if (recurrenceType === 'none') return undefined
    if (recurrenceType === 'daily') return 'FREQ=DAILY'
    if (recurrenceType === 'weekly') return 'FREQ=WEEKLY'
    if (recurrenceType === 'monthly') return 'FREQ=MONTHLY'
    if (recurrenceType === 'yearly') return 'FREQ=YEARLY'
    if (recurrenceType === 'custom' && customDays.length > 0) {
      return `FREQ=WEEKLY;BYDAY=${customDays.join(',')}`
    }
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('כותרת נדרשת'); return }
    setLoading(true)
    setError('')

    const startDT = allDay ? `${date}T00:00:00` : `${date}T${startTime}:00`
    const endDT = allDay ? `${date}T23:59:59` : `${date}T${endTime}:00`

    const payload = {
      title: title.trim(),
      description: description || null,
      location: location || undefined,
      start_datetime: new Date(startDT).toISOString(),
      end_datetime: new Date(endDT).toISOString(),
      all_day: allDay,
      created_by: profile!.id,
      assigned_to: assignedTo === BOTH ? null : assignedTo,
      color,
      recurrence_rule: buildRRule(),
      recurrence_end_date: recurrenceEnd || undefined,
      reminder_minutes: reminder || undefined,
    }

    try {
      if (event) {
        await updateEvent(event.id, payload)
      } else {
        await createEvent(payload)
      }
      onDone()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5 pb-8">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">כותרת *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="שם האירוע"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-right"
          autoFocus
        />
      </div>

      {/* Assign to */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">מיועד ל</label>
        <div className="flex gap-2">
          {[
            { id: BOTH, name: 'שניהם' },
            { id: profile?.id ?? '', name: profile?.display_name ?? '' },
            ...(partner ? [{ id: partner.id, name: partner.display_name }] : []),
          ].filter((p) => p.id).map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setAssignedTo(p.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                assignedTo === p.id
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">תאריך</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          dir="ltr"
        />
      </div>

      {/* All day toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">כל היום</label>
        <button
          type="button"
          onClick={() => setAllDay((v) => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors ${allDay ? 'bg-primary-600' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${allDay ? 'left-6' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Times */}
      {!allDay && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שעת התחלה</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="ltr"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שעת סיום</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="ltr"
            />
          </div>
        </div>
      )}

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">📍 מיקום</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="כתובת או שם מקום"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-right"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="פרטים נוספים..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-right resize-none"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">צבע</label>
        <div className="flex gap-3">
          {EVENT_COLORS.map((c) => (
            <button
              type="button"
              key={c.hex}
              onClick={() => setColor(c.hex)}
              className={`w-9 h-9 rounded-full transition-all ${color === c.hex ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">חזרה</label>
        <select
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-right"
        >
          <option value="none">ללא</option>
          <option value="daily">כל יום</option>
          <option value="weekly">כל שבוע</option>
          <option value="monthly">כל חודש</option>
          <option value="yearly">כל שנה</option>
          <option value="custom">מותאם אישית</option>
        </select>

        {recurrenceType === 'custom' && (
          <div className="mt-2 flex gap-2">
            {WEEKDAYS.map((d) => (
              <button
                type="button"
                key={d.key}
                onClick={() => setCustomDays((prev) =>
                  prev.includes(d.key) ? prev.filter((x) => x !== d.key) : [...prev, d.key]
                )}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  customDays.includes(d.key) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {recurrenceType !== 'none' && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">תאריך סיום חזרה (אופציונלי)</label>
            <input
              type="date"
              value={recurrenceEnd}
              onChange={(e) => setRecurrenceEnd(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="ltr"
            />
          </div>
        )}
      </div>

      {/* Reminder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">🔔 תזכורת</label>
        <select
          value={reminder}
          onChange={(e) => setReminder(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-right"
        >
          {REMINDERS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white py-3.5 rounded-xl font-semibold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
        style={{ backgroundColor: color }}
      >
        {loading ? 'שומר...' : event ? 'שמור שינויים' : 'הוסף אירוע'}
      </button>
    </form>
  )
}
