import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BottomSheet from './BottomSheet'
import TaskForm from '../tasks/TaskForm'
import EventForm from '../events/EventForm'

interface FABProps {
  defaultDate?: Date
}

export default function FAB({ defaultDate }: FABProps) {
  const [open, setOpen] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <>
      {/* Backdrop — keyed directly under AnimatePresence, not in a fragment */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-backdrop"
            className="fixed inset-0 z-30 bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Menu items */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-menu"
            className="fixed z-40 flex flex-col gap-3 items-center"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)', left: '50%', transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.15 }}
          >
            <button
              className="flex items-center gap-3 bg-white text-gray-800 font-medium px-5 py-3 rounded-full shadow-lg border border-gray-100 whitespace-nowrap"
              onClick={() => { closeMenu(); setShowEventForm(true) }}
            >
              <span>📅</span> אירוע חדש
            </button>
            <button
              className="flex items-center gap-3 bg-white text-gray-800 font-medium px-5 py-3 rounded-full shadow-lg border border-gray-100 whitespace-nowrap"
              onClick={() => { closeMenu(); setShowTaskForm(true) }}
            >
              <span>✅</span> משימה חדשה
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        className="fixed z-40 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light leading-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)', left: '1rem' }}
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        +
      </motion.button>

      <BottomSheet open={showTaskForm} onClose={() => setShowTaskForm(false)} title="משימה חדשה" fullHeight>
        <TaskForm defaultDate={defaultDate} onDone={() => setShowTaskForm(false)} />
      </BottomSheet>

      <BottomSheet open={showEventForm} onClose={() => setShowEventForm(false)} title="אירוע חדש" fullHeight>
        <EventForm defaultDate={defaultDate} onDone={() => setShowEventForm(false)} />
      </BottomSheet>
    </>
  )
}
