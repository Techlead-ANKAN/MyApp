// import { useEffect, useMemo, useState } from 'react'
// import Card from '@/shared/components/Card'
// import Button from '@/shared/components/Button'
// import Input from '@/shared/components/Input'
// import Modal from '@/shared/components/Modal'
// import { supabase } from '@/lib/supabase/client'
// import { useToast } from '@/shared/hooks/useToast'

// export default function GymAdmin() {
//   const toast = useToast()
//   // Gym Days state
//   const [days, setDays] = useState([])
//   const [dayName, setDayName] = useState('')
//   const [bodyParts, setBodyParts] = useState([])
//   const [exercises, setExercises] = useState([])
//   const [bpName, setBpName] = useState('')
//   const [exName, setExName] = useState('')
//   const [exBpId, setExBpId] = useState('')
//   const [mode, setMode] = useState('count') // 'count' | 'time'
//   const [tplSets, setTplSets] = useState('')
//   const [tplReps, setTplReps] = useState('')
//   const [tplDuration, setTplDuration] = useState('')
//   const [tplWeight, setTplWeight] = useState('')
//   const [saving, setSaving] = useState(false)
//   const selectedBp = useMemo(()=> bodyParts.find(bp=>bp.id===exBpId) || null, [bodyParts, exBpId])
//   const [templates, setTemplates] = useState([])
//   const [selectedDayId, setSelectedDayId] = useState('')

//   const load = async () => {
//     try {
//       const { data: bp } = await supabase.from('body_parts').select('id,name').order('name')
//       const { data: ex } = await supabase.from('exercises').select('id,name,body_part_id').order('name')
//       const { data: tpl } = await supabase.from('exercise_templates_view').select('*').order('exercise_name')
//       const { data: ds } = await supabase.from('gym_days').select('id,name').order('created_at')
//       setBodyParts(bp || [])
//       setExercises(ex || [])
//       setTemplates(tpl || [])
//       setDays(ds || [])
//     } catch {
//       setBodyParts([]); setExercises([]); setTemplates([]); setDays([])
//     }
//   }
//   useEffect(()=>{ load() }, [])

//   const addBodyPart = async () => {
//     if (!bpName.trim()) { toast.error('Name required'); return }
//     setSaving(true)
//     const { data, error } = await supabase.rpc('add_body_part', { p_name: bpName.trim() })
//     if (error) toast.error(error.message)
//     else { toast.success('Body part added'); setBpName(''); load() }
//     setSaving(false)
//   }

//   // Gym Days CRUD
//   const createDay = async () => {
//     if (!dayName.trim()) { toast.error('Day name required'); return }
//     const { error } = await supabase.rpc('create_gym_day', { p_name: dayName.trim() })
//     if (error) toast.error(error.message)
//     else { toast.success('Day added'); setDayName(''); await load() }
//   }

//   const deleteDay = async (id) => {
//     const { error } = await supabase.rpc('delete_gym_day', { p_id: id })
//     if (error) toast.error(error.message)
//     else { toast.success('Day deleted'); if (selectedDayId===id) setSelectedDayId(''); await load() }
//   }

//   const addOrUpdateExerciseWithTemplate = async () => {
//     if (!exName.trim() || !exBpId) { toast.error('Name and body part required'); return }
//     if (mode === 'count' && (!tplSets || !tplReps)) { toast.error('Sets and reps required'); return }
//     if (mode === 'time' && (!tplSets || !tplDuration)) { toast.error('Sets and time required'); return }
//     setSaving(true)
//     try {
//       // Find or create exercise under the selected body part
//       let ex = exercises.find(e => e.name.toLowerCase() === exName.trim().toLowerCase() && e.body_part_id === exBpId)
//       if (!ex) {
//         const { data: newId, error: exErr } = await supabase.rpc('add_exercise', { p_name: exName.trim(), p_body_part: exBpId, p_desc: null })
//         if (exErr) throw exErr
//         ex = { id: newId, name: exName.trim(), body_part_id: exBpId }
//       }
//       // Upsert template
//       const sets = Number(tplSets) || 0
//       const reps = mode === 'count' ? (Number(tplReps) || null) : null
//       const duration = mode === 'time' ? (Number(tplDuration) || null) : null
//       const weight = tplWeight === '' ? null : Number(tplWeight)
//       const { error: tplErr } = await supabase.rpc('upsert_exercise_template', {
//         p_exercise: ex.id,
//         p_sets: sets,
//         p_reps: reps,
//         p_duration: duration,
//         p_weight: weight,
//         p_notes: null,
//       })
//       if (tplErr) throw tplErr
//       toast.success('Saved')
//       setTplSets(''); setTplReps(''); setTplDuration(''); setTplWeight(''); setExName('')
//       await load()
//     } catch (err) {
//       toast.error(err.message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//       {/* Left: Parts management + list */}
//       <div className="lg:col-span-1 space-y-6">
//         <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
//           <div className="p-5">
//             <h3 className="text-lg font-semibold text-white mb-3">Body Parts</h3>
//             <div className="flex gap-2 mb-3">
//               <Input label="Add new" value={bpName} onChange={(e)=>setBpName(e.target.value)} placeholder="e.g., Chest" />
//               <Button onClick={addBodyPart} disabled={saving}>{saving?'…':'Add'}</Button>
//             </div>
//             <div>
//               <label className="block text-gray-400 text-sm mb-1">Select part</label>
//               <select className="w-full rounded-lg bg-white/5 border border-white/10 text-white p-2 h-[42px]" value={exBpId} onChange={(e)=>setExBpId(e.target.value)}>
//                 <option value="">All parts</option>
//                 {bodyParts.map(bp => (
//                   <option key={bp.id} value={bp.id}>{bp.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </Card>

//         <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
//           <div className="p-5">
//             <div className="max-h-[60vh] overflow-auto no-scrollbar">
//               <ul className="divide-y divide-white/5">
//                 {bodyParts.map(bp => (
//                   <li key={bp.id} className="py-2 px-1 text-gray-300 flex items-center justify-between">
//                     <span>{bp.name}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Right: Exercise entry + day tables */}
//       <div className="lg:col-span-3 space-y-6">
//         <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
//           <div className="p-6">
//             <h3 className="text-xl font-semibold text-white mb-4">Add Exercise to Day</h3>
//             <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
//               <div>
//                 <label className="block text-gray-400 text-sm mb-1">Gym Day</label>
//                 <select className="w-full rounded-lg bg-white/5 border border-white/10 text-white p-2 h-[42px]" value={selectedDayId} onChange={(e)=>setSelectedDayId(e.target.value)}>
//                   <option value="">Select day…</option>
//                   {days.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
//                 </select>
//               </div>
//               <Input label="Exercise name" value={exName} onChange={(e)=>setExName(e.target.value)} placeholder="e.g., Bench Press" />
//               <div>
//                 <label className="block text-gray-400 text-sm mb-1">Mode</label>
//                 <div className="flex items-center gap-3">
//                   <label className="inline-flex items-center gap-2 text-gray-300 text-sm"><input type="radio" name="mode" checked={mode==='count'} onChange={()=>setMode('count')} /> Count</label>
//                   <label className="inline-flex items-center gap-2 text-gray-300 text-sm"><input type="radio" name="mode" checked={mode==='time'} onChange={()=>setMode('time')} /> Time</label>
//                 </div>
//               </div>
//               <Input label="Sets" type="number" value={tplSets} onChange={(e)=>setTplSets(e.target.value)} placeholder="3" />
//               {mode==='count' ? (
//                 <Input label="Reps" type="number" value={tplReps} onChange={(e)=>setTplReps(e.target.value)} placeholder="10" />
//               ) : (
//                 <Input label="Time (min)" type="number" value={tplDuration} onChange={(e)=>setTplDuration(e.target.value)} placeholder="1" />
//               )}
//               <Input label="Weight (kg)" type="number" value={tplWeight} onChange={(e)=>setTplWeight(e.target.value)} placeholder="optional" />
//               <div className="flex items-end"><Button onClick={async()=>{
//                 if (!selectedDayId) { toast.error('Select a gym day'); return }
//                 // Ensure exercise exists (reuse template logic)
//                 await addOrUpdateExerciseWithTemplate()
//                 // Find exercise id
//                 const ex = exercises.find(e => e.name.toLowerCase() === exName.trim().toLowerCase() && e.body_part_id === exBpId)
//                 const sets = Number(tplSets) || 0
//                 const reps = mode==='count' ? (Number(tplReps)||null) : null
//                 const duration = mode==='time' ? (Number(tplDuration)||null) : null
//                 const weight = tplWeight==='' ? null : Number(tplWeight)
//                 const { error } = await supabase.rpc('assign_exercise_to_day', {
//                   p_day_id: selectedDayId,
//                   p_exercise_id: ex ? ex.id : null,
//                   p_sets: sets,
//                   p_reps: reps,
//                   p_duration: duration,
//                   p_weight: weight,
//                   p_note: null,
//                 })
//                 if (error) toast.error(error.message); else toast.success('Assigned')
//               }} disabled={saving} className="w-full">{saving?'Saving…':'Assign'}</Button></div>
//             </div>
//           </div>
//         </Card>

//         {/* Tables per day with assigned exercises */}
//         <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
//           <div className="p-6 space-y-6">
//             <h4 className="text-white font-medium">Gym Days</h4>
//             <div className="flex gap-2">
//               <Input label="Add Day" value={dayName} onChange={(e)=>setDayName(e.target.value)} placeholder="e.g., Chest Day" />
//               <Button onClick={createDay}>Add</Button>
//             </div>
//             <div className="space-y-6">
//               {days.map(d => (
//                 <div key={d.id} className="rounded-xl border border-white/10 p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <h5 className="text-white font-semibold">{d.name}</h5>
//                     <div className="flex items-center gap-2">
//                       <Button variant="ghost" size="sm" onClick={()=>setSelectedDayId(d.id)}>Select</Button>
//                       <Button variant="outline" size="sm" onClick={()=>deleteDay(d.id)}>Delete</Button>
//                     </div>
//                   </div>
//                   {/* Fetch assigned exercises for this day */}
//                   <AssignedExercises dayId={d.id} />
//                 </div>
//               ))}
//               {days.length===0 && (<p className="text-gray-400 text-sm">No gym days yet. Add one above.</p>)}
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   )
// }

// function AssignedExercises({ dayId }) {
//   const [rows, setRows] = useState([])
//   const toast = useToast()
//   useEffect(() => {
//     let active = true
//     (async ()=>{
//       try {
//         const { data, error } = await supabase
//           .from('gym_day_exercises')
//           .select('exercise_id, sets, reps, duration_minutes, weight, note, exercises(name)')
//           .eq('gym_day_id', dayId)
//           .order('created_at', { ascending: true })
//         if (error) throw error
//         if (active) setRows(data || [])
//       } catch (err) {
//         toast.error(err.message)
//       }
//     })()
//     return () => { active = false }
//   }, [dayId])
//   return (
//     <div className="overflow-auto no-scrollbar">
//       <table className="w-full text-left text-gray-300">
//         <thead className="text-sm text-gray-400">
//           <tr>
//             <th className="py-2">Exercise</th>
//             <th className="py-2">Sets</th>
//             <th className="py-2">Reps</th>
//             <th className="py-2">Time</th>
//             <th className="py-2">Weight</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-white/5">
//           {rows.map((r,i)=> (
//             <tr key={i}>
//               <td className="py-2">{r.exercises?.name || ''}</td>
//               <td className="py-2">{r.sets ?? ''}</td>
//               <td className="py-2">{r.reps ?? ''}</td>
//               <td className="py-2">{r.duration_minutes ?? ''}</td>
//               <td className="py-2">{r.weight ?? ''}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
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

export default function GymAdmin() {
  const toast = useToast()

  // Gym Days
  const [days, setDays] = useState([])
  const [dayName, setDayName] = useState('')
  const [editingDayId, setEditingDayId] = useState(null)
  const [editingDayName, setEditingDayName] = useState('')

  // Global exercises list (names only, used for "find or create")
  const [exercises, setExercises] = useState([])

  // Assign exercise to a day
  const [selectedDayId, setSelectedDayId] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [mode, setMode] = useState('count') // 'count' | 'time'
  const [setsInput, setSetsInput] = useState('')
  const [repsInput, setRepsInput] = useState('')
  const [durationInput, setDurationInput] = useState('')
  const [weightInput, setWeightInput] = useState('')

  const [savingDay, setSavingDay] = useState(false)
  const [savingAssign, setSavingAssign] = useState(false)

  // When this changes, child tables reload
  const [reloadKey, setReloadKey] = useState(0)

  // Load days + exercises
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

  // ========== GYM DAY CRUD ==========

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
      toast.success('Day added')
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

  const cancelEditDay = () => {
    setEditingDayId(null)
    setEditingDayName('')
  }

  const deleteDay = async (id) => {
    if (!window.confirm('Delete this day and its assignments?')) return
    setSavingDay(true)
    try {
      const { error } = await supabase
        .from('gym_days')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Day deleted')
      if (selectedDayId === id) setSelectedDayId('')
      await loadInitial()
      setReloadKey((k) => k + 1)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingDay(false)
    }
  }

  // ========== ASSIGN EXERCISE TO A DAY ==========

  const handleAssignExerciseToDay = async () => {
    if (!selectedDayId) {
      toast.error('Select a gym day')
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
      toast.error('Time (minutes) required')
      return
    }

    setSavingAssign(true)
    try {
      // Find or create global exercise by name
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
      const duration =
        mode === 'time' ? Number(durationInput) || null : null
      const weight = weightInput === '' ? null : Number(weightInput)

      // Use your existing RPC to create the row in gym_day_exercises
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

      toast.success('Exercise saved for this day')

      setExerciseName('')
      setSetsInput('')
      setRepsInput('')
      setDurationInput('')
      setWeightInput('')

      // Tell tables to reload
      setReloadKey((k) => k + 1)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingAssign(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* LEFT: Gym days management */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
          <div className="p-5 space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Gym Days
            </h3>

            {/* Add new day */}
            <div className="flex gap-2">
              <Input
                label="Add Day"
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                placeholder="e.g., Chest Day"
              />
              <div className="flex items-end">
                <Button
                  onClick={createDay}
                  disabled={savingDay}
                  className="whitespace-nowrap"
                >
                  {savingDay ? 'Saving…' : 'Add'}
                </Button>
              </div>
            </div>

            {/* List of days with edit/delete */}
            <div className="max-h-[60vh] overflow-auto no-scrollbar">
              <ul className="divide-y divide-white/5">
                {days.map((d) => (
                  <li
                    key={d.id}
                    className="py-2 flex items-center justify-between gap-2"
                  >
                    {editingDayId === d.id ? (
                      <>
                        <input
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
                          value={editingDayName}
                          onChange={(e) =>
                            setEditingDayName(e.target.value)
                          }
                        />
                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            onClick={saveEditDay}
                            disabled={savingDay}
                          >
                            Save
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={cancelEditDay}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          className={`flex-1 text-left text-sm ${
                            selectedDayId === d.id
                              ? 'text-white'
                              : 'text-gray-300'
                          }`}
                          onClick={() => setSelectedDayId(d.id)}
                        >
                          {d.name}
                        </button>
                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => startEditDay(d)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => deleteDay(d.id)}
                          >
                            Del
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
                {days.length === 0 && (
                  <li className="py-2 text-sm text-gray-400">
                    No days yet. Add one above.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT: Assign exercise + tables per day */}
      <div className="lg:col-span-3 space-y-6">
        {/* Assign exercise to a day */}
        <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-2">
              Add / Assign Exercise
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {/* Select Day */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Gym Day
                </label>
                <select
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white p-2 h-[42px]"
                  value={selectedDayId}
                  onChange={(e) => setSelectedDayId(e.target.value)}
                >
                  <option value="">Select day…</option>
                  {days.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exercise name */}
              <Input
                label="Exercise name"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g., Bench Press"
              />

              {/* Mode */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Mode
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-gray-300 text-sm">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === 'count'}
                      onChange={() => setMode('count')}
                    />
                    Count
                  </label>
                  <label className="inline-flex items-center gap-2 text-gray-300 text-sm">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === 'time'}
                      onChange={() => setMode('time')}
                    />
                    Time
                  </label>
                </div>
              </div>

              {/* Sets */}
              <Input
                label="Sets"
                type="number"
                value={setsInput}
                onChange={(e) => setSetsInput(e.target.value)}
                placeholder="3"
              />

              {/* Reps or Time */}
              {mode === 'count' ? (
                <Input
                  label="Reps"
                  type="number"
                  value={repsInput}
                  onChange={(e) => setRepsInput(e.target.value)}
                  placeholder="10"
                />
              ) : (
                <Input
                  label="Time (min)"
                  type="number"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  placeholder="1"
                />
              )}

              {/* Weight */}
              <Input
                label="Weight (kg)"
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="optional"
              />

              {/* Assign button */}
              <div className="flex items-end">
                <Button
                  onClick={handleAssignExerciseToDay}
                  disabled={savingAssign}
                  className="w-full"
                >
                  {savingAssign ? 'Saving…' : 'Save to Day'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tables per day */}
        <Card className="backdrop-blur-2xl bg-white/[0.03] border-white/10">
          <div className="p-6 space-y-6">
            <h4 className="text-white font-medium">
              Exercises per Gym Day
            </h4>
            <div className="space-y-6">
              {days.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-semibold">
                      {d.name}
                    </h5>
                  </div>
                  <AssignedExercises
                    dayId={d.id}
                    reloadKey={reloadKey}
                  />
                </div>
              ))}
              {days.length === 0 && (
                <p className="text-gray-400 text-sm">
                  Add a gym day to see its exercises.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * Table for exercises assigned to a single day
 * Supports: read, update (sets/reps/time/weight), delete assignment
 */
function AssignedExercises({ dayId, reloadKey }) {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Edit modal state
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
        .select(
          'id, sets, reps, duration_minutes, weight, note, exercises(name)'
        )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const duration =
        editDuration === '' ? null : Number(editDuration)
      const weight =
        editWeight === '' ? null : Number(editWeight)

      const { error } = await supabase
        .from('gym_day_exercises')
        .update({
          sets,
          reps,
          duration_minutes: duration,
          weight,
        })
        .eq('id', editingRow.id)

      if (error) throw error
      toast.success('Exercise updated')
      setEditingRow(null)
      await loadRows()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const deleteRow = async (rowId) => {
    if (!window.confirm('Remove this exercise from the day?')) return
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

  return (
    <div className="overflow-auto no-scrollbar">
      <table className="w-full text-left text-gray-300 text-sm">
        <thead className="text-gray-400">
          <tr>
            <th className="py-2 pr-2">Exercise</th>
            <th className="py-2 pr-2">Sets</th>
            <th className="py-2 pr-2">Reps</th>
            <th className="py-2 pr-2">Time (min)</th>
            <th className="py-2 pr-2">Weight</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading && (
            <tr>
              <td colSpan={6} className="py-3 text-gray-400">
                Loading…
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={6} className="py-3 text-gray-400">
                No exercises assigned yet.
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((r) => (
              <tr key={r.id}>
                <td className="py-2 pr-2">
                  {r.exercises?.name || ''}
                </td>
                <td className="py-2 pr-2">{r.sets ?? ''}</td>
                <td className="py-2 pr-2">{r.reps ?? ''}</td>
                <td className="py-2 pr-2">
                  {r.duration_minutes ?? ''}
                </td>
                <td className="py-2 pr-2">{r.weight ?? ''}</td>
                <td className="py-2 text-right">
                  <button
                    className="text-xs mr-3 text-blue-300 hover:text-blue-100"
                    onClick={() => openEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-red-300 hover:text-red-100"
                    onClick={() => deleteRow(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Edit modal */}
      {editingRow && (
        <Modal
          isOpen={!!editingRow}
          onClose={() => setEditingRow(null)}
          title={`Edit ${editingRow.exercises?.name || 'exercise'}`}
        >
          <div className="space-y-3">
            <Input
              label="Sets"
              type="number"
              value={editSets}
              onChange={(e) => setEditSets(e.target.value)}
            />
            <Input
              label="Reps"
              type="number"
              value={editReps}
              onChange={(e) => setEditReps(e.target.value)}
            />
            <Input
              label="Time (min)"
              type="number"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setEditingRow(null)}
              >
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
