import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getTransactions, deleteTransaction, getCategories } from '../utils/storage'

function History() {
  const navigate = useNavigate()

  // Leer currentUser síncronamente (asumiendo que getCurrentUser es síncrono)
  const currentUser = getCurrentUser()

  // Inicialización en useState mediante función para evitar setState en useEffect
  const [appData, setAppData] = useState(() => ({
    user: currentUser || null,
    transactions: currentUser ? getTransactions() : [],
    categories: currentUser ? getCategories() : { gastos: [], ingresos: [] },
    isLoading: currentUser ? false : true
  }))

  // Si no hay usuario, redirigir. Este effect SOLO hace navegación.
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [navigate, currentUser])

  // Estados de filtros
  const [filters, setFilters] = useState({
    tipo: 'todos',
    categoria: 'todas',
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'fecha-desc'
  })

  // Aplicar filtros usando useMemo (recomputar solo cuando cambian transactions o filters)
  const filteredTransactions = useMemo(() => {
    let result = [...appData.transactions]

    if (filters.tipo !== 'todos') {
      result = result.filter(t => t.tipo === filters.tipo)
    }

    if (filters.categoria !== 'todas') {
      result = result.filter(t => t.categoria === filters.categoria)
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      result = result.filter(t =>
        (t.categoria && t.categoria.toLowerCase().includes(searchLower)) ||
        (t.descripcion && t.descripcion.toLowerCase().includes(searchLower))
      )
    }

    if (filters.dateFrom) {
      result = result.filter(t => new Date(t.fecha) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      result = result.filter(t => new Date(t.fecha) <= new Date(filters.dateTo))
    }

    switch (filters.sortBy) {
      case 'fecha-desc':
        result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        break
      case 'fecha-asc':
        result.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        break
      case 'monto-desc':
        result.sort((a, b) => b.monto - a.monto)
        break
      case 'monto-asc':
        result.sort((a, b) => a.monto - b.monto)
        break
      default:
        break
    }

    return result
  }, [appData.transactions, filters])

  // Calcular totales usando useMemo
  const totales = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.tipo === 'ingreso') {
        acc.ingresos += t.monto
      } else {
        acc.gastos += t.monto
      }
      return acc
    }, { ingresos: 0, gastos: 0 })
  }, [filteredTransactions])

  // Obtener todas las categorías usando useMemo
  const allCategories = useMemo(() => {
    return [...(appData.categories.gastos || []), ...(appData.categories.ingresos || [])]
  }, [appData.categories])

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const handleDeleteTransaction = (transactionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      return
    }

    const result = deleteTransaction(transactionId)

    if (result.success) {
      // Actualizar el estado local (appData.transactions)
      setAppData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== transactionId)
      }))
      alert('Transacción eliminada exitosamente')
    } else {
      alert('Error al eliminar: ' + result.message)
    }
  }

  const clearFilters = () => {
    setFilters({
      tipo: 'todos',
      categoria: 'todas',
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'fecha-desc'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  if (appData.isLoading || !appData.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
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
                <h1 className="text-2xl font-bold text-gray-800">Historial de Transacciones</h1>
                <p className="text-sm text-gray-600">{filteredTransactions.length} transacciones</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Total Ingresos</p>
                <p className="text-sm font-bold text-green-600">{formatCurrency(totales.ingresos)}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Total Gastos</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(totales.gastos)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Buscar por categoría o descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="todos">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={filters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="todas">Todas</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.icono} {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="fecha-desc">Fecha (más reciente)</option>
                <option value="fecha-asc">Fecha (más antigua)</option>
                <option value="monto-desc">Monto (mayor a menor)</option>
                <option value="monto-asc">Monto (menor a mayor)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Lista de Transacciones */}
        {filteredTransactions.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(transaction.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-2">
                          <span className={`p-1.5 rounded-lg ${transaction.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <svg className={`w-4 h-4 ${transaction.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={transaction.tipo === 'ingreso' ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"} />
                            </svg>
                          </span>
                          <span className="text-sm font-medium text-gray-900">{transaction.categoria}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.descripcion || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {transaction.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-bold ${transaction.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(transaction.monto)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDeleteTransaction(transaction.id)} className="text-red-600 hover:text-red-900 transition" title="Eliminar">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <div className="inline-block bg-gray-100 rounded-full p-4 mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron transacciones</h3>
            <p className="text-gray-600 mb-4">
              {appData.transactions.length === 0 ? 'Aún no has registrado ninguna transacción.' : 'Intenta ajustar los filtros para ver más resultados.'}
            </p>
            {appData.transactions.length === 0 && (
              <button onClick={() => navigate('/dashboard')} className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Agregar Primera Transacción</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default History
