import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../components/ui/use-toast'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const { login, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(time => time - 1);
      }, 1000);
    } else if (cooldownTime === 0 && isRateLimited) {
      setIsRateLimited(false);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime, isRateLimited]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isRateLimited) {
      return;
    }
    
    setIsLoading(true)
    
    const result = await login(username, password)
    
    setIsLoading(false)
    
    if (result.success) {
      navigate('/')
    } else {
      if (result.isRateLimited) {
        setIsRateLimited(true)
        setCooldownTime(30) 
        
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: (
            <div>
              {result.error}
              <div className="mt-2">
                Please wait {cooldownTime} seconds before trying again.
              </div>
            </div>
          ),
          duration: 5000,
        })
      }
    }
  }

  return (
    <div className="flex justify-center items-start py-10">
      <div className="w-full max-w-md px-8 py-12 border login-card rounded-lg shadow-sm bg-card">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading || isRateLimited}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading || isRateLimited}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isRateLimited}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
                Logging in...
              </>
            ) : isRateLimited ? (
              `Try again in ${cooldownTime}s`
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
