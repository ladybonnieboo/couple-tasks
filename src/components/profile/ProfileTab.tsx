import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { subscribeToPush, unsubscribeFromPush } from '../../hooks/usePush'

export default function ProfileTab() {
  const { profile, partner, signOut } = useAuthStore()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setPushEnabled(!!sub)
      })
    })
  }, [])

  const handleTogglePush = async () => {
    if (!profile) return
    setPushLoading(true)
    if (pushEnabled) {
      await unsubscribeFromPush(profile.id)
      setPushEnabled(false)
    } else {
      const ok = await subscribeToPush(profile.id)
      setPushEnabled(ok)
    }
    setPushLoading(false)
  }

  const handleSignOut = async () => {
    setLoggingOut(true)
    await signOut()
  }

  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 px-5 pt-14 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 text-white text-2xl font-bold flex items-center justify-center">
            {profile?.display_name?.[0] ?? '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile?.display_name ?? 'משתמש'}</h1>
            {partner && (
              <p className="text-primary-200 text-sm mt-0.5">🤝 עם {partner.display_name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Partner card */}
        {partner && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">שותף/ה</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 text-lg font-bold flex items-center justify-center">
                {partner.display_name[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{partner.display_name}</p>
                <p className="text-xs text-gray-400">{partner.push_subscription ? '🔔 התראות פעילות' : '🔕 התראות כבויות'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">התראות</h2>
          {!pushSupported ? (
            <p className="text-sm text-gray-400">הדפדפן שלך אינו תומך בהתראות</p>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">התראות Push</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {pushEnabled ? 'מופעל – תקבל/י נדנודים ותזכורות' : 'מכובה – הפעל כדי לקבל התראות'}
                </p>
              </div>
              <button
                onClick={handleTogglePush}
                disabled={pushLoading}
                className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-60 ${pushEnabled ? 'bg-primary-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${pushEnabled ? 'left-7' : 'left-0.5'}`} />
              </button>
            </div>
          )}
        </div>

        {/* App info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">אודות האפליקציה</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">גרסה</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">מפותח עם ❤️</span>
              <span>שרון ו-ניקיטה</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full bg-white border border-red-200 text-red-600 py-3.5 rounded-2xl font-semibold hover:bg-red-50 active:scale-95 transition-all disabled:opacity-60"
        >
          {loggingOut ? 'מתנתק...' : 'התנתק'}
        </button>
      </div>
    </div>
  )
}
