import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { vetService } from '../services/api'
import { motion } from 'framer-motion'

const containerStyle = {
  width: '100%',
  height: '500px',
}

export default function MapNearestVets({ onClose }) {
  const [userLocation, setUserLocation] = useState(null)
  const [vets, setVets] = useState([])
  const [selectedVet, setSelectedVet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          try {
            const { data } = await vetService.nearby(latitude, longitude, 10)
            setVets(data)
          } catch (err) {
            setError('Failed to load nearby vets')
          } finally {
            setLoading(false)
          }
        },
        () => {
          setError('Location permission denied')
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation not supported')
      setLoading(false)
    }
  }, [])

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  // Show warning if API key is not configured
  if (!apiKey) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Nearest Veterinary Clinics</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-semibold mb-2">Google Maps API Key Not Configured</p>
            <p className="text-yellow-700 text-sm mb-4">
              To use the veterinary clinic locator feature, please configure your Google Maps API key.
            </p>
            <ol className="text-yellow-700 text-sm text-left space-y-2 mb-4">
              <li>1. Get API key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>2. Create a <code className="bg-white px-2 py-1 rounded">.env</code> file in the frontend folder</li>
              <li>3. Add: <code className="bg-white px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your-key</code></li>
              <li>4. Restart the dev server</li>
            </ol>
            <button
              onClick={onClose}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Nearest Veterinary Clinics</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && <div className="text-danger text-center py-8">{error}</div>}

        {!loading && !error && userLocation && (
          <>
            <LoadScript googleMapsApiKey={apiKey}>
              <GoogleMap mapContainerStyle={containerStyle} center={userLocation} zoom={12}>
                <Marker position={userLocation} label="You" />
                {vets.map((vet) => (
                  <Marker
                    key={vet.id}
                    position={{ lat: vet.lat, lng: vet.lng }}
                    onClick={() => setSelectedVet(vet)}
                  />
                ))}
                {selectedVet && (
                  <InfoWindow
                    position={{ lat: selectedVet.lat, lng: selectedVet.lng }}
                    onCloseClick={() => setSelectedVet(null)}
                  >
                    <div>
                      <h3 className="font-bold">{selectedVet.name}</h3>
                      <p className="text-sm">{selectedVet.address}</p>
                      {selectedVet.phone && (
                        <p className="text-sm">
                          <a href={`tel:${selectedVet.phone}`} className="text-primary">
                            {selectedVet.phone}
                          </a>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedVet.distance_km} km away
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Clinic List</h3>
              {vets.length === 0 ? (
                <p className="text-gray-500">No veterinary clinics found nearby</p>
              ) : (
                <ul className="space-y-3">
                  {vets.map((vet) => (
                    <li key={vet.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{vet.name}</h4>
                          <p className="text-sm text-gray-600">{vet.address}</p>
                          {vet.phone && (
                            <a href={`tel:${vet.phone}`} className="text-sm text-primary">
                              {vet.phone}
                            </a>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {vet.distance_km} km
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
