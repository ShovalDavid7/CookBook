import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { recipesService } from '../services/recipes'
import { importRecipeFromUrl } from '../services/import'
import ImageUploader from '../components/ImageUploader'

const CATEGORIES = ['ארוחת בוקר', 'צהריים', 'עיקרית', 'קינוחים', 'סלטים', 'מרקים']
const DIFFICULTIES = ['קל', 'בינוני', 'קשה']

const inputCls = 'w-full h-12 border border-gray-200 rounded-2xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-stone-500 bg-white text-sm'
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5 text-right'

export default function AddRecipePage() {
  const navigate = useNavigate()
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [source, setSource] = useState('')
  const [subCategory, setSubCategory] = useState('')

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ingredients: [{ name: '', amount: '', unit: '' }],
      instructions: [{ text: '' }],
    }
  })

  const { fields: ingFields, append: addIng, remove: removeIng } = useFieldArray({ control, name: 'ingredients' })
  const { fields: instFields, append: addInst, remove: removeInst } = useFieldArray({ control, name: 'instructions' })

  const handleImport = async (e) => {
    e.preventDefault()
    if (!importUrl.trim()) return
    setImporting(true)
    try {
      const recipe = await importRecipeFromUrl(importUrl.trim())
      reset({
        title: recipe.title,
        description: recipe.description,
        prep_time: recipe.prep_time,
        servings: recipe.servings,
        category: recipe.category,
        difficulty: recipe.difficulty,
        is_kosher: recipe.is_kosher,
        ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', amount: '', unit: '' }],
        instructions: recipe.instructions.length > 0 ? recipe.instructions.map((t) => ({ text: t })) : [{ text: '' }],
      })
      if (recipe.image_url) setImageUrl(recipe.image_url)
      if (recipe.source) setSource(recipe.source)
      if (recipe.sub_category) setSubCategory(recipe.sub_category)
      setImportUrl('')
      toast.success('המתכון יובא בהצלחה! בדקי ותקני לפי הצורך.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'לא הצלחנו לייבא מהכתובת הזו')
    } finally {
      setImporting(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        image_url: imageUrl,
        prep_time: parseInt(data.prep_time),
        difficulty: data.difficulty,
        servings: parseInt(data.servings),
        is_kosher: data.is_kosher === true || (Array.isArray(data.is_kosher) && data.is_kosher.length > 0),
        source,
        category: data.category,
        sub_category: subCategory,
        ingredients: data.ingredients.filter((i) => i.name),
        instructions: data.instructions.map((i) => i.text).filter(Boolean),
      }
      const recipe = await recipesService.create(payload)
      toast.success('המתכון פורסם בהצלחה!')
      navigate(`/recipe/${recipe.id}`)
    } catch {
      toast.error('שגיאה בפרסום המתכון')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0]">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-8 py-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1">
          <span className="material-symbols-outlined text-gray-600">chevron_right</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">מתכון חדש</h1>
        <button
          form="recipe-form"
          type="submit"
          disabled={loading}
          className="hidden md:flex items-center gap-1.5 px-5 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-900 transition-colors disabled:opacity-60"
        >
          {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
          פרסם מתכון
        </button>
      </header>

      {/* ── Import from URL panel ── */}
      <div className="px-4 md:px-8 lg:px-12 pt-4">
        <div className="bg-gradient-to-l from-blue-600 to-indigo-600 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-white text-xl">link</span>
            <h3 className="text-white font-bold text-sm">ייבוא מתכון מאתר</h3>
            <span className="text-blue-200 text-xs">AllRecipes, Ynet, מאכלים, 12Tomatoes ועוד</span>
          </div>
          <form onSubmit={handleImport} className="flex gap-2">
            <button
              type="submit"
              disabled={importing || !importUrl.trim()}
              className="flex-shrink-0 px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              {importing
                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-sm">download</span>
              }
              {importing ? 'מייבא...' : 'ייבא'}
            </button>
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="הדביקי כתובת URL של מתכון..."
              className="flex-1 h-10 bg-white/20 border border-white/30 rounded-xl px-3 text-right text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              dir="ltr"
            />
          </form>
        </div>
      </div>

      <form id="recipe-form" onSubmit={handleSubmit(onSubmit)}>

        {/* ── Mobile: stacked layout ── */}
        <div className="md:hidden px-4 pt-5 pb-28 space-y-5">
          <MobileFields
            register={register} errors={errors}
            imageUrl={imageUrl} setImageUrl={setImageUrl}
            subCategory={subCategory} setSubCategory={setSubCategory}
            ingFields={ingFields} addIng={addIng} removeIng={removeIng}
            instFields={instFields} addInst={addInst} removeInst={removeInst}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-stone-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
            פרסם מתכון
          </button>
        </div>

        {/* ── Desktop: 2-col layout ── */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 px-8 lg:px-12 pt-6 pb-10 max-w-5xl mx-auto">

          {/* Left column: media + basic info */}
          <div className="space-y-5">
            <div>
              <label className={labelCls}>תמונת מתכון</label>
              <div className="h-56">
                <ImageUploader value={imageUrl} onChange={setImageUrl} />
              </div>
            </div>

            <div>
              <label className={labelCls}>שם המתכון *</label>
              <input
                {...register('title', { required: 'נא להזין שם מתכון' })}
                placeholder="לדוגמה: פסטה ברוטב עגבניות"
                className={inputCls}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1 text-right">{errors.title.message}</p>}
            </div>

            <div>
              <label className={labelCls}>תיאור קצר</label>
              <textarea
                {...register('description')}
                placeholder="תאר את המתכון בקצרה..."
                rows={3}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-stone-500 bg-white resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>קטגוריה *</label>
                <select {...register('category', { required: true })} className={`${inputCls} appearance-none`}>
                  <option value="">בחר...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>רמת קושי *</label>
                <select {...register('difficulty', { required: true })} className={`${inputCls} appearance-none`}>
                  <option value="">בחר...</option>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>סוג מנה</label>
              <input
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="לדוגמה: פנקייקים, עוגת שוקולד, שניצל..."
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>זמן הכנה (דקות) *</label>
                <input {...register('prep_time', { required: true, min: 1 })} type="number" placeholder="20" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>מספר מנות *</label>
                <input {...register('servings', { required: true, min: 1 })} type="number" placeholder="4" className={inputCls} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-200">
              <label className="text-sm font-medium text-gray-700">מתכון כשר?</label>
              <input {...register('is_kosher')} type="checkbox" className="w-5 h-5 accent-stone-900" />
            </div>
          </div>

          {/* Right column: ingredients + instructions */}
          <div className="space-y-5">
            <IngredientsSection ingFields={ingFields} addIng={addIng} removeIng={removeIng} register={register} />
            <InstructionsSection instFields={instFields} addInst={addInst} removeInst={removeInst} register={register} />
          </div>
        </div>
      </form>
    </div>
  )
}

function IngredientsSection({ ingFields, addIng, removeIng, register }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100">
      <h3 className="text-base font-bold text-gray-800 mb-4 text-right">מצרכים</h3>
      <div className="space-y-2">
        {ingFields.map((field, i) => (
          <div key={field.id} className="flex gap-2 items-center">
            <button type="button" onClick={() => removeIng(i)} className="text-red-400 flex-shrink-0">
              <span className="material-symbols-outlined text-xl">remove_circle</span>
            </button>
            <input
              {...register(`ingredients.${i}.amount`)}
              placeholder="כמות"
              className="w-16 h-10 border border-gray-200 rounded-xl px-2 text-center text-sm bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
            <input
              {...register(`ingredients.${i}.unit`)}
              placeholder="יח'"
              className="w-16 h-10 border border-gray-200 rounded-xl px-2 text-center text-sm bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
            <input
              {...register(`ingredients.${i}.name`)}
              placeholder="שם המצרך"
              className="flex-1 h-10 border border-gray-200 rounded-xl px-3 text-right text-sm bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addIng({ name: '', amount: '', unit: '' })}
        className="mt-3 flex items-center gap-1 text-stone-900 text-sm font-medium"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        הוסף מצרך
      </button>
    </div>
  )
}

function InstructionsSection({ instFields, addInst, removeInst, register }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100">
      <h3 className="text-base font-bold text-gray-800 mb-4 text-right">הוראות הכנה</h3>
      <div className="space-y-3">
        {instFields.map((field, i) => (
          <div key={field.id} className="flex gap-2 items-start">
            <button type="button" onClick={() => removeInst(i)} className="text-red-400 flex-shrink-0 mt-2">
              <span className="material-symbols-outlined text-xl">remove_circle</span>
            </button>
            <div className="w-7 h-7 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2">
              {i + 1}
            </div>
            <textarea
              {...register(`instructions.${i}.text`)}
              placeholder={`שלב ${i + 1}...`}
              rows={2}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-right text-sm bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 resize-none"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addInst({ text: '' })}
        className="mt-3 flex items-center gap-1 text-stone-900 text-sm font-medium"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        הוסף שלב
      </button>
    </div>
  )
}

function MobileFields({ register, errors, imageUrl, setImageUrl, subCategory, setSubCategory, ingFields, addIng, removeIng, instFields, addInst, removeInst }) {
  return (
    <>
      <div>
        <label className={labelCls}>תמונת מתכון</label>
        <ImageUploader value={imageUrl} onChange={setImageUrl} />
      </div>

      <div>
        <label className={labelCls}>שם המתכון *</label>
        <input
          {...register('title', { required: 'נא להזין שם מתכון' })}
          placeholder="לדוגמה: פסטה ברוטב עגבניות"
          className={inputCls}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1 text-right">{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelCls}>תיאור קצר</label>
        <textarea
          {...register('description')}
          placeholder="תאר את המתכון בקצרה..."
          rows={3}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-stone-500 bg-white resize-none text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>קטגוריה *</label>
          <select {...register('category', { required: true })} className={`${inputCls} appearance-none`}>
            <option value="">בחר...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>רמת קושי *</label>
          <select {...register('difficulty', { required: true })} className={`${inputCls} appearance-none`}>
            <option value="">בחר...</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>סוג מנה</label>
        <input
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          placeholder="לדוגמה: פנקייקים, עוגת שוקולד, שניצל..."
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>זמן הכנה (דקות) *</label>
          <input {...register('prep_time', { required: true, min: 1 })} type="number" placeholder="20" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>מספר מנות *</label>
          <input {...register('servings', { required: true, min: 1 })} type="number" placeholder="4" className={inputCls} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-200">
        <label className="text-sm font-medium text-gray-700">מתכון כשר?</label>
        <input {...register('is_kosher')} type="checkbox" className="w-5 h-5 accent-stone-900" />
      </div>

      <IngredientsSection ingFields={ingFields} addIng={addIng} removeIng={removeIng} register={register} />
      <InstructionsSection instFields={instFields} addInst={addInst} removeInst={removeInst} register={register} />
    </>
  )
}
