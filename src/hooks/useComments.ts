import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Comment } from '../types'

export function useComments(taskId?: string, eventId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const channelId = useRef(`comments-${Math.random().toString(36).slice(2)}`).current

  const fetchComments = useCallback(async () => {
    let query = supabase
      .from('comments')
      .select('*, author:profiles!comments_user_id_fkey(id,display_name)')
      .order('created_at', { ascending: true })

    if (taskId) query = query.eq('task_id', taskId)
    if (eventId) query = query.eq('event_id', eventId)

    const { data } = await query
    setComments((data as Comment[]) ?? [])
    setLoading(false)
  }, [taskId, eventId])

  useEffect(() => {
    if (!taskId && !eventId) return
    fetchComments()
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchComments)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchComments, taskId, eventId, channelId])

  const addComment = async (content: string, userId: string) => {
    const { error } = await supabase.from('comments').insert({
      content,
      user_id: userId,
      task_id: taskId ?? null,
      event_id: eventId ?? null,
    })
    if (error) throw error
  }

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) throw error
  }

  return { comments, loading, addComment, deleteComment }
}
