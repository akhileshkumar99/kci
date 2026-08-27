import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Send, Phone, Mail, MapPin, Clock, MessageSquare, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch { toast.error('Failed to send message'); }
    setLoading(false);
  };

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-4 text-amber-300 shadow-md">
            <MessageSquare className="w-4 h-4 text-amber-400" /> Get In Touch
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
            Contact <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">KCI Team</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Have questions about courses, admissions, or certification? Reach out to us anytime!
          </p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-4 space-y-4">
            {[
              { icon: MapPin, title: 'Head Office Address', lines: ['1st Floor, Near Post Office', 'Sabji Mandi Road, Ayodhya, Faizabad, UP'] },
              { icon: Phone, title: 'Phone Numbers', lines: ['+91 9936384736', '+91 9919660880'] },
              { icon: Mail, title: 'Email Address', lines: ['info@kci.org.in', 'admission@kci.org.in'] },
              { icon: Clock, title: 'Institute Timings', lines: ['Mon - Sat: 9:00 AM - 6:00 PM', 'Sunday: Closed'] },
            ].map(({ icon: Icon, title, lines }) => (
              <motion.div key={title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm mb-1">{title}</h3>
                  {lines.map((line, i) => <p key={i} className="text-gray-600 text-xs sm:text-sm font-medium">{line}</p>)}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="lg:col-span-8 bg-white rounded-3xl shadow-xs p-6 sm:p-8 border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required
                    className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required
                    className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your mobile number"
                    className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Subject <span className="text-red-500">*</span></label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Query subject" required
                    className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Message <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Write your message or inquiry here..." required
                  className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium transition-all resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
