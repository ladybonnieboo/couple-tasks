import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  getCalendarDays, formatMonthYear, isSameDay, isToday, parseISO,
  HEBREW_DAYS_SHORT, startOfMonth, endOfMonth,
} from '../../lib/dates'
import type { CalendarEvent, Task } from '../../types'
import BottomSheet from '../shared/BottomSheet'
import { formatTime } from '../../lib/dates'
import { useNavigate } from 'react-router-dom'
import EventForm from '../events/EventForm'
import TaskForm from '../tasks/TaskForm'

interface Props {
  events: CalendarEvent[]
  tasks: Task[]
  onDayPress?: (date: Date) => void
}

function isInMonth(date: Date, year: number, month: number) {
  return date.getMonth() === month && date.getFullYear() === year
}

export default function MonthlyView({ events, tasks, onDayPress }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(today)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showAddPicker, setShowAddPicker] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [createDate, setCreateDate] = useState<Date | null>(null)
  const navigate = useNavigate()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = getCalendarDays(year, month)

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const dayEvents = (day: Date) =>
    events.filter((e) => {
      try { return isSameDay(parseISO(e.start_datetime), day) } catch { return false }
    })

  const dayTasks = (day: Date) =>
    tasks.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), day))

  const selectedDayEvents = selectedDay ? dayEvents(selectedDay) : []
  const selectedDayTasks = selectedDay ? dayTasks(selectedDay) : []

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* Month header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          <span className="text-base font-bold text-gray-900">{formatMonthYear(viewDate)}</span>
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-2">
          {HEBREW_DAYS_SHORT.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-2 gap-y-1">
          {days.map((day, idx) => {
            const inMonth = isInMonth(day, year, month)
            const isTodayDay = isToday(day)
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
            const evts = dayEvents(day)
            const tsks = dayTasks(day)
            const hasItems = evts.length > 0 || tsks.length > 0

            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedDay(day)
                  onDayPress?.(day)
                }}
                className={`relative flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                  isSelected ? 'bg-primary-600' :
                  isTodayDay ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`text-sm font-medium ${
                  !inMonth ? 'text-gray-300' :
                  isSelected ? 'text-white' :
                  isTodayDay ? 'text-primary-600' : 'text-gray-800'
                }`}>
                  {day.getDate()}
                </span>

                {hasItems && inMonth && (
                  <div className="w-full px-0.5 mt-0.5 flex flex-col gap-px">
                    {[
                      ...evts.map((e) => ({ label: e.title, color: e.color ?? '#4f46e5' })),
                      ...tsks.map((t) => ({ label: t.title, color: '#9ca3af' })),
                    ]
                      .slice(0, 2)
                      .map((item, i) => (
                        <div
                          key={i}
                          className={`w-full truncate rounded px-0.5 text-[9px] leading-tight font-medium text-white ${isSelected ? 'bg-white/20' : ''}`}
                          style={{ backgroundColor: isSelected ? undefined : item.color }}
                        >
                          {item.label}
                        </div>
                      ))}
                    {(evts.length + tsks.length) > 2 && (
                      <div className={`text-[9px] text-center font-medium ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                        +{evts.length + tsks.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Day detail bottom sheet */}
      <BottomSheet
        open={!!selectedDay}
        onClose={() => { setSelectedDay(null); setShowAddPicker(false) }}
        title={selectedDay ? new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDay) : ''}
      >
        <div className="px-4 py-2 pb-8 space-y-4">
          {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">אין אירועים ביום זה</p>
          )}

          {selectedDayEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">אירועים</h3>
              <div className="space-y-2">
                {selectedDayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white active:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedDay(null); navigate(`/events/${e.id}`) }}
                  >
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: e.color ?? '#4f46e5' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{e.title}</p>
                      {!e.all_day && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatTime(e.start_datetime)} – {formatTime(e.end_datetime)}</p>
                      )}
                      {e.location && <p className="text-xs text-gray-400 truncate">📍 {e.location}</p>}
                    </div>
                    {e.assigned_to === null || e.assigned_to === undefined ? (
                      <span className="text-xs text-gray-400 flex-shrink-0 self-start mt-0.5">שניהם</span>
                    ) : e.assignee ? (
                      <div className="flex items-center gap-1 flex-shrink-0 self-start mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {e.assignee.display_name[0]}
                        </div>
                        <span className="text-xs text-gray-400">{e.assignee.display_name}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDayTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">משימות</h3>
              <div className="space-y-2">
                {selectedDayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white active:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedDay(null); navigate(`/tasks/${t.id}`) }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${t.is_done ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`} />
                    <p className={`flex-1 text-sm font-medium ${t.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.title}</p>
                    {t.assigned_to === null ? (
                      <span className="text-xs text-gray-400 flex-shrink-0">שניהם</span>
                    ) : t.assignee ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {t.assignee.display_name[0]}
                        </div>
                        <span className="text-xs text-gray-400">{t.assignee.display_name}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add task / event for this day */}
          {!showAddPicker ? (
            <button
              className="w-full mt-2 py-3 rounded-xl border-2 border-dashed border-primary-300 text-primary-600 text-sm font-medium flex items-center justify-center gap-2 active:bg-primary-50"
              onClick={() => { setCreateDate(selectedDay); setShowAddPicker(true) }}
            >
              <span className="text-lg leading-none">+</span> הוסף אירוע / משימה
            </button>
          ) : (
            <div className="flex gap-3 mt-2">
              <button
                className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold active:bg-primary-700"
                onClick={() => { setSelectedDay(null); setShowAddPicker(false); setShowEventForm(true) }}
              >
                אירוע
              </button>
              <button
                className="flex-1 py-3 rounded-xl border-2 border-primary-600 text-primary-600 text-sm font-semibold active:bg-primary-50"
                onClick={() => { setSelectedDay(null); setShowAddPicker(false); setShowTaskForm(true) }}
              >
                משימה
              </button>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Event creation form for selected day */}
      <BottomSheet open={showEventForm} onClose={() => setShowEventForm(false)} title="אירוע חדש" fullHeight>
        <EventForm defaultDate={createDate ?? undefined} onDone={() => setShowEventForm(false)} />
      </BottomSheet>

      {/* Task creation form for selected day */}
      <BottomSheet open={showTaskForm} onClose={() => setShowTaskForm(false)} title="משימה חדשה" fullHeight>
        <TaskForm defaultDate={createDate ?? undefined} onDone={() => setShowTaskForm(false)} />
      </BottomSheet>
    </>
  )
}
