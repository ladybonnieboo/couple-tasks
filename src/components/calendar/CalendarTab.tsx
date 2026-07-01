import { useState } from 'react'
import { addDays } from '../../lib/dates'
import { useTasks } from '../../hooks/useTasks'
import { useEvents } from '../../hooks/useEvents'
import MonthlyView from './MonthlyView'
import WeeklyView from './WeeklyView'
import FAB from '../shared/FAB'

type CalView = 'month' | 'week'

export default function CalendarTab() {
  const [view, setView] = useState<CalView>('month')
  const [weekDate, setWeekDate] = useState(new Date())
  const [fabDate, setFabDate] = useState<Date | undefined>()
  const { tasks } = useTasks()
  const { events } = useEvents()

  return (
    <div className="h-full flex flex-col bg-white">
      {/* View toggle */}
      <div className="px-4 pt-12 pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${view === 'month' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
            onClick={() => setView('month')}
          >
            חודשי
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${view === 'week' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}
            onClick={() => setView('week')}
          >
            שבועי
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'month' ? (
          <MonthlyView
            events={events}
            tasks={tasks}
            onDayPress={(d) => setFabDate(d)}
          />
        ) : (
          <WeeklyView
            events={events}
            tasks={tasks}
            weekDate={weekDate}
            onPrevWeek={() => setWeekDate((d) => addDays(d, -7))}
            onNextWeek={() => setWeekDate((d) => addDays(d, 7))}
          />
        )}
      </div>

      <FAB defaultDate={fabDate} />
    </div>
  )
}
