import { useAuth } from '@/features/auth/hooks/useAuth'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import { User, Mail, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Profile Settings</h2>
        <p className="text-gray-400">Manage your account information and preferences</p>
      </div>

      {/* Profile Info */}
      <Card className="backdrop-blur-2xl bg-white/[0.02]">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/30">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {user?.email?.split('@')[0]}
            </h3>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              className="pl-10"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              className="pl-10"
            />
          </div>

          <Button variant="primary" className="inline-flex items-center space-x-2 shadow-lg shadow-accent-blue/30">
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <Card className="backdrop-blur-2xl bg-white/[0.02]">
        <h3 className="text-xl font-semibold text-white mb-6">Your Achievement Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-5 rounded-xl bg-gradient-to-br from-accent-blue/10 to-transparent border border-white/10">
            <p className="text-3xl font-bold text-accent-blue mb-2">127</p>
            <p className="text-gray-400 text-sm">Tasks Done</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-gradient-to-br from-accent-orange/10 to-transparent border border-white/10">
            <p className="text-3xl font-bold text-accent-orange mb-2">18</p>
            <p className="text-gray-400 text-sm">Gym Sessions</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-gradient-to-br from-accent-purple/10 to-transparent border border-white/10">
            <p className="text-3xl font-bold text-accent-purple mb-2">8</p>
            <p className="text-gray-400 text-sm">Milestones</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-gradient-to-br from-accent-green/10 to-transparent border border-white/10">
            <p className="text-3xl font-bold text-accent-green mb-2">15</p>
            <p className="text-gray-400 text-sm">Day Streak</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
