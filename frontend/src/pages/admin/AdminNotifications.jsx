import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Bell, X, Eye, Pencil, ImagePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const typeColors = { exam: 'bg-orange-100 text-orange-700', result: 'bg-green-100 text-green-700', course: 'bg-blue-100 text-blue-700', general: 'bg-gray-100 text-gray-700', admission: 'bg-violet-100 text-violet-700', fee: 'bg-yellow-100 text-yellow-700', holiday: 'bg-teal-100 text-teal-700', urgent: 'bg-red-100 text-red-700' };
const emptyForm = { title: '', message: '', type: 'general', targetRole: 'all', image: null };
const cls = 'w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 text-sm';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { api.get('/notifications').then(r => setNotifications(r.data.notifications || [])).catch(() => {}); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error('Fill all fields');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title); fd.append('message', form.message);
      fd.append('type', form.type); fd.append('targetRole', form.targetRole);
      if (form.image) fd.append('image', form.image);
      const { data } = await api.post('/notifications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNotifications(p => [data.notification, ...p]);
      setShowForm(false); setForm(emptyForm);
      toast.success('Notification sent!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!confirm('Delete this notification?')) return;
    try { await api.delete(`/notifications/${id}`); setNotifications(p => p.filter(n => n._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const openEdit = n => { setEditModal(n); setEditForm({ title: n.title, message: n.message, type: n.type, targetRole: n.targetRole, image: null }); };

  const handleEdit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', editForm.title); fd.append('message', editForm.message);
      fd.append('type', editForm.type); fd.append('targetRole', editForm.targetRole);
      if (editForm.image) fd.append('image', editForm.image);
      const { data } = await api.put(`/notifications/${editModal._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNotifications(p => p.map(n => n._id === editModal._id ? data.notification : n));
      setEditModal(null); toast.success('Updated!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

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
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notification Title *" required className={cls} />
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Message *" rows={3} required className={cls + ' resize-none'} />
            <div className="grid sm:grid-cols-2 gap-4">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={cls}>
                <option value="general">General</option><option value="exam">Exam Update</option>
                <option value="result">Result Alert</option><option value="course">Course Update</option>
                <option value="admission">Admission</option><option value="fee">Fee</option>
                <option value="holiday">Holiday</option><option value="urgent">Urgent</option>
              </select>
              <select value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} className={cls}>
                <option value="all">All Users</option><option value="student">Students Only</option>
                <option value="franchise">Franchise Only</option><option value="teacher">Teachers Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image (optional)</label>
              <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={e => setForm(p => ({ ...p, image: e.target.files[0] }))} />
                <ImagePlus className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-500">{form.image ? form.image.name : 'Click to upload image'}</span>
              </label>
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Send Notification 🔔
            </button>
          </form>
        </motion.div>
      )}

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div key={n._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
            {n.image
              ? <img src={n.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
              : <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><Bell className="w-5 h-5 text-blue-600" /></div>
            }
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-gray-900">{n.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>{n.type}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">→ {n.targetRole}</span>
              </div>
              <p className="text-gray-600 text-sm truncate">{n.message}</p>
              <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setViewModal(n)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4" /></button>
              <button onClick={() => openEdit(n)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(n._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No notifications sent yet</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Notification Details</h2>
                <button onClick={() => setViewModal(null)}><X className="w-5 h-5 text-white/80" /></button>
              </div>
              <div className="p-6 space-y-3">
                {viewModal.image && <img src={viewModal.image} alt="" className="w-full h-48 object-cover rounded-xl" />}
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${typeColors[viewModal.type] || 'bg-gray-100 text-gray-700'}`}>{viewModal.type}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">→ {viewModal.targetRole}</span>
                </div>
                <h3 className="font-black text-gray-900 text-lg">{viewModal.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{viewModal.message}</p>
                <p className="text-gray-400 text-xs">{new Date(viewModal.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Edit Notification</h2>
                <button onClick={() => setEditModal(null)}><X className="w-5 h-5 text-white/80" /></button>
              </div>
              <div className="p-6">
                {editModal.image && !editForm.image && <img src={editModal.image} alt="" className="w-full h-32 object-cover rounded-xl border border-gray-100 mb-4" />}
                <form onSubmit={handleEdit} className="space-y-4">
                  <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title *" required className={cls} />
                  <textarea value={editForm.message} onChange={e => setEditForm(p => ({ ...p, message: e.target.value }))} placeholder="Message *" rows={3} required className={cls + ' resize-none'} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className={cls}>
                      <option value="general">General</option><option value="exam">Exam Update</option>
                      <option value="result">Result Alert</option><option value="course">Course Update</option>
                      <option value="admission">Admission</option><option value="fee">Fee</option>
                      <option value="holiday">Holiday</option><option value="urgent">Urgent</option>
                    </select>
                    <select value={editForm.targetRole} onChange={e => setEditForm(p => ({ ...p, targetRole: e.target.value }))} className={cls}>
                      <option value="all">All Users</option><option value="student">Students Only</option>
                      <option value="franchise">Franchise Only</option><option value="teacher">Teachers Only</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={e => setEditForm(p => ({ ...p, image: e.target.files[0] }))} />
                    <ImagePlus className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500">{editForm.image ? editForm.image.name : 'Change image (optional)'}</span>
                  </label>
                  <button type="submit" disabled={saving} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Save Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { api.get('/notifications').then(r => setNotifications(r.data.notifications || [])).catch(() => {}); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error('Fill all fields');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('message', form.message);
      fd.append('type', form.type);
      fd.append('targetRole', form.targetRole);
      if (form.image) fd.append('image', form.image);
      const { data } = await api.post('/notifications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNotifications(p => [data.notification, ...p]);
      setShowForm(false);
      setForm(emptyForm);
      toast.success('Notification sent!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!confirm('Delete this notification?')) return;
    try { await api.delete(`/notifications/${id}`); setNotifications(p => p.filter(n => n._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const openEdit = n => { setEditModal(n); setEditForm({ title: n.title, message: n.message, type: n.type, targetRole: n.targetRole, image: null }); };

  const handleEdit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('message', editForm.message);
      fd.append('type', editForm.type);
      fd.append('targetRole', editForm.targetRole);
      if (editForm.image) fd.append('image', editForm.image);
      const { data } = await api.put(`/notifications/${editModal._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNotifications(p => p.map(n => n._id === editModal._id ? data.notification : n));
      setEditModal(null);
      toast.success('Updated!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const cls = 'w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 text-sm';

  const FormFields = ({ f, setF, onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <input value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} placeholder="Notification Title *" required className={cls} />
      <textarea value={f.message} onChange={e => setF(p => ({ ...p, message: e.target.value }))} placeholder="Message *" rows={3} required className={cls + ' resize-none'} />
      <div className="grid sm:grid-cols-2 gap-4">
        <select value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))} className={cls}>
          <option value="general">General</option>
          <option value="exam">Exam Update</option>
          <option value="result">Result Alert</option>
          <option value="course">Course Update</option>
          <option value="admission">Admission</option>
          <option value="fee">Fee</option>
          <option value="holiday">Holiday</option>
          <option value="urgent">Urgent</option>
        </select>
        <select value={f.targetRole} onChange={e => setF(p => ({ ...p, targetRole: e.target.value }))} className={cls}>
          <option value="all">All Users</option>
          <option value="student">Students Only</option>
          <option value="franchise">Franchise Only</option>
          <option value="teacher">Teachers Only</option>
        </select>
      </div>
      {/* Image Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image (optional)</label>
        <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <input type="file" className="hidden" accept="image/*" onChange={e => setF(p => ({ ...p, image: e.target.files[0] }))} />
          <ImagePlus className="w-5 h-5 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-500">{f.image ? f.image.name : 'Click to upload image'}</span>
          {f.image && <button type="button" onClick={e => { e.preventDefault(); setF(p => ({ ...p, image: null })); }} className="ml-auto"><X className="w-4 h-4 text-gray-400" /></button>}
        </label>
      </div>
      <button type="submit" disabled={saving} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
        {submitLabel}
      </button>
    </form>
  );

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
          <FormFields f={form} setF={setForm} onSubmit={handleSubmit} submitLabel="Send Notification 🔔" />
        </motion.div>
      )}

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div key={n._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
            {n.image
              ? <img src={n.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
              : <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><Bell className="w-5 h-5 text-blue-600" /></div>
            }
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-gray-900">{n.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>{n.type}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">→ {n.targetRole}</span>
              </div>
              <p className="text-gray-600 text-sm truncate">{n.message}</p>
              <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setViewModal(n)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
              <button onClick={() => openEdit(n)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(n._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No notifications sent yet</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Notification Details</h2>
                <button onClick={() => setViewModal(null)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
              </div>
              <div className="p-6 space-y-3">
                {viewModal.image && <img src={viewModal.image} alt="" className="w-full h-48 object-cover rounded-xl border border-gray-100" />}
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${typeColors[viewModal.type] || 'bg-gray-100 text-gray-700'}`}>{viewModal.type}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">→ {viewModal.targetRole}</span>
                </div>
                <h3 className="font-black text-gray-900 text-lg">{viewModal.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{viewModal.message}</p>
                <p className="text-gray-400 text-xs">{new Date(viewModal.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Edit Notification</h2>
                <button onClick={() => setEditModal(null)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
              </div>
              <div className="p-6">
                {editModal.image && !editForm.image && (
                  <img src={editModal.image} alt="" className="w-full h-32 object-cover rounded-xl border border-gray-100 mb-4" />
                )}
                <FormFields f={editForm} setF={setEditForm} onSubmit={handleEdit} submitLabel="Save Changes" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
