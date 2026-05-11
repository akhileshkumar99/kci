import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Building2, User, Mail, Phone, MapPin, Send, CheckCircle, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function BranchApply() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', branchName: '', branchCity: '', branchAddress: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.branchName || !form.branchCity)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await api.post('/branch/apply', form);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setLoading(false);
  };

  const fields = [
    { name: 'name', label: 'Your Full Name *', icon: User, placeholder: 'Enter your name', col: 1 },
    { name: 'email', label: 'Email Address *', icon: Mail, placeholder: 'your@email.com', type: 'email', col: 1 },
    { name: 'phone', label: 'Phone Number', icon: Phone, placeholder: '10-digit mobile', col: 1 },
    { name: 'branchName', label: 'Branch / Center Name *', icon: Building2, placeholder: 'e.g. KCI Varanasi Center', col: 1 },
    { name: 'branchCity', label: 'City *', icon: MapPin, placeholder: 'City name', col: 1 },
  ];

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 py-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-yellow-300" /> Open for Branch Applications
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">Apply for a <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">KCI Branch</span></h1>
          <p className="text-blue-200 text-base max-w-xl mx-auto">Submit your application. Admin will review and send your login credentials via email upon approval.</p>
        </motion.div>
      </section>

      <section className="py-14">
        <div className="max-w-xl mx-auto px-4">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-green-100">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Application Submitted! 🎉</h2>
                <p className="text-gray-500 text-sm mb-4">Our admin team will review your application and send login credentials to <strong className="text-blue-600">{form.email}</strong> upon approval.</p>
                <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 border border-blue-100">
                  📞 For queries: <strong>9936384736</strong>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-white">Branch Application Form</h2>
                        <p className="text-blue-200 text-xs">Fields marked * are required</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {fields.map(({ name, label, icon: Icon, placeholder, type = 'text' }) => (
                      <div key={name} className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">{label}</label>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input name={name} type={type} value={form[name]} onChange={set} placeholder={placeholder}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 placeholder-gray-400" />
                        </div>
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Branch Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <textarea name="branchAddress" value={form.branchAddress} onChange={set} rows={2} placeholder="Full address of the branch"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all resize-none text-gray-800 placeholder-gray-400" />
                      </div>
                    </div>

                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60 transition-all">
                      {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</> : <><Send className="w-5 h-5" /> Submit Application</>}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
