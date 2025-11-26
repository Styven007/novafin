import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from 'c:/Users/reyes/Documents/NovaFin/frontend/src/pages/login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Statistics from './pages/Statistics'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta del dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/history" element={<History />} />

        <Route path="/statistics" element={<Statistics />} /> 
        
        {/* Ruta 404 - cualquier otra ruta no definida */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App