import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import { Moon, Sun, LayoutDashboard, Menu, X } from 'lucide-react'

const Header = () => {
  const { isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/all' },
    { name: 'Contact', path: '/contact' }
  ]

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            className="hover:bg-muted lg:hidden"
            aria-label="Toggle navigation menu"
            ref={buttonRef}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="hidden lg:flex items-center ml-6 gap-6">
            {navItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <Link 
          to="/" 
          className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold tracking-tight hover:text-primary/80 transition"
        >
          Quantum Minds
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="hover:bg-muted"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          {isAuthenticated && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              title="Admin Dashboard"
              className="hover:bg-muted"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute left-0 right-0 top-16 bg-background border-t border-b border-card-border lg:hidden"
        >
          <div className="container mx-auto px-0 w-full">
            <ul className="space-y-0 text-center divide-y divide-border w-full mx-0">
              {navItems.map(item => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`block py-3 hover:bg-muted transition-colors ${
                      isActive(item.path) ? 'text-primary font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
