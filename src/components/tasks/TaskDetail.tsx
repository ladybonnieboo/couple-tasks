import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTasks } from '../../hooks/useTasks'
import { useAuthStore } from '../../stores/authStore'
import { sendNudge } from '../../hooks/usePush'
import { formatDate, formatDateTime } from '../../lib/dates'
import PriorityBadge from '../shared/PriorityBadge'
import Comments from '../comments/Comments'
import BottomSheet from '../shared/BottomSheet'
import TaskForm from './TaskForm'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks, toggleDone, deleteTask } = useTasks()
  const { profile, partner } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)
  const [nudging, setNudging] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const task = tasks.find((t) => t.id === id)
  if (!task) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400">משימה לא נמצאה</p>
    </div>
  )

  const handleNudge = async () => {
    if (!partner) return
    setNudging(true)
    try {
      await sendNudge({
        toUserId: partner.id,
        title: `${profile?.display_name} הזכיר/ה לך`,
        body: task.title,
        taskId: task.id,
      })
    } finally {
      setNudging(false)
    }
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    navigate(-1)
  }

  return (
    <motion.div
      className="h-full flex flex-col bg-white"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="px-4 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="flex-1 text-lg font-bold text-gray-900 truncate">{task.title}</h1>
        <button onClick={() => setShowEdit(true)} className="text-primary-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50">
          ערוך
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Task info */}
        <div className="px-4 py-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleDone(task)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                task.is_done
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.is_done ? 'bg-emerald-600 border-emerald-600' : 'border-gray-400'}`}>
                {task.is_done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              {task.is_done ? 'הושלמה' : 'סמן כהושלם'}
            </button>
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Details grid */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {(task.assignee || task.assigned_to === null) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">מיועד ל</span>
                {task.assigned_to === null ? (
                  <span className="text-sm font-medium text-gray-800">שניהם</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                      {task.assignee!.display_name[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{task.assignee!.display_name}</span>
                  </div>
                )}
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">תאריך יעד</span>
                <span className="text-sm font-medium text-gray-800">{formatDate(task.due_date)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">נוצר</span>
              <span className="text-sm text-gray-600">{formatDateTime(task.created_at)}</span>
            </div>
            {task.completed_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">הושלם</span>
                <span className="text-sm text-gray-600">{formatDateTime(task.completed_at)}</span>
              </div>
            )}
          </div>

          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1.5">תיאור</h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {partner && (
              <button
                onClick={handleNudge}
                disabled={nudging}
                className="flex-1 bg-primary-50 text-primary-700 font-medium text-sm py-3 rounded-xl hover:bg-primary-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                🔔 {nudging ? 'שולח...' : `נדנד את ${partner.display_name}`}
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 bg-red-50 text-red-600 font-medium text-sm py-3 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
            >
              מחק
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="border-t border-gray-100">
          <Comments taskId={task.id} title={task.title} />
        </div>
      </div>

      {/* Edit form */}
      <BottomSheet open={showEdit} onClose={() => setShowEdit(false)} title="ערוך משימה" fullHeight>
        <TaskForm task={task} onDone={() => setShowEdit(false)} />
      </BottomSheet>

      {/* Delete confirm */}
      <BottomSheet open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="מחיקת משימה">
        <div className="px-4 py-4 space-y-4">
          <p className="text-gray-600 text-sm">האם למחוק את המשימה "{task.title}"?</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">ביטול</button>
            <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium">מחק</button>
          </div>
        </div>
      </BottomSheet>
    </motion.div>
  )
}
