import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()

  return (
    <div className="login-page">
      <header className="topbar topbar-login">
        <div className="brand-wrap">
          <div className="brand-mark">B</div>
          <div className="brand-copy">
            <span className="brand-name">Bomberos municipales de ciudad vieja</span>
            <span className="brand-subtitle">CONTROL DE EMERGENCIAS</span>
          </div>
        </div>
      </header>

      <div className="login-card">
        <h2>Inicio de sesión</h2>
        <button type="button" className="btn primary" onClick={() => navigate('/app')}>
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  )
}

export default Login
