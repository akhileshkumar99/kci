import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, Building2, ArrowRight, BookOpen, Users, Award, Key, Shield, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'View results, certificates & study materials' },
  { id: 'branch', label: 'Brand / Branch', icon: Building2, desc: 'Manage your branch center & students' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Full administrative system control' },
];

export default function Login() {
  const [activeRole, setActiveRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [showDemo, setShowDemo] = useState(true);
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
    <div className="w-full min-h-[calc(100vh-80px)] grid grid-cols-1 md:grid-cols-[35%_65%] lg:grid-cols-[42%_58%] bg-[#F8FAFC] text-[#0F172A] font-sans overflow-x-hidden pt-20 sm:pt-24 pb-12">

      {/* ==================================================== */}
      {/* DESKTOP LEFT SIDE — 42% (35% Tablet / Hidden Mobile) */}
      {/* ==================================================== */}
      <div
        className="relative hidden md:flex flex-col justify-between p-8 lg:p-12 overflow-hidden text-white min-h-full"
        style={{ background: 'linear-gradient(135deg, #071A52 0%, #102C7A 50%, #1D4ED8 100%)' }}
      >
        {/* Subtle Background Effects */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* TOP BRANDING */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="kci-logo-wrap w-14 h-14 shadow-2xl border-2 border-white/20">
              <img src="/logo.png" alt="KCI Logo" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">KEERTI</h1>
              <p className="text-amber-300 text-[10px] lg:text-xs font-black tracking-[0.2em] uppercase mt-0.5">COMPUTER INSTITUTE</p>
              <p className="text-blue-200 text-[11px] font-extrabold italic mt-0.5">Learn • Grow • Succeed</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-10 my-auto py-6">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Welcome Back 👋
          </h2>
          <p className="text-slate-200 text-sm lg:text-base leading-relaxed font-semibold mb-8 max-w-md">
            Access your learning dashboard, results, certificates and study materials.
          </p>

          {/* 3 FEATURE CARDS */}
          <div className="space-y-3.5 max-w-md mb-8">
            {[
              { icon: BookOpen, title: '21+ Industry Courses', desc: 'DCA, ADCA, Tally GST & Web Tech', color: 'bg-blue-600' },
              { icon: Users, title: '10,000+ Enrolled Students', desc: 'Trusted IT computer education since 2005', color: 'bg-indigo-600' },
              { icon: Award, title: 'Government Recognized', desc: 'Nationally accepted certifications', color: 'bg-amber-600' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-lg hover:translate-x-1 transition-transform">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-black text-sm">{title}</div>
                  <div className="text-slate-300 text-xs font-semibold">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM TRUST FEATURES */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-200 pt-4 border-t border-white/15 mb-4">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Secure Platform</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Verified Certificates</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 24/7 Access</div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 inline-block">
            <p className="text-amber-300 font-black text-xs uppercase tracking-wider">A Brighter Future Awaits You!</p>
          </div>
        </div>

        {/* BOTTOM BRAND FOOTER */}
        <div className="relative z-10 text-xs font-semibold text-slate-400">
          © {new Date().getFullYear()} Keerti Computer Institute. All rights reserved.
        </div>
      </div>

      {/* ==================================================== */}
      {/* RIGHT SIDE — 58% DESKTOP (65% Tablet / 100% Mobile)  */}
      {/* ==================================================== */}
      <div className="w-full flex justify-center items-center p-4 sm:p-8 lg:p-12 bg-[#F8FAFC] min-h-full">
        <div className="w-full max-w-[620px]">

          {/* MOBILE TOP BRANDING (Design No. 5 Compact Mobile Layout) */}
          <div className="md:hidden text-center mb-6">
            <div className="kci-logo-wrap w-16 h-16 mx-auto mb-2 shadow-lg"><img src="/logo.png" alt="KCI Logo" /></div>
            <h2 className="text-2xl font-black text-[#0F172A]">KEERTI COMPUTER INSTITUTE</h2>
            <p className="text-sm text-blue-700 font-extrabold mt-0.5">Learn • Grow • Succeed</p>
          </div>

          {/* LOGIN CARD (Max-width 620px, Padding 40px, Radius 24px) */}
          <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-[rgba(37,99,235,0.08)] p-6 sm:p-10 text-[#0F172A]">

            {/* LOGIN HEADER */}
            <div className="mb-6 sm:mb-8 text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-extrabold mt-1">
                Select your role and continue to your dashboard
              </p>
            </div>

            {/* ROLE SELECTOR (Equal width 3 buttons, repeat 3, 1fr) */}
            <div className="mb-6">
              <label className="block text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Select Role</label>
              <div className="grid grid-cols-3 gap-2 h-[52px] sm:h-[56px] p-1.5 bg-slate-100 rounded-[12px] items-center">
                {roles.map(({ id, label, icon: Icon }) => {
                  const isSelected = activeRole === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveRole(id)}
                      className={`h-full flex items-center justify-center gap-1.5 px-2 rounded-[10px] text-sm font-black transition-all duration-200 cursor-pointer ${isSelected
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#4338CA] text-white shadow-md shadow-blue-600/20 scale-[1.02]'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                        }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Banner Info */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl mb-6 bg-blue-50 border border-blue-200 text-blue-950">
              <roleConfig.icon className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span className="text-sm sm:text-base font-black leading-snug">{roleConfig.desc}</span>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* FIELD 1 */}
              <div>
                <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">
                  {activeRole === 'student' ? 'Form Number or Email' : 'Phone Number or Email'}
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'email' ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value.trim() }))}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    placeholder="Enter phone number or email"
                    className="w-full h-[54px] sm:h-[56px] pl-12 pr-4 text-base text-[#0F172A] placeholder-slate-400 outline-none transition-all bg-slate-50/80 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-black border-2 border-slate-300 rounded-[10px] sm:rounded-[12px]"
                  />
                </div>
              </div>

              {/* FIELD 2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-wider">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.error('Contact your center branch admin for password reset.'); }}
                    className="text-sm text-[#2563EB] hover:underline font-black">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'password' ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    placeholder="Enter password"
                    className="w-full h-[54px] sm:h-[56px] pl-12 pr-12 text-base text-[#0F172A] placeholder-slate-400 outline-none transition-all bg-slate-50/80 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-black border-2 border-slate-300 rounded-[10px] sm:rounded-[12px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] transition-colors p-1"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[54px] sm:h-[56px] rounded-[12px] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all bg-gradient-to-r from-[#2563EB] to-[#4338CA] hover:from-[#1d4ed8] hover:to-[#3730a3] hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Login Securely</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* DEMO CREDENTIALS COLLAPSIBLE CARD */}
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDemo(!showDemo)}>
                <div className="flex items-center gap-2 text-sm sm:text-base font-black text-blue-950">
                  <Key className="w-4 h-4 text-[#2563EB]" /> Demo Credentials
                </div>
                {showDemo ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
              </div>
              {showDemo && (
                <div className="mt-2 text-sm sm:text-base text-blue-950 font-bold border-t border-blue-200/80 pt-2 space-y-1">
                  <p><strong>Admin:</strong> admin@kci.org.in / admin123</p>
                </div>
              )}
            </div>

            {/* SECONDARY ACTION LINK */}
            <div className="mt-5 text-center text-sm sm:text-base">
              <Link to="/branch-apply" className="text-[#2563EB] hover:underline font-black inline-flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2563EB]" /> Apply for Branch Franchise
              </Link>
            </div>

            {/* SECURITY FOOTER */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-around gap-2 text-xs sm:text-sm font-black text-slate-600">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-600" /> 🔒 256-bit SSL Secured</span>
              <span>🔐 Privacy Protected</span>
              <span>🛡 Secure Authentication</span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
