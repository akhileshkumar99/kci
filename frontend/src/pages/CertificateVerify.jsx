import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, CheckCircle, XCircle, Shield } from 'lucide-react';
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
    <div className="pt-16">
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 py-16 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-4">
          <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Verify Certificate</h1>
          <p className="text-blue-200 text-lg">Enter certificate number to verify its authenticity</p>
        </motion.div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
            <form onSubmit={handleVerify} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="Enter Certificate Number (e.g. KCI/2024/DCA/0001)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
                Verify
              </button>
            </form>
          </motion.div>

          {searched && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {certificate ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                      <div className="font-bold text-green-800">Certificate Verified ✓</div>
                      <div className="text-green-600 text-sm">This is a valid KCI certificate</div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <Award className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900">{certificate.studentName}</h2>
                    <p className="text-gray-500">has successfully completed</p>
                    <p className="text-blue-700 font-bold text-lg mt-1">{certificate.courseName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Certificate No.', value: certificate.certificateNumber },
                      { label: 'Issue Date', value: new Date(certificate.issueDate).toLocaleDateString('en-IN') },
                      { label: 'Grade', value: certificate.grade },
                      { label: 'Status', value: certificate.isValid ? '✓ Valid' : '✗ Invalid' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <div className="text-gray-500 text-xs">{label}</div>
                        <div className="font-semibold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-red-100">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Certificate Not Found</h3>
                  <p className="text-gray-500 text-sm">No valid certificate found for "{certNumber}". This may be an invalid or fake certificate.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
