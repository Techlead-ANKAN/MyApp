// import { useEffect, useState } from 'react'
// import Card from '@/shared/components/Card'
// import Button from '@/shared/components/Button'
// import Input from '@/shared/components/Input'
// import Modal from '@/shared/components/Modal'
// import { supabase } from '@/lib/supabase/client'
// import { useToast } from '@/shared/hooks/useToast'

// export default function GymAdmin() {
//   const toast = useToast()

//   // Gym Days
//   const [days, setDays] = useState([])
//   const [dayName, setDayName] = useState('')
//   const [editingDayId, setEditingDayId] = useState(null)
//   const [editingDayName, setEditingDayName] = useState('')

//   // Global exercises list (names only, used for "find or create")
//   const [exercises, setExercises] = useState([])

//   // Assign exercise to a day
//   const [selectedDayId, setSelectedDayId] = useState('')
//   const [exerciseName, setExerciseName] = useState('')
//   const [mode, setMode] = useState('count') // 'count' | 'time'
//   const [setsInput, setSetsInput] = useState('')
//   const [repsInput, setRepsInput] = useState('')
//   const [durationInput, setDurationInput] = useState('')
//   const [weightInput, setWeightInput] = useState('')

//   const [savingDay, setSavingDay] = useState(false)
//   const [savingAssign, setSavingAssign] = useState(false)

//   // When this changes, child tables reload
//   const [reloadKey, setReloadKey] = useState(0)

//   // Load days + exercises
//   const loadInitial = async () => {
//     try {
//       const { data: ds, error: dsErr } = await supabase
//         .from('gym_days')
//         .select('id,name,created_at')
//         .order('created_at', { ascending: true })

//       if (dsErr) throw dsErr

//       const { data: ex, error: exErr } = await supabase
//         .from('exercises')
//         .select('id,name')
//         .order('name', { ascending: true })

//       if (exErr) throw exErr

//       setDays(ds || [])
//       setExercises(ex || [])
//     } catch (err) {
//       console.error(err)
//       toast.error(err.message || 'Failed to load data')
//       setDays([])
//       setExercises([])
//     }
//   }

//   useEffect(() => {
//     loadInitial()
//   }, [])

//   // ========== GYM DAY CRUD ==========

//   const createDay = async () => {
//     if (!dayName.trim()) {
//       toast.error('Day name required')
//       return
//     }
//     setSavingDay(true)
//     try {
//       const { error } = await supabase
//         .from('gym_days')
//         .insert({ name: dayName.trim() })

//       if (error) throw error
//       toast.success('Day added')
//       setDayName('')
//       await loadInitial()
//     } catch (err) {
//       toast.error(err.message)
//     } finally {
//       setSavingDay(false)
//     }
//   }

//   const startEditDay = (day) => {
//     setEditingDayId(day.id)
//     setEditingDayName(day.name)
//   }

//   const saveEditDay = async () => {
//     if (!editingDayId) return
//     if (!editingDayName.trim()) {
//       toast.error('Day name required')
//       return
//     }
//     setSavingDay(true)
//     try {
//       const { error } = await supabase
//         .from('gym_days')
//         .update({ name: editingDayName.trim() })
//         .eq('id', editingDayId)

//       if (error) throw error
//       toast.success('Day updated')
//       setEditingDayId(null)
//       setEditingDayName('')
//       await loadInitial()
//     } catch (err) {
//       toast.error(err.message)
//     } finally {
//       setSavingDay(false)
//     }
//   }

//   const cancelEditDay = () => {
//     setEditingDayId(null)
//     setEditingDayName('')
//   }

//   const deleteDay = async (id) => {
//     if (!window.confirm('Delete this day and its assignments?')) return
//     setSavingDay(true)
//     try {
//       const { error } = await supabase
//         .from('gym_days')
//         .delete()
//         .eq('id', id)

//       if (error) throw error
//       toast.success('Day deleted')
//       if (selectedDayId === id) setSelectedDayId('')
//       await loadInitial()
//       setReloadKey((k) => k + 1)
//     } catch (err) {
//       toast.error(err.message)
//     } finally {
//       setSavingDay(false)
//     }
//   }

//   // ========== ASSIGN EXERCISE TO A DAY ==========

//   const handleAssignExerciseToDay = async () => {
//     if (!selectedDayId) {
//       toast.error('Select a gym day')
//       return
//     }
//     if (!exerciseName.trim()) {
//       toast.error('Exercise name required')
//       return
//     }
//     if (!setsInput) {
//       toast.error('Sets required')
//       return
//     }
//     if (mode === 'count' && !repsInput) {
//       toast.error('Reps required')
//       return
//     }
//     if (mode === 'time' && !durationInput) {
//       toast.error('Time (minutes) required')
//       return
//     }

//     setSavingAssign(true)
//     try {
//       // Find or create global exercise by name
//       let exercise = exercises.find(
//         (e) => e.name.toLowerCase() === exerciseName.trim().toLowerCase()
//       )

//       if (!exercise) {
//         const { data, error } = await supabase
//           .from('exercises')
//           .insert({ name: exerciseName.trim() })
//           .select('id,name')
//           .single()

//         if (error) throw error
//         exercise = data
//         setExercises((prev) => [...prev, data])
//       }

//       const sets = Number(setsInput) || 0
//       const reps = mode === 'count' ? Number(repsInput) || null : null
//       const duration =
//         mode === 'time' ? Number(durationInput) || null : null
//       const weight = weightInput === '' ? null : Number(weightInput)

//       // Use your existing RPC to create the row in gym_day_exercises
//       const { error: assignErr } = await supabase.rpc(
//         'assign_exercise_to_day',
//         {
//           p_day_id: selectedDayId,
//           p_exercise_id: exercise.id,
//           p_sets: sets,
//           p_reps: reps,
//           p_duration: duration,
//           p_weight: weight,
//           p_note: null,
//         }
//       )

//       if (assignErr) throw assignErr

//       toast.success('Exercise saved for this day')

//       setExerciseName('')
//       setSetsInput('')
//       setRepsInput('')
//       setDurationInput('')
//       setWeightInput('')

//       // Tell tables to reload
//       setReloadKey((k) => k + 1)
//     } catch (err) {
//       toast.error(err.message)
//     } finally {
//       setSavingAssign(false)
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//       {/* LEFT: Gym days management */}
//       <div className="lg:col-span-1 space-y-6">
//         <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
//           <div className="p-5 space-y-4">
//             <h3 className="text-lg font-semibold text-white">
//               Gym Days
//             </h3>

//             {/* Add new day */}
//             <div className="flex gap-2">
//               <Input
//                 label="Add Day"
//                 value={dayName}
//                 onChange={(e) => setDayName(e.target.value)}
//                 placeholder="e.g., Chest Day"
//               />
//               <div className="flex items-end">
//                 <Button
//                   onClick={createDay}
//                   disabled={savingDay}
//                   className="whitespace-nowrap"
//                 >
//                   {savingDay ? 'Saving…' : 'Add'}
//                 </Button>
//               </div>
//             </div>

//             {/* List of days with edit/delete */}
//             <div className="max-h-[60vh] overflow-auto no-scrollbar">
//               <ul className="divide-y divide-white/5">
//                 {days.map((d) => (
//                   <li
//                     key={d.id}
//                     className="py-2 flex items-center justify-between gap-2"
//                   >
//                     {editingDayId === d.id ? (
//                       <>
//                         <input
//                           className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
//                           value={editingDayName}
//                           onChange={(e) =>
//                             setEditingDayName(e.target.value)
//                           }
//                         />
//                         <div className="flex gap-1">
//                           <Button
//                             size="xs"
//                             onClick={saveEditDay}
//                             disabled={savingDay}
//                           >
//                             Save
//                           </Button>
//                           <Button
//                             size="xs"
//                             variant="ghost"
//                             onClick={cancelEditDay}
//                           >
//                             Cancel
//                           </Button>
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <button
//                           className={`flex-1 text-left text-sm ${
//                             selectedDayId === d.id
//                               ? 'text-white'
//                               : 'text-gray-300'
//                           }`}
//                           onClick={() => setSelectedDayId(d.id)}
//                         >
//                           {d.name}
//                         </button>
//                         <div className="flex gap-1">
//                           <Button
//                             size="xs"
//                             variant="ghost"
//                             onClick={() => startEditDay(d)}
//                           >
//                             Edit
//                           </Button>
//                           <Button
//                             size="xs"
//                             variant="outline"
//                             onClick={() => deleteDay(d.id)}
//                           >
//                             Del
//                           </Button>
//                         </div>
//                       </>
//                     )}
//                   </li>
//                 ))}
//                 {days.length === 0 && (
//                   <li className="py-2 text-sm text-gray-400">
//                     No days yet. Add one above.
//                   </li>
//                 )}
//               </ul>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* RIGHT: Assign exercise + tables per day */}
//       <div className="lg:col-span-3 space-y-6">
//         {/* Assign exercise to a day */}
//         <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
//           <div className="p-6 space-y-4">
//             <h3 className="text-xl font-semibold text-white mb-2">
//               Add / Assign Exercise
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
//               {/* Select Day */}
//               <div>
//                 <label className="block text-gray-400 text-sm mb-1">
//                   Gym Day
//                 </label>
//                 <select
//                   className="w-full rounded-lg bg-white/5 border border-white/10 text-white p-2 h-[42px]"
//                   value={selectedDayId}
//                   onChange={(e) => setSelectedDayId(e.target.value)}
//                 >
//                   <option value="">Select day…</option>
//                   {days.map((d) => (
//                     <option key={d.id} value={d.id}>
//                       {d.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Exercise name */}
//               <Input
//                 label="Exercise name"
//                 value={exerciseName}
//                 onChange={(e) => setExerciseName(e.target.value)}
//                 placeholder="e.g., Bench Press"
//               />

//               {/* Mode */}
//               <div>
//                 <label className="block text-gray-400 text-sm mb-1">
//                   Mode
//                 </label>
//                 <div className="flex items-center gap-3">
//                   <label className="inline-flex items-center gap-2 text-gray-300 text-sm">
//                     <input
//                       type="radio"
//                       name="mode"
//                       checked={mode === 'count'}
//                       onChange={() => setMode('count')}
//                     />
//                     Count
//                   </label>
//                   <label className="inline-flex items-center gap-2 text-gray-300 text-sm">
//                     <input
//                       type="radio"
//                       name="mode"
//                       checked={mode === 'time'}
//                       onChange={() => setMode('time')}
//                     />
//                     Time
//                   </label>
//                 </div>
//               </div>

//               {/* Sets */}
//               <Input
//                 label="Sets"
//                 type="number"
//                 value={setsInput}
//                 onChange={(e) => setSetsInput(e.target.value)}
//                 placeholder="3"
//               />

//               {/* Reps or Time */}
//               {mode === 'count' ? (
//                 <Input
//                   label="Reps"
//                   type="number"
//                   value={repsInput}
//                   onChange={(e) => setRepsInput(e.target.value)}
//                   placeholder="10"
//                 />
//               ) : (
//                 <Input
//                   label="Time (min)"
//                   type="number"
//                   value={durationInput}
//                   onChange={(e) => setDurationInput(e.target.value)}
//                   placeholder="1"
//                 />
//               )}

//               {/* Weight */}
//               <Input
//                 label="Weight (kg)"
//                 type="number"
//                 value={weightInput}
//                 onChange={(e) => setWeightInput(e.target.value)}
//                 placeholder="optional"
//               />

//               {/* Assign button */}
//               <div className="flex items-end">
//                 <Button
//                   onClick={handleAssignExerciseToDay}
//                   disabled={savingAssign}
//                   className="w-full"
//                 >
//                   {savingAssign ? 'Saving…' : 'Save to Day'}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </Card>

//         {/* Tables per day */}
//         <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
//           <div className="p-6 space-y-6">
//             <h4 className="text-white font-medium">
//               Exercises per Gym Day
//             </h4>
//             <div className="space-y-6">
//               {days.map((d) => (
//                 <div
//                   key={d.id}
//                   className="rounded-xl border border-white/10 p-4"
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className="text-white font-semibold">
//                       {d.name}
//                     </h5>
//                   </div>
//                   <AssignedExercises
//                     dayId={d.id}
//                     reloadKey={reloadKey}
//                   />
//                 </div>
//               ))}
//               {days.length === 0 && (
//                 <p className="text-gray-400 text-sm">
//                   Add a gym day to see its exercises.
//                 </p>
//               )}
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   )
// }

// /**
//  * Table for exercises assigned to a single day
//  * Supports: read, update (sets/reps/time/weight), delete assignment
//  */
// function AssignedExercises({ dayId, reloadKey }) {
//   const toast = useToast()
//   const [rows, setRows] = useState([])
//   const [loading, setLoading] = useState(false)

//   // Edit modal state
//   const [editingRow, setEditingRow] = useState(null)
//   const [editSets, setEditSets] = useState('')
//   const [editReps, setEditReps] = useState('')
//   const [editDuration, setEditDuration] = useState('')
//   const [editWeight, setEditWeight] = useState('')

//   const loadRows = async () => {
//     setLoading(true)
//     try {
//       const { data, error } = await supabase
//         .from('gym_day_exercises')
//         .select(
//           'id, sets, reps, duration_minutes, weight, note, exercises(name)'
//         )
//         .eq('gym_day_id', dayId)
//         .order('created_at', { ascending: true })

//       if (error) throw error
//       setRows(data || [])
//     } catch (err) {
//       toast.error(err.message)
//       setRows([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadRows()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dayId, reloadKey])

//   const openEdit = (row) => {
//     setEditingRow(row)
//     setEditSets(row.sets?.toString() || '')
//     setEditReps(row.reps?.toString() || '')
//     setEditDuration(row.duration_minutes?.toString() || '')
//     setEditWeight(row.weight?.toString() || '')
//   }

//   const saveEdit = async () => {
//     if (!editingRow) return
//     try {
//       const sets = Number(editSets) || 0
//       const reps = editReps === '' ? null : Number(editReps)
//       const duration =
//         editDuration === '' ? null : Number(editDuration)
//       const weight =
//         editWeight === '' ? null : Number(editWeight)

//       const { error } = await supabase
//         .from('gym_day_exercises')
//         .update({
//           sets,
//           reps,
//           duration_minutes: duration,
//           weight,
//         })
//         .eq('id', editingRow.id)

//       if (error) throw error
//       toast.success('Exercise updated')
//       setEditingRow(null)
//       await loadRows()
//     } catch (err) {
//       toast.error(err.message)
//     }
//   }

//   const deleteRow = async (rowId) => {
//     if (!window.confirm('Remove this exercise from the day?')) return
//     try {
//       const { error } = await supabase
//         .from('gym_day_exercises')
//         .delete()
//         .eq('id', rowId)

//       if (error) throw error
//       toast.success('Exercise removed')
//       await loadRows()
//     } catch (err) {
//       toast.error(err.message)
//     }
//   }

//   return (
//     <div className="overflow-auto no-scrollbar">
//       <table className="w-full text-left text-gray-300 text-sm">
//         <thead className="text-gray-400">
//           <tr>
//             <th className="py-2 pr-2">Exercise</th>
//             <th className="py-2 pr-2">Sets</th>
//             <th className="py-2 pr-2">Reps</th>
//             <th className="py-2 pr-2">Time (min)</th>
//             <th className="py-2 pr-2">Weight</th>
//             <th className="py-2 text-right">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-white/5">
//           {loading && (
//             <tr>
//               <td colSpan={6} className="py-3 text-gray-400">
//                 Loading…
//               </td>
//             </tr>
//           )}
//           {!loading && rows.length === 0 && (
//             <tr>
//               <td colSpan={6} className="py-3 text-gray-400">
//                 No exercises assigned yet.
//               </td>
//             </tr>
//           )}
//           {!loading &&
//             rows.map((r) => (
//               <tr key={r.id}>
//                 <td className="py-2 pr-2">
//                   {r.exercises?.name || ''}
//                 </td>
//                 <td className="py-2 pr-2">{r.sets ?? ''}</td>
//                 <td className="py-2 pr-2">{r.reps ?? ''}</td>
//                 <td className="py-2 pr-2">
//                   {r.duration_minutes ?? ''}
//                 </td>
//                 <td className="py-2 pr-2">{r.weight ?? ''}</td>
//                 <td className="py-2 text-right">
//                   <button
//                     className="text-xs mr-3 text-blue-300 hover:text-blue-100"
//                     onClick={() => openEdit(r)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className="text-xs text-red-300 hover:text-red-100"
//                     onClick={() => deleteRow(r.id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//         </tbody>
//       </table>

//       {/* Edit modal */}
//       {editingRow && (
//         <Modal
//           isOpen={!!editingRow}
//           onClose={() => setEditingRow(null)}
//           title={`Edit ${editingRow.exercises?.name || 'exercise'}`}
//         >
//           <div className="space-y-3">
//             <Input
//               label="Sets"
//               type="number"
//               value={editSets}
//               onChange={(e) => setEditSets(e.target.value)}
//             />
//             <Input
//               label="Reps"
//               type="number"
//               value={editReps}
//               onChange={(e) => setEditReps(e.target.value)}
//             />
//             <Input
//               label="Time (min)"
//               type="number"
//               value={editDuration}
//               onChange={(e) => setEditDuration(e.target.value)}
//             />
//             <Input
//               label="Weight (kg)"
//               type="number"
//               value={editWeight}
//               onChange={(e) => setEditWeight(e.target.value)}
//             />
//             <div className="flex justify-end gap-2 pt-2">
//               <Button
//                 variant="ghost"
//                 onClick={() => setEditingRow(null)}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={saveEdit}>Save</Button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   )
// }













import { useEffect, useState } from 'react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Modal from '@/shared/components/Modal'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/shared/hooks/useToast'
import { Plus, Edit2, Trash2, Calendar, Dumbbell, CheckCircle, XCircle, ChevronRight } from 'lucide-react'

export default function GymAdmin() {
  const toast = useToast()

  // Gym Days
  const [days, setDays] = useState([])
  const [dayName, setDayName] = useState('')
  const [editingDayId, setEditingDayId] = useState(null)
  const [editingDayName, setEditingDayName] = useState('')

  // Global exercises list
  const [exercises, setExercises] = useState([])

  // Assign exercise to a day
  const [selectedDayId, setSelectedDayId] = useState('')
  const [selectedDayName, setSelectedDayName] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [mode, setMode] = useState('count')
  const [setsInput, setSetsInput] = useState('')
  const [repsInput, setRepsInput] = useState('')
  const [durationInput, setDurationInput] = useState('')
  const [weightInput, setWeightInput] = useState('')

  const [savingDay, setSavingDay] = useState(false)
  const [savingAssign, setSavingAssign] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [activeTab, setActiveTab] = useState('manage') // 'manage' | 'assign'

  const loadInitial = async () => {
    try {
      const { data: ds, error: dsErr } = await supabase
        .from('gym_days')
        .select('id,name,created_at')
        .order('created_at', { ascending: true })

      if (dsErr) throw dsErr

      const { data: ex, error: exErr } = await supabase
        .from('exercises')
        .select('id,name')
        .order('name', { ascending: true })

      if (exErr) throw exErr

      setDays(ds || [])
      setExercises(ex || [])
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to load data')
      setDays([])
      setExercises([])
    }
  }

  useEffect(() => {
    loadInitial()
  }, [])

  // Gym Day CRUD
  const createDay = async () => {
    if (!dayName.trim()) {
      toast.error('Day name required')
      return
    }
    setSavingDay(true)
    try {
      const { error } = await supabase
        .from('gym_days')
        .insert({ name: dayName.trim() })

      if (error) throw error
      toast.success('Day created successfully')
      setDayName('')
      await loadInitial()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingDay(false)
    }
  }

  const startEditDay = (day) => {
    setEditingDayId(day.id)
    setEditingDayName(day.name)
  }

  const saveEditDay = async () => {
    if (!editingDayId) return
    if (!editingDayName.trim()) {
      toast.error('Day name required')
      return
    }
    setSavingDay(true)
    try {
      const { error } = await supabase
        .from('gym_days')
        .update({ name: editingDayName.trim() })
        .eq('id', editingDayId)

      if (error) throw error
      toast.success('Day updated')
      setEditingDayId(null)
      setEditingDayName('')
      await loadInitial()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingDay(false)
    }
  }

  const deleteDay = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its exercises?`)) return
    setSavingDay(true)
    try {
      const { error } = await supabase
        .from('gym_days')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Day deleted')
      if (selectedDayId === id) {
        setSelectedDayId('')
        setSelectedDayName('')
      }
      await loadInitial()
      setReloadKey((k) => k + 1)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingDay(false)
    }
  }

  const handleDaySelect = (day) => {
    setSelectedDayId(day.id)
    setSelectedDayName(day.name)
    setActiveTab('assign')
  }

  // Assign Exercise
  const handleAssignExerciseToDay = async () => {
    if (!selectedDayId) {
      toast.error('Please select a workout day')
      return
    }
    if (!exerciseName.trim()) {
      toast.error('Exercise name required')
      return
    }
    if (!setsInput) {
      toast.error('Sets required')
      return
    }
    if (mode === 'count' && !repsInput) {
      toast.error('Reps required')
      return
    }
    if (mode === 'time' && !durationInput) {
      toast.error('Time required')
      return
    }

    setSavingAssign(true)
    try {
      let exercise = exercises.find(
        (e) => e.name.toLowerCase() === exerciseName.trim().toLowerCase()
      )

      if (!exercise) {
        const { data, error } = await supabase
          .from('exercises')
          .insert({ name: exerciseName.trim() })
          .select('id,name')
          .single()

        if (error) throw error
        exercise = data
        setExercises((prev) => [...prev, data])
      }

      const sets = Number(setsInput) || 0
      const reps = mode === 'count' ? Number(repsInput) || null : null
      const duration = mode === 'time' ? Number(durationInput) || null : null
      const weight = weightInput === '' ? null : Number(weightInput)

      const { error: assignErr } = await supabase.rpc(
        'assign_exercise_to_day',
        {
          p_day_id: selectedDayId,
          p_exercise_id: exercise.id,
          p_sets: sets,
          p_reps: reps,
          p_duration: duration,
          p_weight: weight,
          p_note: null,
        }
      )

      if (assignErr) throw assignErr

      toast.success('Exercise added to workout')
      setExerciseName('')
      setSetsInput('')
      setRepsInput('')
      setDurationInput('')
      setWeightInput('')
      setReloadKey((k) => k + 1)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingAssign(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Dumbbell className="w-8 h-8" />
            Workout Program Manager
          </h1>
          <p className="text-gray-400">Create and manage your gym workout days and exercises</p>
        </header>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'manage' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('manage')}
            >
              <Calendar className="w-5 h-5 mx-auto mb-1" />
              Days
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'assign' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('assign')}
              disabled={!selectedDayId}
            >
              <Plus className="w-5 h-5 mx-auto mb-1" />
              Add Exercises
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Manage Days (Always visible on desktop) */}
          <div className={`lg:col-span-1 ${activeTab === 'manage' ? 'block' : 'hidden lg:block'}`}>
            <Card className="backdrop-blur-xl bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Workout Days
                  </h2>
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                    {days.length} days
                  </span>
                </div>

                {/* Add New Day */}
                <div className="space-y-3">
                  <label className="text-sm text-gray-300 font-medium">Create New Day</label>
                  <div className="flex gap-2">
                    <Input
                      value={dayName}
                      onChange={(e) => setDayName(e.target.value)}
                      placeholder="e.g., Chest & Triceps"
                      className="flex-1"
                    />
                    <Button
                      onClick={createDay}
                      disabled={savingDay || !dayName.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {savingDay ? 'Adding...' : <Plus className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Days List */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 font-medium">Your Workout Days</label>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {days.map((day) => (
                      <div
                        key={day.id}
                        className={`group flex items-center justify-between p-3 rounded-lg transition-all hover:bg-gray-700/50 ${
                          selectedDayId === day.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-700/30'
                        }`}
                      >
                        <button
                          onClick={() => handleDaySelect(day)}
                          className="flex-1 text-left flex items-center gap-3"
                        >
                          <div className={`w-3 h-3 rounded-full ${selectedDayId === day.id ? 'bg-blue-500' : 'bg-gray-600'}`} />
                          <span className="text-white font-medium">{day.name}</span>
                          {selectedDayId === day.id && (
                            <ChevronRight className="w-4 h-4 text-blue-400 ml-auto" />
                          )}
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingDayId === day.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white w-32"
                                value={editingDayName}
                                onChange={(e) => setEditingDayName(e.target.value)}
                                autoFocus
                              />
                              <Button size="sm" onClick={saveEditDay} disabled={savingDay}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingDayId(null)}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditDay(day)}
                                className="hover:bg-gray-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteDay(day.id, day.name)}
                                className="hover:bg-red-500/20 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {days.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No workout days yet</p>
                        <p className="text-sm mt-1">Create your first day above</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Assign Exercises (Always visible on desktop) */}
          <div className={`lg:col-span-2 ${activeTab === 'assign' ? 'block' : 'hidden lg:block'}`}>
            {/* Selected Day Banner */}
            {selectedDayId ? (
              <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Adding exercises to: <span className="text-blue-300">{selectedDayName}</span>
                    </h3>
                    <p className="text-sm text-gray-400">Fill in the exercise details below</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('manage')}
                    className="lg:hidden"
                  >
                    Change Day
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Workout Day</h3>
                <p className="text-gray-400 mb-4">Choose a day from the left panel to start adding exercises</p>
                <Button
                  onClick={() => setActiveTab('manage')}
                  className="lg:hidden"
                >
                  Browse Days
                </Button>
              </div>
            )}

            {/* Exercise Form */}
            {selectedDayId && (
              <Card className="backdrop-blur-xl bg-gray-800/50 border-gray-700 mb-6">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Exercise
                  </h3>

                  <div className="space-y-6">
                    {/* Exercise Name */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Exercise Name
                      </label>
                      <Input
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="e.g., Bench Press, Squats, Pull-ups"
                        className="w-full"
                      />
                    </div>

                    {/* Mode Selection */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-3">
                        Exercise Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMode('count')}
                          className={`p-4 rounded-lg border transition-all ${
                            mode === 'count'
                              ? 'bg-blue-500/20 border-blue-500 text-white'
                              : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-semibold mb-1">Count-based</div>
                            <div className="text-sm">Sets & Reps</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('time')}
                          className={`p-4 rounded-lg border transition-all ${
                            mode === 'time'
                              ? 'bg-purple-500/20 border-purple-500 text-white'
                              : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-semibold mb-1">Time-based</div>
                            <div className="text-sm">Duration & Sets</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Exercise Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Sets */}
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Sets
                        </label>
                        <Input
                          type="number"
                          value={setsInput}
                          onChange={(e) => setSetsInput(e.target.value)}
                          placeholder="3"
                          min="1"
                          className="w-full"
                        />
                      </div>

                      {/* Reps or Duration */}
                      {mode === 'count' ? (
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Reps per Set
                          </label>
                          <Input
                            type="number"
                            value={repsInput}
                            onChange={(e) => setRepsInput(e.target.value)}
                            placeholder="10"
                            min="1"
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Duration (minutes)
                          </label>
                          <Input
                            type="number"
                            value={durationInput}
                            onChange={(e) => setDurationInput(e.target.value)}
                            placeholder="5"
                            min="1"
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Weight */}
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Weight (kg)
                          <span className="text-gray-500 text-sm font-normal ml-1">Optional</span>
                        </label>
                        <Input
                          type="number"
                          value={weightInput}
                          onChange={(e) => setWeightInput(e.target.value)}
                          placeholder="0"
                          step="2.5"
                          className="w-full"
                        />
                      </div>

                      {/* Add Button */}
                      <div className="flex items-end">
                        <Button
                          onClick={handleAssignExerciseToDay}
                          disabled={savingAssign || !exerciseName.trim() || !setsInput}
                          className="w-full h-[42px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                          {savingAssign ? (
                            'Adding...'
                          ) : (
                            <>
                              <Plus className="w-5 h-5 mr-2" />
                              Add to Workout
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Exercises List for All Days */}
            <Card className="backdrop-blur-xl bg-gray-800/50 border-gray-700">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">All Exercises by Day</h3>
                
                {days.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>No workout days created yet</p>
                    <p className="text-sm mt-2">Create a day first to start adding exercises</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {days.map((day) => (
                      <div key={day.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <h4 className="text-lg font-semibold text-white">{day.name}</h4>
                          <button
                            onClick={() => handleDaySelect(day)}
                            className="ml-auto text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            Add Exercise
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <AssignedExercises
                          dayId={day.id}
                          reloadKey={reloadKey}
                          dayName={day.name}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssignedExercises({ dayId, reloadKey, dayName }) {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [editSets, setEditSets] = useState('')
  const [editReps, setEditReps] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editWeight, setEditWeight] = useState('')

  const loadRows = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gym_day_exercises')
        .select('id, sets, reps, duration_minutes, weight, note, exercises(name)')
        .eq('gym_day_id', dayId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setRows(data || [])
    } catch (err) {
      toast.error(err.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows()
  }, [dayId, reloadKey])

  const openEdit = (row) => {
    setEditingRow(row)
    setEditSets(row.sets?.toString() || '')
    setEditReps(row.reps?.toString() || '')
    setEditDuration(row.duration_minutes?.toString() || '')
    setEditWeight(row.weight?.toString() || '')
  }

  const saveEdit = async () => {
    if (!editingRow) return
    try {
      const sets = Number(editSets) || 0
      const reps = editReps === '' ? null : Number(editReps)
      const duration = editDuration === '' ? null : Number(editDuration)
      const weight = editWeight === '' ? null : Number(editWeight)

      const { error } = await supabase
        .from('gym_day_exercises')
        .update({ sets, reps, duration_minutes: duration, weight })
        .eq('id', editingRow.id)

      if (error) throw error
      toast.success('Exercise updated')
      setEditingRow(null)
      await loadRows()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const deleteRow = async (rowId, exerciseName) => {
    if (!window.confirm(`Remove "${exerciseName}" from ${dayName}?`)) return
    try {
      const { error } = await supabase
        .from('gym_day_exercises')
        .delete()
        .eq('id', rowId)

      if (error) throw error
      toast.success('Exercise removed')
      await loadRows()
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading exercises...</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-8 text-center border border-dashed border-gray-700">
        <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">No exercises added yet</p>
        <p className="text-sm text-gray-500 mt-1">Add your first exercise above</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors group"
          >
            <div className="flex justify-between items-start mb-3">
              <h5 className="font-semibold text-white truncate">
                {row.exercises?.name}
              </h5>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(row)}
                  className="p-1 hover:bg-gray-700 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => deleteRow(row.id, row.exercises?.name)}
                  className="p-1 hover:bg-red-500/20 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <div className="text-gray-400">Sets</div>
                <div className="text-white font-medium">{row.sets || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">
                  {row.duration_minutes ? 'Time (min)' : 'Reps'}
                </div>
                <div className="text-white font-medium">
                  {row.reps || row.duration_minutes || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">Weight</div>
                <div className="text-white font-medium">
                  {row.weight ? `${row.weight} kg` : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">Type</div>
                <div className="text-white font-medium">
                  {row.duration_minutes ? 'Time' : 'Reps'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <Modal
          isOpen={!!editingRow}
          onClose={() => setEditingRow(null)}
          title={`Edit ${editingRow.exercises?.name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sets"
                type="number"
                value={editSets}
                onChange={(e) => setEditSets(e.target.value)}
                min="1"
              />
              <Input
                label="Reps"
                type="number"
                value={editReps}
                onChange={(e) => setEditReps(e.target.value)}
                min="1"
              />
              <Input
                label="Time (min)"
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                min="1"
              />
              <Input
                label="Weight (kg)"
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                step="2.5"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                onClick={() => setEditingRow(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}