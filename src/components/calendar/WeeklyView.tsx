import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWeekDays, isSameDay, isToday, parseISO, HEBREW_DAYS_SHORT, formatTime } from '../../lib/dates'
import type { CalendarEvent, Task } from '../../types'

const HOUR_HEIGHT = 56
const START_HOUR = 7
const END_HOUR = 23
const TOTAL_HOURS = END_HOUR - START_HOUR

interface Props {
  events: CalendarEvent[]
  tasks: Task[]
  weekDate: Date
  onPrevWeek: () => void
  onNextWeek: () => void
}

function timeToMinutes(dateStr: string): number {
  const d = parseISO(dateStr)
  return d.getHours() * 60 + d.getMinutes()
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const navigate = useNavigate()
  const startMin = Math.max(timeToMinutes(event.start_datetime), START_HOUR * 60)
  const endMin = Math.min(timeToMinutes(event.end_datetime), END_HOUR * 60)
  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20)
  const color = event.color ?? '#4f46e5'

  return (
    <div
      className="absolute left-0.5 right-0.5 rounded-lg px-1 py-0.5 overflow-hidden cursor-pointer shadow-sm"
      style={{ top: `${top}px`, height: `${height}px`, backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <p className="text-xs font-semibold leading-tight truncate" style={{ color }}>
        {event.title}
      </p>
      {height > 30 && (
        <p className="text-xs leading-tight" style={{ color: color + 'aa' }}>
          {formatTime(event.start_datetime)}
        </p>
      )}
    </div>
  )
}

export default function WeeklyView({ events, tasks: _tasks, weekDate, onPrevWeek, onNextWeek }: Props) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const days = getWeekDays(weekDate)

  // Default selected day to today if in this week, otherwise first day of week
  const [selectedDay, setSelectedDay] = useState<Date>(
    days.find((d) => isToday(d)) ?? days[0]
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = HOUR_HEIGHT * (8 - START_HOUR)
    }
  }, [])

  // Keep selected day in sync when the week changes
  useEffect(() => {
    const stillInWeek = days.find((d) => isSameDay(d, selectedDay))
    if (!stillInWeek) {
      setSelectedDay(days.find((d) => isToday(d)) ?? days[0])
    }
  }, [weekDate])

  const allDayEvents = events.filter((e) => e.all_day && days.some((d) => isSameDay(parseISO(e.start_datetime), d)))

  const weekLabel = (() => {
    const first = days[0]
    const last = days[6]
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}–${last.getDate()} ${new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(last)}`
    }
    return `${new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(first)} – ${new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }).format(last)}`
  })()

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <button onClick={onNextWeek} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">{weekLabel}</span>
        <button onClick={onPrevWeek} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="flex border-b border-gray-100 flex-shrink-0">
        <div className="w-10 flex-shrink-0" />
        {days.map((day, i) => {
          const today = isToday(day)
          const selected = isSameDay(day, selectedDay)
          return (
            <button
              key={i}
              className="flex-1 flex flex-col items-center py-2 active:bg-gray-50"
              onClick={() => setSelectedDay(day)}
            >
              <span className={`text-xs ${selected ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
                {HEBREW_DAYS_SHORT[i]}
              </span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                today ? 'bg-primary-600' : selected ? 'bg-primary-100' : ''
              }`}>
                <span className={`text-sm font-semibold ${
                  today ? 'text-white' : selected ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {day.getDate()}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-gray-100 flex-shrink-0 min-h-8">
          <div className="w-10 flex-shrink-0 flex items-center justify-center">
            <span className="text-xs text-gray-400">כ״י</span>
          </div>
          <div className="flex-1 flex relative py-1 gap-0.5">
            {days.map((day, di) => (
              <div key={di} className="flex-1 relative px-0.5">
                {allDayEvents
                  .filter((e) => isSameDay(parseISO(e.start_datetime), day))
                  .map((e) => (
                    <div
                      key={e.id}
                      className="text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer mb-0.5"
                      style={{ backgroundColor: e.color ?? '#4f46e5' }}
                      onClick={() => navigate(`/events/${e.id}`)}
                    >
                      {e.title}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
          {/* Time labels */}
          <div className="w-10 flex-shrink-0 relative">
            {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
              <div
                key={i}
                className="absolute text-xs text-gray-400 leading-none"
                style={{ top: `${i * HOUR_HEIGHT - 6}px`, right: '4px' }}
              >
                {(START_HOUR + i).toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Hour lines + day columns */}
          <div className="flex-1 relative">
            {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ top: `${i * HOUR_HEIGHT}px` }}
              />
            ))}

            <div className="absolute inset-0 flex">
              {days.map((day, di) => {
                const dayEvts = events.filter(
                  (e) => !e.all_day && isSameDay(parseISO(e.start_datetime), day)
                )
                const todayLine = isToday(day)
                const selected = isSameDay(day, selectedDay)
                const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
                const nowTop = ((nowMin - START_HOUR * 60) / 60) * HOUR_HEIGHT

                return (
                  <div
                    key={di}
                    className={`flex-1 relative border-r border-gray-50 last:border-r-0 ${selected ? 'bg-primary-50/60' : ''}`}
                  >
                    {todayLine && nowTop > 0 && nowTop < TOTAL_HOURS * HOUR_HEIGHT && (
                      <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: `${nowTop}px` }}>
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        <div className="flex-1 h-px bg-red-400" />
                      </div>
                    )}
                    {dayEvts.map((e) => (
                      <EventBlock key={e.id} event={e} />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
