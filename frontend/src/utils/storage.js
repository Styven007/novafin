// ============================================
// SISTEMA DE ALMACENAMIENTO LOCAL - NovaFin
// ============================================

// Claves para localStorage
const KEYS = {
  USERS: 'novafin_users',
  CURRENT_USER: 'novafin_current_user',
  TRANSACTIONS: 'novafin_transactions',
  CATEGORIES: 'novafin_categories',
}

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

/**
 * Obtener todos los usuarios registrados
 */
export const getUsers = () => {
  const users = localStorage.getItem(KEYS.USERS)
  return users ? JSON.parse(users) : []
}

/**
 * Guardar un nuevo usuario
 */
export const saveUser = (userData) => {
  const users = getUsers()
  
  // Verificar si el email ya existe
  const emailExists = users.some(user => user.email === userData.email)
  if (emailExists) {
    return { success: false, message: 'Este correo ya está registrado' }
  }

  // Crear nuevo usuario
  const newUser = {
    id: Date.now().toString(), // ID único basado en timestamp
    nombre: userData.nombre,
    email: userData.email,
    password: userData.password, // En producción, esto debería estar hasheado
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem(KEYS.USERS, JSON.stringify(users))
  
  return { success: true, user: newUser }
}

/**
 * Verificar credenciales de login
 */
export const loginUser = (email, password) => {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password)
  
  if (user) {
    // Guardar sesión del usuario actual (sin la contraseña)
    const { password: _, ...userWithoutPassword } = user
    setCurrentUser(userWithoutPassword)
    return { success: true, user: userWithoutPassword }
  }
  
  return { success: false, message: 'Correo o contraseña incorrectos' }
}

/**
 * Guardar usuario actual en sesión
 */
export const setCurrentUser = (user) => {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user))
}

/**
 * Obtener usuario actual
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem(KEYS.CURRENT_USER)
  return user ? JSON.parse(user) : null
}

/**
 * Cerrar sesión
 */
export const logout = () => {
  localStorage.removeItem(KEYS.CURRENT_USER)
}

/**
 * Verificar si hay un usuario logueado
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null
}

// ============================================
// GESTIÓN DE TRANSACCIONES
// ============================================

/**
 * Obtener todas las transacciones del usuario actual
 */
export const getTransactions = () => {
  const currentUser = getCurrentUser()
  if (!currentUser) return []

  const allTransactions = localStorage.getItem(KEYS.TRANSACTIONS)
  const transactions = allTransactions ? JSON.parse(allTransactions) : []
  
  // Filtrar solo las transacciones del usuario actual
  return transactions.filter(t => t.userId === currentUser.id)
}

/**
 * Guardar una nueva transacción
 */
export const saveTransaction = (transactionData) => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    return { success: false, message: 'Usuario no autenticado' }
  }

  const allTransactions = localStorage.getItem(KEYS.TRANSACTIONS)
  const transactions = allTransactions ? JSON.parse(allTransactions) : []

  const newTransaction = {
    id: Date.now().toString(),
    userId: currentUser.id,
    tipo: transactionData.tipo, // 'ingreso' o 'gasto'
    monto: parseFloat(transactionData.monto),
    categoria: transactionData.categoria,
    descripcion: transactionData.descripcion || '',
    fecha: transactionData.fecha || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }

  transactions.push(newTransaction)
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions))

  return { success: true, transaction: newTransaction }
}

/**
 * Eliminar una transacción
 */
export const deleteTransaction = (transactionId) => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    return { success: false, message: 'Usuario no autenticado' }
  }

  const allTransactions = localStorage.getItem(KEYS.TRANSACTIONS)
  const transactions = allTransactions ? JSON.parse(allTransactions) : []
  
  // Verificar que la transacción pertenece al usuario actual
  const transactionToDelete = transactions.find(t => t.id === transactionId)
  if (transactionToDelete && transactionToDelete.userId !== currentUser.id) {
    return { success: false, message: 'No tienes permiso para eliminar esta transacción' }
  }
  
  const filteredTransactions = transactions.filter(t => t.id !== transactionId)
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(filteredTransactions))
  
  return { success: true }
}

/**
 * Calcular balance del usuario
 */
export const getBalance = () => {
  const transactions = getTransactions()
  
  const ingresos = transactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0)
  
  const gastos = transactions
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0)
  
  return {
    ingresos,
    gastos,
    balance: ingresos - gastos
  }
}

// ============================================
// GESTIÓN DE CATEGORÍAS
// ============================================

/**
 * Categorías predeterminadas
 */
const DEFAULT_CATEGORIES = {
  gastos: [
    { id: '1', nombre: 'Alimentación', icono: '🍔', color: '#F59E0B' },
    { id: '2', nombre: 'Transporte', icono: '🚗', color: '#3B82F6' },
    { id: '3', nombre: 'Entretenimiento', icono: '🎮', color: '#8B5CF6' },
    { id: '4', nombre: 'Educación', icono: '📚', color: '#10B981' },
    { id: '5', nombre: 'Salud', icono: '🏥', color: '#EF4444' },
    { id: '6', nombre: 'Vivienda', icono: '🏠', color: '#6366F1' },
    { id: '7', nombre: 'Otros', icono: '📦', color: '#6B7280' },
  ],
  ingresos: [
    { id: '8', nombre: 'Salario', icono: '💼', color: '#10B981' },
    { id: '9', nombre: 'Freelance', icono: '💻', color: '#3B82F6' },
    { id: '10', nombre: 'Inversiones', icono: '📈', color: '#8B5CF6' },
    { id: '11', nombre: 'Otros', icono: '💰', color: '#6B7280' },
  ]
}

/**
 * Obtener categorías del usuario
 */
export const getCategories = () => {
  const currentUser = getCurrentUser()
  if (!currentUser) return DEFAULT_CATEGORIES

  const allCategories = localStorage.getItem(KEYS.CATEGORIES)
  const categories = allCategories ? JSON.parse(allCategories) : {}
  
  // Si el usuario no tiene categorías personalizadas, usar las predeterminadas
  if (!categories[currentUser.id]) {
    return DEFAULT_CATEGORIES
  }
  
  return categories[currentUser.id]
}

/**
 * Guardar categorías personalizadas
 */
export const saveCategories = (newCategories) => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    return { success: false, message: 'Usuario no autenticado' }
  }

  const allCategories = localStorage.getItem(KEYS.CATEGORIES)
  const categories = allCategories ? JSON.parse(allCategories) : {}
  
  categories[currentUser.id] = newCategories
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories))
  
  return { success: true }
}

/**
 * Agregar una nueva categoría
 */
export const addCategory = (tipo, categoryData) => {
  const categories = getCategories()
  
  const newCategory = {
    id: Date.now().toString(),
    nombre: categoryData.nombre,
    icono: categoryData.icono || '📦',
    color: categoryData.color || '#6B7280',
  }
  
  categories[tipo].push(newCategory)
  saveCategories(categories)
  
  return { success: true, category: newCategory }
}

// ============================================
// UTILIDADES ADICIONALES
// ============================================

/**
 * Limpiar todos los datos (útil para desarrollo)
 */
export const clearAllData = () => {
  localStorage.removeItem(KEYS.USERS)
  localStorage.removeItem(KEYS.CURRENT_USER)
  localStorage.removeItem(KEYS.TRANSACTIONS)
  localStorage.removeItem(KEYS.CATEGORIES)
  console.log('✅ Todos los datos han sido eliminados')
}

/**
 * Exportar datos para respaldo
 */
export const exportData = () => {
  const data = {
    users: getUsers(),
    currentUser: getCurrentUser(),
    transactions: getTransactions(),
    categories: getCategories(),
    exportDate: new Date().toISOString(),
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `novafin-backup-${Date.now()}.json`
  a.click()
}

/**
 * Obtener estadísticas del usuario
 */
export const getStatistics = () => {
  const transactions = getTransactions()
  const balance = getBalance()
  
  // Gastos por categoría
  const gastosPorCategoria = transactions
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto
      return acc
    }, {})
  
  // Ingresos por categoría
  const ingresosPorCategoria = transactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto
      return acc
    }, {})
  
  return {
    balance,
    gastosPorCategoria,
    ingresosPorCategoria,
    totalTransacciones: transactions.length,
  }
}