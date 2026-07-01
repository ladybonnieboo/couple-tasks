import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { formatDate, isOverdue } from '../../lib/dates'
import PriorityBadge from '../shared/PriorityBadge'
import type { Task } from '../../types'

interface Props {
  task: Task
  onTap: () => void
  onToggle: () => void
  onDelete?: () => void
}

export default function TaskCard({ task, onTap, onToggle, onDelete }: Props) {
  const overdue = task.due_date && !task.is_done && isOverdue(task.due_date)
  const x = useMotionValue(0)
  const background = useTransform(x, [0, 60], ['#f9fafb', '#d1fae5'])
  const [swiped, setSwiped] = useState(false)

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 80 && !task.is_done) {
      animate(x, 300, { duration: 0.2, onComplete: () => { setSwiped(true); onToggle() } })
    } else {
      animate(x, 0, { duration: 0.2 })
    }
  }

  if (swiped && task.is_done) return null

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe background */}
      <motion.div
        className="absolute inset-0 rounded-2xl flex items-center px-5"
        style={{ background }}
      >
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </motion.div>

      <motion.div
        className={`relative bg-white border rounded-2xl px-4 py-3 cursor-pointer ${overdue ? 'border-red-200' : 'border-gray-100'}`}
        drag="x"
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={onTap}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start gap-3">
          <button
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${task.is_done ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}
            onClick={(e) => { e.stopPropagation(); onToggle() }}
          >
            {task.is_done && (
              <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path d="M5 13l4 4L19 7"/>
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-medium ${task.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.title}
              </p>
              <PriorityBadge priority={task.priority} />
            </div>

            {task.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-3 mt-1.5">
              {task.assignee && (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                    {task.assignee.display_name[0]}
                  </div>
                  <span className="text-xs text-gray-500">{task.assignee.display_name}</span>
                </div>
              )}
              {task.due_date && (
                <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {overdue ? '⚠ ' : '📅 '}{formatDate(task.due_date)}
                </span>
              )}
              {(task.comment_count ?? 0) > 0 && (
                <span className="text-xs text-gray-400">💬 {task.comment_count}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
