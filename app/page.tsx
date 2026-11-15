 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check, Circle, CircleCheck, Clock3, Plus, Search, CalendarDays, ListTodo,
  LayoutDashboard, Trash2, Pencil, X, ChevronDown, AlertCircle, Flag, Target
} from "lucide-react";

type Status = "To do" | "In progress" | "Done";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: Status;
  priority: Priority;
  startDate: string;
  dueDate: string;
  createdAt: string;
};

const STORAGE_KEY = "taskflow-tasks-v1";
const today = () => new Date().toISOString().slice(0, 10);
const sampleTasks: Task[] = [
  { id: "sample-1", title: "Plan the week", description: "Review priorities and block time for key deliverables.", category: "Personal", status: "Done", priority: "Medium", startDate: today(), dueDate: today(), createdAt: new Date().toISOString() },
  { id: "sample-2", title: "Prepare project proposal", description: "Draft scope, milestones and expected outcomes.", category: "Work", status: "In progress", priority: "High", startDate: today(), dueDate: today(), createdAt: new Date().toISOString() },
  { id: "sample-3", title: "Review monthly expenses", description: "Check spending and update the monthly tracker.", category: "Personal", status: "To do", priority: "Low", startDate: today(), dueDate: "", createdAt: new Date().toISOString() }
];

const statusColor: Record<Status, string> = {
  "To do": "bg-slate-100 text-slate-600",
  "In progress": "bg-blue-50 text-blue-700",
  "Done": "bg-emerald-50 text-emerald-700"
};
const priorityColor: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-rose-50 text-rose-700"
};

function prettyDate(value: string) {
  if (!value) return "No due date";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function isOverdue(task: Task) {
  return task.status !== "Done" && !!task.dueDate && task.dueDate < today();
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "Work", status: "To do" as Status,
    priority: "Medium" as Priority, startDate: today(), dueDate: ""
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) : sampleTasks);
    } catch {
      setTasks(sampleTasks);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const done = tasks.filter(t => t.status === "Done").length;
  const inProgress = tasks.filter(t => t.status === "In progress").length;
  const overdue = tasks.filter(isOverdue).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const visibleTasks = useMemo(() => tasks
    .filter(t => filter === "All" || t.status === filter)
    .filter(t => `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }), [tasks, filter, query]);

  const upcoming = tasks.filter(t => t.status !== "Done" && t.dueDate && t.dueDate >= today())
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);

  function openNew() {
    setEditing(null);
    setForm({ title: "", description: "", category: "Work", status: "To do", priority: "Medium", startDate: today(), dueDate: "" });
    setModalOpen(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setForm({ title: task.title, description: task.description, category: task.category, status: task.status, priority: task.priority, startDate: task.startDate, dueDate: task.dueDate });
    setModalOpen(true);
  }
  function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editing) {
      setTasks(prev => prev.map(t => t.id === editing.id ? { ...t, ...form, title: form.title.trim() } : t));
    } else {
      setTasks(prev => [{ ...form, title: form.title.trim(), id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev]);
    }
    setModalOpen(false);
  }
  function cycleStatus(task: Task) {
    const next: Record<Status, Status> = { "To do": "In progress", "In progress": "Done", "Done": "To do" };
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next[t.status] } : t));
  }
  function deleteTask(id: string) {
    if (window.confirm("Delete this task?")) setTasks(prev => prev.filter(t => t.id !== id));
  }

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><Check size={22}/></div>
            <div><div className="font-bold text-lg tracking-tight">TaskFlow</div><div className="text-xs text-slate-500">Plan clearly. Make progress.</div></div>
          </div>
          <button onClick={openNew} className="btn btn-primary flex items-center gap-2"><Plus size={16}/> New task</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="mb-7 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div><p className="text-sm text-slate-500 mb-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your workspace</h1><p className="text-slate-500 text-sm mt-1">A clear view of what needs your attention.</p></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Your tasks are saved in this browser</div>
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Stat label="Total tasks" value={tasks.length} icon={<ListTodo size={18}/>} tint="bg-indigo-50 text-indigo-600"/>
          <Stat label="Completed" value={done} icon={<CircleCheck size={18}/>} tint="bg-emerald-50 text-emerald-600"/>
          <Stat label="In progress" value={inProgress} icon={<Clock3 size={18}/>} tint="bg-blue-50 text-blue-600"/>
          <Stat label="Overdue" value={overdue} icon={<AlertCircle size={18}/>} tint="bg-rose-50 text-rose-600"/>
        </section>

        <section className="grid lg:grid-cols-3 gap-5 mb-5">
          <div className="panel p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-semibold">Overall progress</h2><p className="text-xs text-slate-500 mt-1">Based on completed tasks</p></div><div className="text-3xl font-bold text-indigo-600">{progress}%</div></div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }}/></div>
            <div className="flex justify-between mt-3 text-xs text-slate-500"><span>{done} completed</span><span>{tasks.length - done} remaining</span></div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-3"><Target size={17} className="text-indigo-600"/><h2 className="font-semibold">Quick insight</h2></div>
            <p className="text-sm text-slate-600 leading-6">{tasks.length === 0 ? "Add your first task to start tracking progress." : overdue > 0 ? `You have ${overdue} overdue ${overdue === 1 ? "task" : "tasks"}. Review the deadlines and adjust your plan.` : done === tasks.length ? "Everything is complete. Great work!" : `You have ${tasks.length - done} open tasks. Keep moving one task at a time.`}</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="panel p-5 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div><h2 className="font-semibold text-lg">Tasks</h2><p className="text-xs text-slate-500 mt-1">{visibleTasks.length} tasks shown</p></div>
              <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="field pl-9 w-full sm:w-56 text-sm" placeholder="Search tasks..." value={query} onChange={e => setQuery(e.target.value)}/></div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
              {(["All", "To do", "In progress", "Done"] as const).map(s => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${filter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{s}</button>)}
            </div>
            <div className="divide-y divide-slate-100">
              {visibleTasks.map(task => <article key={task.id} className="py-4 flex gap-3 items-start">
                <button title="Move to next status" onClick={() => cycleStatus(task)} className="mt-0.5 text-slate-400 hover:text-indigo-600">{task.status === "Done" ? <CircleCheck className="text-emerald-600" size={21}/> : <Circle size={21}/>}</button>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${task.status === "Done" ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</div>
                  {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`badge ${statusColor[task.status]}`}>{task.status}</span>
                    <span className={`badge ${priorityColor[task.priority]}`}>{task.priority} priority</span>
                    <span className="text-[11px] text-slate-500">{task.category}</span>
                    <span className={`text-[11px] flex items-center gap-1 ${isOverdue(task) ? "text-rose-600 font-semibold" : "text-slate-500"}`}><CalendarDays size={12}/>{isOverdue(task) ? "Overdue · " : ""}{prettyDate(task.dueDate)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button title="Edit task" onClick={() => openEdit(task)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={15}/></button>
                  <button title="Delete task" onClick={() => deleteTask(task.id)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15}/></button>
                </div>
              </article>)}
              {visibleTasks.length === 0 && <div className="py-12 text-center"><ListTodo size={28} className="mx-auto text-slate-300 mb-2"/><p className="text-sm font-medium text-slate-600">No tasks found</p><p className="text-xs text-slate-400 mt-1">Add a task or change your search/filter.</p></div>}
            </div>
          </div>

          <aside className="panel p-5 h-fit">
            <div className="flex items-center gap-2 mb-1"><CalendarDays size={17} className="text-indigo-600"/><h2 className="font-semibold">Upcoming deadlines</h2></div>
            <p className="text-xs text-slate-500 mb-4">Your next due tasks</p>
            {upcoming.length ? <div className="space-y-3">{upcoming.map(task => <div key={task.id} className="border-l-2 border-indigo-200 pl-3 py-1"><div className="text-sm font-medium">{task.title}</div><div className="text-xs text-slate-500 mt-1">{prettyDate(task.dueDate)}</div></div>)}</div> : <div className="py-6 text-center text-xs text-slate-400">No upcoming deadlines.</div>}
            {overdue > 0 && <div className="mt-5 rounded-xl bg-rose-50 p-3"><div className="flex items-center gap-2 text-rose-700 text-xs font-bold"><AlertCircle size={14}/>{overdue} overdue</div><p className="text-xs text-rose-600 mt-1">Review these tasks and update their due dates or status.</p></div>}
            <button onClick={openNew} className="btn btn-quiet w-full mt-5 flex items-center justify-center gap-2"><Plus size={15}/> Add a task</button>
          </aside>
        </section>
        <footer className="text-center text-xs text-slate-400 mt-8">TaskFlow · Simple task and progress management</footer>
      </div>

      {modalOpen && <div className="fixed inset-0 z-50 bg-slate-900/40 p-4 flex items-center justify-center overflow-y-auto">
        <form onSubmit={saveTask} className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 my-auto">
          <div className="flex items-center justify-between mb-5"><div><h2 className="text-xl font-bold">{editing ? "Edit task" : "Create a task"}</h2><p className="text-xs text-slate-500 mt-1">Add the details and set a timeline.</p></div><button type="button" onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18}/></button></div>
          <div className="space-y-4">
            <label className="block"><span className="text-xs font-semibold text-slate-600">Task title *</span><input required autoFocus className="field mt-1.5" placeholder="e.g. Prepare monthly review" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></label>
            <label className="block"><span className="text-xs font-semibold text-slate-600">Description</span><textarea rows={3} className="field mt-1.5 resize-y" placeholder="Add notes or details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label><span className="text-xs font-semibold text-slate-600">Category</span><input className="field mt-1.5" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Work / Personal"/></label>
              <label><span className="text-xs font-semibold text-slate-600">Priority</span><select className="field mt-1.5" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}><option>Low</option><option>Medium</option><option>High</option></select></label>
              <label><span className="text-xs font-semibold text-slate-600">Start date</span><input type="date" className="field mt-1.5" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}/></label>
              <label><span className="text-xs font-semibold text-slate-600">Due date</span><input type="date" className="field mt-1.5" value={form.dueDate} min={form.startDate || undefined} onChange={e => setForm({ ...form, dueDate: e.target.value })}/></label>
              <label className="sm:col-span-2"><span className="text-xs font-semibold text-slate-600">Status</span><select className="field mt-1.5" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}><option>To do</option><option>In progress</option><option>Done</option></select></label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6"><button type="button" onClick={() => setModalOpen(false)} className="btn btn-quiet">Cancel</button><button type="submit" className="btn btn-primary">{editing ? "Save changes" : "Create task"}</button></div>
        </form>
      </div>}
    </main>
  );
}

function Stat({ label, value, icon, tint }: { label: string; value: number; icon: React.ReactNode; tint: string }) {
  return <div className="panel p-4"><div className="flex items-center justify-between"><span className="text-xs text-slate-500 font-medium">{label}</span><span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tint}`}>{icon}</span></div><div className="text-2xl font-bold mt-2">{value}</div></div>;
}
