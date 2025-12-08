import { useState, useEffect } from 'react'
import { diseaseService } from '../../services/api'

export default function DiseasesManager() {
  const [diseases, setDiseases] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', symptoms: '' })

  useEffect(() => {
    fetchDiseases()
  }, [])

  const fetchDiseases = async () => {
    try {
      const { data } = await diseaseService.list()
      setDiseases(data.results || data)
    } catch (err) {
      console.error('Failed to load diseases:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await diseaseService.update(editing.id, formData)
      } else {
        await diseaseService.create(formData)
      }
      setFormData({ name: '', description: '', symptoms: '' })
      setEditing(null)
      fetchDiseases()
    } catch (err) {
      alert('Operation failed')
    }
  }

  const handleEdit = (disease) => {
    setEditing(disease)
    setFormData({ name: disease.name, description: disease.description, symptoms: disease.symptoms })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this disease?')) {
      try {
        await diseaseService.delete(id)
        fetchDiseases()
      } catch (err) {
        alert('Delete failed')
      }
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit' : 'Add'} Disease</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Disease Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <textarea
          placeholder="Symptoms (one per line)"
          value={formData.symptoms}
          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-4">
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-700">
            {editing ? 'Update' : 'Add'} Disease
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormData({ name: '', description: '', symptoms: '' })
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4">Diseases List</h2>
      <div className="space-y-4">
        {diseases.map((disease) => (
          <div key={disease.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{disease.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{disease.description}</p>
                <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{disease.symptoms}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(disease)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(disease.id)}
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
