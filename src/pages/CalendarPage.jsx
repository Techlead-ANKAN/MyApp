import { useEffect, useMemo, useState } from 'react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Textarea from '@/shared/components/Textarea'
import '@/styles/util.css'
import { Calendar as CalendarIcon, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react'
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
    const firstDayIdx = startOfMonth.getDay() // 0 Sun - 6 Sat
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
    // ensure full weeks (rows of 7)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [startOfMonth, endOfMonth, monthTasks])

  const isSameDate = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const beginEdit = (task) => {
    setEditingTask(task)
    setForm({ title: task.title || '', description: task.description || '' })
  }
  const cancelEdit = () => { setEditingTask(null); setForm({ title: '', description: '' }) }

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
    else { toast.success('Task added'); setForm({ title: '', description: '' }); loadDayTasks(); loadMonthTasks() }
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
    else { toast.success('Task updated'); cancelEdit(); loadDayTasks(); loadMonthTasks() }
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
    else { toast.success('Task deleted'); loadDayTasks(); loadMonthTasks() }
  }
  // Modals for add/edit and full task list
  const [showAllModal, setShowAllModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const pendingTasks = dayTasks.filter(t => (t.status||'todo') !== 'done')
  const doneTasks = dayTasks.filter(t => (t.status||'todo') === 'done')
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Productivity Calendar
          </h2>
          <p className="text-gray-400">
            Manage your tasks and track habits with precision
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={()=>setSelectedDate(new Date())}>Today</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid */}
        <Card className="lg:col-span-2 backdrop-blur-2xl bg-white/[0.02]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-accent-blue" />
                <h3 className="text-xl font-semibold text-white">
                  {startOfMonth.toLocaleString(undefined,{ month:'long' })} {startOfMonth.getFullYear()}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {loadingMonth && <span className="text-gray-400 text-sm mr-2">Loading…</span>}
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
            <div className="grid grid-cols-7 text-center text-gray-400 text-sm mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-[3.2rem] sm:auto-rows-[4.5rem]">
              {daysGrid.map((cell, idx) => (
                <button
                  key={idx}
                  className={
                    `h-full rounded-xl p-1 sm:p-2 text-left border transition-all duration-200 overflow-hidden ` +
                    (cell ? 'border-white/10 ' : 'border-transparent') +
                    (cell && isSameDate(cell.dateObj, today)
                      ? ' bg-green-400/10 backdrop-blur-sm border-green-400/30'
                      : ' bg-white/[0.03] hover:bg-white/[0.06]') +
                    (cell && isSameDate(cell.dateObj, selectedDate) ? ' outline outline-1 outline-accent-purple/50' : '')
                  }
                  onClick={() => cell && setSelectedDate(cell.dateObj)}
                  disabled={!cell}
                >
                  {cell && (
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-center justify-between">
                        <span className={`${cell.dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate()) ? 'text-gray-600' : 'text-white'} text-[12px] sm:text-sm font-semibold`}>{cell.d}</span>
                        {cell.count > 0 && (
                          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                            {cell.done}/{cell.count}
                          </span>
                        )}
                      </div>
                      {cell.count > 0 && cell.done === cell.count && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none translate-y-1 sm:translate-y-2">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-400/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: two boxes */}
        <div className="space-y-4">
          {/* Box 1: Add Task (opens modal) */}
          <Card className="backdrop-blur-2xl bg-white/[0.02]">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Add Task</h3>
                <Button size="sm" onClick={()=>setShowAddModal(true)}>Open</Button>
              </div>
            </div>
          </Card>

          {/* Box 2: All tasks with inside scroll */}
          <Card className="backdrop-blur-2xl bg-white/[0.02]">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Tasks for Selected Day</h3>
                  <p className="text-gray-400 text-xs">{selectedDate.toDateString()}</p>
                  <p className="text-gray-500 text-xs mt-1">{pendingTasks.length} pending · {doneTasks.length} done</p>
                </div>
                <div className="flex items-center space-x-2">
                  {loadingDay && <span className="text-gray-400 text-sm">Loading…</span>}
                  <Button variant="outline" size="sm" onClick={()=>setShowAllModal(true)}>View All</Button>
                </div>
              </div>
              <div className="max-h-[42vh] overflow-auto no-scrollbar rounded-lg">
                <ul className="divide-y divide-white/5">
                  {[...dayTasks].sort((a,b)=>{
                    const ad = (a.status||'todo')==='done'
                    const bd = (b.status||'todo')==='done'
                    if (ad===bd) return 0
                    return ad ? 1 : -1
                  }).map(t => (
                    <li key={t.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button onClick={()=>toggleDone(t)} className="p-1 rounded-lg hover:bg-white/10">
                          {(t.status || 'todo') === 'done' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <p className={`text-white font-medium ${ (t.status||'todo')==='done' ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                          {t.description && <p className="text-gray-400 text-sm">{t.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={()=>beginEdit(t)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={()=>removeTask(t)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Add Task Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={()=>setShowAddModal(false)} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-dark-900/95 border border-white/10 rounded-xl shadow-2xl p-4">
                <h4 className="text-white font-semibold mb-3">Add Task for Today</h4>
                <div className="space-y-3">
                  <Input label={'New Title'} value={form.title} onChange={(e)=>setForm(v=>({ ...v, title: e.target.value }))} placeholder="Task title" />
                  <Textarea label={'Description'} value={form.description} onChange={(e)=>setForm(v=>({ ...v, description: e.target.value }))} placeholder="Optional details" />
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" onClick={()=>{ cancelEdit(); setShowAddModal(false) }}>Cancel</Button>
                    <Button onClick={async()=>{ await createTodayTask(); setShowAddModal(false) }} disabled={saving}>{saving? 'Saving…':'Add Task'}</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View All Modal (unchanged functionality) */}
          {showAllModal && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={()=>setShowAllModal(false)} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl bg-dark-900/95 border border-white/10 rounded-xl shadow-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">All Tasks for Today</h4>
                  <Button variant="ghost" onClick={()=>setShowAllModal(false)}>Close</Button>
                </div>
                <div className="max-h-[70vh] overflow-auto no-scrollbar">
                  <ul className="divide-y divide-white/5">
                    {[...dayTasks].sort((a,b)=>{
                      const ad = (a.status||'todo')==='done'
                      const bd = (b.status||'todo')==='done'
                      if (ad===bd) return 0
                      return ad ? 1 : -1
                    }).map(t => (
                      <li key={t.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button onClick={()=>toggleDone(t)} className="p-1 rounded-lg hover:bg-white/10">
                            {(t.status || 'todo') === 'done' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div>
                            <p className={`text-white font-medium ${ (t.status||'todo')==='done' ? 'line-through text-gray-400' : ''}`}>{t.title}</p>
                            {t.description && <p className="text-gray-400 text-sm">{t.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={()=>beginEdit(t)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={()=>removeTask(t)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
