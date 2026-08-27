import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Send, User, Mail, Phone, MapPin, BookOpen, GraduationCap, CheckCircle, Calendar, Building2, Sparkles, Camera, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

export default function Admission() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoRef = useRef(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    course: searchParams.get('course') || '',
    qualification: '', dob: '', gender: '', message: '',
    branchId: '', fatherName: '', batch: '',
  });

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.courses)).catch(() => {});
    api.get('/branch/public').then(({ data }) => setBranches(data.branches || [])).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Photo must be under 2MB');
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.course || !form.qualification)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (photo) fd.append('photo', photo);
      await api.post('/admissions', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
      toast.success('Application submitted successfully!', { duration: 4000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSubmitted(false);
    setPhoto(null);
    setPhotoPreview(null);
    setForm({ name: '', email: '', phone: '', address: '', course: '', qualification: '', dob: '', gender: '', message: '', branchId: '', fatherName: '', batch: '' });
  };

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">

      {/* Hero Banner */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        {/* Glow Spheres */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 7, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-500/30 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-4 text-amber-300 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" /> Admissions Open 2026 Academic Year
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
            Apply for <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">Admission</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Fill out the form below to enroll in your preferred computer training program at KCI
          </p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-3xl shadow-lg p-10 text-center border border-emerald-100">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Application Submitted! 🎉</h2>
                <p className="text-gray-600 text-sm mb-2">Thank you, <strong className="text-blue-600 font-bold">{form.name || 'Student'}</strong>!</p>
                <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-md mx-auto">Our admissions counselor will review your application and contact you within 24 business hours.</p>
                <div className="bg-emerald-50 rounded-2xl p-4 mb-8 text-xs sm:text-sm text-emerald-800 border border-emerald-200 max-w-md mx-auto font-medium">
                  📞 For urgent admission queries: <strong>+91 9936384736 / +91 9919660880</strong>
                </div>
                <button onClick={resetForm} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md">
                  Submit Another Application
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                  
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 px-6 sm:px-8 py-6 text-white relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/15 shrink-0">
                        <GraduationCap className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black">Student Registration Form</h2>
                        <p className="text-blue-200 text-xs mt-0.5">Fields marked with <span className="text-amber-300 font-bold">*</span> are required</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

                    {/* Section 1: Personal Information */}
                    <div>
                      <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                        <User className="w-4 h-4 text-blue-600" />
                        <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">1. Personal Information</h3>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" required
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" required
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Date of Birth</label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input name="dob" type="date" value={form.dob} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Father's Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father's full name"
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Batch Year</label>
                          <div className="relative">
                            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input name="batch" value={form.batch} onChange={handleChange} placeholder="e.g. 2026 Academic"
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800" />
                          </div>
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Passport Photo <span className="text-gray-400 font-normal lowercase">(optional — under 2MB)</span></label>
                          <div className="flex items-center gap-4">
                            <div
                              onClick={() => photoRef.current?.click()}
                              className="w-20 h-24 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden shrink-0"
                            >
                              {photoPreview
                                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                                : <><Camera className="w-5 h-5 text-blue-500 mb-1" /><span className="text-[10px] text-blue-600 font-bold text-center">Upload</span></>
                              }
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p className="font-semibold text-gray-700">Attach student photo</p>
                              <p>• Accepted formats: JPG, PNG</p>
                              <p>• Recommended size under 2MB</p>
                              {photoPreview && (
                                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); photoRef.current.value = ''; }}
                                  className="text-red-600 font-bold hover:underline mt-1">Remove Photo</button>
                              )}
                            </div>
                          </div>
                          <input ref={photoRef} type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="hidden" />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Course & Qualification */}
                    <div>
                      <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">2. Course Selection & Academic Details</h3>
                      </div>
                      
                      <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Course <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select name="course" value={form.course} onChange={handleChange} required
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800 appearance-none">
                              <option value="">-- Select a program --</option>
                              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Highest Qualification <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select name="qualification" value={form.qualification} onChange={handleChange} required
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800 appearance-none">
                              <option value="">Select</option>
                              {['8th Pass','10th Pass','12th Pass','Graduate','Post Graduate','Other'].map(q => <option key={q}>{q}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Branch Selection */}
                      <div className="mt-4 space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Preferred Branch / Center</label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select name="branchId" value={form.branchId} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all font-medium text-gray-800 appearance-none">
                            <option value="">-- Select nearest branch --</option>
                            {branches.map(b => (
                              <option key={b._id} value={b._id}>
                                {b.branchName}{b.branchCity ? ` — ${b.branchCity}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="mt-4 space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Gender</label>
                        <div className="flex gap-3">
                          {['Male', 'Female', 'Other'].map(g => (
                            <label key={g} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${
                              form.gender === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50/50 text-gray-600 hover:border-gray-200'
                            }`}>
                              <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handleChange} className="hidden" />
                              <span>{g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'}</span>
                              {g}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Address & Message */}
                    <div>
                      <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">3. Address & Additional Info</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Address</label>
                          <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House no, Street, City, State, Pincode"
                            className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all resize-none font-medium text-gray-800" />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Additional Message / Remarks</label>
                          <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Any specific requirements or queries..."
                            className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 focus:bg-white text-sm transition-all resize-none font-medium text-gray-800" />
                        </div>
                      </div>
                    </div>

                    {/* Support Callout */}
                    <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="text-xs text-blue-900 font-medium">
                        <strong>Need assistance?</strong> Contact Admission Office: <strong>+91 9936384736</strong> / <strong>+91 9919660880</strong>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting Application...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Submit Admission Application</>
                      )}
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
