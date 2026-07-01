import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  fullHeight?: boolean
}

export default function BottomSheet({ open, onClose, title, children, fullHeight }: BottomSheetProps) {
  // iOS Safari fix: use position:fixed on root instead of overflow:hidden on body
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) window.scrollTo(0, -parseInt(scrollY || '0'))
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && <motion.div
        key="bs-overlay"
        className="fixed inset-0 bg-black/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />}
      {open && <motion.div
        key="bs-panel"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl overflow-hidden max-w-[430px] mx-auto ${fullHeight ? 'max-h-[92vh]' : 'max-h-[80vh]'}`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 flex-shrink-0"
            aria-label="סגור"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div
          className="overflow-y-auto"
          style={{ maxHeight: fullHeight ? 'calc(92vh - 4rem)' : 'calc(80vh - 4rem)' }}
        >
          {children}
        </div>
      </motion.div>}
    </AnimatePresence>
  )
}
