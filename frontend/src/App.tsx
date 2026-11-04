import { HealthStatus } from './components/HealthStatus'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="brand">Financy</p>
        <h1>Fundação da aplicação financeira</h1>
        <p className="lede">
          Etapa 1 — estrutura React + Vite com cliente GraphQL. Cadastro, login, dashboard e CRUD
          serão implementados nas próximas etapas, alinhados ao Figma oficial.
        </p>
      </header>

      <main>
        <HealthStatus />
      </main>
    </div>
  )
}
