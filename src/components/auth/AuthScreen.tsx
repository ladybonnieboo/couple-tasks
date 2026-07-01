import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-white p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💑</div>
          <h1 className="text-2xl font-bold text-gray-900">Family Planner</h1>
          <p className="text-gray-500 text-sm mt-1">תכנון משפחתי משותף</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-center text-lg font-semibold text-gray-800 mb-6">כניסה</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                dir="ltr"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  טוען...
                </span>
              ) : 'כניסה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
