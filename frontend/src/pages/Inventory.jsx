import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { inventoryService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Inventory() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    category: 'feed',
    quantity: '',
    unit: 'kg',
    price: '',
    expiry_date: '',
    notes: ''
  })

  const categories = [
    { value: 'feed', label: '🌾 Feed', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'vaccine', label: '💉 Vaccine', color: 'bg-blue-100 text-blue-800' },
    { value: 'medicine', label: '💊 Medicine', color: 'bg-green-100 text-green-800' },
    { value: 'equipment', label: '🔧 Equipment', color: 'bg-purple-100 text-purple-800' },
    { value: 'other', label: '📦 Other', color: 'bg-gray-100 text-gray-800' }
  ]

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const { data } = await inventoryService.list()
      // Handle both array and object with results array
      setItems(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await inventoryService.update(editingItem.id, formData)
      } else {
        await inventoryService.create(formData)
      }
      fetchInventory()
      resetForm()
    } catch (error) {
      alert('Failed to save item')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.delete(id)
        fetchInventory()
      } catch (error) {
        alert('Failed to delete item')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'feed',
      quantity: '',
      unit: 'kg',
      price: '',
      expiry_date: '',
      notes: ''
    })
    setEditingItem(null)
    setShowAddModal(false)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price || '',
      expiry_date: item.expiry_date || '',
      notes: item.notes || ''
    })
    setShowAddModal(true)
  }

  const getCategoryStyle = (category) => {
    return categories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800'
  }

  const getCategoryLabel = (category) => {
    return categories.find(c => c.value === category)?.label || '📦 Other'
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <p className="pill mb-2">Track your supplies</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              My <span className="accent-gradient">Inventory</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Manage feed, vaccines, medicines, and equipment for your {user?.role === 'vet' ? 'clinic' : 'farm'}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 text-white rounded-xl glow-button font-semibold"
          >
            ➕ Add Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-gray-600">Feed Stock</p>
            <p className="text-2xl font-bold text-yellow-600">
              {items.filter(i => i.category === 'feed').length}
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-gray-600">Vaccines</p>
            <p className="text-2xl font-bold text-blue-600">
              {items.filter(i => i.category === 'vaccine').length}
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm text-gray-600">Medicines</p>
            <p className="text-2xl font-bold text-green-600">
              {items.filter(i => i.category === 'medicine').length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-panel rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">🔍 All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          {(searchQuery || filterCategory !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>Showing {filteredItems.length} of {items.length} items</span>
              {(searchQuery || filterCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterCategory('all')
                  }}
                  className="text-primary hover:text-green-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inventory List */}
        {loading ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your inventory by adding your first item</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 text-white rounded-xl glow-button font-semibold"
            >
              ➕ Add Your First Item
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterCategory('all')
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Expiry</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.price ? `$${item.price}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {item.expiry_date ? (
                          <span className={`text-sm ${new Date(item.expiry_date) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
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
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Chicken Feed Premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">liters</option>
                    <option value="ml">ml</option>
                    <option value="units">units</option>
                    <option value="boxes">boxes</option>
                    <option value="bags">bags</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Additional notes or description..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-white rounded-xl glow-button font-semibold"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
