import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 mt-4">
        <Button asChild>
          <Link to="/" className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/about" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            About Quantum Minds
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
