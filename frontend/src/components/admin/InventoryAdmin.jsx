import { useState, useEffect } from 'react'
import { inventoryService } from '../../services/api'

export default function InventoryAdmin() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    price_per_unit: ''
  })
  const [editingId, setEditingId] = useState(null)

  const categories = ['Feed', 'Vaccine', 'Medicine', 'Equipment', 'Supplies', 'Other']
  const units = ['kg', 'liter', 'pieces', 'box', 'bottle']

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const { data } = await inventoryService.list()
      const items = Array.isArray(data) ? data : data?.results || []
      setInventory(items)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to load inventory' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await inventoryService.update(editingId, formData)
        setMessage({ type: 'success', text: 'Inventory item updated successfully' })
        setEditingId(null)
      } else {
        await inventoryService.create(formData)
        setMessage({ type: 'success', text: 'Inventory item added successfully' })
      }
      setFormData({ name: '', category: '', quantity: '', unit: '', price_per_unit: '' })
      fetchInventory()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save inventory item' })
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData(item)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await inventoryService.delete(id)
        setMessage({ type: 'success', text: 'Inventory item deleted successfully' })
        fetchInventory()
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete inventory item' })
      }
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Feed': 'bg-yellow-100 text-yellow-800',
      'Vaccine': 'bg-blue-100 text-blue-800',
      'Medicine': 'bg-red-100 text-red-800',
      'Equipment': 'bg-purple-100 text-purple-800',
      'Supplies': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Unit</option>
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <input
            type="number"
            name="price_per_unit"
            placeholder="Price per Unit"
            value={formData.price_per_unit}
            onChange={handleInputChange}
            step="0.01"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              {editingId ? 'Update' : 'Add'} Item
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ name: '', category: '', quantity: '', unit: '', price_per_unit: '' })
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
        <p className="text-center text-gray-600">Loading inventory...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Quantity</th>
                <th className="text-left p-3">Unit</th>
                <th className="text-left p-3">Price/Unit</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{item.name}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3">PKR {item.price_per_unit}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
