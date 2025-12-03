import { useEffect, useState } from 'react'
import Card from '@/shared/components/Card'
import { 
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function HomePage() {
  // Today's tasks pulled from Supabase (mirrors Calendar logic)
  const [todayCounts, setTodayCounts] = useState({ done: 0, total: 0 })
  const [gymTodayDone, setGymTodayDone] = useState(false)

  useEffect(() => {
    const loadToday = async () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59)
      const { data, error } = await supabase
        .from('tasks')
        .select('id,status,start_at')
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
      if (error) {
        // Keep silent failure on dashboard to avoid noisy toasts
        setTodayCounts({ done: 0, total: 0 })
      } else {
        const total = data?.length || 0
        const done = (data || []).filter(t => (t.status || 'todo') === 'done').length
        setTodayCounts({ done, total })
      }

      // Gym done flag (via gym_day_status table if present)
      try {
        const yyyy = start.getFullYear()
        const mm = String(start.getMonth() + 1).padStart(2, '0')
        const dd = String(start.getDate()).padStart(2, '0')
        const key = `${yyyy}-${mm}-${dd}`
        const { data: gds, error: gErr } = await supabase
          .from('gym_day_status')
          .select('is_done')
          .eq('day_date', key)
          .maybeSingle()
        if (!gErr && gds) {
          setGymTodayDone(!!gds.is_done)
        } else {
          setGymTodayDone(false)
        }
      } catch {
        // Table may not exist yet; treat as not done
        setGymTodayDone(false)
      }
    }
    loadToday()
  }, [])

  const todayStats = {
    tasksCompleted: todayCounts.done,
    totalTasks: todayCounts.total,
    gymCompleted: gymTodayDone,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-accent-blue/10 via-transparent to-accent-purple/10">
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Welcome to Your Discipline Hub 🚀
          </h2>
          <p className="text-gray-300 text-lg">
            Track your progress, build streaks, and achieve your goals with precision
          </p>
        </div>
      </div>

      {/* Today's Summary */}
      <Card className="backdrop-blur-2xl bg-white/[0.02]">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6 text-accent-blue" />
          <span>Today's Progress</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="text-center p-5 rounded-xl bg-gradient-to-br from-accent-blue/10 to-transparent border border-white/10 hover:border-accent-blue/30 transition-all duration-300">
            <p className="text-4xl font-bold text-accent-blue mb-2">
              {todayStats.tasksCompleted}/{todayStats.totalTasks}
            </p>
            <p className="text-gray-400 text-sm font-medium">Tasks Done</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-gradient-to-br from-accent-green/10 to-transparent border border-white/10 hover:border-accent-green/30 transition-all duration-300">
            <p className="text-4xl font-bold text-accent-green mb-2">
              {todayStats.gymCompleted ? '✓' : '○'}
            </p>
            <p className="text-gray-400 text-sm font-medium">Gym Today</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="backdrop-blur-2xl bg-white/[0.02]">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-accent-blue" />
          <span>Quick Stats Overview</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-accent-blue/10 to-transparent border border-white/10 hover:border-accent-blue/30 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-2 font-medium">Total Tasks Completed</p>
            <p className="text-4xl font-bold text-white">127</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-accent-orange/10 to-transparent border border-white/10 hover:border-accent-orange/30 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-2 font-medium">Gym Sessions This Month</p>
            <p className="text-4xl font-bold text-white">18</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-accent-purple/10 to-transparent border border-white/10 hover:border-accent-purple/30 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-2 font-medium">Learning Milestones</p>
            <p className="text-4xl font-bold text-white">8/15</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
