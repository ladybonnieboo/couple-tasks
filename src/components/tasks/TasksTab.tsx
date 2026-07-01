import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from '../../hooks/useTasks'
import { useAuthStore } from '../../stores/authStore'
import TaskCard from './TaskCard'
import FAB from '../shared/FAB'
import { parseISO } from '../../lib/dates'

type Filter = 'all' | 'mine' | 'partner'

export default function TasksTab() {
  const navigate = useNavigate()
  const { profile, partner } = useAuthStore()
  const { tasks, toggleDone, deleteTask } = useTasks()
  const [filter, setFilter] = useState<Filter>('all')
  const [showCompleted, setShowCompleted] = useState(false)

  const openTasks = tasks.filter((t) => !t.is_done)
  const doneTasks = tasks.filter((t) => t.is_done)

  const filtered = openTasks.filter((t) => {
    if (filter === 'mine') return t.assigned_to === profile?.id || t.assigned_to === null
    if (filter === 'partner') return t.assigned_to === partner?.id || t.assigned_to === null
    return true
  }).sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime()
  })

  const filterChips: { id: Filter; label: string }[] = [
    { id: 'all', label: 'הכל' },
    { id: 'mine', label: `שלי (${openTasks.filter((t) => t.assigned_to === profile?.id || t.assigned_to === null).length})` },
    { id: 'partner', label: `של ${partner?.display_name ?? 'שותף'} (${openTasks.filter((t) => t.assigned_to === partner?.id || t.assigned_to === null).length})` },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900 mb-3">משימות</h1>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === chip.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 pb-24 space-y-2">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <span className="text-4xl mb-3">✅</span>
              <p className="text-gray-500 font-medium">אין משימות פתוחות</p>
              <p className="text-gray-400 text-sm mt-1">לחץ + כדי להוסיף משימה חדשה</p>
            </motion.div>
          )}

          {filtered.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              layout
            >
              <TaskCard
                task={task}
                onTap={() => navigate(`/tasks/${task.id}`)}
                onToggle={() => toggleDone(task)}
                onDelete={() => deleteTask(task.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Completed tasks */}
        {doneTasks.length > 0 && (
          <div className="mt-4">
            <button
              className="flex items-center gap-2 w-full text-sm font-semibold text-gray-500 py-2"
              onClick={() => setShowCompleted((v) => !v)}
            >
              <motion.span animate={{ rotate: showCompleted ? 90 : 0 }} transition={{ duration: 0.2 }}>
                ›
              </motion.span>
              הושלמו ({doneTasks.length})
            </button>

            <AnimatePresence>
              {showCompleted && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {doneTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTap={() => navigate(`/tasks/${task.id}`)}
                      onToggle={() => toggleDone(task)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FAB />
    </div>
  )
}
