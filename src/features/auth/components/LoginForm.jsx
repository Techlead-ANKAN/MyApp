import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'
import { ROUTES } from '@/shared/constants/routes'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import Card from '@/shared/components/Card'
import { Lock, User } from 'lucide-react'

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export default function LoginForm() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    const { error } = await signIn('Ankan', data.password)

    if (error) {
      toast.error(error.message || 'Failed to login')
      setIsLoading(false)
    } else {
      toast.success('Welcome back!')
      navigate(ROUTES.HOME)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-2xl bg-white/[0.03] border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple mb-4 shadow-lg shadow-accent-blue/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            <Input
              label="Username"
              type="text"
              value="Ankan"
              disabled
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            <Input
              {...register('password')}
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              className="pl-10"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-6 h-12 text-base font-semibold bg-gradient-to-r from-accent-blue to-accent-purple hover:shadow-lg hover:shadow-accent-blue/50 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">Use password: <span className="text-white/90 font-semibold">Goal</span></p>
        </div>
      </Card>
    </div>
  )
}
