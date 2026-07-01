import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../../hooks/useTasks'
import { useEvents } from '../../hooks/useEvents'
import { useAuthStore } from '../../stores/authStore'
import { formatDate, formatTime, isToday, parseISO, isSameDay, startOfDay, isOverdue } from '../../lib/dates'
import PriorityBadge from '../shared/PriorityBadge'
import FAB from '../shared/FAB'
import type { Task, CalendarEvent } from '../../types'

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
  return (
    <div className={`${sz} rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {name[0]}
    </div>
  )
}

function TaskRow({ task, onTap }: { task: Task; onTap: () => void }) {
  const overdue = task.due_date && !task.is_done && isOverdue(task.due_date)
  return (
    <div
      className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl border border-gray-100 active:bg-gray-50 cursor-pointer"
      onClick={onTap}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${task.is_done ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
        {task.is_done && <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
        {task.due_date && (
          <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
            {overdue ? 'באיחור · ' : ''}{formatDate(task.due_date)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.assignee && <Avatar name={task.assignee.display_name} />}
      </div>
    </div>
  )
}

function EventRow({ event, onTap }: { event: CalendarEvent; onTap: () => void }) {
  return (
    <div
      className="flex items-start gap-3 py-3 px-4 bg-white rounded-xl border border-gray-100 cursor-pointer active:bg-gray-50"
      onClick={onTap}
    >
      <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: event.color ?? '#4f46e5' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
        {!event.all_day ? (
          <p className="text-xs text-gray-400 mt-0.5">
            {formatTime(event.start_datetime)} – {formatTime(event.end_datetime)}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">כל היום</p>
        )}
        {event.location && <p className="text-xs text-gray-400 truncate">📍 {event.location}</p>}
      </div>
    </div>
  )
}

export default function HomeTab() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { tasks } = useTasks()
  const { events } = useEvents()

  const today = new Date()
  const todayEvents = events.filter((e) => {
    try { return isSameDay(parseISO(e.start_datetime), today) } catch { return false }
  })
  const todayTasks = tasks.filter((t) => !t.is_done && t.due_date && isSameDay(parseISO(t.due_date), today))
  const overdueTasks = tasks.filter((t) => !t.is_done && t.due_date && isOverdue(t.due_date))

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'בוקר טוב' : now.getHours() < 17 ? 'צהריים טובים' : 'ערב טוב'

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 px-5 pt-12 pb-8 text-white">
        <p className="text-primary-200 text-sm">{greeting}</p>
        <h1 className="text-2xl font-bold mt-0.5">{profile?.display_name ?? 'שלום'} 👋</h1>
        <p className="text-primary-200 text-sm mt-1">
          {new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)}
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-24">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'אירועים היום', value: todayEvents.length, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'משימות היום', value: todayTasks.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'באיחור', value: overdueTasks.length, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Today's events */}
        {todayEvents.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">אירועים היום</h2>
            <div className="space-y-2">
              {todayEvents.map((e) => <EventRow key={e.id} event={e} onTap={() => navigate(`/events/${e.id}`)} />)}
            </div>
          </section>
        )}

        {/* Tasks today */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">משימות היום</h2>
          {todayTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
              אין משימות להיום 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((t) => (
                <TaskRow key={t.id} task={t} onTap={() => navigate(`/tasks/${t.id}`)} />
              ))}
            </div>
          )}
        </section>

      </div>

      <FAB />
    </div>
  )
}
