import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, FileText, Award, Image,
  ClipboardList, UserCheck, MessageSquare, LogOut, Menu, X,
  ChevronRight, Bell, Sun, Moon, Search, Settings, ChevronDown,
  TrendingUp, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, color: 'text-blue-400' },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen, color: 'text-emerald-400' },
  { path: '/admin/students', label: 'Students', icon: Users, color: 'text-violet-400' },
  { path: '/admin/admissions', label: 'Admissions', icon: ClipboardList, color: 'text-orange-400' },
  { path: '/admin/results', label: 'Results', icon: Award, color: 'text-yellow-400' },
  { path: '/admin/certificates', label: 'Certificates', icon: FileText, color: 'text-teal-400' },
  { path: '/admin/gallery', label: 'Gallery', icon: Image, color: 'text-pink-400' },
  { path: '/admin/staff', label: 'Staff', icon: UserCheck, color: 'text-cyan-400' },
  { path: '/admin/contacts', label: 'Messages', icon: MessageSquare, color: 'text-rose-400' },
];

const mockNotifications = [
  { id: 1, type: 'info', title: 'New Admission', msg: 'A new admission form was submitted', time: '2m ago', read: false },
  { id: 2, type: 'success', title: 'Result Published', msg: 'Result for KCI20240001 published', time: '1h ago', read: false },
  { id: 3, type: 'warning', title: 'Gallery Upload', msg: '3 new images added to gallery', time: '3h ago', read: true },
  { id: 4, type: 'info', title: 'New Message', msg: 'Contact form message received', time: '5h ago', read: true },
];

const notifIcon = { info: Info, success: CheckCircle, warning: AlertCircle };
const notifColor = { info: 'text-blue-500 bg-blue-50', success: 'text-green-500 bg-green-50', warning: 'text-orange-500 bg-orange-50' };

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem('kci_dark') === 'true');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchVal, setSearchVal] = useState('');
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef();
  const profileRef = useRef();

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    localStorage.setItem('kci_dark', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const currentPage = location.pathname.split('/').pop() || 'Dashboard';

  const bg = dark ? 'bg-gray-950' : 'bg-gray-100';
  const sidebar = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const header = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const text = dark ? 'text-gray-100' : 'text-gray-900';
  const subtext = dark ? 'text-gray-400' : 'text-gray-500';
  const navHover = dark ? 'hover:bg-gray-800 hover:text-white' : 'hover:bg-blue-50 hover:text-blue-700';
  const navInactive = dark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex h-screen ${bg} overflow-hidden`}>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`${sidebar} border-r flex flex-col overflow-hidden shrink-0 shadow-sm`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center px-4 border-b ${dark ? 'border-gray-800' : 'border-gray-100'} shrink-0`}>
          <motion.div whileHover={{ scale: 1.05 }} className="relative shrink-0">
            <img src="/logo.png" alt="KCI" className="w-9 h-9 rounded-xl object-cover shadow-md ring-2 ring-blue-500/30" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="ml-3 overflow-hidden">
                <div className={`font-black text-sm ${text} whitespace-nowrap`}>KEERTI</div>
                <div className="text-blue-500 text-[10px] font-bold tracking-wider whitespace-nowrap">Admin Panel</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
          {navItems.map(({ path, label, icon: Icon, exact, color }) => {
            const active = isActive({ path, exact });
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : `${navInactive} ${navHover}`
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : color}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap">{label}</motion.span>
                  )}
                </AnimatePresence>
                {active && sidebarOpen && (
                  <motion.div layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`p-3 border-t ${dark ? 'border-gray-800' : 'border-gray-100'} space-y-1`}>
          <button onClick={() => setDark(!dark)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${navInactive} ${navHover}`}>
            {dark ? <Sun className="w-5 h-5 shrink-0 text-yellow-400" /> : <Moon className="w-5 h-5 shrink-0 text-indigo-400" />}
            {sidebarOpen && <span className="text-sm font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${navInactive} hover:bg-red-50 hover:text-red-500`}>
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className={`h-16 ${header} border-b flex items-center px-4 gap-3 shrink-0 shadow-sm`}>
          {/* Toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className={`flex items-center gap-1 text-sm ${subtext} hidden sm:flex`}>
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={`${text} font-semibold capitalize`}>{currentPage}</span>
          </div>

          {/* Search */}
          <div className={`hidden md:flex items-center gap-2 flex-1 max-w-xs ml-4 px-3 py-2 rounded-xl border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <Search className={`w-4 h-4 ${subtext}`} />
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Search..."
              className={`bg-transparent text-sm outline-none flex-1 ${text} placeholder:${subtext}`} />
          </div>

          <div className="ml-auto flex items-center gap-2">

            {/* Dark/Light toggle (header) */}
            <button onClick={() => setDark(!dark)}
              className={`p-2 rounded-xl transition-colors ${dark ? 'text-yellow-400 hover:bg-gray-800' : 'text-indigo-500 hover:bg-gray-100'}`}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className={`relative p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                    {unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <span className={`font-bold text-sm ${text}`}>Notifications</span>
                      <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-600 font-medium">Mark all read</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map(n => {
                        const Icon = notifIcon[n.type];
                        return (
                          <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors ${dark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-50 hover:bg-gray-50'} ${!n.read ? (dark ? 'bg-blue-950/30' : 'bg-blue-50/50') : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notifColor[n.type]}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-semibold ${text}`}>{n.title}</div>
                              <div className={`text-xs ${subtext} truncate`}>{n.msg}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{n.time}</div>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm ring-2 ring-blue-500/30">
                  <img src="/logo.png" alt="KCI" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`text-xs font-bold ${text}`}>Admin</div>
                  <div className="text-[10px] text-gray-400">Super Admin</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 ${subtext} hidden sm:block`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className={`absolute right-0 top-12 w-52 rounded-2xl shadow-2xl border z-50 overflow-hidden ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className={`font-bold text-sm ${text}`}>Admin User</div>
                      <div className="text-xs text-gray-400">admin@kci.org.in</div>
                    </div>
                    <div className="p-2">
                      <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${dark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                        🌐 View Website
                      </Link>
                      <button onClick={() => setDark(!dark)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full transition-colors ${dark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                      </button>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto p-6 ${dark ? 'bg-gray-950' : 'bg-gray-50'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
