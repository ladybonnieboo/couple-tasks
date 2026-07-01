import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import ErrorBoundary from './components/shared/ErrorBoundary'
import AuthScreen from './components/auth/AuthScreen'
import BottomNav from './components/navigation/BottomNav'
import HomeTab from './components/home/HomeTab'
import CalendarTab from './components/calendar/CalendarTab'
import TasksTab from './components/tasks/TasksTab'
import TaskDetail from './components/tasks/TaskDetail'
import EventDetail from './components/events/EventDetail'
import ProfileTab from './components/profile/ProfileTab'

function AppRoutes() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden h-full">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeTab />} />
          <Route path="/calendar" element={<CalendarTab />} />
          <Route path="/tasks" element={<TasksTab />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/profile" element={<ProfileTab />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const { user, loading, setUser, setLoading, fetchProfiles } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfiles(u.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfiles(u.id)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, fetchProfiles])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthScreen />

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
