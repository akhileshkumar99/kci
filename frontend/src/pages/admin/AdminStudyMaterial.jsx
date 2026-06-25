import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, X, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const empty = { title: '', description: '', category: 'notes', course: '', videoUrl: '' };
const catColors = { notes: 'bg-blue-100 text-blue-700', assignment: 'bg-violet-100 text-violet-700', previous_paper: 'bg-orange-100 text-orange-700', video: 'bg-pink-100 text-pink-700', other: 'bg-gray-100 text-gray-700' };

const getYouTubeThumbnail = url => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};

export default function AdminStudyMaterial() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/study-material').then(r => setMaterials(r.data.materials || []));
    api.get('/courses').then(r => setCourses(r.data.courses || []));
  }, []);

  const openAdd = () => { setEditId(null); setForm(empty); setThumbnail(null); setThumbPreview(null); setShowForm(true); };
  const openEdit = m => {
    setEditId(m._id);
    setForm({ title: m.title || '', description: m.description || '', category: m.category || 'notes', course: m.course?._id || m.course || '', videoUrl: m.videoUrl || '' });
    setThumbnail(null);
    setThumbPreview(m.thumbnailUrl || null);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(empty); setThumbnail(null); setThumbPreview(null); setPdfFile(null); };

  const handleThumb = e => {
    const f = e.target.files[0];
    if (!f) return;
    setThumbnail(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title) return toast.error('Title required');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      if (pdfFile) fd.append('file', pdfFile);
      if (editId) {
        const { data } = await api.put(`/study-material/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMaterials(p => p.map(m => m._id === editId ? data.material : m));
        toast.success('Updated!');
      } else {
        const { data } = await api.post('/study-material', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMaterials(p => [data.material, ...p]);
        toast.success('Added!');
      }
      closeForm();
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/study-material/${id}`); setMaterials(p => p.filter(m => m._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Study Material</h1><p className="text-sm text-gray-500">Manage notes, assignments & videos</p></div>
        <button onClick={showForm ? closeForm : openAdd} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'Add Material'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? 'Edit Material' : 'Add Material'}</h2>
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
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Thumbnail Image</label>
                <input type="file" onChange={handleThumb} accept="image/*" className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm" />
                {thumbPreview && <img src={thumbPreview} className="mt-2 h-24 w-full object-contain bg-gray-100 rounded-xl" />}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">PDF / Document File</label>
                <input type="file" onChange={e => setPdfFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx" className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm" />
                {pdfFile && <p className="text-xs text-green-600 font-semibold mt-1">✓ {pdfFile.name}</p>}
              </div>
            </div>
            <input value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="Video URL (YouTube/Drive link)" className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50" />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50 resize-none" />
            <button type="submit" disabled={loading} className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : editId ? 'Update Material' : 'Add Material'}
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m, i) => {
          const ytThumb = getYouTubeThumbnail(m.videoUrl);
          const thumb = m.thumbnailUrl || ytThumb;
          return (
            <motion.div key={m._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {thumb ? (
                <img src={thumb} alt={m.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{m.title}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(m)} className="p-1.5 text-violet-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(m._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${catColors[m.category] || 'bg-gray-100 text-gray-700'}`}>{m.category?.replace('_', ' ')}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
