export interface Profile {
  id: string
  display_name: string
  push_subscription: PushSubscriptionJSON | null
}

export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to: string | null
  created_by: string
  due_date?: string
  priority: Priority
  is_done: boolean
  completed_at?: string
  recurrence_rule?: string
  recurrence_end_date?: string
  created_at: string
  assignee?: Profile | null
  comment_count?: number
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  location?: string
  start_datetime: string
  end_datetime: string
  all_day: boolean
  created_by: string
  assigned_to?: string | null
  color?: string
  recurrence_rule?: string
  recurrence_end_date?: string
  reminder_minutes?: number
  created_at: string
  creator?: Profile
  assignee?: Profile | null
}

export interface Comment {
  id: string
  task_id?: string
  event_id?: string
  user_id: string
  content: string
  created_at: string
  author?: Profile
}

export interface Nudge {
  id: string
  task_id: string
  from_user: string
  to_user: string
  created_at: string
}

export type TabId = 'home' | 'calendar' | 'tasks' | 'profile'

export interface DayEvents {
  date: Date
  events: CalendarEvent[]
  tasks: Task[]
}
