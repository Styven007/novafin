import { useState } from 'react'
import { saveTransaction, getCategories } from '../utils/storage'

function TransactionForm({ tipo, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    monto: '',
    categoria: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Obtener categorías según el tipo
  const categories = getCategories()
  const availableCategories = tipo === 'ingreso' ? categories.ingresos : categories.gastos

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    if (!formData.categoria) {
      setError('Debes seleccionar una categoría')
      return
    }

    setLoading(true)

    // Guardar transacción
    const result = saveTransaction({
      tipo,
      monto: parseFloat(formData.monto),
      categoria: formData.categoria,
      descripcion: formData.descripcion,
      fecha: new Date(formData.fecha).toISOString()
    })

    setLoading(false)

    if (result.success) {
      onSuccess(result.transaction)
    } else {
      setError(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Mensaje de Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Campo Monto */}
      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
          Monto *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
            $
          </span>
          <input
            id="monto"
            name="monto"
            type="number"
            value={formData.monto}
            onChange={handleChange}
            placeholder="50000"
            min="0"
            step="100"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Campo Categoría */}
      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
          Categoría *
        </label>
        <select
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none bg-white"
          required
          disabled={loading}
        >
          <option value="">Selecciona una categoría</option>
          {availableCategories.map(cat => (
            <option key={cat.id} value={cat.nombre}>
              {cat.icono} {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Campo Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Ej: Compra de mercado"
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
          disabled={loading}
        />
      </div>

      {/* Campo Fecha */}
      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha *
        </label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          required
          disabled={loading}
        />
      </div>

      {/* Botones */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 px-4 py-3 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
            tipo === 'ingreso'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {loading ? 'Guardando...' : tipo === 'ingreso' ? 'Agregar Ingreso' : 'Registrar Gasto'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm