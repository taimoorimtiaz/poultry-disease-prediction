import { useState } from 'react'
import { motion } from 'framer-motion'
import DiseasesManager from './DiseasesManager'
import MedicinesManager from './MedicinesManager'
import VetsManager from './VetsManager'
import UsersManager from './UsersManager'
import InventoryManager from './InventoryManager'

const tabs = [
  { id: 'diseases', label: 'Diseases', icon: '🦠' },
  { id: 'medicines', label: 'Medicines', icon: '💊' },
  { id: 'vets', label: 'Vet Clinics', icon: '🏥' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('diseases')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage system data and users</p>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'diseases' && <DiseasesManager />}
            {activeTab === 'medicines' && <MedicinesManager />}
            {activeTab === 'vets' && <VetsManager />}
            {activeTab === 'users' && <UsersManager />}
            {activeTab === 'inventory' && <InventoryManager />}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
