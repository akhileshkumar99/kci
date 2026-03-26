import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Save, Image } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Events', description: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => {
    try { const { data } = await api.get('/gallery'); setItems(data.items); } catch {}
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !file) return toast.error('Title and image are required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('image', file);
      await api.post('/gallery', fd);
      toast.success('Image added');
      setModal(false);
      fetchItems();
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    try { await api.delete(`/gallery/${id}`); toast.success('Deleted'); fetchItems(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery ({items.length})</h1>
        <button onClick={() => { setForm({ title: '', category: 'Events', description: '' }); setFile(null); setModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {loading ? <Loader /> : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
          <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No images yet. Add some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
              <div className="relative h-36 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button onClick={() => handleDelete(item._id)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                <span className="text-xs text-blue-600">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Add Gallery Image</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {['Events', 'Campus', 'Students', 'Achievements', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image *</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Uploading...' : 'Add Image'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
