import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Award, Info, Filter, Sparkles } from 'lucide-react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import { CardSkeletonLoader } from '../components/PageLoader';
import SectionTitle from '../components/SectionTitle';

const categories = ['All', 'Basic', 'Certificate', 'Diploma', 'Advanced', 'Professional'];

const categoryStats = {
  Basic: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Certificate: 'bg-blue-50 text-blue-700 border-blue-200',
  Diploma: 'bg-purple-50 text-purple-700 border-purple-200',
  Advanced: 'bg-amber-50 text-amber-700 border-amber-200',
  Professional: 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.courses)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  const countByCategory = (cat) => courses.filter((c) => c.category === cat).length;

  return (
    <div className="pt-24 sm:pt-28 min-h-screen">
      {/* Hero Header */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        {/* Glow Spheres */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 7, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-500/30 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-4 text-blue-200 shadow-md">
            <BookOpen className="w-4 h-4 text-amber-400" /> 25+ Industry-Relevant Programs
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
            Explore <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">Our Courses</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-xl mx-auto font-normal leading-relaxed">
            Government recognized certifications designed to accelerate your career in IT & Software Development
          </p>

          {/* Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course title or topic..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none shadow-xl text-sm border border-white/20 transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Notice Banner */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mb-8 shadow-xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
              <strong>CCC from NIELIT</strong> available in 80 hours — Fee ₹3,000/- &nbsp;|&nbsp;
              <strong>All Courses Exam & Certificate Fee:</strong> ₹500 extra
            </div>
          </motion.div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                    : cat === 'All'
                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    : `${categoryStats[cat]} border hover:opacity-90`
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${category === cat ? 'bg-white/20 text-white' : 'bg-white/80'}`}>
                    {countByCategory(cat)}
                  </span>
                )}
                {cat === 'All' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-extrabold bg-gray-100 text-gray-700">{courses.length}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <CardSkeletonLoader count={8} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-xs">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-800 text-base">No courses found</p>
              <p className="text-xs text-gray-500 mt-1">Try a different search term or category filter</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Showing <strong className="text-gray-900 font-bold">{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
                  {category !== 'All' && <> in <strong className="text-blue-600 font-bold">{category}</strong></>}
                  {search && <> matching "<strong className="text-blue-600 font-bold">{search}</strong>"</>}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((course, i) => (
                  <CourseCard key={course._id} course={course} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
