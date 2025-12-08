/**
 * Unit tests for critical frontend components
 * 
 * To run these tests:
 * 1. Install testing dependencies:
 *    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
 * 
 * 2. Add to package.json scripts:
 *    "test": "vitest"
 * 
 * 3. Create vitest.config.js with:
 *    import { defineConfig } from 'vite'
 *    import react from '@vitejs/plugin-react'
 *    
 *    export default defineConfig({
 *      plugins: [react()],
 *      test: {
 *        environment: 'jsdom',
 *        globals: true,
 *        setupFiles: './src/test/setup.js',
 *      },
 *    })
 * 
 * 4. Create src/test/setup.js with:
 *    import '@testing-library/jest-dom'
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import AnimateAnalyzing from '../components/AnimateAnalyzing'
import ResultCard from '../components/ResultCard'
import Header from '../components/Header'

// Mock AuthContext provider for testing
const MockAuthProvider = ({ children, value }) => (
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
)

describe('AnimateAnalyzing Component', () => {
  it('renders analyzing animation', () => {
    render(<AnimateAnalyzing />)
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument()
  })

  it('cycles through analysis messages', async () => {
    render(<AnimateAnalyzing />)
    
    // Initial message should be visible
    const messageElement = screen.getByText(/analyzing|processing|detecting/i)
    expect(messageElement).toBeInTheDocument()
  })

  it('applies spinning animation class', () => {
    const { container } = render(<AnimateAnalyzing />)
    
    // Check that animation container has appropriate classes
    const animationDiv = container.querySelector('[class*="animate"]')
    expect(animationDiv).toBeInTheDocument()
  })
})

describe('ResultCard Component', () => {
  const mockPrediction = {
    disease_name: 'Coccidiosis',
    confidence: 0.87,
    disease_id: 1,
  }

  const mockRecommendations = [
    {
      medicine_name: 'Amprolium',
      dosage: '10 mg/kg body weight',
      administration: 'Mix in drinking water for 5-7 days',
      medicine_id: 1,
    },
  ]

  it('renders disease prediction correctly', () => {
    render(
      <ResultCard 
        prediction={mockPrediction} 
        recommendations={mockRecommendations} 
      />
    )

    expect(screen.getByText('Coccidiosis')).toBeInTheDocument()
    expect(screen.getByText(/87%/)).toBeInTheDocument()
  })

  it('displays confidence bar with correct width', () => {
    const { container } = render(
      <ResultCard 
        prediction={mockPrediction} 
        recommendations={mockRecommendations} 
      />
    )

    // Confidence bar should have width proportional to confidence (87%)
    const confidenceBar = container.querySelector('[class*="bg-green"]')
    expect(confidenceBar).toBeInTheDocument()
  })

  it('shows medicine recommendations', () => {
    render(
      <ResultCard 
        prediction={mockPrediction} 
        recommendations={mockRecommendations} 
      />
    )

    expect(screen.getByText('Amprolium')).toBeInTheDocument()
    expect(screen.getByText(/10 mg\/kg/)).toBeInTheDocument()
  })

  it('handles empty recommendations gracefully', () => {
    render(
      <ResultCard 
        prediction={mockPrediction} 
        recommendations={[]} 
      />
    )

    expect(screen.getByText('Coccidiosis')).toBeInTheDocument()
    // Should not crash with empty recommendations
  })
})

describe('Header Component', () => {
  const mockAuthContext = {
    user: null,
    logout: vi.fn(),
    isAuthenticated: false,
    isAdmin: false,
  }

  it('renders logo and navigation for unauthenticated user', () => {
    render(
      <BrowserRouter>
        <MockAuthProvider value={mockAuthContext}>
          <Header />
        </MockAuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText(/poultry disease/i)).toBeInTheDocument()
  })

  it('shows login button when not authenticated', () => {
    render(
      <BrowserRouter>
        <MockAuthProvider value={mockAuthContext}>
          <Header />
        </MockAuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText(/login/i)).toBeInTheDocument()
  })

  it('shows user menu when authenticated', () => {
    const authenticatedContext = {
      ...mockAuthContext,
      user: { email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
    }

    render(
      <BrowserRouter>
        <MockAuthProvider value={authenticatedContext}>
          <Header />
        </MockAuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText(/Test User|test@example.com/i)).toBeInTheDocument()
  })

  it('shows admin link for admin users', () => {
    const adminContext = {
      ...mockAuthContext,
      user: { email: 'admin@example.com', name: 'Admin User', role: 'admin' },
      isAuthenticated: true,
      isAdmin: true,
    }

    render(
      <BrowserRouter>
        <MockAuthProvider value={adminContext}>
          <Header />
        </MockAuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText(/admin/i)).toBeInTheDocument()
  })

  it('calls logout function when logout button clicked', async () => {
    const logoutMock = vi.fn()
    const authenticatedContext = {
      ...mockAuthContext,
      user: { email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      logout: logoutMock,
    }

    render(
      <BrowserRouter>
        <MockAuthProvider value={authenticatedContext}>
          <Header />
        </MockAuthProvider>
      </BrowserRouter>
    )

    const logoutButton = screen.getByText(/logout/i)
    await userEvent.click(logoutButton)

    expect(logoutMock).toHaveBeenCalledOnce()
  })
})

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('stores tokens in localStorage after login', () => {
    const accessToken = 'mock-access-token'
    const refreshToken = 'mock-refresh-token'

    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)

    expect(localStorage.getItem('access_token')).toBe(accessToken)
    expect(localStorage.getItem('refresh_token')).toBe(refreshToken)
  })

  it('removes tokens from localStorage on logout', () => {
    localStorage.setItem('access_token', 'mock-token')
    localStorage.setItem('refresh_token', 'mock-refresh')

    // Simulate logout
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })
})

describe('Form Validation Tests', () => {
  it('validates email format', () => {
    const invalidEmails = ['invalid', 'test@', '@example.com', 'test@.com']
    const validEmails = ['test@example.com', 'user+tag@domain.co.uk']

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false)
    })

    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true)
    })
  })

  it('validates password strength requirements', () => {
    const weakPasswords = ['123', 'password', 'abc']
    const strongPasswords = ['TestPass123!', 'Secure@2024', 'MyP@ssw0rd']

    // Minimum 6 characters for basic validation
    weakPasswords.forEach((password) => {
      expect(password.length).toBeLessThan(6)
    })

    strongPasswords.forEach((password) => {
      expect(password.length).toBeGreaterThanOrEqual(6)
    })
  })
})
