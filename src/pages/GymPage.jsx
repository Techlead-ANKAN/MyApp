// import { useEffect, useMemo, useState } from 'react'
// import Card from '@/shared/components/Card'
// import Button from '@/shared/components/Button'
// import Input from '@/shared/components/Input'
// // We will render a full-screen overlay instead of the generic Modal for admin
// import { Calendar as CalendarIcon, Dumbbell, Plus } from 'lucide-react'
// import { supabase } from '@/lib/supabase/client'
// import { useToast } from '@/shared/hooks/useToast'
// import { useNavigate } from 'react-router-dom'
// import { ROUTES } from '@/shared/constants/routes'

// export default function GymPage() {
//   const [sessionChecked, setSessionChecked] = useState(false)
//   const [isAuthed, setIsAuthed] = useState(false)
//   const [programs, setPrograms] = useState([])
//   const [loading, setLoading] = useState(true)
//   const toast = useToast()
//   const navigate = useNavigate()

//   // Calendar state
//   const [selectedDate, setSelectedDate] = useState(() => new Date())
//   const startOfMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), [selectedDate])
//   const endOfMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), [selectedDate])
//   const today = new Date()
//   const fmtDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
//   const toISODate = (d) => fmtDateOnly(d).toISOString()

//   // Gym day assignments and exercises
//   const [monthAssignments, setMonthAssignments] = useState([]) // [{day_date, body_part_name}]
//   const [dayExercises, setDayExercises] = useState([]) // [{exercise_name, sets, reps_per_set, weight, duration_minutes, notes}]
//   const [loadingDay, setLoadingDay] = useState(false)

//   // Optional: load programs if table exists; keep UI functional if missing
//   const loadPrograms = async () => {
//     setLoading(true)
//     try {
//       const { data, error } = await supabase
//         .from('gym_programs')
//         .select('id,name,start_date,is_active,created_at')
//         .order('created_at', { ascending: false })
//         .limit(50)
//       if (error) throw error
//       setPrograms(data || [])
//     } catch {
//       setPrograms([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(()=>{ loadPrograms() }, [])

//   // Ensure user is authenticated before RLS-protected queries
//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await supabase.auth.getSession()
//         setIsAuthed(!!data?.session?.user)
//       } finally {
//         setSessionChecked(true)
//       }
//     })()
//   }, [])

//   // Load month assignments (safe if tables not present)
//   const loadMonthAssignments = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('gym_day_assignments')
//         .select('day_date, body_parts(name)')
//         .gte('day_date', toISODate(startOfMonth))
//         .lte('day_date', new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate(), 23, 59, 59).toISOString())
//         .order('day_date', { ascending: true })
//       if (error) throw error
//       setMonthAssignments((data || []).map(r => ({
//         day_date: r.day_date,
//         body_part_name: r.body_parts?.name || null,
//       })))
//     } catch {
//       // tables may not exist yet; keep UI functional
//       setMonthAssignments([])
//     }
//   }

//   const loadDayExercises = async () => {
//     setLoadingDay(true)
//     try {
//       const { data, error } = await supabase
//         .from('gym_day_exercises_view')
//         .select('*')
//         .eq('day_date', toISODate(selectedDate))
//         .order('exercise_name', { ascending: true })
//       if (error) throw error
//       setDayExercises(data || [])
//     } catch {
//       setDayExercises([])
//     } finally {
//       setLoadingDay(false)
//     }
//   }

//   useEffect(()=>{ if (sessionChecked && isAuthed) loadMonthAssignments() }, [sessionChecked, isAuthed, startOfMonth, endOfMonth])
//   useEffect(()=>{ if (sessionChecked && isAuthed) loadDayExercises() }, [sessionChecked, isAuthed, selectedDate])

//   return (
//     <div className="max-w-7xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Gym Tracker</h2>
//           <p className="text-gray-400">
//             Plan workouts and track your fitness journey
//           </p>
//         </div>
//         <Button onClick={()=>navigate(ROUTES.GYM_ADMIN)} variant="primary" className="inline-flex items-center space-x-2 shadow-lg shadow-accent-orange/30">
//           <Plus className="w-5 h-5" />
//           <span>Gym Admin</span>
//         </Button>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Month Grid */}
//         <Card className="lg:col-span-2 backdrop-blur-2xl bg-white/[0.02]">
//           <div className="p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-2">
//                 <CalendarIcon className="w-5 h-5 text-accent-orange" />
//                 <h3 className="text-xl font-semibold text-white">
//                   {startOfMonth.toLocaleString(undefined,{ month:'long' })} {startOfMonth.getFullYear()}
//                 </h3>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Button variant="ghost" size="sm" onClick={()=>{ const d = new Date(selectedDate); d.setMonth(d.getMonth()-1); setSelectedDate(d) }}>Prev</Button>
//                 <Button variant="ghost" size="sm" onClick={()=>{ const d = new Date(selectedDate); d.setMonth(d.getMonth()+1); setSelectedDate(d) }}>Next</Button>
//               </div>
//             </div>
//             <div className="grid grid-cols-7 gap-2 auto-rows-[4.5rem]">
//               {(()=>{
//                 const firstDayIdx = startOfMonth.getDay()
//                 const totalDays = endOfMonth.getDate()
//                 const cells = []
//                 for (let i=0;i<firstDayIdx;i++) cells.push(null)
//                 for (let d=1; d<=totalDays; d++) {
//                   const dateObj = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), d)
//                   const iso = fmtDateOnly(dateObj).toISOString()
//                   const assignment = monthAssignments.find(a => a.day_date && fmtDateOnly(new Date(a.day_date)).toISOString() === iso)
//                   cells.push({ d, dateObj, assignment })
//                 }
//                 while (cells.length % 7 !== 0) cells.push(null)
//                 return cells
//               })().map((cell, idx) => (
//                 <button key={idx}
//                   className={`h-full rounded-xl p-2 text-left border transition-all duration-200 overflow-hidden ` +
//                     (cell ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]' : 'border-transparent')}
//                   onClick={()=> cell && setSelectedDate(cell.dateObj)}
//                   disabled={!cell}
//                 >
//                   {cell && (
//                     <div className="relative flex flex-col h-full">
//                       <div className="flex items-center justify-between">
//                         <span className="text-white text-sm font-semibold">{cell.d}</span>
//                         {cell.assignment?.body_part_name && (
//                           <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
//                             {cell.assignment.body_part_name}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </Card>

//         {/* Right panel: Selected day exercises */}
//         <Card className="backdrop-blur-2xl bg-white/[0.02]">
//           <div className="p-4 space-y-3">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-xl font-semibold text-white">Workout for Selected Day</h3>
//                 <p className="text-gray-400 text-xs">{selectedDate.toDateString()}</p>
//               </div>
//               <Button variant="outline" size="sm" onClick={()=>{/* future: open admin assign modal */}}>Assign</Button>
//             </div>
//             <div className="max-h-[50vh] overflow-auto no-scrollbar rounded-lg">
//               {loadingDay ? (
//                 <p className="text-gray-400">Loading…</p>
//               ) : dayExercises.length === 0 ? (
//                 <p className="text-gray-400">No exercises assigned.</p>
//               ) : (
//                 <ul className="divide-y divide-white/5">
//                   {dayExercises.map((ex, i)=> (
//                     <li key={i} className="py-3">
//                       <div className="flex items-center justify-between">
//                         <p className="text-white font-medium">{ex.exercise_name}</p>
//                         <span className="text-gray-400 text-xs">{ex.sets} x {ex.reps_per_set}{ex.weight ? ` @ ${ex.weight}kg` : ''}</span>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Admin now lives on a dedicated page via sidebar or header button */}
//     </div>
//   )
// }


import { useEffect, useMemo, useState } from 'react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import { Calendar as CalendarIcon, Dumbbell, Plus, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/shared/hooks/useToast'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export default function GymPage() {
  const toast = useToast()
  const navigate = useNavigate()

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const startOfMonth = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate]
  )
  const endOfMonth = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    [selectedDate]
  )

  const today = new Date()

  // === Date helpers (NO timezone issues) ===
  const dateKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}` // "YYYY-MM-DD" in LOCAL time

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  // Gym days (Chest Day, Leg Day, etc.)
  const [gymDays, setGymDays] = useState([]) // [{id, name}]

  // Month assignments: which calendar date → which gym day
  const [monthAssignments, setMonthAssignments] = useState([]) // [{day_date, gym_day_id, gym_day_name}]

  // Status map: which date is marked done
  const [statusMap, setStatusMap] = useState([]) // [{day_date, is_done}]

  // Selected day details (exercises)
  const [dayExercises, setDayExercises] = useState([]) // from view
  const [loadingDay, setLoadingDay] = useState(false)
  const [selectedDayAssignment, setSelectedDayAssignment] = useState(null)

  // Assign-day modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignGymDayId, setAssignGymDayId] = useState('')

  // Derived: is current selected date marked done?
  const isSelectedDone = useMemo(() => {
    const key = dateKey(selectedDate)
    const st = statusMap.find((s) => s.day_date === key)
    return st?.is_done ?? false
  }, [statusMap, selectedDate])

  // Load gym day types from gym_days
  const loadGymDays = async () => {
    try {
      const { data, error } = await supabase
        .from('gym_days')
        .select('id, name')
        .order('created_at', { ascending: true })

      if (error) throw error
      setGymDays(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load gym days')
      setGymDays([])
    }
  }

  // Load assignments for current month (calendar dates → gym_day)
  const loadMonthAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('gym_day_assignments')
        .select('day_date, gym_days(id, name)')
        .gte('day_date', dateKey(startOfMonth))
        .lte('day_date', dateKey(endOfMonth))
        .order('day_date', { ascending: true })

      if (error) throw error

      setMonthAssignments(
        (data || []).map((r) => ({
          day_date: r.day_date, // "YYYY-MM-DD"
          gym_day_id: r.gym_days?.id || null,
          gym_day_name: r.gym_days?.name || null,
        }))
      )
    } catch (err) {
      console.error(err)
      setMonthAssignments([])
    }
  }

  // Load completion status for current month
  const loadMonthStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('gym_day_status')
        .select('day_date, is_done')
        .gte('day_date', dateKey(startOfMonth))
        .lte('day_date', dateKey(endOfMonth))
        .order('day_date', { ascending: true })

      if (error) throw error
      setStatusMap(data || [])
    } catch (err) {
      console.error(err)
      setStatusMap([])
    }
  }

  // Load exercises for selected date from view
  const loadDayExercises = async (date = selectedDate) => {
    setLoadingDay(true)
    try {
      const { data, error } = await supabase
        .from('gym_day_exercises_view')
        .select('*')
        .eq('day_date', dateKey(date))
        .order('exercise_name', { ascending: true })

      if (error) throw error
      setDayExercises(data || [])
    } catch (err) {
      console.error(err)
      setDayExercises([])
    } finally {
      setLoadingDay(false)
    }
  }

  // Update selectedDayAssignment when date or monthAssignments change
  const refreshSelectedAssignment = () => {
    const key = dateKey(selectedDate)
    const match = monthAssignments.find((a) => a.day_date === key)
    setSelectedDayAssignment(match || null)
    if (match) {
      setAssignGymDayId(match.gym_day_id || '')
    } else {
      setAssignGymDayId('')
    }
  }

  // Initial loads
  useEffect(() => {
    loadGymDays()
  }, [])

  useEffect(() => {
    loadMonthAssignments()
    loadMonthStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOfMonth, endOfMonth])

  useEffect(() => {
    loadDayExercises()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  useEffect(() => {
    refreshSelectedAssignment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, monthAssignments])

  // Handlers
  const handleSelectDate = (dateObj) => {
    setSelectedDate(dateObj)
  }

  const handleOpenAssignModal = () => {
    if (!gymDays.length) {
      toast.error('No gym days found. Create them in Gym Admin first.')
      return
    }
    setAssignModalOpen(true)
  }

  const handleAssignDay = async () => {
    if (!assignGymDayId) {
      toast.error('Select a gym day')
      return
    }
    try {
      const payload = {
        day_date: dateKey(selectedDate), // pure "YYYY-MM-DD"
        gym_day_id: assignGymDayId,
      }

      const { error } = await supabase
        .from('gym_day_assignments')
        .upsert(payload, { onConflict: 'day_date' })

      if (error) throw error

      toast.success('Gym day assigned to this date')
      setAssignModalOpen(false)

      await loadMonthAssignments()
      await loadDayExercises()
    } catch (err) {
      console.error(err)
      toast.error(err.message)
    }
  }

  const handleToggleDone = async () => {
    const key = dateKey(selectedDate)
    const existing = statusMap.find((s) => s.day_date === key)
    const newVal = existing ? !existing.is_done : true

    try {
      const { error } = await supabase
        .from('gym_day_status')
        .upsert({ day_date: key, is_done: newVal }, { onConflict: 'day_date' })

      if (error) throw error

      toast.success(newVal ? 'Marked as done' : 'Marked as not done')
      await loadMonthStatus()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Gym Tracker
          </h2>
          <p className="text-gray-400">
            Plan workouts and track your fitness journey
          </p>
        </div>
        <Button
          onClick={() => navigate(ROUTES.GYM_ADMIN)}
          variant="primary"
          className="inline-flex items-center space-x-2 shadow-lg shadow-accent-orange/30"
        >
          <Plus className="w-5 h-5" />
          <span>Gym Admin</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid */}
        <Card className="lg:col-span-2 backdrop-blur-2xl bg-white/[0.02]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-accent-orange" />
                <h3 className="text-xl font-semibold text-white">
                  {startOfMonth.toLocaleString(undefined, {
                    month: 'long',
                  })}{' '}
                  {startOfMonth.getFullYear()}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const d = new Date(selectedDate)
                    d.setMonth(d.getMonth() - 1)
                    setSelectedDate(d)
                  }}
                >
                  Prev
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const d = new Date(selectedDate)
                    d.setMonth(d.getMonth() + 1)
                    setSelectedDate(d)
                  }}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2 auto-rows-[4.5rem]">
              {(() => {
                const firstDayIdx = startOfMonth.getDay()
                const totalDays = endOfMonth.getDate()
                const cells = []
                for (let i = 0; i < firstDayIdx; i++) cells.push(null)
                for (let d = 1; d <= totalDays; d++) {
                  const dateObj = new Date(
                    startOfMonth.getFullYear(),
                    startOfMonth.getMonth(),
                    d
                  )
                  const key = dateKey(dateObj)
                  const assignment = monthAssignments.find(
                    (a) => a.day_date === key
                  )
                  const status = statusMap.find((s) => s.day_date === key)
                  const isDone = status?.is_done ?? false
                  cells.push({ d, dateObj, assignment, isDone })
                }
                while (cells.length % 7 !== 0) cells.push(null)
                return cells
              })().map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={idx}
                      className="h-full rounded-xl border border-transparent"
                    />
                  )
                }

                const cellDateOnly = new Date(
                  cell.dateObj.getFullYear(),
                  cell.dateObj.getMonth(),
                  cell.dateObj.getDate()
                )
                const isTodayCell = isSameDate(cellDateOnly, todayOnly)
                const isPast = cellDateOnly < todayOnly
                const isSelected = isSameDate(
                  cellDateOnly,
                  new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate()
                  )
                )

                let bgClass = 'bg-white/[0.03]'
                let borderClass = 'border-white/10'

                if (isPast && !isTodayCell) {
                  bgClass = 'bg-white/[0.01]'
                  borderClass = 'border-white/5'
                }

                if (isTodayCell) {
                  bgClass =
                    'bg-emerald-400/15 backdrop-blur-xl shadow-inner shadow-emerald-500/20'
                  borderClass = 'border-emerald-400/50'
                }

                if (isSelected) {
                  borderClass =
                    'border-accent-orange/60 ring-1 ring-accent-orange/50'
                }

                return (
                  <button
                    key={idx}
                    className={[
                      'h-full rounded-xl p-2 text-left border transition-all duration-200 overflow-hidden',
                      bgClass,
                      borderClass,
                      'hover:bg-white/[0.08]',
                    ].join(' ')}
                    onClick={() => handleSelectDate(cell.dateObj)}
                  >
                    <div className="relative flex flex-col h-full justify-between">
                      {/* tick for done */}
                      {cell.isDone && (
                        <span className="absolute top-1 right-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            isPast && !isTodayCell
                              ? 'text-gray-300'
                              : 'text-white'
                          }`}
                        >
                          {cell.d}
                        </span>
                        {cell.assignment?.gym_day_name && (
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/8 border border-white/15 text-gray-100 max-w-[80%] truncate">
                            {cell.assignment.gym_day_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Right panel: Selected day exercises */}
        <Card className="backdrop-blur-2xl bg-white/[0.02]">
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Workout for Selected Day
                </h3>
                <p className="text-gray-400 text-xs">
                  {selectedDate.toDateString()}
                </p>
                {selectedDayAssignment?.gym_day_name ? (
                  <p className="mt-1 text-emerald-300 text-xs inline-flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    {selectedDayAssignment.gym_day_name}
                  </p>
                ) : (
                  <p className="mt-1 text-gray-500 text-xs">
                    No gym day assigned yet.
                  </p>
                )}
                {isSelectedDone && (
                  <p className="mt-1 text-emerald-400 text-xs inline-flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Gym completed for this day
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAssignModal}
                >
                  {selectedDayAssignment ? 'Change Day' : 'Assign Day'}
                </Button>
                <Button
                  variant={isSelectedDone ? 'ghost' : 'primary'}
                  size="sm"
                  onClick={handleToggleDone}
                  className="inline-flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  {isSelectedDone ? 'Undo Done' : 'Mark Done'}
                </Button>
              </div>
            </div>

            <div className="max-h-[50vh] overflow-auto no-scrollbar rounded-lg">
              {loadingDay ? (
                <p className="text-gray-400">Loading…</p>
              ) : dayExercises.length === 0 ? (
                <p className="text-gray-400">No exercises assigned.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {dayExercises.map((ex, i) => (
                    <li key={i} className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">
                          {ex.exercise_name}
                        </p>
                        <span className="text-gray-400 text-xs">
                          {ex.sets} ×{' '}
                          {ex.reps_per_set ??
                            (ex.duration_minutes
                              ? `${ex.duration_minutes} min`
                              : '')}
                          {ex.weight ? ` @ ${ex.weight}kg` : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Assign gym day modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Gym Day"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Select which gym day (Chest, Pull, Legs, etc.) you want to attach to{' '}
            <span className="font-medium text-white">
              {selectedDate.toDateString()}
            </span>
            .
          </p>

          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Gym Day
            </label>
            <select
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white p-2 h-[42px]"
              value={assignGymDayId}
              onChange={(e) => setAssignGymDayId(e.target.value)}
            >
              <option value="">Select…</option>
              {gymDays.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignDay}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
