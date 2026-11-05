import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { initials } from '../../lib/categoryTone'
import { Logo } from '../ui/Logo'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transações' },
  { to: '/categories', label: 'Categorias' },
]

export function AppShell() {
  const { user } = useAuth()

  return (
    <div className="app-frame">
      <header className="topbar">
        <Logo />
        <nav className="topbar-nav" aria-label="Principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/account" className="avatar-link" aria-label="Conta">
          {initials(user?.name ?? '')}
        </NavLink>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
