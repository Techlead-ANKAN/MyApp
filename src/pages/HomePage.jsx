import { useEffect, useState } from 'react'
import Card from '@/shared/components/Card'
import SmallStatCard from '@/shared/components/SmallStatCard'
import Checkbox from '@/shared/components/Checkbox'
import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import { 
  Trophy,
  CheckCircle2,
  Dumbbell,
  Flame,
  Calendar as CalendarIcon,
  Clock,
  Edit2,
  Trash2,
  ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from 'dayjs'

export default function HomePage() {
  const navigate = useNavigate()
  const [todayTasks, setTodayTasks] = useState([])
  const [todayGymDay, setTodayGymDay] = useState(null)
  const [gymStreak, setGymStreak] = useState(0)
  const [stats, setStats] = useState({
    completionPercent: 0,
    tasksCompleted: 0,
    gymSessions: 0,
    totalTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const now = new Date()
      const today = dayjs(now).format('YYYY-MM-DD')
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59)

      // Load today's tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('created_at', { ascending: false })

      if (!tasksError && tasksData) {
        setTodayTasks(tasksData)
      }

      // Load today's gym assignment
      try {
        const { data: gymAssignment } = await supabase
          .from('gym_day_assignments')
          .select(`
            *,
            gym_days (name)
          `)
          .eq('day_date', today)
          .maybeSingle()

        if (gymAssignment) {
          const { data: gymStatus } = await supabase
            .from('gym_day_status')
            .select('is_done')
            .eq('day_date', today)
            .maybeSingle()

          setTodayGymDay({
            name: gymAssignment.gym_days?.name || 'Gym Day',
            isDone: gymStatus?.is_done || false
          })
        }
      } catch (e) {
        console.error('Gym data error:', e)
      }

      // Calculate gym streak
      try {
        const { data: gymStatuses } = await supabase
          .from('gym_day_status')
          .select('day_date, is_done')
          .eq('is_done', true)
          .order('day_date', { ascending: false })
          .limit(30)

        if (gymStatuses && gymStatuses.length > 0) {
          let streak = 0
          let currentDate = dayjs()
          
          for (let i = 0; i < 30; i++) {
            const checkDate = currentDate.subtract(i, 'day').format('YYYY-MM-DD')
            const hasWorkout = gymStatuses.some(s => s.day_date === checkDate)
            if (hasWorkout) {
              streak++
            } else if (i > 0) {
              break
            }
          }
          setGymStreak(streak)
        }
      } catch (e) {
        console.error('Streak calculation error:', e)
      }

      // Load aggregate stats
      const { count: totalTasksCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })

      const { count: completedTasksCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'done')

      const monthStart = dayjs().startOf('month').format('YYYY-MM-DD')
      const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD')
      
      const { count: gymSessionsCount } = await supabase
        .from('gym_day_status')
        .select('day_date', { count: 'exact', head: true })
        .eq('is_done', true)
        .gte('day_date', monthStart)
        .lte('day_date', monthEnd)

      const completionPercent = totalTasksCount > 0 
        ? Math.round((completedTasksCount / totalTasksCount) * 100) 
        : 0

      setStats({
        completionPercent,
        tasksCompleted: completedTasksCount || 0,
        gymSessions: gymSessionsCount || 0,
        totalTasks: totalTasksCount || 0,
      })
    } catch (error) {
      console.error('Dashboard data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : null
      })
      .eq('id', taskId)

    if (!error) {
      loadDashboardData()
    }
  }

  const deleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (!error) {
      loadDashboardData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Track your progress and stay on top of your goals
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SmallStatCard
          label="Overall completion"
          value={`${stats.completionPercent}%`}
          subtext={`${stats.tasksCompleted} of ${stats.totalTasks} tasks`}
          icon={Trophy}
          accent="primary"
        />
        <SmallStatCard
          label="Tasks completed"
          value={stats.tasksCompleted}
          subtext="All time"
          icon={CheckCircle2}
          accent="emerald"
        />
        <SmallStatCard
          label="Gym sessions"
          value={stats.gymSessions}
          subtext="This month"
          icon={Dumbbell}
          accent="orange"
        />
        <SmallStatCard
          label="Gym streak"
          value={`${gymStreak} days`}
          subtext={gymStreak > 0 ? "Keep it up!" : "Start your streak"}
          icon={Flame}
          accent="rose"
        />
        <SmallStatCard
          label="Today's gym"
          value={todayGymDay ? todayGymDay.name : 'Not assigned'}
          subtext={todayGymDay?.isDone ? '✓ Completed' : 'Pending'}
          icon={CalendarIcon}
          accent={todayGymDay ? 'amber' : 'primary'}
        />
        <SmallStatCard
          label="Tasks today"
          value={`${todayTasks.filter(t => t.status === 'done').length}/${todayTasks.length}`}
          subtext={todayTasks.length > 0 ? 'In progress' : 'No tasks'}
          icon={Clock}
          accent="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Todo List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Today's Tasks
            </h2>
            <Button 
              size="sm" 
              onClick={() => navigate(ROUTES.CALENDAR)}
              className="text-xs"
            >
              View All
            </Button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No tasks scheduled for today
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Checkbox 
                    checked={task.status === 'done'}
                    onChange={() => toggleTask(task.id, task.status)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {task.description}
                      </p>
                    )}
                  </div>
                  {task.status === 'done' && (
                    <Badge variant="success" className="text-xs">Done</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's Progress Summary */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Today's Progress
          </h2>
          
          <div className="space-y-6">
            {/* Tasks Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tasks</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {todayTasks.filter(t => t.status === 'done').length} / {todayTasks.length}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${todayTasks.length > 0 ? (todayTasks.filter(t => t.status === 'done').length / todayTasks.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Gym Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gym</span>
                {todayGymDay ? (
                  <Badge variant={todayGymDay.isDone ? 'success' : 'warning'}>
                    {todayGymDay.isDone ? 'Completed' : 'Pending'}
                  </Badge>
                ) : (
                  <Badge variant="default">Not assigned</Badge>
                )}
              </div>
              {todayGymDay && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {todayGymDay.name}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  className="w-full justify-between"
                  onClick={() => navigate(ROUTES.CALENDAR)}
                >
                  <span>Manage Tasks</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-between"
                  onClick={() => navigate(ROUTES.GYM)}
                >
                  <span>Track Gym</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
