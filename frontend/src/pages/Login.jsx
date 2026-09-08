import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, Building2, ArrowRight, Shield, Star, Award, Users, BookOpen, Key, ChevronDown, ChevronUp, CheckCircle, Sun, Moon, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'branch', label: 'Branch / Franchise', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function Login() {
  const [activeRole, setActiveRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
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
      else if (user.role === 'student') navigate('/student-dashboard');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#EBEFF8] text-[#0F172A] font-sans relative overflow-x-hidden pt-12 sm:pt-16 lg:pt-20 pb-8">
      {/* BACKGROUND GRAPHIC CURVE */}
      <div 
        className="absolute top-0 left-0 w-full lg:w-[62%] h-[320px] sm:h-[400px] lg:h-full bg-gradient-to-br from-[#0B1536] via-[#0E2055] to-[#1E3A8A] z-0"
        style={{
          clipPath: 'ellipse(100% 100% at 50% 0%)'
        }}
      >
        {/* Background Building Overlay Effect */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: 'url("/hero-bg.jpg")' }}
        />
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* TOP HEADER CONTROLS (Top Right of Page) */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 py-2 sm:py-3 flex justify-between lg:justify-end items-center gap-4 text-xs font-semibold">
        <div className="lg:hidden flex items-center gap-2 text-white">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-white/30" />
          <span className="font-bold tracking-tight text-sm">KEERTI COMPUTER INSTITUTE</span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/80 text-slate-700 shadow-sm">
            <LockKeyhole className="w-3.5 h-3.5 text-blue-600" />
            <span>Secure Access</span>
          </div>
          <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full p-1 border border-white shadow-sm gap-1">
            <button type="button" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full text-slate-500 hover:text-slate-900 flex items-center justify-center">
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-120px)] mt-1 sm:mt-2">

        {/* CENTER/RIGHT COLUMN: FLOATING WHITE LOGIN CARD (Order 1 on Mobile, 5 Cols Desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center order-1 lg:order-2">
          <div className="w-full max-w-[460px] bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.14)] border border-slate-100 p-5 sm:p-8 text-[#0F172A] relative">
            
            {/* CARD LOGO & HEADER */}
            <div className="text-center space-y-1 mb-5">
              <img src="/logo.png" alt="KCI" className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full shadow-md border border-amber-300 mb-1.5" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-wider uppercase">KEERTI COMPUTER INSTITUTE</h3>
              <p className="text-blue-600 text-[11px] sm:text-xs font-semibold italic">Learn • Grow • Succeed</p>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-2 flex items-center justify-center gap-1.5">
                Welcome Back <span className="text-xl sm:text-2xl">👋</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Sign in to access your learning dashboard
              </p>
            </div>

            {/* ROLE TAB SELECTOR */}
            <div className="mb-4 bg-slate-100 p-1 sm:p-1.5 rounded-2xl grid grid-cols-3 gap-1">
              {roles.map(({ id, label, icon: Icon }) => {
                const isSelected = activeRole === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveRole(id)}
                    className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value.trim() }))}
                    placeholder="Enter your phone number or email"
                    className="w-full h-11 sm:h-12 pl-10 pr-3.5 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="w-full h-11 sm:h-12 pl-10 pr-10 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* REMEMBER & FORGOT */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                <label className="flex items-center gap-1.5 font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); toast.error('Contact center branch admin for password reset.'); }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login Securely</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* SECURITY ASSURANCE BOX */}
            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-600 font-medium leading-tight">
                <div className="font-bold text-slate-900">Your data is safe with us</div>
                <div className="text-[10px] text-slate-500 mt-0.5">256-bit SSL • Privacy Protected • Secure Auth</div>
              </div>
            </div>

            {/* DEMO CREDENTIALS TOGGLE */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 text-center">
              <button 
                type="button" 
                onClick={() => setShowDemo(!showDemo)}
                className="text-[11px] sm:text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showDemo ? 'Hide Demo Credentials' : 'Show Demo Credentials'}</span>
                {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showDemo && (
                <div className="mt-2 p-2 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-700 text-left space-y-1">
                  <p><strong>Admin:</strong> admin@kci.org.in / admin123</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* LEFT COLUMN: HERO CONTENT & BRANDING (Desktop only / Hidden on Mobile to prevent scrolling) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 text-white flex-col justify-between space-y-8 pr-0 lg:pr-6 order-2 lg:order-1">
          {/* LOGO & TITLE */}
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <img src="/logo.png" alt="Keerti Logo" className="w-14 h-14 rounded-full border-2 border-amber-400 shadow-lg" />
              <div>
                <h1 className="text-xl font-black text-white tracking-wider leading-none">KEERTI</h1>
                <p className="text-amber-400 text-[10px] font-black tracking-widest uppercase mt-0.5">COMPUTER INSTITUTE</p>
                <p className="text-blue-200 text-[11px] font-medium italic mt-0.5">Learn • Grow • Succeed</p>
              </div>
            </div>

            {/* TRUST BADGE */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>India's Trusted Computer Institute</span>
            </div>

            {/* MAIN HEADLINE */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Learn Today <br />
                Build a Brighter <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                  Tomorrow
                </span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-lg leading-relaxed font-normal">
                Gain in-demand skills, get certified, and take the next step towards your successful career.
              </p>
            </div>
          </div>

          {/* 4 STAT BADGES GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '21+', sub: 'Industry Courses', icon: BookOpen },
              { label: '10,000+', sub: 'Students Trained', icon: Users },
              { label: '30+', sub: 'Branches', icon: Award },
              { label: '100%', sub: 'Career Support', icon: ShieldCheck },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center hover:bg-white/15 transition-all">
                <div className="w-8 h-8 rounded-full bg-blue-600/60 flex items-center justify-center mb-1.5 text-white">
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-white leading-none">{stat.label}</div>
                <div className="text-[11px] text-slate-300 font-medium mt-1 leading-tight">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* QUOTE & TESTIMONIAL CARD */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-2xl text-blue-400 font-serif leading-none">“</span>
              <p className="text-xs sm:text-sm italic text-slate-200 font-medium leading-snug">
                Skills are the keys to a brighter future.
              </p>
              <p className="text-[11px] text-slate-400 font-semibold">— Keerti Computer Institute</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-blue-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="w-8 h-8 rounded-full border-2 border-blue-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="w-8 h-8 rounded-full border-2 border-blue-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Student" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-none">10K+</div>
                <div className="text-[10px] text-slate-300">Happy Students</div>
                <div className="flex text-amber-400 text-[10px] mt-0.5">★★★★★</div>
              </div>
            </div>
          </div>

          {/* BOTTOM FEATURE LIST */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-300 border-t border-white/10">
            <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Practical Training</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Expert Faculty</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Government Recognized</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Better Placements</div>
          </div>
        </div>

        {/* RIGHT SIDE DECORATIVE SIDEBAR (DECORATIVE ACCENTS ON XL SCREENS) */}
        <div className="hidden xl:flex xl:col-span-1 flex-col items-center justify-center space-y-6 text-center text-xs font-semibold text-slate-500 pl-4 order-3">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-700 font-bold">Same</p>
            <p className="text-[11px] text-slate-700 font-bold">Institute</p>
            <p className="text-[11px] text-blue-600 font-extrabold">Bigger</p>
            <p className="text-[11px] text-slate-700 font-bold">Opportunities</p>
          </div>
          <div className="w-[1px] h-12 bg-blue-300" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="w-[1px] h-8 bg-blue-200" />
          <div className="text-[10px] text-slate-600 font-bold space-y-1">
            <p className="text-blue-700">Learn</p>
            <p className="text-blue-800">Grow</p>
            <p className="text-blue-900">Succeed</p>
          </div>
        </div>

      </div>

      {/* FOOTER BAR */}
      <div className="relative z-10 py-3 text-center text-xs text-slate-500 font-medium border-t border-slate-200/60 bg-white/40 backdrop-blur-xs">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px]">
          <span>© {new Date().getFullYear()} Keerti Computer Institute. All rights reserved.</span>
          <div className="flex items-center gap-3 text-slate-600">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">Terms of Use</a>
            <span>•</span>
            <a href="#contact" onClick={(e) => e.preventDefault()} className="hover:underline">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
}
