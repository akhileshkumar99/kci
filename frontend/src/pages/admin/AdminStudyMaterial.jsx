import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminStudyMaterial() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'notes', course: '', videoUrl: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/study-material').then(r => setMaterials(r.data.materials || []));
    api.get('/courses').then(r => setCourses(r.data.courses || []));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title) return toast.error('Title required');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      const { data } = await api.post('/study-material', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMaterials(p => [data.material, ...p]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'notes', course: '', videoUrl: '' });
      setFile(null);
      toast.success('Material added!');
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/study-material/${id}`); setMaterials(p => p.filter(m => m._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const catColors = { notes: 'bg-blue-100 text-blue-700', assignment: 'bg-violet-100 text-violet-700', previous_paper: 'bg-orange-100 text-orange-700', video: 'bg-pink-100 text-pink-700', other: 'bg-gray-100 text-gray-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Study Material</h1><p className="text-sm text-gray-500">Manage notes, assignments & videos</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'Add Material'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title *" className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50" />
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50">
                <option value="notes">Notes</option>
                <option value="assignment">Assignment</option>
                <option value="previous_paper">Previous Paper</option>
                <option value="video">Video</option>
                <option value="other">Other</option>
              </select>
              <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx" className="px-4 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm" />
            </div>
            <input value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="Video URL (YouTube/Drive link)" className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50" />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50 resize-none" />
            <button type="submit" disabled={loading} className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-60">
              {loading ? 'Uploading...' : 'Add Material'}
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m, i) => (
          <motion.div key={m._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-violet-600" /></div>
              <button onClick={() => handleDelete(m._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 truncate">{m.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${catColors[m.category] || 'bg-gray-100 text-gray-700'}`}>{m.category?.replace('_', ' ')}</span>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
              <Download className="w-3.5 h-3.5" /> {m.downloads || 0} downloads
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
