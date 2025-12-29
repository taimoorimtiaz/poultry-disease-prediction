import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

console.log('API_BASE configured as:', API_BASE)

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Check for maintenance mode (503) - but only redirect non-admin users
    if (error.response?.status === 503) {
      // Check if user is admin
      const token = localStorage.getItem('accessToken')
      let isAdmin = false
      
      if (token) {
        try {
          const decoded = jwtDecode(token)
          isAdmin = decoded.role === 'admin'
        } catch (e) {
          // Invalid token, not admin
        }
      }
      // Fallback to persisted user if token lacks claims (e.g., after refresh)
      if (!isAdmin) {
        try {
          const persisted = JSON.parse(localStorage.getItem('currentUser') || 'null')
          if (persisted?.role === 'admin') {
            isAdmin = true
          }
        } catch {}
      }
      // Never redirect while on admin routes
      const onAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
      
      // Only redirect non-admin users to maintenance page
      if (!isAdmin && !onAdminRoute) {
        window.location.href = '/maintenance'
      }
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, {
            refresh: refreshToken,
          })
          localStorage.setItem('accessToken', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  signup: (data) => api.post('/auth/signup/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  deleteAccount: (data) => api.post('/auth/delete-account/', data),
  sendOTP: (data) => api.post('/auth/send-otp/', data),
  verifyOTP: (data) => api.post('/auth/verify-otp/', data),
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return false
    try {
      const decoded = jwtDecode(token)
      return decoded.exp * 1000 > Date.now()
    } catch {
      return false
    }
  },
  getUser: () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    try {
      return jwtDecode(token)
    } catch {
      return null
    }
  },
}

export const analysisService = {
  upload: (formData) =>
    api.post('/analysis/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStatus: (id) => api.get(`/analysis/${id}/status/`),
  getResult: (id) => api.get(`/analysis/${id}/result/`),
  getHistory: () => api.get('/analysis/history/'),
}

export const diseaseService = {
  list: (params) => api.get('/diseases/', { params }),
  get: (id) => api.get(`/diseases/${id}/`),
  create: (data) => api.post('/diseases/', data),
  update: (id, data) => api.put(`/diseases/${id}/`, data),
  delete: (id) => api.delete(`/diseases/${id}/`),
}

export const medicineService = {
  list: (params) => api.get('/medicines/', { params }),
  get: (id) => api.get(`/medicines/${id}/`),
  create: (data) => api.post('/medicines/', data),
  update: (id, data) => api.put(`/medicines/${id}/`, data),
  delete: (id) => api.delete(`/medicines/${id}/`),
}

export const vetService = {
  list: (params) => api.get('/vets/', { params }),
  nearby: (lat, lng, radius_km = 10) =>
    api.get('/vets/nearby/', { params: { lat, lng, radius_km } }),
  create: (data) => api.post('/vets/', data),
  update: (id, data) => api.put(`/vets/${id}/`, data),
  delete: (id) => api.delete(`/vets/${id}/`),
}

export const inventoryService = {
  list: () => api.get('/inventory/'),
  create: (data) => api.post('/inventory/', data),
  update: (id, data) => api.put(`/inventory/${id}/`, data),
  delete: (id) => api.delete(`/inventory/${id}/`),
  exportCSV: () => api.get('/inventory/export/', { responseType: 'blob' }),
}

export const reportService = {
  list: () => api.get('/reports/'),
  generate: (analysisId) => api.post('/reports/generate/', { analysis_id: analysisId }),
  download: (id) => api.get(`/reports/${id}/download/`, { responseType: 'blob' }),
}

export const userService = {
  list: (params) => api.get('/auth/users/', { params }),
  update: (id, data) => api.patch(`/auth/users/${id}/`, data),
  delete: (id) => api.delete(`/auth/users/${id}/`),
}

export const settingsService = {
  get: () => api.get('/auth/settings/'),
  update: (data) => api.patch('/auth/settings/', data),
}

export default api
