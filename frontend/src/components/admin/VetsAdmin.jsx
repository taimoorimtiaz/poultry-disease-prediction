import { useState, useEffect } from 'react'
import { vetService } from '../../services/api'

export default function VetsAdmin() {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    clinic_name: '',
    city: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchVets()
  }, [])

  const fetchVets = async () => {
    setLoading(true)
    try {
      const { data } = await vetService.list()
      const items = Array.isArray(data) ? data : data?.results || []
      setVets(items)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to load vets' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddVet = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await vetService.update(editingId, formData)
        setMessage({ type: 'success', text: 'Vet clinic updated successfully' })
        setEditingId(null)
      } else {
        await vetService.create(formData)
        setMessage({ type: 'success', text: 'Vet clinic added successfully' })
      }
      setFormData({ clinic_name: '', city: '', latitude: '', longitude: '', phone: '', email: '' })
      fetchVets()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save vet clinic' })
    }
  }

  const handleEdit = (vet) => {
    setEditingId(vet.id)
    setFormData(vet)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vet clinic?')) {
      try {
        await vetService.delete(id)
        setMessage({ type: 'success', text: 'Vet clinic deleted successfully' })
        fetchVets()
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete vet clinic' })
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

      {/* Form */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Vet Clinic' : 'Add New Vet Clinic'}</h3>
        <form onSubmit={handleAddVet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="clinic_name"
            placeholder="Clinic Name"
            value={formData.clinic_name}
            onChange={handleInputChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            step="0.0001"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            step="0.0001"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              {editingId ? 'Update' : 'Add'} Clinic
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ clinic_name: '', city: '', latitude: '', longitude: '', phone: '', email: '' })
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-600">Loading vets...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vets.map((vet) => (
            <div key={vet.id} className="p-4 border border-gray-300 rounded-lg hover:shadow-lg transition-all">
              <h4 className="font-bold text-lg mb-2">{vet.clinic_name}</h4>
              <p className="text-gray-600 text-sm">📍 {vet.city}</p>
              <p className="text-gray-600 text-sm">📞 {vet.phone}</p>
              <p className="text-gray-600 text-sm">📧 {vet.email}</p>
              <p className="text-gray-500 text-xs mt-2">Lat: {vet.latitude}, Lng: {vet.longitude}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(vet)}
                  className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(vet.id)}
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
