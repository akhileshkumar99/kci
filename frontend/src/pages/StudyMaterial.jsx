import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, BookOpen, Video, FileQuestion, Filter } from 'lucide-react';
import api from '../utils/api';

const categories = [
  { value: 'all', label: 'All', icon: Filter, color: 'bg-gray-100 text-gray-700' },
  { value: 'notes', label: 'Notes', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  { value: 'assignment', label: 'Assignments', icon: BookOpen, color: 'bg-violet-100 text-violet-700' },
  { value: 'previous_paper', label: 'Previous Papers', icon: FileQuestion, color: 'bg-orange-100 text-orange-700' },
  { value: 'video', label: 'Videos', icon: Video, color: 'bg-pink-100 text-pink-700' },
];

const getYouTubeThumbnail = url => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};

const decode = str => {
  if (!str) return str;
  return str
    .replace(/â€"/g, '\u2013')
    .replace(/â€"/g, '\u2014')
    .replace(/â€˜/g, '\u2018')
    .replace(/â€™/g, '\u2019')
    .replace(/â€œ/g, '\u201C')
    .replace(/â€/g, '\u201D')
    .replace(/Â /g, ' ');
};

const handleDownload = async (url, title) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = title || 'file';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch { window.open(url, '_blank'); }
};

export default function StudyMaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = category !== 'all' ? `?category=${category}` : '';
    api.get(`/study-material${params}`).then(r => setMaterials(r.data.materials || [])).catch(() => {}).finally(() => setLoading(false));
  }, [category]);

  const filtered = materials.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-violet-700 to-indigo-800 py-12 text-white text-center overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Study <span className="text-yellow-400">Library</span></h1>
          <p className="text-violet-200">Download notes, assignments & previous year papers</p>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl bg-white focus:outline-none focus:border-violet-500 transition-all text-gray-800" />
        </div>

        <div className="flex gap-3 flex-wrap mb-8">
          {categories.map(({ value, label, icon: Icon, color }) => (
            <button key={value} onClick={() => setCategory(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${category === value ? 'bg-violet-600 text-white border-violet-600 shadow-md' : `${color} border-transparent hover:opacity-80`}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold">No materials found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m, i) => (
              <motion.div key={m._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }} className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all overflow-hidden">
{(() => {
                  const ytThumb = getYouTubeThumbnail(m.videoUrl);
                  const thumb = m.thumbnailUrl || ytThumb;
                  return thumb ? (
                    <div className="relative">
                      <img src={thumb} alt={decode(m.title)} className="w-full h-40 object-cover" />
                      {m.videoUrl && (
                        <a href={m.videoUrl} target="_blank" rel="noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className={`w-full h-40 flex items-center justify-center ${categories.find(c => c.value === m.category)?.color || 'bg-gray-100 text-gray-400'}`}>
                      <FileText className="w-12 h-12 opacity-30" />
                    </div>
                  );
                })()}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categories.find(c => c.value === m.category)?.color || 'bg-gray-100 text-gray-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 leading-snug">{decode(m.title)}</h3>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{m.category?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {m.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{decode(m.description)}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{m.downloads || 0} downloads</span>
                    {m.fileUrl ? (
                      <button onClick={() => handleDownload(m.fileUrl, decode(m.title))}
                        className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    ) : m.videoUrl ? (
                      <a href={m.videoUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl hover:bg-pink-700 transition-colors">
                        <Video className="w-3.5 h-3.5" /> Watch
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
