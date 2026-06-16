import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, LogIn, GraduationCap, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses' },
  { label: 'Admission', path: '/admission' },
  { label: 'Result', path: '/result' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Branches', path: '/branches' },
  { label: 'Staff', path: '/staff' },
  { label: 'Contact', path: '/contact' },
  { label: 'Exam Form', path: '/exam-form' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logo, setLogo] = useState(() => localStorage.getItem('kci_logo') || '/logo.png');
  const logoRef = useRef();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

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
              {user && (
                <button type="button" onClick={e => { e.preventDefault(); logoRef.current.click(); }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition-colors text-white text-[10px]">
                  📷
                </button>
              )}
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { setLogo(ev.target.result); localStorage.setItem('kci_logo', ev.target.result); }; r.readAsDataURL(f); }} />
            </motion.div>
            <div className="hidden sm:block">
              <div className={`text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-wide`}>KEERTI</div>
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
                    className={`relative px-4 py-2 rounded-lg text-[15px] font-semibold transition-all duration-200 group ${
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
          </div>

          {/* Right: Auth Buttons */}
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

          {/* Mobile: menu only */}
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
  );
}
