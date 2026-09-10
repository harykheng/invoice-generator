import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Layout({ children }) {
  const { signOut } = useAuth()

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-accent-50 text-accent-700' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <span className="whitespace-nowrap text-base font-semibold text-gray-900">
            Invoice Tracker
          </span>
          <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/new" className={linkClass}>
              Invoice Baru
            </NavLink>
          </nav>
          <button
            onClick={signOut}
            className="whitespace-nowrap text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
