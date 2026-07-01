import { useState, useRef, useEffect } from 'react'
import { useComments } from '../../hooks/useComments'
import { useAuthStore } from '../../stores/authStore'
import { sendNudge } from '../../hooks/usePush'
import { formatDateTime } from '../../lib/dates'

interface Props {
  taskId?: string
  eventId?: string
  title?: string
}

export default function Comments({ taskId, eventId, title }: Props) {
  const { profile, partner } = useAuthStore()
  const { comments, addComment } = useComments(taskId, eventId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || !profile) return
    setSending(true)
    try {
      await addComment(trimmed, profile.id)
      setText('')
      if (partner) {
        sendNudge({
          toUserId: partner.id,
          title: title ?? (taskId ? 'משימה' : 'אירוע'),
          body: `${profile.display_name}: ${trimmed}`,
          taskId,
          eventId,
        }).catch(() => {})
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="px-4 py-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">תגובות ({comments.length})</h3>

      <div className="space-y-3 mb-4">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">אין תגובות עדיין</p>
        )}
        {comments.map((c) => {
          const isMe = c.user_id === profile?.id
          return (
            <div key={c.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {c.author?.display_name?.[0] ?? '?'}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary-600 text-white rounded-tl-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tr-sm'
                }`}>
                  {c.content}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 px-1">{formatDateTime(c.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="כתוב תגובה..."
          rows={1}
          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-right resize-none"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary-700 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
