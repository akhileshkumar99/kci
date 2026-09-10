import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, XCircle, User, Calendar, MapPin, Clock, BookOpen, Hash, Award, Building2, Shield, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../utils/api';

export default function VerifyAdmitCard() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');

    api.get(`/admit-card/verify/${token}`)
      .then(res => {
        if (res.data.verified) {
          setData(res.data.admitCard);
        } else {
          setError(res.data.message || '✕ INVALID ADMIT CARD. Verification failed.');
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || '✕ INVALID ADMIT CARD. This Admit Card could not be verified in the KCI Central Database.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      
      {/* Background Ambient Gradient Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 pointer-events-none -z-10 flex justify-center opacity-60">
        <div className="w-[500px] h-[300px] bg-gradient-to-tr from-blue-400/20 via-indigo-400/30 to-amber-400/20 blur-[100px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-2xl mx-auto">

        {/* ── Institution Header Badge ── */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-amber-400/60 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="KCI Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-black bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-950 bg-clip-text text-transparent leading-tight">
                KEERTI COMPUTER INSTITUTE
              </h2>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">
                Central Examination Board
              </p>
            </div>
          </Link>
          <p className="text-xs text-slate-500 font-semibold">
            Official QR Security Verification System
          </p>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-200 text-center">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-base font-black text-slate-800">Verifying Admit Card...</h3>
            <p className="text-xs text-slate-500 mt-1">Connecting to KCI Central Examination Database</p>
          </div>
        )}

        {/* ── Invalid QR Token Error ── */}
        {!loading && error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl border border-red-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <span className="px-3 py-1 bg-red-800/60 border border-white/20 rounded-full text-xs font-black tracking-widest uppercase mb-2 inline-block">
                Verification Failed
              </span>
              <h2 className="text-2xl font-black tracking-tight">✕ INVALID ADMIT CARD</h2>
            </div>
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-slate-700 leading-relaxed mb-6">
                {error}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 font-semibold mb-6">
                🔒 For security reasons, candidate personal details are not displayed for invalid or unapproved admit card QR codes.
              </div>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-md"
              >
                <span>Return to KCI Homepage</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Valid Verified Admit Card ── */}
        {!loading && data && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Verified Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-6 text-white text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/40 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <span className="px-3.5 py-1 bg-emerald-900/60 border border-emerald-300/40 rounded-full text-xs font-black tracking-widest uppercase mb-2 inline-block shadow-sm">
                ✓ ADMIT CARD VERIFIED
              </span>
              <h2 className="text-2xl font-black tracking-tight">Official Examination Admit Card</h2>
              <p className="text-emerald-100 text-xs mt-1 font-semibold">
                Digitally authenticated by KCI Central Examination Board
              </p>
            </div>

            {/* Candidate Photo & Summary */}
            <div className="p-6 sm:p-8 bg-slate-50/60 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                
                {/* Candidate Photo */}
                <div className="relative shrink-0">
                  <div className="w-28 h-36 rounded-2xl border-4 border-amber-400/80 bg-slate-200 overflow-hidden shadow-md flex items-center justify-center">
                    {data.studentPhoto ? (
                      <img src={data.studentPhoto} alt={data.studentName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-3">
                        <User className="w-10 h-10 text-slate-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Candidate Photo</span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-full shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>

                {/* Candidate Quick Header Info */}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-black rounded-full mb-2">
                    <span>Admit Card Status:</span>
                    <span className="text-emerald-600 uppercase tracking-wider">{data.status || 'VALID'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 truncate tracking-tight">{data.studentName}</h3>
                  <p className="text-xs font-bold text-indigo-600 mt-0.5">{data.courseName}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-slate-600">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Roll Number</span>
                      <span className="text-slate-900 font-black font-mono">{data.rollNumber}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-sm">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Form Number</span>
                      <span className="text-slate-900 font-black font-mono">{data.formNumber}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Verification Data Grid */}
            <div className="p-6 sm:p-8 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" /> Examination Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { icon: BookOpen, label: 'Course Name', value: data.courseName },
                  { icon: Hash, label: 'Exam Type', value: data.examType || 'Regular' },
                  { icon: Calendar, label: 'Exam Date', value: data.examDate ? new Date(data.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'As Per Schedule' },
                  { icon: Clock, label: 'Reporting Time', value: data.reportingTime || '9:15 AM' },
                  { icon: MapPin, label: 'Exam Center', value: data.examCenter || 'KCI Main Campus' },
                  { icon: Calendar, label: 'Batch / Session', value: data.session || '2026' },
                  { icon: Award, label: 'Admit Card Serial', value: data.serialNumber || 'KCI-001' },
                  { icon: ShieldCheck, label: 'Verified On', value: data.verificationTime || new Date().toLocaleString('en-IN') },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verification Footer Disclaimer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="text-[11px] text-slate-500 font-bold">
                  <span>KEERTI COMPUTER INSTITUTE — OFFICIAL SEAL</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ISO 9001:2015 CERTIFIED SYSTEM</span>
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
