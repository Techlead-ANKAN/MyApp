import { useEffect, useMemo, useState } from 'react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Textarea from '@/shared/components/Textarea'
import Modal from '@/shared/components/Modal'
import Checkbox from '@/shared/components/Checkbox'
import Badge from '@/shared/components/Badge'
import { Calendar as CalendarIcon, Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/shared/hooks/useToast'

export default function CalendarPage() {
  const [monthTasks, setMonthTasks] = useState([])
  const [loadingMonth, setLoadingMonth] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [dayTasks, setDayTasks] = useState([])
  const [loadingDay, setLoadingDay] = useState(true)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAllModal, setShowAllModal] = useState(false)
  const toast = useToast()

  const startOfMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), [selectedDate])
  const endOfMonth = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), [selectedDate])
  const today = new Date()

  const fmtDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const toISODate = (d) => fmtDateOnly(d).toISOString()

  const loadMonthTasks = async () => {
    setLoadingMonth(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('id,title,status,start_at,completed_at')
      .gte('start_at', toISODate(startOfMonth))
      .lte('start_at', new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate(), 23, 59, 59).toISOString())
      .order('start_at', { ascending: true })
    if (error) toast.error(error.message)
    setMonthTasks(data || [])
    setLoadingMonth(false)
  }

  const loadDayTasks = async () => {
    setLoadingDay(true)
    const start = fmtDateOnly(selectedDate)
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('start_at', start.toISOString())
      .lte('start_at', end.toISOString())
      .order('created_at', { ascending: true })
    if (error) toast.error(error.message)
    setDayTasks(data || [])
    setLoadingDay(false)
  }

  useEffect(() => { loadMonthTasks() }, [startOfMonth, endOfMonth])
  useEffect(() => { loadDayTasks() }, [selectedDate])

  const daysGrid = useMemo(() => {
    const firstDayIdx = startOfMonth.getDay()
    const totalDays = endOfMonth.getDate()
    const cells = []
    for (let i = 0; i < firstDayIdx; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), d)
      const dayISO = fmtDateOnly(dateObj).toISOString()
      const tasksForDay = monthTasks.filter(t => t.start_at && fmtDateOnly(new Date(t.start_at)).toISOString() === dayISO)
      const doneCount = tasksForDay.filter(t => (t.status || 'todo') === 'done').length
      cells.push({ d, dateObj, count: tasksForDay.length, done: doneCount })
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [startOfMonth, endOfMonth, monthTasks])

  const isSameDate = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const beginEdit = (task) => {
    setEditingTask(task)
    setForm({ title: task.title || '', description: task.description || '' })
    setShowAddModal(true)
  }
  
  const cancelEdit = () => { 
    setEditingTask(null)
    setForm({ title: '', description: '' })
    setShowAddModal(false)
  }

  const createTodayTask = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const start = fmtDateOnly(selectedDate)
    const { error } = await supabase.from('tasks').insert({
      title: form.title.trim(),
      description: form.description?.trim() || null,
      start_at: start.toISOString(),
      is_all_day: true,
      status: 'todo',
    })
    if (error) toast.error(error.message)
    else { 
      toast.success('Task added')
      cancelEdit()
      loadDayTasks()
      loadMonthTasks()
    }
    setSaving(false)
  }

  const updateTask = async () => {
    if (!editingTask) return
    setSaving(true)
    const { error } = await supabase.from('tasks').update({
      title: form.title.trim(),
      description: form.description?.trim() || null,
    }).eq('id', editingTask.id)
    if (error) toast.error(error.message)
    else { 
      toast.success('Task updated')
      cancelEdit()
      loadDayTasks()
      loadMonthTasks()
    }
    setSaving(false)
  }

  const toggleDone = async (task) => {
    const nextStatus = (task.status || 'todo') === 'done' ? 'todo' : 'done'
    const { error } = await supabase.from('tasks').update({
      status: nextStatus,
      completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
    }).eq('id', task.id)
    if (error) toast.error(error.message)
    else { loadDayTasks(); loadMonthTasks() }
  }

  const removeTask = async (task) => {
    const { error } = await supabase.from('tasks').delete().eq('id', task.id)
    if (error) toast.error(error.message)
    else { 
      toast.success('Task deleted')
      loadDayTasks()
      loadMonthTasks()
    }
  }

  const pendingTasks = dayTasks.filter(t => (t.status||'todo') !== 'done')
  const doneTasks = dayTasks.filter(t => (t.status||'todo') === 'done')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Productivity Calendar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Manage your tasks and track habits with precision
          </p>
        </div>
        <Button variant="secondary" onClick={()=>setSelectedDate(new Date())}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {startOfMonth.toLocaleString(undefined,{ month:'long' })} {startOfMonth.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {loadingMonth && <span className="text-slate-500 dark:text-slate-400 text-sm">Loading...</span>}
              <Button variant="ghost" size="sm" onClick={()=>{
                const d = new Date(selectedDate)
                d.setMonth(d.getMonth()-1)
                setSelectedDate(d)
              }}>Prev</Button>
              <Button variant="ghost" size="sm" onClick={()=>{
                const d = new Date(selectedDate)
                d.setMonth(d.getMonth()+1)
                setSelectedDate(d)
              }}>Next</Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 text-center text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 auto-rows-[80px] md:auto-rows-[100px]">
            {daysGrid.map((cell, idx) => (
              <button
                key={idx}
                className={`
                  h-full rounded-lg p-2 text-left border transition-all duration-200 overflow-hidden relative
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
                    <div className="flex items-start justify-between">
                      <span className={`text-sm font-semibold ${
                        isSameDate(cell.dateObj, today)
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : cell.dateObj < fmtDateOnly(today)
                          ? 'text-slate-400 dark:text-slate-600'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {cell.d}
                      </span>
                      {cell.count > 0 && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          {cell.done}/{cell.count}
                        </Badge>
                      )}
                    </div>
                    {cell.count > 0 && cell.done === cell.count && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-8 h-8 text-emerald-500 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Add Task Button */}
          <Button 
            className="w-full" 
            onClick={()=>{
              setEditingTask(null)
              setForm({ title: '', description: '' })
              setShowAddModal(true)
            }}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>

          {/* Tasks for Selected Day */}
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {pendingTasks.length} pending · {doneTasks.length} done
                </p>
              </div>

              {loadingDay ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-600 border-t-transparent mx-auto"></div>
                </div>
              ) : dayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No tasks for this day
                  </p>
                </div>
              ) : (
                <>
                  <div className="max-h-[400px] overflow-auto space-y-2">
                    {[...dayTasks].sort((a,b)=>{
                      const ad = (a.status||'todo')==='done'
                      const bd = (b.status||'todo')==='done'
                      if (ad===bd) return 0
                      return ad ? 1 : -1
                    }).map(t => (
                      <div 
                        key={t.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <Checkbox 
                          checked={(t.status || 'todo') === 'done'}
                          onChange={() => toggleDone(t)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            (t.status||'todo')==='done' 
                              ? 'line-through text-slate-400 dark:text-slate-500' 
                              : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {t.title}
                          </p>
                          {t.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {t.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={()=>beginEdit(t)} className="p-1.5">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={()=>removeTask(t)} className="p-1.5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {dayTasks.length > 5 && (
                    <Button variant="outline" size="sm" onClick={()=>setShowAllModal(true)} className="w-full">
                      View All ({dayTasks.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={cancelEdit}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        footer={
          <>
            <Button variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button 
              onClick={editingTask ? updateTask : createTodayTask} 
              disabled={saving || !form.title.trim()}
            >
              {saving ? 'Saving...' : editingTask ? 'Update' : 'Add Task'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Title"
            value={form.title} 
            onChange={(e)=>setForm(v=>({ ...v, title: e.target.value }))} 
            placeholder="Enter task title" 
          />
          <Textarea 
            label="Description (optional)"
            value={form.description} 
            onChange={(e)=>setForm(v=>({ ...v, description: e.target.value }))} 
            placeholder="Add details about this task..."
            rows={3}
          />
        </div>
      </Modal>

      {/* View All Tasks Modal */}
      <Modal
        isOpen={showAllModal}
        onClose={()=>setShowAllModal(false)}
        title={`All Tasks - ${selectedDate.toLocaleDateString()}`}
        size="lg"
      >
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {[...dayTasks].sort((a,b)=>{
            const ad = (a.status||'todo')==='done'
            const bd = (b.status||'todo')==='done'
            if (ad===bd) return 0
            return ad ? 1 : -1
          }).map(t => (
            <div 
              key={t.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Checkbox 
                checked={(t.status || 'todo') === 'done'}
                onChange={() => toggleDone(t)}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  (t.status||'todo')==='done' 
                    ? 'line-through text-slate-400 dark:text-slate-500' 
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={()=>beginEdit(t)} className="p-1.5">
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={()=>removeTask(t)} className="p-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
