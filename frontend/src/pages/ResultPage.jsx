import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, Phone, Hash, BookOpen, Award, GraduationCap, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import MemorandumOfMarks from './MemorandumOfMarks';

const COURSES = [
  'All Courses',
  'DCA',
  'ADCA',
  'Tally with GST',
  'CCC',
  'MS Office',
  'Web Designing',
  'Python',
  'Hardware & Networking',
];

const YEARS = ['All Years', '2024', '2023', '2022', '2021', '2020'];

export default function ResultPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [course, setCourse] = useState('All Courses');
  const [year, setYear] = useState('All Years');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return toast.error('Please enter roll number');
    setLoading(true);
    setSearched(false);
    setResult(null);
    try {
      const { data } = await api.get(`/results/roll/${rollNumber.trim()}`);
      setResult(data.result);
    } catch {
      setResult(null);
    }
    setSearched(true);
    setLoading(false);
  };

  const selectClass = "w-full px-4 py-3.5 text-sm font-semibold border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#0B1F5B] focus:outline-none transition-all duration-200 text-gray-700 appearance-none cursor-pointer";

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0B1F5B] via-[#1a3a8f] to-[#0e2d7a] py-14 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-400/10 rounded-full blur-2xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-200 mb-5 tracking-wide uppercase">
            <Award className="w-3.5 h-3.5" /> Academic Result Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            Check Your <span className="text-yellow-400">Result</span>
          </h1>
          <p className="text-blue-200 text-base">Enter your roll number to view your academic result instantly</p>
        </motion.div>
      </section>

      {/* Search Card */}
      <div className="max-w-2xl mx-auto px-4 -mt-2 pb-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl shadow-blue-100/60 border border-gray-100 p-6 sm:p-8">

          {/* Card header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-[#0B1F5B] to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Roll Number Search</h2>
              <p className="text-xs text-gray-400">Enter your enrollment or roll number below</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSearch} className="space-y-4">

            {/* 1. Roll Number */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 2026010007"
                className="w-full pl-12 pr-4 py-3.5 text-base font-semibold border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#0B1F5B] focus:outline-none transition-all duration-200 placeholder:font-normal placeholder:text-gray-400 text-gray-800 tracking-wider"
              />
            </div>

            {/* 2 & 3. Course + Year selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Course */}
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none z-10" style={{width:'18px',height:'18px'}} />
                <select value={course} onChange={e => setCourse(e.target.value)} className={`${selectClass} pl-11`}>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Year */}
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-gray-400" style={{width:'18px',height:'18px'}} />
                <select value={year} onChange={e => setYear(e.target.value)} className={`${selectClass} pl-11`}>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-[#0B1F5B] to-indigo-600 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Search Result
                </>
              )}
            </motion.button>
          </form>



          {/* Info chips */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: 'All Courses', desc: 'DCA, ADCA, Tally & more' },
              { icon: Award, label: 'Instant Result', desc: 'Results available 24/7' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-2.5 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#0B1F5B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Not found */}
        <AnimatePresence>
          {searched && !result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mt-6 bg-white rounded-3xl border-2 border-red-100 shadow-lg p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1">No Result Found</h3>
              <p className="text-sm text-gray-500 mb-4">
                No result found for <span className="font-bold text-red-500">"{rollNumber}"</span>. Please check your roll number.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Phone className="w-3.5 h-3.5" />
                <span>Help: <span className="font-semibold text-gray-600">9936384736 / 9919660880</span></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-8">
              <MemorandumOfMarks result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
