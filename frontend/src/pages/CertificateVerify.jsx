import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, CheckCircle, XCircle, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

export default function CertificateVerify() {
  const [certNumber, setCertNumber] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certNumber.trim()) return toast.error('Please enter certificate number');
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/certificates/verify/${certNumber.trim()}`);
      setCertificate(data.certificate);
    } catch {
      setCertificate(null);
    }
    setLoading(false);
  };

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-4 text-amber-300 shadow-md">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Digital Certificate Authentication
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
            Verify <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">Certificate</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Enter your official certificate number to verify its authenticity and student credentials
          </p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xs p-6 border border-gray-100 mb-8">
            <form onSubmit={handleVerify} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="Enter Certificate No. (e.g. KCI/2026/DCA/0001)"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium transition-all"
                />
              </div>
              <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {loading ? 'Verifying...' : 'Verify Now'}
              </button>
            </form>
          </motion.div>

          {searched && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {certificate ? (
                <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80">
                    <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-emerald-900 text-base">Certificate Verified ✓</div>
                      <div className="text-emerald-700 text-xs font-medium">Official KCI Government Recognized Certificate Record</div>
                    </div>
                  </div>

                  <div className="text-center mb-6 py-4 bg-slate-50 rounded-2xl border border-gray-100">
                    <Award className="w-14 h-14 text-blue-600 mx-auto mb-2" />
                    <h2 className="text-2xl font-black text-gray-900">{certificate.studentName}</h2>
                    <p className="text-gray-500 text-xs mt-1">has successfully completed the program</p>
                    <p className="text-blue-700 font-extrabold text-base sm:text-lg mt-1">{certificate.courseName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    {[
                      { label: 'Certificate No.', value: certificate.certificateNumber },
                      { label: 'Issue Date', value: new Date(certificate.issueDate).toLocaleDateString('en-IN') },
                      { label: 'Grade / Score', value: certificate.grade },
                      { label: 'Status', value: certificate.isValid ? '✓ Valid Record' : '✗ Invalid Record' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50/80 rounded-xl p-3 border border-gray-100">
                        <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{label}</div>
                        <div className="font-extrabold text-gray-900 mt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-md p-8 text-center border-2 border-red-100">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">Certificate Record Not Found</h3>
                  <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto font-normal">
                    No matching record was found for "{certNumber}". Please check the number or contact KCI support.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
