import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, LogOut, Receipt } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { businessConfig } from '../config/business'

const NAV_ITEMS = [
  { to: '/', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/new', end: false, label: 'Invoice Baru', icon: FilePlus2 },
]

function initials(name) {
  return (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Layout({ children }) {
  const { signOut } = useAuth()

  const sidebarLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent-50 text-accent-700'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium ${
      isActive ? 'bg-accent-50 text-accent-700' : 'text-slate-500 hover:bg-slate-100'
    }`

  return (
    <div className="min-h-screen bg-slate-100 lg:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:h-[calc(100vh-3rem)] lg:flex-row lg:overflow-hidden lg:rounded-3xl lg:border lg:border-slate-200/70 lg:bg-white lg:shadow-xl lg:shadow-slate-900/5">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white p-5 lg:flex">
          <div className="mb-8 flex items-center gap-2.5 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm shadow-accent-600/30">
              <Receipt size={18} strokeWidth={2.25} />
            </div>
            <span className="text-base font-semibold text-slate-900">Invoice Tracker</span>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={sidebarLinkClass}>
                <item.icon size={18} strokeWidth={2} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
              {initials(businessConfig.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {businessConfig.name}
              </p>
              <button
                onClick={signOut}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700"
              >
                <LogOut size={12} /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white">
              <Receipt size={16} strokeWidth={2.25} />
            </div>
            <span className="whitespace-nowrap text-base font-semibold text-slate-900">
              Invoice Tracker
            </span>
          </div>
          <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={signOut}
            className="whitespace-nowrap text-sm font-medium text-slate-400 hover:text-slate-700"
          >
            Sign out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/60 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
