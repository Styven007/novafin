import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout, getBalance, getTransactions, deleteTransaction } from '../utils/storage'
import { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState({ ingresos: 0, gastos: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [showIngresoModal, setShowIngresoModal] = useState(false)
  const [showGastoModal, setShowGastoModal] = useState(false)

  useEffect(() => {
    const loadUserData = () => {
      const currentUser = getCurrentUser()
      
      if (!currentUser) {
        navigate('/login')
        return
      }

      const userBalance = getBalance()
      const userTransactions = getTransactions()
      
      setUser(currentUser)
      setBalance(userBalance)
      setTransactions(userTransactions)
    }

    loadUserData()
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleTransactionSuccess = (newTransaction) => {
    // Actualizar el estado con la nueva transacción
    setTransactions(prev => [newTransaction, ...prev])
    
    // Recalcular balance
    const newBalance = getBalance()
    setBalance(newBalance)
    
    // Cerrar modales
    setShowIngresoModal(false)
    setShowGastoModal(false)
    
    // Mostrar mensaje de éxito
    alert(`¡${newTransaction.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} registrado exitosamente!`)
  }

  const handleDeleteTransaction = (transactionId) => {
  if (!window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
    return
  }

  const result = deleteTransaction(transactionId)

  if (result.success) {
    // Actualizar la lista de transacciones
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
    
    // Recalcular balance
    const newBalance = getBalance()
    setBalance(newBalance)
    
    alert('Transacción eliminada exitosamente')
  } else {
    alert('Error al eliminar: ' + result.message)
  }
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
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  if (!user) {
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">NovaFin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Bienvenido</p>
                <p className="text-sm font-semibold text-gray-800">{user.nombre}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Hola, {user.nombre.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Aquí está el resumen de tus finanzas
          </p>
        </div>

        {/* Cards de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Balance Total */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Balance Total</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{formatCurrency(balance.balance)}</p>
            <p className="text-sm opacity-75">
              {balance.balance >= 0 ? '✓ Balance positivo' : '⚠ Balance negativo'}
            </p>
          </div>

          {/* Card Ingresos */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 font-medium">Ingresos</p>
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{formatCurrency(balance.ingresos)}</p>
            <p className="text-sm text-gray-500">Total registrado</p>
          </div>

          {/* Card Gastos */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 font-medium">Gastos</p>
              <div className="bg-red-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{formatCurrency(balance.gastos)}</p>
            <p className="text-sm text-gray-500">Total registrado</p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setShowIngresoModal(true)}
              className="flex items-center justify-center space-x-3 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Ingreso</span>
            </button>
            <button 
              onClick={() => setShowGastoModal(true)}
              className="flex items-center justify-center space-x-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              <span>Registrar Gasto</span>
            </button>
          </div>
        </div>

{/* Lista de Transacciones Recientes */}
{transactions.length > 0 ? (
  <div className="bg-white rounded-2xl p-6 shadow-lg">
    <h3 className="text-xl font-bold text-gray-800 mb-4">Transacciones Recientes</h3>
    <div className="space-y-3">
      {transactions.slice(0, 10).map(transaction => (
        <div 
          key={transaction.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-2 rounded-lg ${
              transaction.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-5 h-5 ${
                transaction.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={transaction.tipo === 'ingreso' 
                    ? "M7 11l5-5m0 0l5 5m-5-5v12" 
                    : "M17 13l-5 5m0 0l-5-5m5 5V6"
                  } 
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{transaction.categoria}</p>
              <p className="text-sm text-gray-500">
                {transaction.descripcion || 'Sin descripción'} • {formatDate(transaction.fecha)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <p className={`font-bold text-lg ${
              transaction.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(transaction.monto)}
            </p>
            
            {/* Botón Eliminar */}
            <button
              onClick={() => handleDeleteTransaction(transaction.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-50 rounded-lg"
              title="Eliminar transacción"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
    
    {transactions.length > 10 && (
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Mostrando 10 de {transactions.length} transacciones
        </p>
      </div>
    )}
  </div>
) : (
  <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
    <div className="inline-block bg-indigo-100 rounded-full p-4 mb-4">
      <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">
      ¡Comienza a registrar tus finanzas!
    </h3>
    <p className="text-gray-600 mb-4">
      Aún no tienes transacciones registradas. Empieza agregando tus ingresos y gastos.
    </p>
  </div>
)}
      </main>

      {/* Modales */}
      <Modal 
        isOpen={showIngresoModal} 
        onClose={() => setShowIngresoModal(false)}
        title="Agregar Ingreso"
      >
        <TransactionForm 
          tipo="ingreso"
          onSuccess={handleTransactionSuccess}
          onCancel={() => setShowIngresoModal(false)}
        />
      </Modal>

      <Modal 
        isOpen={showGastoModal} 
        onClose={() => setShowGastoModal(false)}
        title="Registrar Gasto"
      >
        <TransactionForm 
          tipo="gasto"
          onSuccess={handleTransactionSuccess}
          onCancel={() => setShowGastoModal(false)}
        />
      </Modal>
    </div>
  )
}

export default Dashboard