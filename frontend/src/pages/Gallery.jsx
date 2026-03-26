import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image } from 'lucide-react';
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
    <div className="pt-16">
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 py-16 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-blue-200 text-lg">Moments from our campus, events, and student life</p>
        </motion.div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50'}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? <Loader /> : items.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No images in this category yet.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {items.map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="break-inside-avoid cursor-pointer group" onClick={() => setSelected(item)}>
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={item.image} alt={item.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                      <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-white/70">{item.category}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
              <img src={selected.image} alt={selected.title} className="max-w-full max-h-[80vh] object-contain" />
              <div className="bg-white p-4">
                <h3 className="font-bold text-gray-900">{selected.title}</h3>
                {selected.description && <p className="text-gray-500 text-sm">{selected.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
