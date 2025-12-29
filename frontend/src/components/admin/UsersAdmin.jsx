import { useState, useEffect } from 'react'
import { userService } from '../../services/api'

export default function UsersAdmin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await userService.list()
      const items = Array.isArray(data) ? data : data?.results || []
      setUsers(items)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await userService.update(userId, {
        is_active: !currentStatus
      })
      setMessage({ 
        type: 'success', 
        text: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      })
      fetchUsers()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user status' })
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await userService.update(userId, {
        role: newRole
      })
      setMessage({ type: 'success', text: 'User role updated successfully' })
      fetchUsers()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user role' })
    }
  }

  const filteredUsers = users.filter(u => {
    if (filter === 'active') return u?.is_active
    if (filter === 'inactive') return !u?.is_active
    if (filter === 'admin') return u?.role === 'admin'
    if (filter === 'farmer') return u?.role === 'farmer'
    if (filter === 'vet') return u?.role === 'vet'
    return true
  })

  return (
    <div>
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All ({users.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-all ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Active ({users.filter(u => u.is_active).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg transition-all ${filter === 'inactive' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Inactive ({users.filter(u => !u.is_active).length})
        </button>
        <button
          onClick={() => setFilter('admin')}
          className={`px-4 py-2 rounded-lg transition-all ${filter === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="px-3 py-1 rounded border border-gray-300"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="vet">Vet</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`px-3 py-1 rounded text-white text-sm transition-all ${
                        user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
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
