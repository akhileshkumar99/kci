import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Bell, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'general', targetRole: 'all' });

  useEffect(() => { api.get('/notifications').then(r => setNotifications(r.data.notifications || [])); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error('Fill all fields');
    try {
      const { data } = await api.post('/notifications', form);
      setNotifications(p => [data.notification, ...p]);
      setShowForm(false);
      setForm({ title: '', message: '', type: 'general', targetRole: 'all' });
      toast.success('Notification sent!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async id => {
    try { await api.delete(`/notifications/${id}`); setNotifications(p => p.filter(n => n._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const typeColors = { exam: 'bg-orange-100 text-orange-700', result: 'bg-green-100 text-green-700', course: 'bg-blue-100 text-blue-700', general: 'bg-gray-100 text-gray-700', admission: 'bg-violet-100 text-violet-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Notifications</h1><p className="text-sm text-gray-500">Send announcements to students</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'Send Notification'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notification Title *" className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50" />
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Message *" rows={3} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 resize-none" />
            <div className="grid sm:grid-cols-2 gap-4">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50">
                <option value="general">General</option>
                <option value="exam">Exam Update</option>
                <option value="result">Result Alert</option>
                <option value="course">Course Update</option>
                <option value="admission">Admission</option>
              </select>
              <select value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50">
                <option value="all">All Users</option>
                <option value="student">Students Only</option>
                <option value="franchise">Franchise Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
              Send Notification 🔔
            </button>
          </form>
        </motion.div>
      )}

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div key={n._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><Bell className="w-5 h-5 text-blue-600" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900">{n.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>{n.type}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">→ {n.targetRole}</span>
              </div>
              <p className="text-gray-600 text-sm">{n.message}</p>
              <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <button onClick={() => handleDelete(n._id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
