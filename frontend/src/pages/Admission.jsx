import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Send, User, Mail, Phone, MapPin, BookOpen, GraduationCap, CheckCircle, Calendar, Users, Sparkles } from 'lucide-react';
import api from '../utils/api';

const inputClass = "w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50/30 bg-gray-50 transition-all duration-200 text-gray-800 placeholder-gray-400";
const selectClass = "w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50/30 bg-gray-50 transition-all duration-200 text-gray-800 appearance-none";

export default function Admission() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    course: searchParams.get('course') || '',
    qualification: '', dob: '', gender: '', message: '',
  });

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.courses)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.course || !form.qualification)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await api.post('/admissions', form);
      setSubmitted(true);
      toast.success('Application submitted successfully!', { duration: 4000, icon: '🎉' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ name: '', email: '', phone: '', address: '', course: '', qualification: '', dob: '', gender: '', message: '' });
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-10 text-white overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-400/10 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-300/10 rotate-45 rounded-2xl" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white/5 rotate-12 rounded-2xl" />
        {/* Floating circles */}
        {[...Array(4)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-white/5"
            style={{ width: `${50 + i * 30}px`, height: `${50 + i * 30}px`, left: `${15 + i * 20}%`, top: `${20 + (i % 2) * 40}%` }}
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.5 + i, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f8fafc" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-yellow-300" /> Admissions Open 2025-26
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">Apply for <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Admission</span></h1>
          <p className="text-blue-200 text-base max-w-xl mx-auto">Fill the form below and we'll get back to you within 24 hours</p>
          <div className="flex justify-center gap-8 mt-6">
            {[['500+', 'Students'], ['21+', 'Courses'], ['100%', 'Placement']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-yellow-300">{val}</div>
                <div className="text-blue-300 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-green-100">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">Application Submitted! 🎉</h2>
                <p className="text-gray-500 mb-2">Thank you <strong className="text-blue-600">{form.name || 'Student'}</strong>!</p>
                <p className="text-gray-400 text-sm mb-8">Our team will contact you within 24 hours on your provided phone/email.</p>
                <div className="bg-green-50 rounded-2xl p-4 mb-8 text-sm text-green-700 border border-green-100">
                  📞 For urgent queries: <strong>9936384736 / 9919660880</strong>
                </div>
                <button onClick={resetForm} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Submit Another Application
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Admission Form</h2>
                      </div>
                      <p className="text-blue-200 text-sm ml-13">Fields marked with <span className="text-red-300 font-bold">*</span> are required</p>
                    </div>
                    {/* Step indicators */}
                    <div className="flex items-center gap-2 mt-4">
                      {['Personal Info', 'Course Details', 'Additional'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                            <span className="text-white/70 text-xs hidden sm:block">{s}</span>
                          </div>
                          {i < 2 && <div className="w-8 h-0.5 bg-white/20" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Section 1: Personal Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Personal Information</h3>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 placeholder-gray-400 hover:border-gray-200" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 placeholder-gray-400 hover:border-gray-200" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 placeholder-gray-400 hover:border-gray-200" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                          <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input name="dob" type="date" value={form.dob} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 hover:border-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Course Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-violet-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Course Details</h3>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Select Course <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                            <select name="course" value={form.course} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-all text-gray-800 appearance-none hover:border-gray-200">
                              <option value="">Choose your course</option>
                              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Qualification <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                            <select name="qualification" value={form.qualification} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-violet-500 bg-gray-50 focus:bg-white transition-all text-gray-800 appearance-none hover:border-gray-200">
                              <option value="">Select</option>
                              {['8th Pass','10th Pass','12th Pass','Graduate','Post Graduate','Other'].map(q => <option key={q}>{q}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Gender radio buttons */}
                      <div className="mt-5 space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Gender</label>
                        <div className="flex gap-3 flex-wrap">
                          {['Male', 'Female', 'Other'].map(g => (
                            <label key={g} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                              form.gender === g ? 'border-violet-500 bg-violet-50 text-violet-700 font-semibold' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                            }`}>
                              <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handleChange} className="hidden" />
                              <span className="text-sm">{g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'}</span>
                              {g}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Additional */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Additional Details</h3>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Address</label>
                          <div className="relative group">
                            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Your full address"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all resize-none text-gray-800 placeholder-gray-400 hover:border-gray-200" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Message <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                          <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Any additional information or queries..."
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all resize-none text-gray-800 placeholder-gray-400 hover:border-gray-200" />
                        </div>
                      </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-blue-800 text-sm font-semibold">Need help with admission?</p>
                        <p className="text-blue-600 text-xs mt-0.5">Call us: <strong>9936384736</strong> / <strong>9919660880</strong> — Mon to Sat, 9AM–6PM</p>
                      </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-60 text-white font-bold text-lg rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:shadow-xl"
                    >
                      {loading ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-5 h-5" /> Submit Application 🚀</>
                      )}
                    </motion.button>
                    <p className="text-center text-xs text-gray-400">By submitting, you agree to be contacted by KCI regarding your admission.</p>
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
