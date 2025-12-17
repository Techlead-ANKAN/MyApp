import { useAuth } from '@/features/auth/hooks/useAuth'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import SmallStatCard from '@/shared/components/SmallStatCard'
import { User, Mail, Save, CheckCircle2, Dumbbell, Award, Flame } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Profile Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/30">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={user?.email || ''}
            disabled
          />

          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your name"
          />

          <Button className="inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </Card>

      {/* Achievement Stats */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Your Achievement Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SmallStatCard
            label="Tasks Done"
            value="127"
            icon={CheckCircle2}
            accent="emerald"
          />
          <SmallStatCard
            label="Gym Sessions"
            value="18"
            icon={Dumbbell}
            accent="orange"
          />
          <SmallStatCard
            label="Milestones"
            value="8"
            icon={Award}
            accent="purple"
          />
          <SmallStatCard
            label="Day Streak"
            value="15"
            icon={Flame}
            accent="rose"
          />
        </div>
      </div>
    </div>
  )
}
