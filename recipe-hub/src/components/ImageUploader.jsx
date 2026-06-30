import { useRef, useState } from 'react'
import { uploadRecipeImage } from '../services/upload'
import toast from 'react-hot-toast'

export default function ImageUploader({ value, onChange }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('יש לבחור קובץ תמונה')
    if (file.size > 5 * 1024 * 1024) return toast.error('התמונה גדולה מדי (מקסימום 5MB)')

    setUploading(true)
    try {
      const url = await uploadRecipeImage(file)
      onChange(url)
      toast.success('התמונה הועלתה!')
    } catch {
      toast.error('שגיאה בהעלאת התמונה')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="w-full h-40 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-colors overflow-hidden relative"
    >
      {value ? (
        <>
          <img src={value} alt="תצוגה מקדימה" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">לחץ להחלפה</span>
          </div>
        </>
      ) : (
        <>
          {uploading ? (
            <span className="material-symbols-outlined text-3xl text-stone-800 animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl text-stone-500">add_photo_alternate</span>
              <p className="text-sm text-stone-800 mt-1">לחץ להוספת תמונה</p>
            </>
          )}
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
