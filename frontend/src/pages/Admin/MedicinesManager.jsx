import { useState, useEffect } from 'react'
import { medicineService, diseaseService } from '../../services/api'

export default function MedicinesManager() {
  const [medicines, setMedicines] = useState([])
  const [diseases, setDiseases] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    disease: '',
    dosage_guidelines: '',
    administration: '',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [medRes, diseaseRes] = await Promise.all([medicineService.list(), diseaseService.list()])
      setMedicines(medRes.data.results || medRes.data)
      setDiseases(diseaseRes.data.results || diseaseRes.data)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await medicineService.update(editing.id, formData)
      } else {
        await medicineService.create(formData)
      }
      setFormData({ name: '', disease: '', dosage_guidelines: '', administration: '', notes: '' })
      setEditing(null)
      fetchData()
    } catch (err) {
      alert('Operation failed')
    }
  }

  const handleEdit = (medicine) => {
    setEditing(medicine)
    setFormData({
      name: medicine.name,
      disease: medicine.disease,
      dosage_guidelines: medicine.dosage_guidelines,
      administration: medicine.administration,
      notes: medicine.notes || '',
    })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineService.delete(id)
        fetchData()
      } catch (err) {
        alert('Delete failed')
      }
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit' : 'Add'} Medicine</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Medicine Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <select
          value={formData.disease}
          onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        >
          <option value="">Select Disease</option>
          {diseases.map((disease) => (
            <option key={disease.id} value={disease.id}>
              {disease.name}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Dosage Guidelines"
          value={formData.dosage_guidelines}
          onChange={(e) => setFormData({ ...formData, dosage_guidelines: e.target.value })}
          required
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <textarea
          placeholder="Administration Instructions"
          value={formData.administration}
          onChange={(e) => setFormData({ ...formData, administration: e.target.value })}
          required
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <textarea
          placeholder="Additional Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-4">
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-700">
            {editing ? 'Update' : 'Add'} Medicine
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormData({ name: '', disease: '', dosage_guidelines: '', administration: '', notes: '' })
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4">Medicines List</h2>
      <div className="space-y-4">
        {medicines.map((medicine) => (
          <div key={medicine.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{medicine.name}</h3>
                <p className="text-sm text-gray-600">Disease: {medicine.disease_name}</p>
                <p className="text-xs text-gray-500 mt-1">Dosage: {medicine.dosage_guidelines}</p>
                <p className="text-xs text-gray-500">Administration: {medicine.administration}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(medicine)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(medicine.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
