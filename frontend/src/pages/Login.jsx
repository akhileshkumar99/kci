import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, Building2,
  ArrowRight, Star, Award, Users, BookOpen, Key, ChevronDown, ChevronUp,
  CheckCircle, LockKeyhole, ShieldAlert, X, Sparkles, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'from-blue-600 to-indigo-600' },
  { id: 'branch', label: 'Branch / Franchise', icon: Building2, color: 'from-emerald-600 to-teal-600' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'from-purple-600 to-violet-600' },
];

const stats = [
  { label: '21+', sub: 'Courses', icon: BookOpen },
  { label: '10K+', sub: 'Students', icon: Users },
  { label: '30+', sub: 'Branches', icon: Award },
  { label: '100%', sub: 'Support', icon: ShieldCheck },
];

const features = [
  'Practical Training', 'Expert Faculty', 'Govt. Recognized', 'Better Placements',
];

export default function Login() {
  const [activeRole, setActiveRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '', role: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, activeRole);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'branch') navigate('/branch-dashboard');
      else navigate('/student-dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      let title = 'Invalid Credentials 🔒';
      if (msg.toLowerCase().includes('approved')) title = 'Account Pending Approval ⏳';
      setErrorModal({ open: true, title, message: msg, role: activeRole });
    }
    setLoading(false);
  };

  const activeRoleObj = roles.find(r => r.id === activeRole);

  return (
    <div className="min-h-screen w-full bg-[#f0f4ff] flex flex-col overflow-x-hidden">

      {/* ── TOP NAV BAR ── */}
      <header className="w-full bg-[#0a1329] px-4 sm:px-8 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="KCI" className="w-8 h-8 rounded-full border border-amber-400/60" />
          <div>
            <div className="text-white font-black text-xs sm:text-sm tracking-wide leading-none">KEERTI</div>
            <div className="text-amber-400 text-[9px] font-bold tracking-widest">COMPUTER INSTITUTE</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
          <LockKeyhole className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Secure Access</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SSL Protected
          </span>
        </div>
      </header>

      {/* ── MAIN BODY ── */}
      <main className="flex-1 flex flex-col lg:flex-row">

        {/* LEFT PANEL — branding (hidden on mobile, shown on lg+) */}
        <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-gradient-to-br from-[#060d1f] via-[#0d1f4a] to-[#0f2d6b] relative flex-col justify-between p-10 xl:p-14 overflow-hidden">

          {/* Background glow blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />

          {/* Top: logo + headline */}
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="KCI" className="w-16 h-16 rounded-full border-2 border-amber-400 shadow-xl" />
              <div>
                <div className="text-white font-black text-2xl tracking-wide leading-none">KEERTI</div>
                <div className="text-amber-400 text-xs font-black tracking-widest mt-0.5">COMPUTER INSTITUTE</div>
                <div className="text-blue-300 text-xs font-medium italic mt-0.5">Learn • Grow • Succeed</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              India's Trusted Computer Institute
            </div>

            <div>
              <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                Learn Today<br />
                Build a Brighter<br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                  Tomorrow
                </span>
              </h2>
              <p className="text-slate-300 text-sm mt-4 max-w-md leading-relaxed">
                Gain in-demand skills, get certified, and take the next step towards your successful career.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-3 text-center hover:bg-white/12 transition-all">
                  <s.icon className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                  <div className="text-lg font-black text-white leading-none">{s.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: quote + features */}
          <div className="relative z-10 space-y-5">
            <div className="bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <span className="text-3xl text-blue-400 font-serif leading-none">"</span>
                <p className="text-sm italic text-slate-200 font-medium leading-snug -mt-1">
                  Skills are the keys to a brighter future.
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">— Keerti Computer Institute</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="Student" className="w-8 h-8 rounded-full border-2 border-[#0d1f4a] object-cover" />
                  ))}
                </div>
                <div>
                  <div className="text-xs font-black text-white">10K+</div>
                  <div className="text-[10px] text-slate-400">Happy Students</div>
                  <div className="text-amber-400 text-[10px]">★★★★★</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-white/10 pt-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — login form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-[#f0f4ff]">

          {/* Mobile-only branding */}
          <div className="lg:hidden flex flex-col items-center mb-6 text-center">
            <img src="/logo.png" alt="KCI" className="w-16 h-16 rounded-full border-2 border-amber-400 shadow-lg mb-2" />
            <div className="font-black text-[#0a1329] text-lg tracking-wide">KEERTI COMPUTER INSTITUTE</div>
            <div className="text-blue-600 text-xs font-semibold italic">Learn • Grow • Succeed</div>
          </div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-100 p-6 sm:p-8"
          >
            {/* Card header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold mb-3">
                <Sparkles className="w-3 h-3" /> Student Portal
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                Welcome Back <span>👋</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Sign in to access your learning dashboard</p>
            </div>

            {/* Role tabs */}
            <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-3 gap-1 mb-5">
              {roles.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveRole(id)}
                  className={`flex items-center justify-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-bold transition-all ${
                    activeRole === id
                      ? `bg-gradient-to-r ${color} text-white shadow-md`
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate hidden sm:inline">{label}</span>
                  <span className="truncate sm:hidden">{id === 'branch' ? 'Branch' : label}</span>
                </button>
              ))}
            </div>

            {/* Active role badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 mb-4">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${activeRoleObj?.color} flex items-center justify-center shrink-0`}>
                {activeRoleObj && <activeRoleObj.icon className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-xs font-bold text-slate-700">Logging in as: <span className="text-blue-700">{activeRoleObj?.label}</span></span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email/Phone */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value.trim() }))}
                  placeholder="Email / Phone / Roll Number"
                  className="w-full h-12 pl-10 pr-4 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-11 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast.error('Contact your branch admin for password reset.')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r ${activeRoleObj?.color} shadow-lg transition-all hover:shadow-xl hover:opacity-95 active:scale-[0.99] disabled:opacity-70 cursor-pointer`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Login Securely
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security badge */}
            <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Your data is safe with us</div>
                <div className="text-[10px] text-slate-500 mt-0.5">256-bit SSL • Privacy Protected • Secure Auth</div>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <Key className="w-3.5 h-3.5" />
                {showDemo ? 'Hide Demo Credentials' : 'Show Demo Credentials'}
                {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <AnimatePresence>
                {showDemo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5 text-[11px] font-semibold text-slate-700">
                      <p><span className="text-slate-400 font-bold">Admin:</span> admin@kci.org.in / admin123</p>
                      <p><span className="text-slate-400 font-bold">Student:</span> student@kci.org.in / student123</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mobile stats strip */}
          <div className="lg:hidden mt-6 w-full max-w-[440px] grid grid-cols-4 gap-2">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-2.5 text-center border border-slate-100 shadow-sm">
                <div className="text-sm font-black text-blue-700">{s.label}</div>
                <div className="text-[10px] text-slate-500 font-medium">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-[11px] text-slate-400 font-medium space-y-1">
            <div>© {new Date().getFullYear()} Keerti Computer Institute. All rights reserved.</div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => {}} className="hover:text-slate-600 hover:underline">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => {}} className="hover:text-slate-600 hover:underline">Terms of Use</button>
              <span>•</span>
              <button onClick={() => toast('📞 9936384736')} className="hover:text-slate-600 hover:underline">Contact Us</button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {errorModal.open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Invalid Email / Phone or Password</span>
            <button onClick={() => setErrorModal({ open: false, title: '', message: '', role: '' })} className="ml-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
