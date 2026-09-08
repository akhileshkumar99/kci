import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense, Component } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence as AnimatePresenceWA } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import StudentDashboard from './pages/StudentDashboard';
import BranchDashboard from './pages/BranchDashboard';
import Login from './pages/Login';

// Helper for safe lazy loading to automatically handle Vercel deployment chunk updates
const safeLazy = (importFn) =>
  lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      if (typeof window !== 'undefined' && (error?.message?.includes('dynamically imported module') || error?.message?.includes('Failed to fetch'))) {
        window.location.reload();
        return new Promise(() => { });
      }
      throw error;
    }
  });

// Lazy load remaining pages
const Home = safeLazy(() => import('./pages/Home'));
const About = safeLazy(() => import('./pages/About'));
const Courses = safeLazy(() => import('./pages/Courses'));
const CourseDetail = safeLazy(() => import('./pages/CourseDetail'));
const Admission = safeLazy(() => import('./pages/Admission'));
const Gallery = safeLazy(() => import('./pages/Gallery'));
const Branches = safeLazy(() => import('./pages/Branches'));
const Staff = safeLazy(() => import('./pages/Staff'));
const Contact = safeLazy(() => import('./pages/Contact'));
const Register = safeLazy(() => import('./pages/Register'));
const CertificateVerify = safeLazy(() => import('./pages/CertificateVerify'));
const Result = safeLazy(() => import('./pages/Result'));
const StudyMaterial = safeLazy(() => import('./pages/StudyMaterial'));
const IDCard = safeLazy(() => import('./pages/IDCard'));
const Notifications = safeLazy(() => import('./pages/Notifications'));
const ExaminationForm = safeLazy(() => import('./pages/ExaminationForm'));
const AdmitCard = safeLazy(() => import('./pages/AdmitCard'));
const BranchApply = safeLazy(() => import('./pages/BranchApply'));
const FranchiseDashboard = safeLazy(() => import('./pages/franchise/FranchiseDashboard'));
const FranchiseLayout = safeLazy(() => import('./pages/franchise/FranchiseLayout'));
const FranchiseStudents = safeLazy(() => import('./pages/franchise/FranchiseStudents'));
const AdminLayout = safeLazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = safeLazy(() => import('./pages/admin/AdminDashboard'));
const AdminCourses = safeLazy(() => import('./pages/admin/AdminCourses'));
const AdminStudents = safeLazy(() => import('./pages/admin/AdminStudents'));
const AdminResults = safeLazy(() => import('./pages/admin/AdminResults'));
const AdminCertificates = safeLazy(() => import('./pages/admin/AdminCertificates'));
const AdminGallery = safeLazy(() => import('./pages/admin/AdminGallery'));
const AdminAdmissions = safeLazy(() => import('./pages/admin/AdminAdmissions'));
const AdminStaff = safeLazy(() => import('./pages/admin/AdminStaff'));
const AdminContacts = safeLazy(() => import('./pages/admin/AdminContacts'));
const AdminStudyMaterial = safeLazy(() => import('./pages/admin/AdminStudyMaterial'));
const AdminNotifications = safeLazy(() => import('./pages/admin/AdminNotifications'));
const AdminBranches = safeLazy(() => import('./pages/admin/AdminBranches'));
const AdminExamForms = safeLazy(() => import('./pages/admin/AdminExamForms'));
const AdminAdmitCard = safeLazy(() => import('./pages/admin/AdminAdmitCard'));
const AdminAnalytics = safeLazy(() => import('./pages/admin/AdminAnalytics'));
const AdminAuditLogs = safeLazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminQuiz = safeLazy(() => import('./pages/admin/AdminQuiz'));
const AdminFranchise = safeLazy(() => import('./pages/admin/AdminFranchise'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("KCI App Error:", error, errorInfo);
    if (error?.toString()?.includes('dynamically imported module') || error?.toString()?.includes('Failed to fetch')) {
      window.location.reload();
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">⚠️</div>
          <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6">{this.state.error?.toString()}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all">
            Refresh & Continue
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const WHATSAPP_NUMBER = '919936384736';
const AUTO_MESSAGES = [
  '👋 Namaste! Welcome to Keerti Computer Institute!',
  '🎓 Kya aap computer courses mein interested hain?',
  '📚 Hum offer karte hain: DCA, ADCA, Tally, Web Design, Python & more!',
  '💬 Koi bhi sawaal ho toh hume WhatsApp karein!',
];

// Chat Box + Chat Icon + WhatsApp Button
function ChatBox() {
  const [open, setOpen] = useState(false);
  const [visibleMsgs, setVisibleMsgs] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!open) return;
    setVisibleMsgs([]);
    AUTO_MESSAGES.forEach((text, i) => {
      setTimeout(() => setVisibleMsgs(prev => [...prev, text]), i * 900);
    });
  }, [open]);

  const sendMessage = () => {
    const text = input.trim() || 'Hello! I want to know more about your courses.';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed right-4 sm:right-6 z-[999] flex flex-col items-end gap-3" style={{ bottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 5rem))' }}>
      {/* On mobile push above bottom nav (64px) */}

      {/* Chat Box */}
      <AnimatePresenceWA>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-[calc(100vw-32px)] max-w-sm sm:w-80 rounded-2xl shadow-2xl overflow-hidden border border-green-100"
          >
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
              <div className="relative">
                <img src="/logo.png" alt="KCI" className="w-10 h-10 rounded-full object-cover object-center overflow-hidden" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">Keerti Computer Institute</div>
                <div className="text-green-300 text-xs">● Online</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="bg-[#ECE5DD] px-4 py-4 space-y-3 min-h-[180px]">
              {visibleMsgs.map((text, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-end gap-2">
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 text-sm text-gray-800 shadow max-w-[85%]">
                    {text}
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none shadow-sm"
              />
              <button onClick={sendMessage} className="w-9 h-9 rounded-full flex items-center justify-center shadow" style={{ background: '#25D366' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresenceWA>

      {/* Chat Icon Button (above WhatsApp) */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center relative"
        style={{ background: '#075E54' }}
      >
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">1</span>}
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      </motion.button>

      {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative"
        style={{ background: '#25D366' }}
      >
        <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-50 animate-ping" />
        <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10" fill="white">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.829 1.781 6.859L2 30l7.352-1.758A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.834-1.594l-.418-.248-4.363 1.043 1.074-4.25-.273-.437A11.47 11.47 0 014.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.617c-.344-.172-2.035-1.004-2.35-1.117-.316-.115-.547-.172-.777.172-.23.344-.893 1.117-1.094 1.348-.2.23-.402.258-.746.086-.344-.172-1.453-.535-2.766-1.707-1.023-.91-1.713-2.035-1.914-2.379-.2-.344-.021-.531.15-.703.155-.154.344-.402.516-.603.172-.2.23-.344.344-.574.115-.23.058-.43-.029-.603-.086-.172-.777-1.875-1.064-2.566-.281-.672-.566-.58-.777-.59l-.66-.012c-.23 0-.603.086-.918.43-.316.344-1.207 1.18-1.207 2.877s1.236 3.338 1.408 3.568c.172.23 2.432 3.713 5.893 5.207.824.355 1.467.568 1.969.727.827.263 1.58.226 2.174.137.663-.1 2.035-.832 2.322-1.635.287-.803.287-1.492.2-1.635-.086-.143-.316-.23-.66-.402z" />
        </svg>
      </motion.a>
    </div>
  );
}

function WhatsAppButton() { return null; }

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresenceWA>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[9998] max-w-sm mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 flex items-center gap-4">
            <img src="/logo.png" alt="KCI" className="w-14 h-14 rounded-xl object-contain flex-shrink-0 bg-white p-1" />
            <div className="flex-1 min-w-0">
              <div className="font-black text-gray-900 text-sm">Install KCI App</div>
              <div className="text-xs text-gray-500 mt-0.5">Add to home screen for quick access</div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={handleInstall}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold whitespace-nowrap">
                Install
              </button>
              <button onClick={() => setShow(false)}
                className="px-4 py-1.5 text-gray-400 rounded-xl text-xs font-semibold hover:bg-gray-50">
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresenceWA>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  return null;
}

function RouteLoader() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setProgress(0);
    setVisible(true);
    const t1 = setTimeout(() => setProgress(85), 10);
    const t2 = setTimeout(() => setProgress(100), 50);
    const t3 = setTimeout(() => setVisible(false), 120);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]" style={{ background: 'transparent' }}>
      <motion.div
        className="h-full rounded-full"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)',
          transition: progress === 70 ? 'width 0.3s ease' : progress === 100 ? 'width 0.2s ease' : 'none',
          boxShadow: '0 0 8px #a78bfa',
        }}
      />
    </div>
  );
}

const ProtectedRoute = ({ children, roles = ['admin'] }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Loader />
            <ChatBox />
            <InstallPrompt />
            <RouteLoader />
            <ScrollToTop />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
                <Route path="/courses/:id" element={<PublicLayout><CourseDetail /></PublicLayout>} />
                <Route path="/admission" element={<PublicLayout><Admission /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
                <Route path="/verify-certificate" element={<PublicLayout><CertificateVerify /></PublicLayout>} />
                <Route path="/result" element={<PublicLayout><Result /></PublicLayout>} />
                <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
                <Route path="/branches" element={<PublicLayout><Branches /></PublicLayout>} />
                <Route path="/staff" element={<PublicLayout><Staff /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                <Route path="/study-material" element={<PublicLayout><StudyMaterial /></PublicLayout>} />
                <Route path="/id-card" element={<PublicLayout><IDCard /></PublicLayout>} />
                <Route path="/notifications" element={<PublicLayout><Notifications /></PublicLayout>} />
                <Route path="/branch-apply" element={<PublicLayout><BranchApply /></PublicLayout>} />
                <Route path="/exam-form" element={<PublicLayout><ExaminationForm /></PublicLayout>} />
                <Route path="/branch-dashboard" element={<BranchDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/franchise-dashboard" element={<FranchiseDashboard />} />
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="admissions" element={<AdminAdmissions />} />
                  <Route path="results" element={<AdminResults />} />
                  <Route path="certificates" element={<AdminCertificates />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="study-material" element={<AdminStudyMaterial />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="branches" element={<AdminBranches />} />
                  <Route path="contacts" element={<AdminContacts />} />
                  <Route path="exam-forms" element={<AdminExamForms />} />
                  <Route path="admit-card" element={<AdminAdmitCard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="quiz" element={<AdminQuiz />} />
                  <Route path="franchise" element={<AdminFranchise />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
