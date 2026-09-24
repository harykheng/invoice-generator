import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function CustomSelect({ value, onChange, options, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selected = options.find((opt) => opt.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-sm text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
      >
        <span>{selected?.label ?? 'Pilih'}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10">
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm ${
                opt.value === value
                  ? 'bg-accent-50 font-medium text-accent-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
              {opt.value === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
