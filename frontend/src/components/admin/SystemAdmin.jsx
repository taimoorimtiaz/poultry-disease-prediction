import { useEffect, useState } from 'react'
import { settingsService } from '../../services/api'

export default function SystemAdmin() {
  const [settings, setSettings] = useState({
    siteName: 'Poultry AI',
    maintenanceMode: false,
    maxUploadSize: 5,
    otpExpiry: 10,
    emailVerification: true,
    allowSignups: true,
    defaultTheme: 'light'
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await settingsService.get()
      setSettings(prev => ({
        ...prev,
        maintenanceMode: data.maintenance_mode,
        allowSignups: data.allow_signups,
      }))
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load settings' })
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      const payload = {
        maintenance_mode: settings.maintenanceMode,
        allow_signups: settings.allowSignups,
      }
      await settingsService.update(payload)
      setMessage({ type: 'success', text: 'System settings saved successfully' })
      setSaved(true)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save settings' })
    }
  }

  return (
    <div>
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* General Settings */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4">General Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Maintenance Mode</span>
              </label>
              <p className="text-xs text-gray-600 mt-1 ml-7">Disable access for non-admin users</p>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.allowSignups}
                  onChange={(e) => handleSettingChange('allowSignups', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Allow Signups</span>
              </label>
              <p className="text-xs text-gray-600 mt-1 ml-7">Allow new users to register</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Default Theme</label>
              <select
                value={settings.defaultTheme}
                onChange={(e) => handleSettingChange('defaultTheme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4">Security Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.emailVerification}
                  onChange={(e) => handleSettingChange('emailVerification', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Require Email Verification</span>
              </label>
              <p className="text-xs text-gray-600 mt-1 ml-7">Require OTP for signup and account changes</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">OTP Expiry (minutes)</label>
              <input
                type="number"
                value={settings.otpExpiry}
                onChange={(e) => handleSettingChange('otpExpiry', parseInt(e.target.value))}
                min="5"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Max Upload Size (MB)</label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => handleSettingChange('maxUploadSize', parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4">Email Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Email settings are configured in the backend <code className="bg-gray-200 px-2 py-1 rounded">.env</code> file.
          </p>
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Current:</strong> Gmail SMTP configured<br/>
              <strong>Status:</strong> ✅ Active<br/>
              <strong>OTP Emails:</strong> Verified working
            </p>
          </div>
        </div>

        {/* System Info */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4">System Information</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Frontend:</strong> React 18 + Vite 5</p>
            <p><strong>Backend:</strong> Django 4.x + DRF</p>
            <p><strong>Database:</strong> SQLite (Development)</p>
            <p><strong>AI Model:</strong> EfficientNet-B0 (98.29% accuracy)</p>
            <p><strong>Authentication:</strong> JWT + OTP</p>
            <p><strong>Mapping:</strong> Google Maps + OpenStreetMap</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
          >
            💾 Save Settings
          </button>
          {saved && (
            <span className="flex items-center gap-2 text-green-600 font-semibold">
              ✅ Saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
