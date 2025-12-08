import { useState, useEffect } from 'react'
import { vetService } from '../../services/api'

export default function VetsManager() {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', address: '', lat: '', lng: '', phone: '' })

  useEffect(() => {
    fetchVets()
  }, [])

  const fetchVets = async () => {
    try {
      const { data } = await vetService.list()
      setVets(data.results || data)
    } catch (err) {
      console.error('Failed to load vets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      }
      if (editing) {
        await vetService.update(editing.id, payload)
      } else {
        await vetService.create(payload)
      }
      setFormData({ name: '', address: '', lat: '', lng: '', phone: '' })
      setEditing(null)
      fetchVets()
    } catch (err) {
      alert('Operation failed')
    }
  }

  const handleEdit = (vet) => {
    setEditing(vet)
    setFormData({
      name: vet.name,
      address: vet.address,
      lat: vet.lat.toString(),
      lng: vet.lng.toString(),
      phone: vet.phone || '',
    })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vet clinic?')) {
      try {
        await vetService.delete(id)
        fetchVets()
      } catch (err) {
        alert('Delete failed')
      }
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit' : 'Add'} Vet Clinic</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Clinic Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <textarea
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-4">
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-700">
            {editing ? 'Update' : 'Add'} Clinic
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormData({ name: '', address: '', lat: '', lng: '', phone: '' })
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4">Vet Clinics List</h2>
      <div className="space-y-4">
        {vets.map((vet) => (
          <div key={vet.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{vet.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{vet.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {vet.lat}, {vet.lng}
                </p>
                {vet.phone && <p className="text-xs text-gray-500">Phone: {vet.phone}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(vet)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(vet.id)}
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
