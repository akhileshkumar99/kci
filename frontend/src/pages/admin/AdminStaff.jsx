import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, User } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const emptyForm = { name: '', designation: '', qualification: '', experience: '', department: '', email: '', phone: '', order: '0' };

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStaff(); }, []);
  const fetchStaff = async () => {
    try { const { data } = await api.get('/staff'); setStaff(data.staff); } catch {}
    setLoading(false);
  };

  const openEdit = (s) => { setForm({ ...s, order: s.order?.toString() || '0' }); setEditing(s._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.designation) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'photo' || typeof v === 'string') fd.append(k, v); });
      if (form.photoFile) fd.append('photo', form.photoFile);
      if (editing) { await api.put(`/staff/${editing}`, fd); toast.success('Updated'); }
      else { await api.post('/staff', fd); toast.success('Added'); }
      setModal(false); fetchStaff();
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff member?')) return;
    try { await api.delete(`/staff/${id}`); toast.success('Deleted'); fetchStaff(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <div key={s._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                {s.photo ? <img src={s.photo} alt={s.name} className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
                <p className="text-blue-600 text-sm">{s.designation}</p>
                <p className="text-gray-500 text-xs">{s.department}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Staff' : 'Add Staff'}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              {[['name', 'Name *'], ['designation', 'Designation *'], ['qualification', 'Qualification'], ['experience', 'Experience'], ['department', 'Department'], ['email', 'Email'], ['phone', 'Phone']].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, photoFile: e.target.files[0] })} className="w-full text-sm text-gray-600" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
