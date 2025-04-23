import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '../components/ui/use-toast'
import { apiGet, apiPost } from '../lib/api'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const checkAuthStatus = useCallback(async () => {
    const shouldCheckAuth = 
      location.pathname.startsWith('/admin') || 
      location.pathname.startsWith('/edit') || 
      location.pathname.startsWith('/new') || 
      location.pathname.startsWith('/manage');
      
    if (!shouldCheckAuth && authChecked) {
      return;
    }
    
    if (!authChecked || shouldCheckAuth) {
      try {
        setLoading(true)
        const response = await apiGet('/api/auth/status')
        
        if (!response.ok) {
          throw new Error('Failed to check authentication status');
        }
        
        const data = await response.json()
        
        if (data.authenticated) {
          setUser({ username: data.user })
        } else {
          setUser(null)
          
          if (shouldCheckAuth) {
            navigate('/login', { replace: true })
          }
        }
        setAuthChecked(true)
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
  }, [location.pathname, authChecked, navigate])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = async (username, password) => {
    try {
      const response = await apiPost('/api/auth/login', { username, password })

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          throw new Error(errorData.error || 'Too many login attempts. Please try again later.');
        } else if (response.status === 403) {
          throw new Error(errorData.error || 'Access temporarily blocked for security reasons.');
        }
        
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      setUser({ username });
      setAuthChecked(true);
      
      toast({
        title: "Login Successful",
        description: "You've been successfully logged in.",
      });
      
      return { success: true };
    } catch (error) {
      const isRateLimited = error.message.includes('too many') || 
                           error.message.includes('try again later') ||
                           error.message.toLowerCase().includes('attempt');
      
      toast({
        variant: "destructive",
        title: isRateLimited ? "Rate Limited" : "Login Failed",
        description: error.message || "Invalid credentials",
        duration: isRateLimited ? 5000 : 3000, 
      })
      
      return { success: false, error: error.message, isRateLimited }
    }
  }

  const logout = async () => {
    try {
      await apiPost('/api/auth/logout', {})
      
      setUser(null)
      
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      })
      
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null) 
      
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "There was a problem logging out.",
      })
      
      navigate('/')
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
