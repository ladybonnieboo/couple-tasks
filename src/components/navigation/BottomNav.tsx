import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const tabs = [
  {
    id: 'home',
    path: '/home',
    label: 'בית',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'fill-primary-600' : 'fill-gray-400'}`} viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    id: 'calendar',
    path: '/calendar',
    label: 'לוח שנה',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'stroke-primary-600' : 'stroke-gray-400'} fill-none`} viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'tasks',
    path: '/tasks',
    label: 'משימות',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'stroke-primary-600' : 'stroke-gray-400'} fill-none`} viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'פרופיל',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'stroke-primary-600' : 'stroke-gray-400'} fill-none`} viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = tabs.find((t) => location.pathname.startsWith(t.path))?.id ?? 'home'

  return (
    <nav className="bg-white border-t border-gray-100 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
          >
            {tab.icon(active)}
            <span className={`text-xs font-medium ${active ? 'text-primary-600' : 'text-gray-400'}`}>
              {tab.label}
            </span>
            {active && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full"
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
