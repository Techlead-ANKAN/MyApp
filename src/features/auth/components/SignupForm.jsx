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
import { Lock, Mail, User } from 'lucide-react'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function SignupForm() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    const { error } = await signUp(data.email, data.password, {
      full_name: data.fullName,
    })

    if (error) {
      toast.error(error.message || 'Failed to sign up')
      setIsLoading(false)
    } else {
      toast.success('Account created! Please check your email to verify.')
      navigate(ROUTES.LOGIN)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-2xl bg-white/[0.03] border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue mb-4 shadow-lg shadow-accent-purple/30">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-gray-400 text-sm">Start your productivity journey today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            <Input
              {...register('fullName')}
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.fullName?.message}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            <Input
              {...register('email')}
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
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

          <div className="relative">
            <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            <Input
              {...register('confirmPassword')}
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              className="pl-10"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-6 h-12 text-base font-semibold bg-gradient-to-r from-accent-purple to-accent-blue hover:shadow-lg hover:shadow-accent-purple/50 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating account...</span>
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-accent-purple hover:text-accent-blue font-semibold transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
