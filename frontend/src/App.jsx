import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence as AnimatePresenceWA } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Loader from './components/Loader';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Admission from './pages/Admission';
import Login from './pages/Login';
import ResultPage from './pages/ResultPage';
import Gallery from './pages/Gallery';
import Branches from './pages/Branches';
import Staff from './pages/Staff';
import Contact from './pages/Contact';
import StudentDashboard from './pages/StudentDashboard';
import FranchiseDashboard from './pages/FranchiseDashboard';
import Register from './pages/Register';
import QuizPage from './pages/QuizPage';
import StudyMaterial from './pages/StudyMaterial';
import IDCard from './pages/IDCard';
import Franchise from './pages/Franchise';
import Notifications from './pages/Notifications';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminStudents from './pages/admin/AdminStudents';
import AdminResults from './pages/admin/AdminResults';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminGallery from './pages/admin/AdminGallery';
import AdminAdmissions from './pages/admin/AdminAdmissions';
import AdminStaff from './pages/admin/AdminStaff';
import AdminContacts from './pages/admin/AdminContacts';
import AdminQuiz from './pages/admin/AdminQuiz';
import AdminStudyMaterial from './pages/admin/AdminStudyMaterial';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminFranchise from './pages/admin/AdminFranchise';

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
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">

      {/* Chat Box */}
      <AnimatePresenceWA>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-80 rounded-2xl shadow-2xl overflow-hidden border border-green-100"
          >
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
              <div className="relative">
                <img src="/logo.png" alt="KCI" className="w-10 h-10 rounded-full object-cover" />
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
        transition={{ delay: 2.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center relative"
        style={{ background: '#075E54' }}
      >
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">1</span>}
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </motion.button>

      {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative"
        style={{ background: '#25D366' }}
      >
        <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-50 animate-ping" />
        <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10" fill="white">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.829 1.781 6.859L2 30l7.352-1.758A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.834-1.594l-.418-.248-4.363 1.043 1.074-4.25-.273-.437A11.47 11.47 0 014.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.617c-.344-.172-2.035-1.004-2.35-1.117-.316-.115-.547-.172-.777.172-.23.344-.893 1.117-1.094 1.348-.2.23-.402.258-.746.086-.344-.172-1.453-.535-2.766-1.707-1.023-.91-1.713-2.035-1.914-2.379-.2-.344-.021-.531.15-.703.155-.154.344-.402.516-.603.172-.2.23-.344.344-.574.115-.23.058-.43-.029-.603-.086-.172-.777-1.875-1.064-2.566-.281-.672-.566-.58-.777-.59l-.66-.012c-.23 0-.603.086-.918.43-.316.344-1.207 1.18-1.207 2.877s1.236 3.338 1.408 3.568c.172.23 2.432 3.713 5.893 5.207.824.355 1.467.568 1.969.727.827.263 1.58.226 2.174.137.663-.1 2.035-.832 2.322-1.635.287-.803.287-1.492.2-1.635-.086-.143-.316-.23-.66-.402z"/>
        </svg>
      </motion.a>
    </div>
  );
}

function WhatsAppButton() { return null; }

function RouteLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [location.pathname]);
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center" style={{ background: '#0f172a' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="relative flex items-center justify-center"
        style={{ width: 80, height: 80 }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <ellipse key={i} cx="40" cy="10" rx="5" ry="10"
              fill={`hsl(${i * 36}, 90%, 65%)`}
              opacity={0.25 + (i / 10) * 0.75}
              transform={`rotate(${i * 36} 40 40)`}
            />
          ))}
        </svg>
        <img src="/logo.png" alt="KCI" className="w-12 h-12 rounded-full object-cover z-10" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="text-white/60 text-xs tracking-widest uppercase mt-4"
      >Loading...</motion.p>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
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
    <AuthProvider>
      <Loader />
      <ChatBox />
      <WhatsAppButton />
      <BrowserRouter>
        <RouteLoader />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
          <Route path="/courses/:id" element={<PublicLayout><CourseDetail /></PublicLayout>} />
          <Route path="/admission" element={<PublicLayout><Admission /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/result" element={<PublicLayout><ResultPage /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/branches" element={<PublicLayout><Branches /></PublicLayout>} />
          <Route path="/staff" element={<PublicLayout><Staff /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/franchise-dashboard" element={<FranchiseDashboard />} />
          <Route path="/dashboard" element={<StudentRoute><PublicLayout><StudentDashboard /></PublicLayout></StudentRoute>} />
          <Route path="/quiz" element={<PublicLayout><QuizPage /></PublicLayout>} />
          <Route path="/quiz/:id" element={<PublicLayout><QuizPage /></PublicLayout>} />
          <Route path="/study-material" element={<PublicLayout><StudyMaterial /></PublicLayout>} />
          <Route path="/id-card" element={<PublicLayout><IDCard /></PublicLayout>} />
          <Route path="/franchise" element={<PublicLayout><Franchise /></PublicLayout>} />
          <Route path="/notifications" element={<PublicLayout><Notifications /></PublicLayout>} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="quiz" element={<AdminQuiz />} />
            <Route path="study-material" element={<AdminStudyMaterial />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="franchise" element={<AdminFranchise />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
