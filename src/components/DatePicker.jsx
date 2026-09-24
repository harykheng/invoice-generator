import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '../lib/invoiceUtils'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toISO(date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function buildGrid(viewDate) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), outside: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), outside: false })
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      outside: true,
    })
  }
  return cells
}

export default function DatePicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => (value ? parseISO(value) : new Date()))
  const ref = useRef(null)

  useEffect(() => {
    if (value) setViewDate(parseISO(value))
  }, [value])

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

  const cells = buildGrid(viewDate)
  const todayISO = toISO(new Date())

  const selectDay = (date) => {
    onChange(toISO(date))
    setOpen(false)
  }

  const changeMonth = (delta) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-sm text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
      >
        <span>{value ? formatDate(value) : 'Pilih tanggal'}</span>
        <Calendar size={16} className="shrink-0 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium capitalize text-slate-900">{monthLabel}</span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[11px] font-medium text-slate-400">
                {w}
              </span>
            ))}
            {cells.map(({ date, outside }, i) => {
              const iso = toISO(date)
              const isSelected = iso === value
              const isToday = iso === todayISO
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(date)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    isSelected
                      ? 'bg-accent-600 font-semibold text-white'
                      : outside
                        ? 'text-slate-300 hover:bg-slate-50'
                        : isToday
                          ? 'font-semibold text-accent-600 hover:bg-accent-50'
                          : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => selectDay(new Date())}
            className="mt-2 w-full rounded-lg py-1.5 text-center text-xs font-medium text-accent-600 hover:bg-accent-50"
          >
            Hari ini
          </button>
        </div>
      )}
    </div>
  )
}
