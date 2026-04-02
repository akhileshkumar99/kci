import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, Building2, UserCheck, ArrowRight, BookOpen, Users, Award, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-blue-600', desc: 'Access your courses & results' },
  { id: 'franchise', label: 'Franchise', icon: Building2, color: 'from-green-500 to-emerald-600', desc: 'Manage your center' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'from-violet-500 to-indigo-600', desc: 'Full system control' },
];

export default function Login() {
  const [activeRole, setActiveRole] = useState('student');
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

      if (activeRole === 'admin' && user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.');
        setLoading(false); return;
      }
      if (activeRole === 'franchise' && user.role !== 'franchise') {
        toast.error('Access denied. Franchise credentials required.');
        setLoading(false); return;
      }
      if (activeRole === 'student' && !['student'].includes(user.role)) {
        toast.error('Access denied. Student credentials required.');
        setLoading(false); return;
      }

      toast.success(`Welcome, ${user.name}! 🎉`);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'franchise') navigate('/franchise-dashboard');
      else navigate('/dashboard');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  const roleConfig = roles.find(r => r.id === activeRole);

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1e3a8a 100%)' }}>
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 text-center max-w-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img src="/logo.png" alt="KCI" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-black text-white mb-1 tracking-tight">KEERTI</h1>
            <p className="text-blue-300 text-sm font-bold tracking-widest mb-2">COMPUTER INSTITUTE</p>
            <div className="w-16 h-0.5 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
            <p className="text-slate-400 text-sm leading-relaxed">Government recognized computer education since 2005. Trusted by 10,000+ students across Uttar Pradesh.</p>
          </motion.div>

          <div className="mt-8 space-y-3">
            {[{ icon: BookOpen, label: '21+ Courses', value: 'Available', color: 'from-blue-500 to-blue-600' },
              { icon: Users, label: 'Students', value: '10,000+', color: 'from-indigo-500 to-indigo-600' },
              { icon: Award, label: 'Branches', value: '30+', color: 'from-violet-500 to-violet-600' }
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.2 }}
                className="flex items-center gap-4 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-sm">{value}</div>
                  <div className="text-slate-400 text-xs">{label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 text-slate-600 text-xs">© {new Date().getFullYear()} Keerti Computer Institute</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <img src="/logo.png" alt="KCI" className="w-16 h-16 mx-auto mb-2 rounded-full object-cover shadow-xl border-2 border-blue-200" />
            <h2 className="text-lg font-black text-gray-900">Keerti Computer Institute</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Welcome Back 👋</h2>
              <p className="text-gray-500 text-sm">Select your role and sign in</p>
            </div>

            {/* Role Selector */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1.5 bg-gray-100 rounded-2xl">
              {roles.map(({ id, label, icon: Icon, color }) => (
                <button key={id} onClick={() => setActiveRole(id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 ${activeRole === id ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-xs font-bold ${activeRole === id ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
                </button>
              ))}
            </div>

            {/* Role Description */}
            <AnimatePresence mode="wait">
              <motion.div key={activeRole} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-5 bg-gradient-to-r ${roleConfig.color} bg-opacity-10`}>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${roleConfig.color} flex items-center justify-center`}>
                  <roleConfig.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">{roleConfig.desc}</span>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder={activeRole === 'admin' ? 'admin@kci.org.in' : activeRole === 'franchise' ? 'franchise@kci.org.in' : 'student@email.com'}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all bg-slate-50 focus:bg-white"
                    style={{ borderColor: focused === 'email' ? '#3b82f6' : '#e2e8f0' }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === 'password' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all bg-slate-50 focus:bg-white"
                    style={{ borderColor: focused === 'password' ? '#3b82f6' : '#e2e8f0' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all bg-gradient-to-r ${roleConfig.color} disabled:opacity-70`}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</>
                  : <><roleConfig.icon className="w-4 h-4" /> Login as {roleConfig.label} <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-2">🔑 Demo Credentials:</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p><strong>Admin:</strong> admin@kci.org.in / admin123</p>
                <p><strong>Student:</strong> student@kci.org.in / student123</p>
              </div>
            </div>

            {/* Links */}
            <div className="mt-5 flex items-center justify-between text-xs">
              <Link to="/register" className="text-blue-600 hover:underline font-semibold">New Student? Register</Link>
              <Link to="/franchise" className="text-green-600 hover:underline font-semibold">Apply for Franchise</Link>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-gray-400">Secure encrypted connection</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
