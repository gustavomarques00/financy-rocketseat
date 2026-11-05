import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../ui/Button'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transações' },
  { to: '/categories', label: 'Categorias' },
  { to: '/account', label: 'Conta' },
]

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-brand">Financy</div>
        <nav className="sidebar-nav" aria-label="Principal">
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
        <div className="sidebar-footer">
          <p className="sidebar-user">{user?.name}</p>
          <Button variant="secondary" onClick={logout}>
            Sair
          </Button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="brand-mobile">Financy</div>
          <nav className="topbar-nav" aria-label="Mobile">
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
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
