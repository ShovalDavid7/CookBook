import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, signup, resetPassword } = useAuthStore()
  const [isSignup, setIsSignup] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isForgot) {
        await resetPassword(data.email)
        toast.success('שלחנו לך קישור לאיפוס סיסמה למייל!')
        setIsForgot(false)
      } else if (isSignup) {
        await signup(data.email, data.password, data.name)
        toast.success('ברוכים הבאים! החשבון נוצר בהצלחה')
        navigate('/')
      } else {
        await login(data.email, data.password)
        toast.success('ברוכים הבאים!')
        navigate('/')
      }
    } catch (err) {
      const msg = err.message?.includes('Invalid login') ? 'אימייל או סיסמה שגויים'
        : err.message?.includes('already registered') ? 'האימייל כבר רשום במערכת'
        : err.message?.includes('Password') ? 'הסיסמה חייבת להיות לפחות 6 תווים'
        : 'שגיאה, נסה שוב'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full h-12 border border-gray-200 rounded-2xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm bg-gray-50 focus:bg-white transition-colors'

  return (
    <div className="min-h-screen flex" dir="ltr">

      {/* ── Desktop: decorative left panel ── */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-amber-800 to-stone-700 px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[120px] flex flex-wrap gap-6 p-10 overflow-hidden select-none">
          {['🍝', '🥗', '🍜', '🥘', '🍕', '🥙', '🍲', '🥞'].map((e, i) => (
            <span key={i}>{e}</span>
          ))}
        </div>
        <div className="relative text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-white text-3xl">restaurant</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">CookBook</h1>
          <p className="text-stone-100 text-lg mb-8">שיתוף מתכונים מהקהילה</p>
          <div className="space-y-3 text-right" dir="rtl">
            {[
              { icon: 'restaurant_menu', text: 'גלה מתכונים מהקהילה' },
              { icon: 'favorite', text: 'שמור את המתכונים האהובים' },
              { icon: 'add_circle', text: 'שתף את המתכונים שלך' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                <span className="material-symbols-outlined text-stone-200">{f.icon}</span>
                <span className="text-white text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F5F4F0] md:bg-white" dir="rtl">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <div className="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-stone-200">
              <span className="material-symbols-outlined text-white text-2xl">restaurant</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">CookBook</h1>
          </div>

          <div className="bg-white md:bg-transparent rounded-3xl p-7 md:p-0 shadow-sm md:shadow-none">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-right">
                {isForgot ? 'איפוס סיסמה' : isSignup ? 'יצירת חשבון' : 'ברוכים הבאים'}
              </h2>
              <p className="text-gray-500 text-sm mt-1 text-right">
                {isForgot ? 'נשלח לך קישור לאיפוס למייל' : isSignup ? 'הצטרפי לקהילת המתכונים שלנו' : 'התחברי לחשבון שלך'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isForgot ? (
                <div>
                  <input
                    {...register('email', { required: 'נא להזין אימייל', pattern: { value: /^\S+@\S+\.\S+$/, message: 'אימייל לא תקין' } })}
                    type="email"
                    placeholder="אימייל"
                    className={inputCls}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 text-right">{errors.email.message}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-4 bg-[#8B7355] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#7A6347] transition-colors"
                  >
                    {loading && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                    שלחי קישור לאיפוס
                  </button>
                  <button type="button" onClick={() => setIsForgot(false)} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 text-center">
                    חזרה להתחברות
                  </button>
                </div>
              ) : null}

              {!isForgot && isSignup && (
                <div>
                  <input
                    {...register('name', { required: 'נא להזין שם' })}
                    type="text"
                    placeholder="שם מלא"
                    className={inputCls}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 text-right">{errors.name.message}</p>}
                </div>
              )}

              {!isForgot && (
                <>
                  <div>
                    <input
                      {...register('email', {
                        required: 'נא להזין אימייל',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'אימייל לא תקין' }
                      })}
                      type="email"
                      placeholder="אימייל"
                      className={inputCls}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 text-right">{errors.email.message}</p>}
                  </div>

                  <div>
                    <input
                      {...register('password', {
                        required: 'נא להזין סיסמה',
                        minLength: { value: 6, message: 'סיסמה חייבת להיות לפחות 6 תווים' }
                      })}
                      type="password"
                      placeholder="סיסמה"
                      className={inputCls}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1 text-right">{errors.password.message}</p>}
                  </div>

                  {!isSignup && (
                    <div className="text-right">
                      <button type="button" onClick={() => setIsForgot(true)} className="text-xs text-[#8B7355] hover:underline">
                        שכחתי סיסמה
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#8B7355] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#7A6347] transition-colors"
                  >
                    {loading && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                    {isSignup ? 'צרי חשבון' : 'התחברי'}
                  </button>
                </>
              )}
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500 mb-3">
                {isSignup ? 'כבר יש לך חשבון?' : 'עדיין אין לך חשבון?'}
              </p>
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="w-full h-12 border-2 border-amber-700 text-stone-900 rounded-2xl font-bold hover:bg-stone-50 transition-colors"
              >
                {isSignup ? 'התחבר' : 'צור חשבון חינם'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
