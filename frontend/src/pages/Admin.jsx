import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import UsersAdmin from '../components/admin/UsersAdmin'
import VetsAdmin from '../components/admin/VetsAdmin'
import DiseasesAdmin from '../components/admin/DiseasesAdmin'
import MedicinesAdmin from '../components/admin/MedicinesAdmin'
import InventoryAdmin from '../components/admin/InventoryAdmin'
import SystemAdmin from '../components/admin/SystemAdmin'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')

  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    navigate('/dashboard')
    return null
  }

  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'vets', label: 'Vets & Clinics', icon: '🏥' },
    { id: 'diseases', label: 'Diseases', icon: '🦠' },
    { id: 'medicines', label: 'Medicines', icon: '💊' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersAdmin />
      case 'vets':
        return <VetsAdmin />
      case 'diseases':
        return <DiseasesAdmin />
      case 'medicines':
        return <MedicinesAdmin />
      case 'inventory':
        return <InventoryAdmin />
      case 'system':
        return <SystemAdmin />
      default:
        return <UsersAdmin />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">👑</span>
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage users, vets, diseases, medicines, inventory, and system settings</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'glass-panel border border-white/40 shadow-lg text-gray-900'
                    : 'bg-white/40 hover:bg-white/60 text-gray-700'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 border border-white/40">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
