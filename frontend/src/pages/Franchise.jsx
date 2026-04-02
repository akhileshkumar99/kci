import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, TrendingUp, Award, CheckCircle, ArrowRight, MapPin, Phone, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const benefits = [
  { icon: '💰', title: 'Revenue Sharing', desc: 'Earn up to 60% revenue from student fees' },
  { icon: '🎓', title: 'Training Support', desc: 'Complete training and certification provided' },
  { icon: '📚', title: 'Study Material', desc: 'All course materials provided by KCI' },
  { icon: '🏆', title: 'Brand Value', desc: '18+ years of trusted brand in UP' },
  { icon: '💻', title: 'Software Access', desc: 'Full access to KCI management software' },
  { icon: '📢', title: 'Marketing Support', desc: 'Marketing materials and digital support' },
];

export default function FranchisePage() {
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', franchiseCenter: '', franchiseCity: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone || !form.franchiseCenter || !form.franchiseCity)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await api.post('/franchise/register', form);
      setSubmitted(true);
      toast.success('Application submitted! We will contact you within 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setLoading(false);
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-700 via-emerald-700 to-teal-800 py-16 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" className="w-full" preserveAspectRatio="none">
            <path d="M0,25 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f9fafb" />
          </svg>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
              <Building2 className="w-4 h-4 text-yellow-400" /> Franchise Opportunity
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">Start Your Own <span className="text-yellow-400">KCI Center</span></h1>
            <p className="text-green-200 text-lg mb-8">Join India's trusted computer education network. Low investment, high returns, full support.</p>
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => setTab('register')} className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black rounded-xl transition-all hover:scale-105 shadow-lg">
                Apply Now <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
              <button onClick={() => setTab('info')} className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-all">
                Learn More
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="hidden lg:grid grid-cols-2 gap-4">
            {[['30+', 'Active Centers'], ['10K+', 'Students'], ['18+', 'Years'], ['95%', 'Success Rate']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-2xl p-5 text-center">
                <div className="text-3xl font-black text-yellow-400">{v}</div>
                <div className="text-green-200 text-sm">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {[{ id: 'info', label: 'About Franchise' }, { id: 'register', label: 'Apply Now' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === t.id ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Benefits */}
              <h2 className="text-2xl font-black text-gray-900 mb-6">Why Choose KCI Franchise?</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {benefits.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all">
                    <div className="text-4xl mb-3">{b.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                    <p className="text-gray-500 text-sm">{b.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Investment */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 text-white mb-8">
                <h2 className="text-2xl font-black mb-6">Investment & Returns</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[{ label: 'Min. Investment', value: '₹50,000', sub: 'One time setup cost' }, { label: 'Monthly Revenue', value: '₹30,000+', sub: 'Average per center' }, { label: 'ROI Period', value: '6-12 Months', sub: 'Break even period' }].map(({ label, value, sub }) => (
                    <div key={label} className="bg-white/10 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-black text-yellow-400">{value}</div>
                      <div className="font-semibold mt-1">{label}</div>
                      <div className="text-green-200 text-xs mt-1">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button onClick={() => setTab('register')} className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-2xl transition-all hover:scale-105 shadow-lg">
                  Apply for Franchise Now 🚀
                </button>
              </div>
            </motion.div>
          )}

          {tab === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              {submitted ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-xl p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-3">Application Submitted! 🎉</h2>
                  <p className="text-gray-500 mb-2">Thank you for your interest in KCI Franchise.</p>
                  <p className="text-gray-400 text-sm mb-6">Our team will contact you within 24-48 hours.</p>
                  <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700">
                    📞 For urgent queries: <strong>9936384736</strong>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6">
                    <h2 className="text-2xl font-black text-white">Franchise Application</h2>
                    <p className="text-green-200 text-sm mt-1">Fill the form below to apply for KCI franchise</p>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      {[{ name: 'name', label: 'Full Name *', icon: User, placeholder: 'Your full name' },
                        { name: 'email', label: 'Email *', icon: Mail, placeholder: 'your@email.com', type: 'email' },
                        { name: 'phone', label: 'Phone *', icon: Phone, placeholder: '10-digit mobile' },
                        { name: 'password', label: 'Password *', icon: User, placeholder: 'Create password', type: 'password' },
                        { name: 'franchiseCenter', label: 'Center Name *', icon: Building2, placeholder: 'e.g. KCI Varanasi' },
                        { name: 'franchiseCity', label: 'City *', icon: MapPin, placeholder: 'Your city' },
                      ].map(({ name, label, icon: Icon, placeholder, type = 'text' }) => (
                        <div key={name} className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">{label}</label>
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder}
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Address</label>
                      <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Center address"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all resize-none" />
                    </div>
                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-3">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Building2 className="w-5 h-5" />}
                      {loading ? 'Submitting...' : 'Submit Application 🚀'}
                    </motion.button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
