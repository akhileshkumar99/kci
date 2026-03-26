import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const empty = { title: '', description: '', duration: '', fee: '', category: 'Certificate', syllabus: '', eligibility: '', featured: false };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try { const { data } = await api.get('/courses'); setCourses(data.courses); } catch {}
    setLoading(false);
  };

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (c) => {
    setForm({ ...c, syllabus: c.syllabus?.join('\n') || '', fee: c.fee.toString() });
    setEditing(c._id); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.duration || !form.fee) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'image' || typeof v === 'string') fd.append(k, v); });
      if (form.imageFile) fd.append('image', form.imageFile);
      if (editing) { await api.put(`/courses/${editing}`, fd); toast.success('Course updated'); }
      else { await api.post('/courses', fd); toast.success('Course added'); }
      setModal(false); fetchCourses();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await api.delete(`/courses/${id}`); toast.success('Deleted'); fetchCourses(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>{['Title', 'Category', 'Duration', 'Fee', 'Featured', 'Actions'].map(h => <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>)}</tr></thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{c.title}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">{c.category}</span></td>
                  <td className="p-4 text-gray-600">{c.duration}</td>
                  <td className="p-4 text-gray-600">₹{c.fee.toLocaleString()}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs ${c.featured ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.featured ? 'Yes' : 'No'}</span></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[['title', 'Title *', 'text'], ['duration', 'Duration *', 'text'], ['fee', 'Fee (₹) *', 'number']].map(([name, label, type]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {['Basic', 'Certificate', 'Diploma', 'Advanced', 'Professional'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus (one per line)</label>
                <textarea value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Image</label>
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })} className="w-full text-sm text-gray-600" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 text-blue-600" />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Course</label>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Course'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
