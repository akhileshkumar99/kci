import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Sparkles, Camera } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import SectionTitle from '../components/SectionTitle';

const categories = ['All', 'Events', 'Campus', 'Students', 'Achievements', 'Other'];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = category !== 'All' ? `?category=${category}` : '';
    api.get(`/gallery${q}`).then(({ data }) => setItems(data.items)).catch(() => {}).finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-4 text-amber-300 shadow-md">
            <Camera className="w-4 h-4 text-amber-400" /> KCI Life & Events
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
            Campus <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Moments, celebrations, computer lab sessions, and achievements at Keerti Computer Institute
          </p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Category Filter Pills */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-slate-100'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-xs">
              <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-800 text-base">No images found</p>
              <p className="text-xs text-gray-500 mt-1">Check back soon for new photo updates</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {items.map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="break-inside-avoid cursor-pointer group" onClick={() => setSelected(item)}>
                  <div className="relative overflow-hidden rounded-2xl shadow-xs border border-gray-100 bg-white">
                    <img src={item.image} alt={item.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1 inline-block">
                          {item.category}
                        </span>
                        <p className="font-extrabold text-sm leading-snug">{item.title}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-xs" onClick={() => setSelected(null)}>
            <button className="absolute top-4 right-4 text-white/80 hover:text-white transition-transform hover:scale-110">
              <X className="w-8 h-8" />
            </button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
              <img src={selected.image} alt={selected.title} className="max-w-full max-h-[75vh] w-full object-contain bg-slate-950" />
              <div className="p-5">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selected.category}</span>
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mt-0.5">{selected.title}</h3>
                {selected.description && <p className="text-gray-600 text-xs sm:text-sm mt-1">{selected.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
