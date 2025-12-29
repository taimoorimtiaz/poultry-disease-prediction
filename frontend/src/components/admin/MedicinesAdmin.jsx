import { useState, useEffect } from 'react'
import { medicineService } from '../../services/api'

export default function MedicinesAdmin() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dosage_per_bird: '',
    duration_days: '',
    price_per_unit: '',
    side_effects: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const { data } = await medicineService.list()
      const items = Array.isArray(data) ? data : data?.results || []
      setMedicines(items)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to load medicines' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddMedicine = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await medicineService.update(editingId, formData)
        setMessage({ type: 'success', text: 'Medicine updated successfully' })
        setEditingId(null)
      } else {
        await medicineService.create(formData)
        setMessage({ type: 'success', text: 'Medicine added successfully' })
      }
      setFormData({ name: '', description: '', dosage_per_bird: '', duration_days: '', price_per_unit: '', side_effects: '' })
      fetchMedicines()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save medicine' })
    }
  }

  const handleEdit = (medicine) => {
    setEditingId(medicine.id)
    setFormData(medicine)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await medicineService.delete(id)
        setMessage({ type: 'success', text: 'Medicine deleted successfully' })
        fetchMedicines()
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete medicine' })
      }
    }
  }

  return (
    <div>
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
        <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Medicine Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="dosage_per_bird"
            placeholder="Dosage per Bird"
            value={formData.dosage_per_bird}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            name="duration_days"
            placeholder="Duration (days)"
            value={formData.duration_days}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            name="price_per_unit"
            placeholder="Price per Unit"
            value={formData.price_per_unit}
            onChange={handleInputChange}
            step="0.01"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="2"
            className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            name="side_effects"
            placeholder="Side Effects"
            value={formData.side_effects}
            onChange={handleInputChange}
            rows="2"
            className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              {editingId ? 'Update' : 'Add'} Medicine
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ name: '', description: '', dosage_per_bird: '', duration_days: '', price_per_unit: '', side_effects: '' })
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading medicines...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="p-4 border border-gray-300 rounded-lg hover:shadow-lg transition-all">
              <h4 className="font-bold text-lg mb-2">{medicine.name}</h4>
              <p className="text-gray-600 text-sm mb-1">{medicine.description}</p>
              <p className="text-gray-600 text-xs">💊 {medicine.dosage_per_bird}</p>
              <p className="text-gray-600 text-xs">⏱️ {medicine.duration_days} days</p>
              <p className="text-gray-600 text-xs">💰 PKR {medicine.price_per_unit}</p>
              {medicine.side_effects && <p className="text-red-600 text-xs mt-1">⚠️ {medicine.side_effects}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(medicine)}
                  className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(medicine.id)}
                  className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
