import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, Building2, ArrowRight, BookOpen, Users, Award, Key, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    selectedCard: 'bg-blue-600 text-white border-blue-600 shadow-md',
    unselectedCard: 'bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-100',
    descBox: 'bg-blue-50 text-blue-950 border-blue-300',
    descIconBg: 'bg-blue-600 text-white',
    desc: 'View results, certificates & study materials'
  },
  {
    id: 'branch',
    label: 'Branch',
    icon: Building2,
    btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    selectedCard: 'bg-purple-600 text-white border-purple-600 shadow-md',
    unselectedCard: 'bg-purple-50 text-purple-950 border-purple-200 hover:bg-purple-100',
    descBox: 'bg-purple-50 text-purple-950 border-purple-300',
    descIconBg: 'bg-purple-600 text-white',
    desc: 'Manage your branch center & students'
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    selectedCard: 'bg-amber-600 text-white border-amber-600 shadow-md',
    unselectedCard: 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100',
    descBox: 'bg-amber-50 text-amber-950 border-amber-300',
    descIconBg: 'bg-amber-600 text-white',
    desc: 'Full administrative system control'
  },
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

  const roleConfig = roles.find(r => r.id === activeRole);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] text-slate-900">

      {/* Left Panel: Institute Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden bg-[#0b1f5b] text-white min-h-screen">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />

        <div className="relative z-10 text-center max-w-md">
          <div className="kci-logo-wrap w-32 h-32 mx-auto mb-5 shadow-2xl border-4 border-white/20">
            <img src="/logo.png" alt="KCI Logo" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-1.5 tracking-tight">KEERTI</h1>
          <p className="text-amber-300 text-xs font-black tracking-[0.25em] mb-3 uppercase">Computer Institute</p>
          <div className="w-20 h-1 mx-auto mb-6 bg-amber-400 rounded-full" />
          
          <p className="text-slate-200 text-sm leading-relaxed font-semibold">
            Government recognized computer education since 2005. Empowering 10,000+ students with career-ready digital skills.
          </p>

          {/* Highlights */}
          <div className="mt-8 space-y-3">
            {[
              { icon: BookOpen, label: '21+ Courses', value: 'Available', color: 'bg-blue-600' },
              { icon: Users, label: 'Students Enrolled', value: '10,000+', color: 'bg-purple-600' },
              { icon: Award, label: 'Affiliated Centers', value: '30+ Branches', color: 'bg-amber-600' }
            ].map(({ icon: Icon, label, value, color }, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-md">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-black text-sm">{value}</div>
                  <div className="text-slate-200 text-xs font-semibold">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-slate-300 text-xs font-bold tracking-wide">
          © {new Date().getFullYear()} Keerti Computer Institute • Official Portal
        </p>
      </div>

      {/* Right Panel: Clean, High-Contrast Simple Login Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start items-center p-5 sm:p-8 lg:p-12 pt-28 sm:pt-32 pb-16 bg-[#f8fafc] overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="kci-logo-wrap w-16 h-16 mx-auto mb-2 shadow-lg"><img src="/logo.png" alt="KCI Logo" /></div>
            <h2 className="text-xl font-black text-slate-900">Keerti Computer Institute</h2>
          </div>

          {/* Main Clean Card Container */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 p-6 sm:p-8 text-slate-900">
            
            {/* Header Title */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-950 border border-blue-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" /> KCI Portal Access
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back 👋
              </h2>
              <p className="text-slate-800 text-xs sm:text-sm font-black mt-1">
                Select your role and sign in to continue
              </p>
            </div>

            {/* Role Selector Cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {roles.map(({ id, label, icon: Icon, selectedCard, unselectedCard }) => {
                const isSelected = activeRole === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveRole(id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-150 cursor-pointer ${
                      isSelected ? selectedCard : unselectedCard
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-900 shadow-xs'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black tracking-wide">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Description Badge */}
            <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl mb-6 border-2 ${roleConfig.descBox}`}>
              <div className={`w-8 h-8 rounded-xl ${roleConfig.descIconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                <roleConfig.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-black leading-snug text-slate-950">{roleConfig.desc}</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field 1 */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-900 mb-1.5 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {activeRole === 'student' ? 'Form Number / Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${focused === 'email' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value.trim() }))}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    placeholder={activeRole === 'admin' ? 'admin@kci.org.in' : activeRole === 'branch' ? 'branch@email.com' : 'KCI/FORM/2026/0001'}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all bg-slate-50 focus:bg-white focus:border-blue-600 font-black border-slate-300"
                  />
                </div>
              </div>

              {/* Field 2 */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-900 mb-1.5 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${focused === 'password' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all bg-slate-50 focus:bg-white focus:border-blue-600 font-black border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all ${roleConfig.btnColor} disabled:opacity-70 cursor-pointer mt-2`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <roleConfig.icon className="w-4 h-4" />
                    Login as {roleConfig.label}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-5 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center gap-1.5 text-xs font-black text-blue-950 mb-1">
                <Key className="w-3.5 h-3.5 text-blue-700" /> Demo Credentials:
              </div>
              <div className="space-y-1 text-xs text-blue-950 font-black">
                <p><strong>Admin:</strong> admin@kci.org.in / admin123</p>
              </div>
            </div>

            {/* Apply Branch Link */}
            <div className="mt-5 flex items-center justify-center text-xs">
              <Link to="/branch-apply" className="text-blue-700 hover:underline font-black flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Apply for Branch Franchise
              </Link>
            </div>

            {/* Security Badge */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-xs text-slate-800 font-black">Secure 256-Bit Encrypted Connection</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
