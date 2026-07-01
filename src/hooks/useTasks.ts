import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const channelId = useRef(`tasks-${Math.random().toString(36).slice(2)}`).current

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assigned_to_fkey(id,display_name)')
      .order('created_at', { ascending: false })
    setTasks((data as Task[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchTasks, channelId])

  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'is_done'>) => {
    const { error } = await supabase.from('tasks').insert({ ...task, is_done: false })
    if (error) throw error
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (error) throw error
  }

  const toggleDone = async (task: Task) => {
    const updates: Partial<Task> = {
      is_done: !task.is_done,
      completed_at: !task.is_done ? new Date().toISOString() : undefined,
    }
    await updateTask(task.id, updates)
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  }

  return { tasks, loading, fetchTasks, createTask, updateTask, toggleDone, deleteTask }
}
