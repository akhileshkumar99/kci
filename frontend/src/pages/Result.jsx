import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, User, BookOpen, MapPin, Calendar, Hash, X, Download } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-28 pb-16 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-widest mb-3">
            Result Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Check Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Result</span>
          </h1>
          <p className="text-gray-500 text-sm">Enter your roll number to view your exam result</p>
        </motion.div>
      </div>

      {/* Search Box */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              value={rollNumber}
              onChange={e => { setRollNumber(e.target.value); setError(''); }}
              placeholder="Enter Roll Number (e.g. KCI20240001)"
              className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            {rollNumber && (
              <button type="button" onClick={() => { setRollNumber(''); setResult(null); setError(''); }}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button type="submit" disabled={loading || !rollNumber.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search className="w-4 h-4" />}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <X className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg">Result Found</h2>
                    <p className="text-blue-200 text-xs">Keerti Computer Institute</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-400/20 border border-green-300/30 text-green-100 text-xs font-bold rounded-full">
                  ✓ Verified
                </span>
              </div>

              {/* Fields Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm font-bold text-gray-800">{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Result File */}
              {result.resultFile && (
                <div className="px-6 pb-6">
                  <button onClick={() => handleDownload(result.resultFile)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <Download className="w-4 h-4" /> Download Result
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Note */}
      {!result && !error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-xs text-gray-400 mt-8">
          🔒 Results are official and verified by KCI. For queries contact your branch.
        </motion.p>
      )}
    </div>
  );
}
