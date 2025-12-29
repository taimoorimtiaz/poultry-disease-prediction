import { useState, useEffect } from 'react'
import { diseaseService } from '../../services/api'

export default function DiseasesAdmin() {
  const [diseases, setDiseases] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symptoms: '',
    treatment_notes: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchDiseases()
  }, [])

  const fetchDiseases = async () => {
    setLoading(true)
    try {
      const { data } = await diseaseService.list()
      const items = Array.isArray(data) ? data : data?.results || []
      setDiseases(items)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to load diseases' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddDisease = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await diseaseService.update(editingId, formData)
        setMessage({ type: 'success', text: 'Disease updated successfully' })
        setEditingId(null)
      } else {
        await diseaseService.create(formData)
        setMessage({ type: 'success', text: 'Disease added successfully' })
      }
      setFormData({ name: '', description: '', symptoms: '', treatment_notes: '' })
      fetchDiseases()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save disease' })
    }
  }

  const handleEdit = (disease) => {
    setEditingId(disease.id)
    setFormData(disease)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await diseaseService.delete(id)
        setMessage({ type: 'success', text: 'Disease deleted successfully' })
        fetchDiseases()
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete disease' })
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
        <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Disease' : 'Add New Disease'}</h3>
        <form onSubmit={handleAddDisease} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Disease Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            name="symptoms"
            placeholder="Symptoms (comma-separated)"
            value={formData.symptoms}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            name="treatment_notes"
            placeholder="Treatment Notes"
            value={formData.treatment_notes}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              {editingId ? 'Update' : 'Add'} Disease
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ name: '', description: '', symptoms: '', treatment_notes: '' })
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
        <p className="text-center text-gray-600">Loading diseases...</p>
      ) : (
        <div className="space-y-4">
          {diseases.map((disease) => (
            <div key={disease.id} className="p-4 border border-gray-300 rounded-lg hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{disease.name}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(disease)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(disease.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{disease.description}</p>
              {disease.symptoms && <p className="text-gray-500 text-xs mb-1"><strong>Symptoms:</strong> {disease.symptoms}</p>}
              {disease.treatment_notes && <p className="text-gray-500 text-xs"><strong>Treatment:</strong> {disease.treatment_notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
