import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { CalendarEvent } from '../types'

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const channelId = useRef(`events-${Math.random().toString(36).slice(2)}`).current

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('*, creator:profiles!events_created_by_fkey(id,display_name), assignee:profiles!events_assigned_to_fkey(id,display_name)')
      .order('start_datetime', { ascending: true })
    setEvents((data as CalendarEvent[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchEvents, channelId])

  const createEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('events').insert(event)
    if (error) throw error
  }

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const { error } = await supabase.from('events').update(updates).eq('id', id)
    if (error) throw error
  }

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
  }

  const deleteFutureEvents = async (event: CalendarEvent) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const { error } = await supabase
      .from('events')
      .update({ recurrence_end_date: yesterday.toISOString().split('T')[0] })
      .eq('id', event.id)
    if (error) throw error
  }

  return { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent, deleteFutureEvents }
}
