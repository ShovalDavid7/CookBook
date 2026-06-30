import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  useEffect(() => {
    // Supabase processes the hash fragment automatically on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) throw error
      toast.success('הסיסמה עודכנה בהצלחה!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'שגיאה באיפוס הסיסמה')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full h-12 border border-gray-200 rounded-2xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40 text-sm bg-gray-50 focus:bg-white transition-colors'

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#8B7355] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-white text-2xl">lock_reset</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">איפוס סיסמה</h1>
          <p className="text-gray-500 text-sm mt-1">הזיני סיסמה חדשה לחשבון שלך</p>
        </div>

        {!ready ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin block mb-3">progress_activity</span>
            <p className="text-gray-500 text-sm">מאמתת את הקישור...</p>
            <p className="text-gray-400 text-xs mt-3">
              אם הדף לא מתקדם — הלינק אולי פג תוקף.{' '}
              <button onClick={() => navigate('/login')} className="text-[#8B7355] underline">
                בקשי לינק חדש
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
            <div>
              <input
                {...register('password', {
                  required: 'נא להזין סיסמה',
                  minLength: { value: 6, message: 'לפחות 6 תווים' }
                })}
                type="password"
                placeholder="סיסמה חדשה"
                className={inputCls}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <input
                {...register('confirm', {
                  required: 'אשרי את הסיסמה',
                  validate: (v) => v === watch('password') || 'הסיסמאות לא תואמות'
                })}
                type="password"
                placeholder="אימות סיסמה"
                className={inputCls}
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#8B7355] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#7A6347] transition-colors"
            >
              {loading && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
              עדכני סיסמה
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
