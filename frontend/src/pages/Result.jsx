import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, User, BookOpen, MapPin, Calendar, Hash, X, Download, ShieldCheck, CheckCircle, AlertCircle, Award, ChevronDown, Filter } from 'lucide-react';
import api from '../utils/api';

const COURSES = [
  'All Courses',
  'ADCA (Advanced Diploma in Computer Applications)',
  'DCA (Diploma in Computer Applications)',
  'CCC (Course on Computer Concepts)',
  'Tally Prime with GST',
  'Python & Web Development',
  'Graphic Design & Video Editing',
  'Hardware & Networking',
  'O Level',
];

const YEARS = [
  'All Years',
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
];

export default function Result() {
  const [rollNumber, setRollNumber] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!rollNumber.trim()) {
      setError('Please enter a valid Roll Number or Form Number.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let queryUrl = `/results/public/search?rollNumber=${encodeURIComponent(rollNumber.trim())}`;
      if (selectedCourse !== 'All Courses') queryUrl += `&course=${encodeURIComponent(selectedCourse)}`;
      if (selectedYear !== 'All Years') queryUrl += `&year=${encodeURIComponent(selectedYear)}`;

      const { data } = await api.get(queryUrl);
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'No official examination result found matching the entered Roll Number and filters.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = url.split('.').pop().split('?')[0] || 'png';
      const fileName = `KCI_Result_${result?.rollNumber || 'Statement'}.${ext}`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const fields = result ? [
    { icon: User, label: 'Student Name', value: result.studentName },
    { icon: User, label: "Father's Name", value: result.fatherName },
    { icon: BookOpen, label: 'Course Enrolled', value: result.courseName },
    { icon: MapPin, label: 'Branch / Center', value: result.branch },
    { icon: Hash, label: 'Roll Number', value: result.rollNumber },
    { icon: Hash, label: 'Form Number', value: result.formNo },
    { icon: Calendar, label: 'Batch / Session', value: result.batch },
    { icon: Calendar, label: 'Examination Date', value: result.examDate ? new Date(result.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10 flex justify-center opacity-60">
        <div className="w-[500px] h-[300px] bg-gradient-to-tr from-blue-400/20 via-indigo-400/30 to-purple-400/20 blur-[100px] rounded-full animate-pulse" />
        <div className="w-[400px] h-[250px] bg-gradient-to-bl from-cyan-400/20 via-blue-500/20 to-indigo-400/20 blur-[90px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider mb-4 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Examination Verification</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
              Check Your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Examination Result</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
              Enter your official roll number or form number to check your examination marks
            </p>
          </motion.div>
        </div>

        {/* Search & Filter Card Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15, duration: 0.5 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl shadow-blue-500/10 border border-slate-200/80 space-y-3.5">
            
            {/* Selectors Grid: Course & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Course Selector */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5 px-1">
                  <BookOpen className="w-3 h-3 text-blue-600" /> Select Course
                </label>
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-none appearance-none transition-all cursor-pointer truncate"
                  >
                    {COURSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Year / Session Selector */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5 px-1">
                  <Calendar className="w-3 h-3 text-blue-600" /> Examination Year
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-none appearance-none transition-all cursor-pointer"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Input & Search Button */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-slate-100">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={e => { 
                    setRollNumber(e.target.value); 
                    if (error) setError(''); 
                  }}
                  placeholder="Enter Roll Number (e.g. KCI20260001)"
                  className={`w-full pl-12 pr-10 py-3.5 bg-slate-50 text-slate-900 text-sm font-semibold rounded-2xl outline-none border-2 transition-all placeholder:text-slate-400 ${
                    touched && !rollNumber.trim() 
                      ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                      : 'border-slate-100 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                  }`}
                />
                {rollNumber && (
                  <button 
                    type="button" 
                    onClick={() => { setRollNumber(''); setResult(null); setError(''); setTouched(false); }}
                    className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Result</span>
                  </>
                )}
              </button>
            </form>

            {/* Validation & Error Messages */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }} 
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-2xl font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Output Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden relative">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 sm:px-8 py-6 relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-white font-black text-lg sm:text-xl tracking-wide">Keerti Computer Institute</h2>
                        </div>
                        <p className="text-blue-300 text-xs font-semibold">Official Statement of Examination Marks</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black rounded-full shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Digitally Verified</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 sm:p-8 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {fields.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-white border border-slate-200/60 rounded-2xl p-3.5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
                            <p className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">{value || '—'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Marks Summary Badge if available */}
                  {result.percentage !== undefined && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-blue-900">Overall Performance Grade</p>
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">Status: <span className="text-emerald-600 font-black">PASSED</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                          {result.percentage}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {result.resultFile ? (
                    <div className="mt-6">
                      <button 
                        onClick={() => handleDownload(result.resultFile)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        <Download className="w-4.5 h-4.5" />
                        <span>Download Official Mark Sheet (PDF / Image)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 text-center">
                      <p className="text-xs text-slate-400 font-semibold">
                        Official physical copy certified by KCI Examination Board.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Stamp */}
                <div className="bg-slate-100/80 px-6 py-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span>KEERTI COMPUTER INSTITUTE</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> ISO 9001:2015 CERTIFIED
                  </span>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Guarantee Footer */}
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="text-center text-xs sm:text-sm text-slate-500 mt-10 font-bold flex items-center justify-center gap-2 max-w-lg mx-auto leading-relaxed"
        >
          <span>🔒 All results are digitally verified and issued directly by KCI Central Examination Board.</span>
        </motion.p>

      </div>
    </div>
  );
}
