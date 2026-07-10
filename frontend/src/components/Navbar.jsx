import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, LogIn, GraduationCap, Building2, Store, CheckCircle, ChevronRight, ChevronDown, MapPin, Phone, Mail, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses' },
  { label: 'Admission', path: '/admission' },
  { label: 'Result', path: '/result' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Staff', path: '/staff' },
  { label: 'Contact', path: '/contact' },
];

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Center Details' },
];

function ApplyBranchModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    franchiseCenter: '', franchiseCity: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/franchise/register', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 pt-6 pb-10">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Apply for Branch</h2>
              <p className="text-blue-200 text-xs">Join KCI Franchise Network</p>
            </div>
          </div>
          {/* Step indicators */}
          {!success && (
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${step >= s.id ? 'bg-white text-blue-700' : 'bg-white/20 text-white/70'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-blue-600 text-white' : 'bg-white/30 text-white'}`}>
                      {step > s.id ? '✓' : s.id}
                    </span>
                    {s.label}
                  </div>
                  {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-white/50" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 -mt-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            {success ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Application Submitted! 🎉</h3>
                <p className="text-gray-500 text-sm mb-1">Thank you, <span className="font-semibold text-gray-700">{form.name}</span>!</p>
                <p className="text-gray-400 text-sm mb-6">Our team will review your application for <span className="font-semibold text-blue-600">{form.franchiseCenter}</span> and contact you within 2-3 business days.</p>
                <div className="bg-blue-50 rounded-xl p-4 text-left mb-5">
                  <p className="text-xs font-bold text-blue-700 mb-2">WHAT HAPPENS NEXT?</p>
                  {['Admin reviews your application', 'You receive approval email with login credentials', 'Start managing your KCI branch!'].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                      {t}
                    </div>
                  ))}
                </div>
                <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                  Close
                </button>
              </motion.div>
            ) : step === 1 ? (
              <form onSubmit={handleNext} className="space-y-4">
                <p className="text-xs text-gray-500 font-medium mb-3">Fill in your personal information</p>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" /> Full Name *
                  </label>
                  <input type="text" required value={form.name} onChange={set('name')} placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" /> Email Address *
                  </label>
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="your@email.com"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" /> Phone Number *
                  </label>
                  <input type="tel" required value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white" />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  Next: Center Details <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-gray-500 font-medium mb-3">Tell us about your proposed center</p>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Center / Branch Name *
                  </label>
                  <input type="text" required value={form.franchiseCenter} onChange={set('franchiseCenter')} placeholder="e.g. KCI Lucknow North"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> City *
                  </label>
                  <input type="text" required value={form.franchiseCity} onChange={set('franchiseCity')} placeholder="Enter your city"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> Full Address
                  </label>
                  <textarea rows={2} value={form.address} onChange={set('address')} placeholder="Enter complete address"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white resize-none" />
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl">
                    <X className="w-3.5 h-3.5 shrink-0" /> {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 text-center">
            <p className="text-xs text-gray-400">🔒 Your information is secure and will only be used for franchise evaluation.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [branchModal, setBranchModal] = useState(false);
  const [branchDropdown, setBranchDropdown] = useState(false);
  const [logo, setLogo] = useState(() => localStorage.getItem('kci_logo') || '/logo.png');
  const logoRef = useRef();
  const branchDropdownRef = useRef();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setBranchDropdown(false); }, [location]);

  useEffect(() => {
    const handler = (e) => { if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) setBranchDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'branch') return '/branch-dashboard';
    if (user.role === 'student') return '/student-dashboard';
    return '/';
  };

  const getDashboardLabel = () => {
    if (user?.role === 'admin') return 'Admin Panel';
    if (user?.role === 'branch') return 'Branch Panel';
    if (user?.role === 'student') return 'My Portal';
    return 'Dashboard';
  };

  const getDashboardIcon = () => {
    if (user?.role === 'student') return <GraduationCap className="w-4 h-4" />;
    if (user?.role === 'branch') return <Building2 className="w-4 h-4" />;
    return <LayoutDashboard className="w-4 h-4" />;
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/98 shadow-xl shadow-blue-100/50 backdrop-blur-md' : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-800" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ type: 'spring', stiffness: 300 }} className="relative">
                <img src={logo} alt="KCI Logo" className="w-14 h-14 rounded-full object-cover shadow-lg ring-2 ring-blue-500/30" />

              </motion.div>
              <div className="hidden sm:block">
                <div className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-wide">KEERTI</div>
                <div className="text-[10px] font-bold leading-tight tracking-[0.2em] uppercase text-blue-500">Computer Institute</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, i) => {
                const active = location.pathname === link.path;
                return (
                  <motion.div key={link.path} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i + 0.2 }}>
                    <Link to={link.path}
                      className={`relative px-4 py-2 rounded-lg text-[15px] font-bold transition-all duration-200 group ${
                        active ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                      }`}>
                      {active && (
                        <motion.div layoutId="activeTab"
                          className="absolute inset-0 rounded-lg bg-blue-50 border border-blue-100"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                      )}
                      <span className="relative z-10">{link.label}</span>
                      {!active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-500 rounded-full group-hover:w-4/5 transition-all duration-300" />}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Branches Dropdown */}
              <div className="relative" ref={branchDropdownRef}>
                <button onClick={() => setBranchDropdown(p => !p)}
                  className={`relative flex items-center gap-1 px-4 py-2 rounded-lg text-[15px] font-bold transition-all duration-200 ${
                    location.pathname === '/branches' ? 'text-blue-600 bg-blue-50 border border-blue-100' : 'text-gray-600 hover:text-blue-600'
                  }`}>
                  Branches <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${branchDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {branchDropdown && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <Link to="/branches" className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Building2 className="w-4 h-4" /> View Branches
                      </Link>
                      <div className="h-px bg-gray-100" />
                      <button onClick={() => { setBranchDropdown(false); setBranchModal(true); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
                        <Store className="w-4 h-4" /> Apply for Branch
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                  <Link to={getDashboardPath()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-200">
                    {getDashboardIcon()} {getDashboardLabel()}
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Link to="/login"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile: menu toggle */}
            <div className="lg:hidden flex items-center">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)}
                className="p-2 rounded-xl transition-colors text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <AnimatePresence mode="wait">
                  {open
                    ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-6 h-6" /></motion.div>
                    : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-6 h-6" /></motion.div>
                  }
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden border-t overflow-hidden bg-white border-blue-50 shadow-xl">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div key={link.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={link.path}
                      className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        location.pathname === link.path
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Branches accordion - mobile */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.04 }}>
                  <button onClick={() => setBranchDropdown(p => !p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <span>Branches</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${branchDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {branchDropdown && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1">
                        <Link to="/branches" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Building2 className="w-4 h-4" /> View Branches
                        </Link>
                        <button onClick={() => { setBranchDropdown(false); setOpen(false); setBranchModal(true); }}
                          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
                          <Store className="w-4 h-4" /> Apply for Branch
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="pt-3 border-t space-y-2 border-gray-100">
                  {user ? (
                    <>
                      <Link to={getDashboardPath()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold">
                        {getDashboardIcon()} {getDashboardLabel()}
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md">
                      <LogIn className="w-4 h-4" /> Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-1 w-full overflow-hidden">
          <div className="running-line h-full" />
        </div>
      </motion.nav>

      {/* Branch Application Modal */}
      <AnimatePresence>
        {branchModal && <ApplyBranchModal onClose={() => setBranchModal(false)} />}
      </AnimatePresence>
    </>
  );
}
