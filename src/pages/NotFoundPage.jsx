import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '@/shared/components/Button'
import { ROUTES } from '@/shared/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent mb-6">404</h1>
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Page Not Found</h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={ROUTES.HOME}>
          <Button variant="primary" className="inline-flex items-center space-x-2 shadow-lg shadow-accent-blue/30">
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
