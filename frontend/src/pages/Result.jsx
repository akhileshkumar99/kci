import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, User, BookOpen, MapPin, Calendar, Hash, X, Download, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function Result() {
  const [rollNumber, setRollNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.get(`/results/public/search?rollNumber=${rollNumber.trim()}`);
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'No result found for this roll number.');
    }
    setLoading(false);
  };

  const handleDownload = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = url.split('.').pop().split('?')[0] || 'png';
      const fileName = `result_${result.rollNumber || 'file'}.${ext}`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, '_blank'); }
  };

  const fields = result ? [
    { icon: User, label: 'Student Name', value: result.studentName },
    { icon: User, label: "Father's Name", value: result.fatherName },
    { icon: BookOpen, label: 'Course', value: result.courseName },
    { icon: MapPin, label: 'Branch', value: result.branch },
    { icon: Hash, label: 'Roll Number', value: result.rollNumber },
    { icon: Hash, label: 'Form No', value: result.formNo },
    { icon: Calendar, label: 'Batch / Session', value: result.batch },
    { icon: Calendar, label: 'Exam Date', value: result.examDate ? new Date(result.examDate).toLocaleDateString('en-IN') : '—' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28 pb-16 px-4">
      {/* Header Banner */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-extrabold rounded-full uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Examination Verification
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
            Check Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Examination Result</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-normal">Enter your official roll number or form number to check your examination marks</p>
        </motion.div>
      </div>

      {/* Search Input Box */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-2xl shadow-md border border-gray-100 p-2">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              value={rollNumber}
              onChange={e => { setRollNumber(e.target.value); setError(''); }}
              placeholder="Enter Roll Number (e.g. KCI20260001)"
              className="flex-1 text-xs sm:text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 font-medium"
            />
            {rollNumber && (
              <button type="button" onClick={() => { setRollNumber(''); setResult(null); setError(''); }}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button type="submit" disabled={loading || !rollNumber.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-extrabold hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search className="w-4 h-4" />}
            {loading ? 'Searching...' : 'Check Result'}
          </button>
        </form>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl font-medium">
              <X className="w-4 h-4 shrink-0 text-red-500" /> {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result Output Card */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/15">
                    <FileText className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-base sm:text-lg">Examination Result</h2>
                    <p className="text-blue-200 text-xs">Keerti Computer Institute</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              {/* Data Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {fields.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 bg-slate-50/70 border border-gray-100 rounded-xl p-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 border border-blue-100">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5">{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download CTA */}
              {result.resultFile && (
                <div className="px-6 pb-6 pt-2">
                  <button onClick={() => handleDownload(result.resultFile)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all">
                    <Download className="w-4 h-4" /> Download Official Statement of Marks
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center text-xs text-gray-400 mt-8 font-medium">
          🔒 All results are digitally verified and issued directly by KCI Central Examination Board.
        </motion.p>
      )}
    </div>
  );
}
