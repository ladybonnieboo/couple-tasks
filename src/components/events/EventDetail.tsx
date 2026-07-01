import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEvents } from '../../hooks/useEvents'
import { useAuthStore } from '../../stores/authStore'
import { sendNudge } from '../../hooks/usePush'
import { formatDate, formatTime, formatDateTime } from '../../lib/dates'
import Comments from '../comments/Comments'
import BottomSheet from '../shared/BottomSheet'
import EventForm from './EventForm'

const REMINDER_LABELS: Record<number, string> = {
  15: '15 דקות לפני',
  30: '30 דקות לפני',
  60: 'שעה לפני',
  1440: 'יום לפני',
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { events, deleteEvent, deleteFutureEvents } = useEvents()
  const { profile, partner } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nudging, setNudging] = useState(false)

  const event = events.find((e) => e.id === id)
  if (!event) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400">אירוע לא נמצא</p>
    </div>
  )

  const handleNudge = async () => {
    if (!partner) return
    setNudging(true)
    try {
      await sendNudge({
        toUserId: partner.id,
        title: `${profile?.display_name} הזכיר/ה לך`,
        body: event.title,
        eventId: event.id,
      })
    } finally {
      setNudging(false)
    }
  }

  const handleDeleteThis = async () => {
    await deleteEvent(event.id)
    navigate(-1)
  }

  const handleDeleteFuture = async () => {
    await deleteFutureEvents(event)
    navigate(-1)
  }

  const isRecurring = !!event.recurrence_rule

  const recurrenceLabel = (() => {
    if (!event.recurrence_rule) return null
    if (event.recurrence_rule === 'FREQ=DAILY') return 'כל יום'
    if (event.recurrence_rule === 'FREQ=WEEKLY') return 'כל שבוע'
    if (event.recurrence_rule === 'FREQ=MONTHLY') return 'כל חודש'
    if (event.recurrence_rule.startsWith('FREQ=WEEKLY;BYDAY=')) {
      const days = event.recurrence_rule.replace('FREQ=WEEKLY;BYDAY=', '').split(',')
      const HE: Record<string, string> = { SU: 'א', MO: 'ב', TU: 'ג', WE: 'ד', TH: 'ה', FR: 'ו', SA: 'ש' }
      return `כל שבוע בימים: ${days.map((d) => HE[d] ?? d).join(', ')}`
    }
    return event.recurrence_rule
  })()

  return (
    <motion.div
      className="h-full flex flex-col bg-white"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Colored header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3" style={{ backgroundColor: (event.color ?? '#4f46e5') + '15' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/10">
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color ?? '#4f46e5' }} />
            <span className="text-xs font-medium text-gray-500">
              {event.creator?.display_name ?? ''}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 truncate">{event.title}</h1>
        </div>
        <button onClick={() => setShowEdit(true)} className="text-primary-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50">
          ערוך
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Event info */}
        <div className="px-4 py-4 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {/* Date & time */}
            <div className="flex items-center gap-3">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{formatDate(event.start_datetime)}</p>
                {!event.all_day ? (
                  <p className="text-xs text-gray-500">{formatTime(event.start_datetime)} – {formatTime(event.end_datetime)}</p>
                ) : (
                  <p className="text-xs text-gray-500">כל היום</p>
                )}
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <p className="text-sm text-gray-800">{event.location}</p>
              </div>
            )}

            {recurrenceLabel && (
              <div className="flex items-center gap-3">
                <span className="text-lg">🔄</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{recurrenceLabel}</p>
                  {event.recurrence_end_date && (
                    <p className="text-xs text-gray-500">עד {formatDate(event.recurrence_end_date)}</p>
                  )}
                </div>
              </div>
            )}

            {event.reminder_minutes && REMINDER_LABELS[event.reminder_minutes] && (
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <p className="text-sm text-gray-800">{REMINDER_LABELS[event.reminder_minutes]}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <p className="text-sm text-gray-800">
                {event.assignee ? event.assignee.display_name : 'שניהם'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg">🕐</span>
              <p className="text-xs text-gray-500">נוצר {formatDateTime(event.created_at)}</p>
            </div>
          </div>

          {event.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1.5">תיאור</h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{event.description}</p>
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
                🔔 {nudging ? 'שולח...' : `הזכר ל${partner.display_name}`}
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
          <Comments eventId={event.id} title={event.title} />
        </div>
      </div>

      {/* Edit sheet */}
      <BottomSheet open={showEdit} onClose={() => setShowEdit(false)} title="ערוך אירוע" fullHeight>
        <EventForm event={event} onDone={() => setShowEdit(false)} />
      </BottomSheet>

      {/* Delete confirm */}
      <BottomSheet open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="מחיקת אירוע">
        <div className="px-4 py-4 space-y-3 pb-6">
          <p className="text-gray-600 text-sm">מה למחוק?</p>
          <button onClick={handleDeleteThis} className="w-full bg-red-500 text-white py-3 rounded-xl font-medium">
            {isRecurring ? 'מחק אירוע זה בלבד' : 'מחק אירוע'}
          </button>
          {isRecurring && (
            <button onClick={handleDeleteFuture} className="w-full bg-red-700 text-white py-3 rounded-xl font-medium">
              מחק אירוע זה וכל האירועים הבאים
            </button>
          )}
          <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">
            ביטול
          </button>
        </div>
      </BottomSheet>
    </motion.div>
  )
}
