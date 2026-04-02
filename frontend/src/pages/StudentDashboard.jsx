import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Download, Bell, User, Clock, TrendingUp, FileText, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (user?.rollNumber) {
      api.get(`/results/roll/${user.rollNumber}`).then(r => setResult(r.data.result)).catch(() => {});
      api.get(`/certificates/verify/${user.rollNumber}`).then(r => setCertificate(r.data.certificate)).catch(() => {});
    }
    api.get('/notifications?role=student').then(r => setNotifications(r.data.notifications || [])).catch(() => {});
    api.get('/study-material').then(r => setMaterials(r.data.materials || [])).catch(() => {});
    api.get('/quiz').then(r => setQuizzes(r.data.quizzes || [])).catch(() => {});
  }, [user]);

  const attendance = user?.totalClasses > 0 ? Math.round((user.attendance / user.totalClasses) * 100) : 0;

  const cards = [
    { icon: BookOpen, label: 'Course', value: user?.courseName || 'Not Enrolled', color: 'from-blue-500 to-blue-600' },
    { icon: TrendingUp, label: 'Attendance', value: `${attendance}%`, color: 'from-emerald-500 to-emerald-600' },
    { icon: Award, label: 'Result', value: result ? `${result.percentage}% - ${result.grade}` : 'Not Published', color: 'from-violet-500 to-violet-600' },
    { icon: FileText, label: 'Certificate', value: certificate ? 'Available' : 'Pending', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
              {user?.photo ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-black">Welcome, {user?.name}! 👋</h1>
              <p className="text-blue-200 text-sm">Roll No: {user?.rollNumber || 'N/A'} | {user?.courseName || 'No Course'}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Check Result', icon: Award, path: '/result', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Verify Certificate', icon: CheckCircle, path: '/verify-certificate', color: 'bg-green-50 text-green-600' },
                  { label: 'Study Material', icon: FileText, path: '/study-material', color: 'bg-violet-50 text-violet-600' },
                  { label: 'Take Quiz', icon: TrendingUp, path: '/quiz', color: 'bg-orange-50 text-orange-600' },
                  { label: 'Video Lectures', icon: Video, path: '/videos', color: 'bg-pink-50 text-pink-600' },
                  { label: 'Download ID', icon: Download, path: '/id-card', color: 'bg-teal-50 text-teal-600' },
                ].map(({ label, icon: Icon, path, color }) => (
                  <Link key={path} to={path} className={`flex flex-col items-center gap-2 p-4 ${color} rounded-xl hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-semibold text-center">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Study Materials */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-900">Study Materials</h2>
                <Link to="/study-material" className="text-blue-600 text-xs font-semibold">View All</Link>
              </div>
              {materials.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No materials available</p>
              ) : (
                <div className="space-y-3">
                  {materials.slice(0, 4).map(m => (
                    <div key={m._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{m.title}</div>
                        <div className="text-xs text-gray-400 capitalize">{m.category}</div>
                      </div>
                      {m.fileUrl && (
                        <a href={`${import.meta.env.VITE_API_URL}/uploads/${m.fileUrl}`} target="_blank" rel="noreferrer"
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Quizzes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-900">Available Quizzes</h2>
                <Link to="/quiz" className="text-blue-600 text-xs font-semibold">View All</Link>
              </div>
              {quizzes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No quizzes available</p>
              ) : (
                <div className="space-y-3">
                  {quizzes.slice(0, 3).map(q => (
                    <div key={q._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{q.title}</div>
                        <div className="text-xs text-gray-400">{q.questions?.length} questions • {q.duration} mins</div>
                      </div>
                      <Link to={`/quiz/${q._id}`} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors">
                        Start
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Attendance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">Attendance</h2>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={attendance >= 75 ? '#10b981' : '#ef4444'} strokeWidth="10"
                      strokeDasharray={`${attendance * 2.51} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-gray-900">{attendance}%</span>
                    <span className="text-xs text-gray-400">Present</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div className="text-center"><div className="font-bold text-gray-900">{user?.attendance || 0}</div><div className="text-gray-400 text-xs">Present</div></div>
                <div className="text-center"><div className="font-bold text-gray-900">{(user?.totalClasses || 0) - (user?.attendance || 0)}</div><div className="text-gray-400 text-xs">Absent</div></div>
                <div className="text-center"><div className="font-bold text-gray-900">{user?.totalClasses || 0}</div><div className="text-gray-400 text-xs">Total</div></div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="font-black text-gray-900">Notifications</h2>
              </div>
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n._id} className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-gray-800">{n.title}</div>
                        <div className="text-xs text-gray-500">{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Result Summary */}
            {result && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-black text-gray-900 mb-4">Latest Result</h2>
                <div className={`text-center p-4 rounded-xl ${result.status === 'Pass' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-3xl font-black ${result.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>{result.percentage}%</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Grade: {result.grade}</div>
                  <div className={`text-sm font-black mt-1 ${result.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>{result.status}</div>
                </div>
                <Link to="/result" className="block mt-3 text-center text-xs text-blue-600 font-semibold hover:underline">View Full Result</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
