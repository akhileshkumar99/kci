import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Award, Info } from 'lucide-react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import SectionTitle from '../components/SectionTitle';

const categories = ['All', 'Basic', 'Certificate', 'Diploma', 'Advanced', 'Professional'];

const categoryStats = {
  Basic: 'bg-green-50 text-green-700 border-green-200',
  Certificate: 'bg-blue-50 text-blue-700 border-blue-200',
  Diploma: 'bg-purple-50 text-purple-700 border-purple-200',
  Advanced: 'bg-orange-50 text-orange-700 border-orange-200',
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
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 py-10 text-white text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: Math.random() * 100 + 20, height: Math.random() * 100 + 20, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: 0.3 }} />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-5">
            <BookOpen className="w-4 h-4 text-yellow-400" /> 21+ Courses Available
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Courses</h1>
          <p className="text-blue-200 text-lg mb-6">Industry-relevant courses with government recognized certificates</p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <motion.input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none shadow-lg text-sm search-animated"
            />
          </div>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-50" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Notice Banner */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8">
            <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>CCC from NIELIT</strong> available in 80 hours — Fee ₹3000/- &nbsp;|&nbsp;
              <strong>All Courses Exam & Certificate Fee:</strong> ₹500 extra
            </div>
          </motion.div>

          {/* Category Stats */}
          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : cat === 'All'
                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    : `${categoryStats[cat]} border hover:opacity-80`
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${category === cat ? 'bg-white/20 text-white' : 'bg-white/60'}`}>
                    {countByCategory(cat)}
                  </span>
                )}
                {cat === 'All' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{courses.length}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No courses found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">
                Showing <strong className="text-gray-800">{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
                {category !== 'All' && <> in <strong className="text-blue-600">{category}</strong></>}
                {search && <> matching "<strong className="text-blue-600">{search}</strong>"</>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
