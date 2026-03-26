import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const floatingCards = [
  { icon: BookOpen, label: '21+ Courses', value: 'Available', color: 'from-blue-500 to-blue-600', delay: 0 },
  { icon: Users, label: 'Students', value: '10,000+', color: 'from-indigo-500 to-indigo-600', delay: 0.3 },
  { icon: Award, label: 'Branches', value: '30+', color: 'from-violet-500 to-violet-600', delay: 0.6 },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') { toast.error('Access denied. Admin only.'); setLoading(false); return; }
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1e3a8a 100%)' }}>

        {/* Animated mesh circles */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute top-1/3 right-8 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />

        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-40 h-40 mx-auto mb-2 mt-8 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img src="/logo.png" alt="KCI Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">KEERTI</h1>
            <p className="text-blue-300 text-lg font-medium tracking-widest mb-2">COMPUTER INSTITUTE</p>
            <div className="w-16 h-0.5 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering students with quality computer education since 2005. Government recognized institute across Uttar Pradesh.
            </p>
          </motion.div>

          {/* Floating stat cards */}
          <div className="mt-10 space-y-3">
            {floatingCards.map(({ icon: Icon, label, value, color, delay }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + delay, duration: 0.6 }}
                whileHover={{ x: 6, scale: 1.02 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 backdrop-blur-sm cursor-default"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-base leading-tight">{value}</div>
                  <div className="text-slate-400 text-xs">{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-6 text-slate-600 text-xs">
          © {new Date().getFullYear()} Keerti Computer Institute
        </motion.p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="KCI Logo" className="w-20 h-20 mx-auto mb-3 rounded-full object-cover shadow-xl border-2 border-blue-200" />
            <h2 className="text-xl font-bold text-gray-900">Keerti Computer Institute</h2>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 p-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Access Only
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Sign in to your admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="admin@kci.org.in"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 bg-slate-50 focus:bg-white"
                    style={{ borderColor: focused === 'email' ? '#3b82f6' : '#e2e8f0', boxShadow: focused === 'email' ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === 'password' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 bg-slate-50 focus:bg-white"
                    style={{ borderColor: focused === 'password' ? '#3b82f6' : '#e2e8f0', boxShadow: focused === 'password' ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Button */}
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 disabled:opacity-70"
                style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: loading ? 'none' : '0 8px 24px rgba(37,99,235,0.35)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Authenticating...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Login to Admin Panel <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-gray-400">Secure encrypted connection</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
