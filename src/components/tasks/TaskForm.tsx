import { useState } from 'react'
import { format } from '../../lib/dates'
import { useTasks } from '../../hooks/useTasks'
import { useAuthStore } from '../../stores/authStore'
import type { Priority, Task } from '../../types'

const BOTH = '__both__'

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

interface Props {
  task?: Task
  defaultDate?: Date
  onDone: () => void
}

const priorities: { value: Priority; label: string; cls: string }[] = [
  { value: 'low',    label: 'נמוכה',   cls: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'medium', label: 'בינונית', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'high',   label: 'גבוהה',   cls: 'bg-red-100 text-red-700 border-red-200' },
]

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none',    label: 'ללא' },
  { value: 'daily',   label: 'כל יום' },
  { value: 'weekly',  label: 'כל שבוע' },
  { value: 'monthly', label: 'כל חודש' },
  { value: 'yearly',  label: 'כל שנה' },
]

function buildRRule(type: RecurrenceType): string | undefined {
  if (type === 'none') return undefined
  const freq = { daily: 'DAILY', weekly: 'WEEKLY', monthly: 'MONTHLY', yearly: 'YEARLY' }[type]
  return `FREQ=${freq}`
}

export default function TaskForm({ task, defaultDate, onDone }: Props) {
  const { profile, partner } = useAuthStore()
  const { createTask, updateTask } = useTasks()

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [assignedTo, setAssignedTo] = useState<string>(
    task !== undefined
      ? (task.assigned_to === null ? BOTH : task.assigned_to)
      : (profile?.id ?? '')
  )
  const [dueDate, setDueDate] = useState(
    task?.due_date ?? (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '')
  )
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [recurrenceEnd, setRecurrenceEnd] = useState(task?.recurrence_end_date ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('שם משימה נדרש'); return }
    setLoading(true)
    setError('')
    try {
      const payload = {
        title: title.trim(),
        description: description || undefined,
        assigned_to: assignedTo === BOTH ? null : assignedTo,
        due_date: dueDate || undefined,
        priority,
        recurrence_rule: buildRRule(recurrence),
        recurrence_end_date: recurrenceEnd || undefined,
      }
      if (task) {
        await updateTask(task.id, payload)
      } else {
        await createTask({ ...payload, created_by: profile!.id })
      }
      onDone()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    }
    setLoading(false)
  }

  const assignees = [
    { id: BOTH, name: 'שניהם' },
    { id: profile?.id ?? '', name: profile?.display_name ?? '' },
    ...(partner ? [{ id: partner.id, name: partner.display_name }] : []),
  ].filter((p) => p.id)

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5 pb-8">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">כותרת *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="מה צריך לעשות?"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-right"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="פרטים נוספים..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-right resize-none"
        />
      </div>

      {/* Assign to */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">מיועד ל</label>
        <div className="flex gap-2">
          {assignees.map((p) => (
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

      {/* Due date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">תאריך יעד</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-right"
          dir="ltr"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">עדיפות</label>
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button
              type="button"
              key={p.value}
              onClick={() => setPriority(p.value)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                priority === p.value ? p.cls + ' border-current' : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">חזרה</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-right"
        >
          {RECURRENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {recurrence !== 'none' && (
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

      {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60"
      >
        {loading ? 'שומר...' : task ? 'שמור שינויים' : 'הוסף משימה'}
      </button>
    </form>
  )
}
