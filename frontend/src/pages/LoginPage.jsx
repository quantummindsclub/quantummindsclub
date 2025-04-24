import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../components/ui/use-toast'
import CaptchaWidget from '../components/CaptchaWidget'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('');
  const { login, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleCaptchaVerify = (token) => {
    setTurnstileToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!turnstileToken) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please complete the verification challenge.",
      });
      return;
    }
    setIsLoading(true)
    const result = await login(username, password, turnstileToken)
    setIsLoading(false)
    if (result.success) {
      navigate('/admin')
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.error || "Invalid credentials. Please try again.",
        duration: 5000,
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md px-4 py-12 border login-card rounded-lg shadow-sm bg-card">
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
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="my-4 w-full">
            <CaptchaWidget onVerify={handleCaptchaVerify} />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
                Logging in...
              </>
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
