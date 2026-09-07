import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import RegistroEvento from './pages/RegistroEvento'

function App() {
  return (
    <main className="app-shell">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<RegistroEvento />} />
      </Routes>
    </main>
  )
}

export default App
