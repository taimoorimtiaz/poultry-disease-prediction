import { useState, useEffect } from 'react'
import { inventoryService } from '../../services/api'

export default function InventoryManager() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ item_name: '', quantity: '', expiry_date: '' })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const { data } = await inventoryService.list()
      setInventory(data.results || data)
    } catch (err) {
      console.error('Failed to load inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        expiry_date: formData.expiry_date || null,
      }
      if (editing) {
        await inventoryService.update(editing.id, payload)
      } else {
        await inventoryService.create(payload)
      }
      setFormData({ item_name: '', quantity: '', expiry_date: '' })
      setEditing(null)
      fetchInventory()
    } catch (err) {
      alert('Operation failed')
    }
  }

  const handleEdit = (item) => {
    setEditing(item)
    setFormData({
      item_name: item.item_name,
      quantity: item.quantity.toString(),
      expiry_date: item.expiry_date || '',
    })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.delete(id)
        fetchInventory()
      } catch (err) {
        alert('Delete failed')
      }
    }
  }

  const handleExportCSV = async () => {
    try {
      const { data } = await inventoryService.exportCSV()
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'inventory.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Export failed')
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{editing ? 'Edit' : 'Add'} Inventory Item</h2>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          📊 Export CSV
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Item Name"
          value={formData.item_name}
          onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <input
          type="date"
          placeholder="Expiry Date (optional)"
          value={formData.expiry_date}
          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-4">
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-700">
            {editing ? 'Update' : 'Add'} Item
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormData({ item_name: '', quantity: '', expiry_date: '' })
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4">Inventory List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
