import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Upload, Image } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const compressImage = (file) => new Promise((resolve) => {
  const img = new window.Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const MAX = 800;
    let { width, height } = img;
    if (width > MAX || height > MAX) {
      if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
      else { width = Math.round(width * MAX / height); height = MAX; }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    canvas.toBlob(blob => {
      URL.revokeObjectURL(url);
      resolve(new File([blob], file.name, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.65);
  };
  img.src = url;
});

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Events', description: '' });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const { data } = await api.get('/gallery'); setItems(data.items); } catch {}
    setLoading(false);
  };

  const addFiles = async (rawFiles) => {
    const imgs = Array.from(rawFiles).filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    const compressed = await Promise.all(imgs.map(compressImage));
    setFiles(prev => [...prev, ...compressed]);
    compressed.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, { url: e.target.result, name: f.name }]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    if (!files.length) return toast.error('Select at least one image');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('image', f));
      await api.post('/gallery', fd);
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded!`);
      setModal(false);
      setFiles([]); setPreviews([]);
      setForm({ title: '', category: 'Events', description: '' });
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    try { await api.delete(`/gallery/${id}`); toast.success('Deleted'); fetchItems(); }
    catch { toast.error('Delete failed'); }
  };

  const openModal = () => {
    setForm({ title: '', category: 'Events', description: '' });
    setFiles([]); setPreviews([]);
    setModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gallery ({items.length})</h1>
        <button onClick={openModal} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Images</span>
          <span className="sm:hidden">Add</span>
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">Add Gallery Images</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Title * <span className="text-gray-400 font-normal">(applies to all images)</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Function 2024"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {['Events', 'Campus', 'Students', 'Achievements', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={() => document.getElementById('gallery-file-input').click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Click or drag & drop images</p>
                <p className="text-xs text-gray-400 mt-1">Hold Ctrl to select multiple</p>
                <input
                  id="gallery-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => addFiles(e.target.files)}
                />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    {previews.length} image{previews.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                    {previews.map((p, i) => (
                      <div key={i} className="relative group">
                        <img src={p.url} alt={p.name} className="w-full h-16 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  : <><Upload className="w-4 h-4" /> Upload {files.length > 0 ? `${files.length} ` : ''}Image{files.length !== 1 ? 's' : ''}</>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
