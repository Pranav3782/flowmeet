import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Plus, Check, Clock, User as UserIcon, Tag, MessageSquare, AlertCircle, RefreshCw, Trash, Edit3 } from 'lucide-react';

export default function TasksPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // States
  const [tasks, setTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Task Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [clientId, setClientId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Comment state on edit
  const [newComment, setNewComment] = useState('');

  const fetchCoreData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [tasksRes, clientsRes, teamRes] = await Promise.all([
        fetch('/api/tasks', { headers }),
        fetch('/api/clients', { headers }),
        fetch('/api/team', { headers }),
      ]);

      const tasksData = await tasksRes.json();
      const clientsData = await clientsRes.json();
      const teamData = await teamRes.json();

      if (tasksRes.ok) setTasks(tasksData);
      if (clientsRes.ok) setClients(clientsData);
      if (teamRes.ok) setTeam(teamData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCoreData();
    }
  }, [token]);

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name, description, priority, status, clientId: clientId || null, ownerId: ownerId || null, dueDate: dueDate || null
        })
      });

      if (response.ok) {
        await fetchCoreData();
        setShowAddModal(false);
        resetForm();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create task');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Edit/Update Task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    let parsedComments = [];
    if (selectedTask.comments) {
      try {
        parsedComments = JSON.parse(selectedTask.comments);
      } catch (e) {
        parsedComments = [];
      }
    }

    if (newComment.trim()) {
      parsedComments.push({
        author: user?.name || 'User',
        text: newComment.trim(),
        time: new Date().toISOString()
      });
    }

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name, description, priority, status, ownerId: ownerId || null, dueDate: dueDate || null, comments: parsedComments
        })
      });

      if (response.ok) {
        await fetchCoreData();
        setShowEditModal(false);
        setNewComment('');
        setSelectedTask(null);
        resetForm();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update task');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Move task status via direct quick action on Kanban column headers
  const handleMoveStatus = async (taskId: string, targetStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      if (response.ok) {
        await fetchCoreData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this action item?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchCoreData();
        setShowEditModal(false);
        setSelectedTask(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (task: any) => {
    setSelectedTask(task);
    setName(task.name);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setClientId(task.clientId || '');
    setOwnerId(task.ownerId || '');
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setNewComment('');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setClientId('');
    setOwnerId('');
    setDueDate('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#111111]/60" />
      </div>
    );
  }

  // Kanban Columns
  const columns = [
    { id: 'PENDING', title: 'Pending Actions', color: 'border-t-4 border-t-[#F8D4E5] bg-[#F8D4E5]/10' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-4 border-t-[#C8D9F7] bg-[#C8D9F7]/10' },
    { id: 'REVIEW', title: 'Under Review', color: 'border-t-4 border-t-[#F5DE74] bg-[#F5DE74]/10' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-t-4 border-t-[#B8E3A1] bg-[#B8E3A1]/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#111111]/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Onboarding Kanban Workspace</h1>
          <p className="text-xs text-[#111111]/50 mt-1 font-medium">Track automatically extracted AI action items, assign task priorities, and audit timelines.</p>
        </div>

        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-5 py-3 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition text-xs flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Custom Task
        </button>
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className="space-y-4">
              {/* Column Header */}
              <div className={`p-4 rounded-t-[20px] flex items-center justify-between shadow-soft ${col.color}`}>
                <span className="font-bold text-sm tracking-tight">{col.title}</span>
                <span className="w-5 h-5 rounded-full bg-white text-[#111111] text-[10px] font-black flex items-center justify-center shadow-sm">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Items inside column */}
              <div className="space-y-3 min-h-[50vh] bg-white/20 p-2.5 rounded-b-[20px] border border-[#111111]/5">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-[10px] font-medium text-[#111111]/30 border border-dashed border-[#111111]/10 rounded-[16px] bg-white/40">
                    No items in this stage.
                  </div>
                ) : (
                  colTasks.map((task) => {
                    let commentCount = 0;
                    if (task.comments) {
                      try {
                        commentCount = JSON.parse(task.comments).length;
                      } catch (e) {
                        commentCount = 0;
                      }
                    }

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => openEditModal(task)}
                        className="p-5 bg-white rounded-[20px] shadow-soft border border-[#111111]/5 hover:border-[#111111]/15 hover:shadow-premium transition cursor-pointer space-y-3.5"
                      >
                        {/* Tags and Priority */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                            task.priority === 'HIGH' ? 'bg-[#F8D4E5] text-rose-800' :
                            task.priority === 'MEDIUM' ? 'bg-[#F5DE74] text-amber-800' : 'bg-[#B8E3A1] text-emerald-800'
                          }`}>
                            {task.priority}
                          </span>
                          {task.client && (
                            <span className="text-[10px] font-bold text-[#111111]/50">{task.client.companyName}</span>
                          )}
                        </div>

                        {/* Title & Desc */}
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm tracking-tight text-[#111111]">{task.name}</h4>
                          <p className="text-xs text-[#111111]/55 leading-relaxed line-clamp-2">{task.description}</p>
                        </div>

                        {/* Footer details */}
                        <div className="flex items-center justify-between pt-3.5 border-t border-[#111111]/5 text-[10px] font-semibold text-[#111111]/45">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {commentCount > 0 && (
                              <span className="flex items-center gap-0.5"><MessageSquare className="w-3.5 h-3.5" /> {commentCount}</span>
                            )}
                            <div className="w-5 h-5 rounded-full bg-[#111111]/5 flex items-center justify-center font-bold text-[9px]">
                              {task.owner?.name[0] || 'U'}
                            </div>
                          </div>
                        </div>

                        {/* Fast Move Buttons to preview drag-drop changes */}
                        <div className="flex gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
                          {col.id !== 'PENDING' && (
                            <button 
                              onClick={() => handleMoveStatus(task.id, col.id === 'IN_PROGRESS' ? 'PENDING' : col.id === 'REVIEW' ? 'IN_PROGRESS' : 'REVIEW')}
                              className="text-[9px] font-bold px-1.5 py-0.5 bg-black/5 hover:bg-black/10 rounded"
                            >
                              &larr; Prev
                            </button>
                          )}
                          {col.id !== 'COMPLETED' && (
                            <button 
                              onClick={() => handleMoveStatus(task.id, col.id === 'PENDING' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'REVIEW' : 'COMPLETED')}
                              className="text-[9px] font-bold px-1.5 py-0.5 bg-[#111111] text-white hover:bg-black/90 rounded ml-auto"
                            >
                              Next &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD TASK */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-premium overflow-hidden border border-[#111111]/15 animate-fade-in p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#111111]/10">
              <h3 className="font-extrabold text-lg">Create Custom Onboarding Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-xl font-bold text-[#111111]/50 hover:text-black">&times;</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="Review client configuration file"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Draft recommendations for integrations setup..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-3 bg-white border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm font-semibold cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-3 bg-white border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm font-semibold cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Assigned Client</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-3 bg-white border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm font-semibold cursor-pointer"
                  >
                    <option value="">None (Internal)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Owner Assignee</label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full px-3 py-3 bg-white border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm font-semibold cursor-pointer"
                >
                  <option value={user?.id}>Assign to Me</option>
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.role.toLowerCase()})</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-[#111111]/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 border border-[#111111]/15 rounded-full font-semibold hover:bg-black/5 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition text-xs btn-pill"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TASK & DISCUSSIONS */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-premium overflow-hidden border border-[#111111]/15 animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-8 py-5 border-b border-[#111111]/10 flex items-center justify-between bg-[#F5F0E6]/30">
              <span className="font-bold text-sm tracking-tight text-[#111111]/60 uppercase">Task Operations Cockpit</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                  title="Delete Task"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <button onClick={() => setShowEditModal(false)} className="text-xl font-bold text-[#111111]/50 hover:text-black px-2">&times;</button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Task Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-3 bg-[#F5F0E6]/10 border border-[#111111]/10 rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-3 bg-[#F5F0E6]/10 border border-[#111111]/10 rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Assigned Owner</label>
                    <select
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      className="w-full px-3 py-3 bg-white border border-[#111111]/10 rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      {team.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/60 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl text-sm cursor-pointer"
                    />
                  </div>
                </div>

                {/* TASK DISCUSSION/COMMENTS LOGS */}
                <div className="pt-6 border-t border-[#111111]/10 space-y-4">
                  <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> Discussion Feed
                  </h4>

                  {/* Comments list */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {(() => {
                      let commentsList = [];
                      if (selectedTask.comments) {
                        try {
                          commentsList = JSON.parse(selectedTask.comments);
                        } catch (e) {
                          commentsList = [];
                        }
                      }

                      if (commentsList.length === 0) {
                        return <p className="text-xs text-[#111111]/40 italic">No notes posted yet. Start the conversation!</p>;
                      }

                      return commentsList.map((c: any, i: number) => (
                        <div key={i} className="p-3 bg-[#F5F0E6]/30 border border-[#111111]/5 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-bold text-[#111111]/60 text-[10px]">
                            <span>{c.author}</span>
                            <span>{new Date(c.time).toLocaleDateString()}</span>
                          </div>
                          <p className="text-black/85 leading-relaxed">{c.text}</p>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Add Comment Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/50 mb-1">Add Comment</label>
                    <input
                      type="text"
                      placeholder="Type a team update or feedback item..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F5F0E6]/30 border border-[#111111]/10 rounded-xl focus:outline-none focus:border-[#111111] text-xs"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-2 border-t border-[#111111]/10">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-3 border border-[#111111]/15 rounded-full font-semibold hover:bg-black/5 transition text-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#111111] text-white rounded-full font-semibold hover:bg-black/90 transition text-xs btn-pill"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
