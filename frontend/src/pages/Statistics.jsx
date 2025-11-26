import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getTransactions } from '../utils/storage'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'

// Función auxiliar para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Custom tooltip FUERA del componente principal
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-indigo-600 font-bold">{formatCurrency(payload[0].value)}</p>
        {payload[0].payload.percentage && (
          <p className="text-sm text-gray-600">{payload[0].payload.percentage}%</p>
        )}
      </div>
    )
  }
  return null
}

// Colores para los gráficos
const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']

function Statistics() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  const [appData] = useState(() => ({
    user: currentUser || null,
    transactions: currentUser ? getTransactions() : []
  }))

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [navigate, currentUser])

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    const transactions = appData.transactions
    
    const gastos = transactions.filter(t => t.tipo === 'gasto')
    const ingresos = transactions.filter(t => t.tipo === 'ingreso')
    
    const totalGastos = gastos.reduce((sum, t) => sum + t.monto, 0)
    const totalIngresos = ingresos.reduce((sum, t) => sum + t.monto, 0)
    const balance = totalIngresos - totalGastos
    
    // Promedio diario de gastos (últimos 30 días)
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    const gastosRecientes = gastos.filter(t => new Date(t.fecha) >= hace30Dias)
    const promedioDiario = gastosRecientes.length > 0 
      ? gastosRecientes.reduce((sum, t) => sum + t.monto, 0) / 30 
      : 0
    
    // Porcentaje de ahorro
    const porcentajeAhorro = totalIngresos > 0 
      ? ((balance / totalIngresos) * 100).toFixed(1)
      : 0
    
    return {
      totalGastos,
      totalIngresos,
      balance,
      promedioDiario,
      porcentajeAhorro,
      cantidadTransacciones: transactions.length,
      cantidadGastos: gastos.length,
      cantidadIngresos: ingresos.length
    }
  }, [appData.transactions])

  // Datos para gráfico de pastel - Gastos por categoría
  const gastosPorCategoria = useMemo(() => {
    const gastos = appData.transactions.filter(t => t.tipo === 'gasto')
    
    if (gastos.length === 0) return []
    
    const agrupado = gastos.reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto
      return acc
    }, {})
    
    const totalGastos = estadisticas.totalGastos || 1
    
    const data = Object.entries(agrupado)
      .map(([categoria, monto]) => ({
        name: categoria,
        value: monto,
        percentage: ((monto / totalGastos) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
    
    return data
  }, [appData.transactions, estadisticas.totalGastos])

  // Datos para gráfico de barras - Top 5 categorías
  const topCategorias = useMemo(() => {
    return gastosPorCategoria.slice(0, 5)
  }, [gastosPorCategoria])

  // Datos para gráfico de línea - Ingresos vs Gastos por mes
  const evolucionMensual = useMemo(() => {
    const transacciones = appData.transactions
    
    if (transacciones.length === 0) return []
    
    // Agrupar por mes
    const porMes = {}
    transacciones.forEach(t => {
      const fecha = new Date(t.fecha)
      const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      
      if (!porMes[mesAno]) {
        porMes[mesAno] = { mes: mesAno, ingresos: 0, gastos: 0 }
      }
      
      if (t.tipo === 'ingreso') {
        porMes[mesAno].ingresos += t.monto
      } else {
        porMes[mesAno].gastos += t.monto
      }
    })
    
    // Calcular balance y ordenar
    const data = Object.values(porMes)
      .map(m => ({
        ...m,
        balance: m.ingresos - m.gastos,
        mesNombre: new Date(m.mes + '-01').toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
    
    return data
  }, [appData.transactions])

  if (!appData.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (appData.transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Estadísticas</h1>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <div className="inline-block bg-indigo-100 rounded-full p-4 mb-4">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No hay datos para mostrar
            </h3>
            <p className="text-gray-600 mb-4">
              Necesitas registrar algunas transacciones para ver estadísticas.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Transacciones</span>
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Estadísticas Financieras</h1>
                <p className="text-sm text-gray-600">Análisis de tus finanzas personales</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Cards de Estadísticas Clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card Balance */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Balance Total</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(estadisticas.balance)}</p>
            <p className="text-sm opacity-75">
              {estadisticas.balance >= 0 ? '✓ Positivo' : '⚠ Negativo'}
            </p>
          </div>

          {/* Card Promedio Diario */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Promedio Diario</p>
              <div className="bg-orange-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{formatCurrency(estadisticas.promedioDiario)}</p>
            <p className="text-sm text-gray-500">Últimos 30 días</p>
          </div>

          {/* Card Porcentaje de Ahorro */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Porcentaje Ahorro</p>
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{estadisticas.porcentajeAhorro}%</p>
            <p className="text-sm text-gray-500">De tus ingresos</p>
          </div>

          {/* Card Total Transacciones */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Transacciones</p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{estadisticas.cantidadTransacciones}</p>
            <p className="text-sm text-gray-500">
              {estadisticas.cantidadIngresos} ingresos, {estadisticas.cantidadGastos} gastos
            </p>
          </div>
        </div>

        {/* Gráficos - Fila 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Gráfico de Pastel - Gastos por Categoría */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Distribución de Gastos</h3>
            {gastosPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No hay gastos registrados
              </div>
            )}
          </div>

          {/* Gráfico de Barras - Top 5 Categorías */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Top 5 Categorías de Gasto</h3>
            {topCategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCategorias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Línea - Evolución Mensual */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Evolución de Ingresos vs Gastos</h3>
          {evolucionMensual.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={evolucionMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mesNombre" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: '#1F2937' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Ingresos"
                  dot={{ fill: '#10B981', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gastos" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Gastos"
                  dot={{ fill: '#EF4444', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  name="Balance"
                  dot={{ fill: '#4F46E5', r: 5 }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              Registra transacciones para ver la evolución
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default Statistics