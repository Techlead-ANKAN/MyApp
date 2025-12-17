import { useEffect, useMemo, useState } from 'react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import { Calendar as CalendarIcon, Dumbbell, ChevronRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/shared/hooks/useToast'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from 'dayjs'

export default function GymPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [monthAssignments, setMonthAssignments] = useState([])
  const [monthStatus, setMonthStatus] = useState([])
  const [dayExercises, setDayExercises] = useState([])
  const [gymDayName, setGymDayName] = useState(null)
  const [isDone, setIsDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const navigate = useNavigate()

  const startOfMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), [selectedDate])
  const endOfMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), [selectedDate])
  const today = new Date()

  const fmtDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const toDateKey = (d) => dayjs(d).format('YYYY-MM-DD')

  useEffect(() => {
    loadMonthAssignments()
  }, [startOfMonth, endOfMonth])

  useEffect(() => {
    loadDayDetails()
  }, [selectedDate])

  const loadMonthAssignments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gym_day_assignments')
        .select(`
          day_date,
          gym_days (name)
        `)
        .gte('day_date', toDateKey(startOfMonth))
        .lte('day_date', toDateKey(endOfMonth))
        .order('day_date', { ascending: true })

      if (error) throw error

      setMonthAssignments((data || []).map(r => ({
        day_date: r.day_date,
        gym_day_name: r.gym_days?.name || null,
      })))

      // Load completion status for the month
      const { data: statusData } = await supabase
        .from('gym_day_status')
        .select('day_date, is_done')
        .gte('day_date', toDateKey(startOfMonth))
        .lte('day_date', toDateKey(endOfMonth))

      setMonthStatus(statusData || [])
    } catch (error) {
      console.error('Error loading assignments:', error)
      setMonthAssignments([])
      setMonthStatus([])
    } finally {
      setLoading(false)
    }
  }

  const loadDayDetails = async () => {
    const dateKey = toDateKey(selectedDate)
    
    try {
      // Load gym day assignment
      const { data: assignment } = await supabase
        .from('gym_day_assignments')
        .select(`
          *,
          gym_days (name)
        `)
        .eq('day_date', dateKey)
        .maybeSingle()

      if (assignment) {
        setGymDayName(assignment.gym_days?.name || 'Gym Day')
        
        // Load exercises for this gym day
        const { data: exercises } = await supabase
          .from('gym_day_exercises_view')
          .select('*')
          .eq('day_date', dateKey)
          .order('exercise_name', { ascending: true })

        setDayExercises(exercises || [])

        // Load completion status
        const { data: status } = await supabase
          .from('gym_day_status')
          .select('is_done')
          .eq('day_date', dateKey)
          .maybeSingle()

        setIsDone(status?.is_done || false)
      } else {
        setGymDayName(null)
        setDayExercises([])
        setIsDone(false)
      }
    } catch (error) {
      console.error('Error loading day details:', error)
      setGymDayName(null)
      setDayExercises([])
      setIsDone(false)
    }
  }

  const toggleDone = async () => {
    const dateKey = toDateKey(selectedDate)
    const newStatus = !isDone

    try {
      const { error } = await supabase
        .from('gym_day_status')
        .upsert({
          day_date: dateKey,
          is_done: newStatus,
        }, {
          onConflict: 'day_date'
        })

      if (error) throw error

      setIsDone(newStatus)
      toast.success(newStatus ? 'Marked as done!' : 'Marked as pending')
      loadMonthAssignments()
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    }
  }

  const daysGrid = useMemo(() => {
    const firstDayIdx = startOfMonth.getDay()
    const totalDays = endOfMonth.getDate()
    const cells = []
    
    for (let i = 0; i < firstDayIdx; i++) cells.push(null)
    
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), d)
      const dateKey = toDateKey(dateObj)
      const assignment = monthAssignments.find(a => a.day_date === dateKey)
      const status = monthStatus.find(s => s.day_date === dateKey)
      
      cells.push({
        d,
        dateObj,
        gymDayName: assignment?.gym_day_name || null,
        isDone: status?.is_done || false,
      })
    }
    
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [startOfMonth, endOfMonth, monthAssignments, monthStatus])

  const isSameDate = (a, b) => 
    a.getFullYear() === b.getFullYear() && 
    a.getMonth() === b.getMonth() && 
    a.getDate() === b.getDate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Gym Tracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Plan workouts and track your fitness journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
          <Button onClick={() => navigate(ROUTES.GYM_ADMIN)}>
            <Dumbbell className="w-4 h-4" />
            Gym Admin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {startOfMonth.toLocaleString(undefined, { month: 'long' })} {startOfMonth.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {loading && <span className="text-slate-500 dark:text-slate-400 text-sm">Loading...</span>}
              <Button variant="ghost" size="sm" onClick={() => {
                const d = new Date(selectedDate)
                d.setMonth(d.getMonth() - 1)
                setSelectedDate(d)
              }}>Prev</Button>
              <Button variant="ghost" size="sm" onClick={() => {
                const d = new Date(selectedDate)
                d.setMonth(d.getMonth() + 1)
                setSelectedDate(d)
              }}>Next</Button>
            </div>
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-7 text-center text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 auto-rows-[80px] md:auto-rows-[100px]">
            {daysGrid.map((cell, idx) => (
              <button
                key={idx}
                className={`
                  h-full rounded-lg p-2 text-left border transition-all duration-200 overflow-hidden
                  ${cell ? 'border-slate-200 dark:border-slate-800' : 'border-transparent'}
                  ${cell && isSameDate(cell.dateObj, today)
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}
                  ${cell && isSameDate(cell.dateObj, selectedDate) ? 'ring-2 ring-primary-500' : ''}
                `}
                onClick={() => cell && setSelectedDate(cell.dateObj)}
                disabled={!cell}
              >
                {cell && (
                  <>
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-sm font-semibold ${
                        isSameDate(cell.dateObj, today)
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : cell.dateObj < fmtDateOnly(today)
                          ? 'text-slate-400 dark:text-slate-600'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {cell.d}
                      </span>
                      {cell.isDone && (
                        <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      )}
                    </div>
                    {cell.gymDayName && (
                      <Badge variant="warning" className="text-[10px] px-1.5 py-0 truncate max-w-full">
                        {cell.gymDayName}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Workout Details */}
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </h3>
              {gymDayName ? (
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{gymDayName}</Badge>
                  <Badge variant={isDone ? 'success' : 'default'}>
                    {isDone ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No gym day assigned</p>
              )}
            </div>

            {gymDayName ? (
              <>
                {/* Exercises List */}
                {dayExercises.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exercises</h4>
                    <div className="space-y-2 max-h-[400px] overflow-auto">
                      {dayExercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1">
                            {exercise.exercise_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            {exercise.reps_per_set ? (
                              <>
                                <span>{exercise.sets} sets × {exercise.reps_per_set} reps</span>
                                {exercise.weight && <span>@ {exercise.weight} kg</span>}
                              </>
                            ) : exercise.duration_minutes ? (
                              <span>{exercise.sets} sets × {exercise.duration_minutes} min</span>
                            ) : (
                              <span>{exercise.sets} sets</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No exercises assigned</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <Button
                    variant={isDone ? 'secondary' : 'primary'}
                    className="w-full"
                    onClick={toggleDone}
                  >
                    {isDone ? 'Mark as Pending' : 'Mark as Done'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => navigate(ROUTES.GYM_ADMIN)}
                  >
                    <span>Manage Workouts</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  No workout assigned for this day
                </p>
                <Button onClick={() => navigate(ROUTES.GYM_ADMIN)}>
                  Assign Workout
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
