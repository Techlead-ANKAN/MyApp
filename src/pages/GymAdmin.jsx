import { useEffect, useState } from 'react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import Badge from '@/shared/components/Badge'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/shared/hooks/useToast'
import { Plus, Edit2, Trash2, Dumbbell, Check, X, ArrowLeft } from 'lucide-react'

export default function GymAdmin() {
  const toast = useToast()

  const [days, setDays] = useState([])
  const [dayName, setDayName] = useState('')
  const [editingDayId, setEditingDayId] = useState(null)
  const [editingDayName, setEditingDayName] = useState('')

  const [exercises, setExercises] = useState([])

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Workout Program Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Create and manage your gym workout days and exercises
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            {days.length} {days.length === 1 ? 'Day' : 'Days'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Workout Days */}
        <Card className="lg:col-span-1">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Workout Days
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your workout split
              </p>
            </div>

            {/* Create New Day */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Create New Day
              </label>
              <div className="flex gap-2">
                <Input
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  placeholder="e.g., Chest & Triceps"
                  onKeyPress={(e) => e.key === 'Enter' && createDay()}
                />
                <Button
                  onClick={createDay}
                  disabled={savingDay || !dayName.trim()}
                  size="sm"
                >
                  {savingDay ? '...' : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Days List */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Your Days ({days.length})
              </label>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {days.map((day) => (
                  <div
                    key={day.id}
                    className={`group relative p-3 rounded-lg border transition-all ${
                      selectedDayId === day.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {editingDayId === day.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingDayName}
                          onChange={(e) => setEditingDayName(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && saveEditDay()}
                        />
                        <Button
                          size="sm"
                          onClick={saveEditDay}
                          disabled={savingDay}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingDayId(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDaySelect(day)}
                          className="flex-1 text-left w-full"
                        >
                          <div className="flex items-center gap-3">
                            <Dumbbell className={`w-4 h-4 ${
                              selectedDayId === day.id
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`} />
                            <span className={`font-medium ${
                              selectedDayId === day.id
                                ? 'text-primary-900 dark:text-primary-100'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {day.name}
                            </span>
                          </div>
                        </button>
                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditDay(day)
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDay(day.id, day.name)
                            }}
                            className="hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {days.length === 0 && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No workout days yet</p>
                    <p className="text-xs mt-1">Create your first day above</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Right Panel - Exercise Management */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDayId ? (
            <>
              {/* Selected Day Header */}
              <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                      {selectedDayName}
                    </h3>
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      Add exercises to this workout day
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDayId('')
                      setSelectedDayName('')
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Add Exercise Form */}
              <Card>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      Add New Exercise
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Fill in exercise details below
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Exercise Name */}
                    <Input
                      label="Exercise Name"
                      value={exerciseName}
                      onChange={(e) => setExerciseName(e.target.value)}
                      placeholder="e.g., Bench Press, Squats, Pull-ups"
                    />

                    {/* Exercise Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Exercise Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMode('count')}
                          className={`p-4 rounded-lg border transition-all text-center ${
                            mode === 'count'
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className={`text-sm font-semibold mb-1 ${
                            mode === 'count'
                              ? 'text-primary-900 dark:text-primary-100'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            Count-based
                          </div>
                          <div className={`text-xs ${
                            mode === 'count'
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            Sets & Reps
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('time')}
                          className={`p-4 rounded-lg border transition-all text-center ${
                            mode === 'time'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className={`text-sm font-semibold mb-1 ${
                            mode === 'time'
                              ? 'text-emerald-900 dark:text-emerald-100'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            Time-based
                          </div>
                          <div className={`text-xs ${
                            mode === 'time'
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            Duration & Sets
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Exercise Parameters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Input
                        label="Sets"
                        type="number"
                        value={setsInput}
                        onChange={(e) => setSetsInput(e.target.value)}
                        placeholder="3"
                        min="1"
                      />
                      {mode === 'count' ? (
                        <Input
                          label="Reps per Set"
                          type="number"
                          value={repsInput}
                          onChange={(e) => setRepsInput(e.target.value)}
                          placeholder="10"
                          min="1"
                        />
                      ) : (
                        <Input
                          label="Duration (min)"
                          type="number"
                          value={durationInput}
                          onChange={(e) => setDurationInput(e.target.value)}
                          placeholder="5"
                          min="1"
                        />
                      )}
                      <Input
                        label="Weight (kg)"
                        type="number"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        placeholder="Optional"
                        step="2.5"
                      />
                      <div className="flex items-end">
                        <Button
                          onClick={handleAssignExerciseToDay}
                          disabled={savingAssign || !exerciseName.trim() || !setsInput}
                          className="w-full"
                        >
                          {savingAssign ? (
                            'Adding...'
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Exercises for Selected Day */}
              <Card>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Exercises in {selectedDayName}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Manage exercises for this workout day
                  </p>
                  <AssignedExercises
                    dayId={selectedDayId}
                    reloadKey={reloadKey}
                    dayName={selectedDayName}
                  />
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="text-center py-16">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Select a Workout Day
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Choose a day from the left panel to manage its exercises
                </p>
                {days.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Create a workout day first
                  </p>
                )}
              </div>
            </Card>
          )}
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
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-3"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading exercises...</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center">
        <Dumbbell className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">No exercises yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">Add your first exercise using the form above</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="group flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
                {row.exercises?.name}
              </h5>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{row.sets}</span>
                  sets
                </span>
                {row.duration_minutes ? (
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{row.duration_minutes}</span>
                    min
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{row.reps}</span>
                    reps
                  </span>
                )}
                {row.weight && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{row.weight}</span>
                    kg
                  </span>
                )}
                <Badge variant={row.duration_minutes ? 'success' : 'default'} className="text-xs">
                  {row.duration_minutes ? 'Time' : 'Reps'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(row)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteRow(row.id, row.exercises?.name)}
                className="hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setEditingRow(null)}
              >
                Cancel
              </Button>
              <Button onClick={saveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}