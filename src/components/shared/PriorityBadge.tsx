import type { Priority } from '../../types'

const MAP: Record<Priority, { label: string; cls: string }> = {
  low:    { label: 'נמוכה', cls: 'bg-green-100 text-green-700' },
  medium: { label: 'בינונית', cls: 'bg-amber-100 text-amber-700' },
  high:   { label: 'גבוהה', cls: 'bg-red-100 text-red-700' },
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, cls } = MAP[priority]
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}
