import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  GraduationCap, Award, FileText, LogOut, User,
  Building2, Phone, Mail, MapPin, Calendar, BookOpen, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const tabs = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'results', label: 'My Results', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: FileText },
];

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value || '—'}</span>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [data, setData] = useState({ student: null, results: [], certificates: [], branch: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { navigate('/login'); return; }
    setLoading(true);
    api.get('/branch/student/me')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load data'); setLoading(false); });
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/'); };

  const { student, results, certificates, branch } = data;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm leading-tight">Student Portal</div>
              <div className="text-xs text-blue-600 font-bold">{user?.rollNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.courseName || 'Student'}</div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h2 className="text-2xl font-black mb-1">{user?.name}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                <BookOpen className="w-3.5 h-3.5" /> {user?.courseName || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                <GraduationCap className="w-3.5 h-3.5" /> Roll: {user?.rollNumber}
              </span>
              {user?.batch && (
                <span className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1">
                  <Calendar className="w-3.5 h-3.5" /> Batch: {user?.batch}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Award, label: 'Results', value: results.length, color: 'bg-yellow-500' },
            { icon: FileText, label: 'Certificates', value: certificates.length, color: 'bg-teal-500' },
            { icon: CheckCircle, label: 'Status', value: user?.isActive ? 'Active' : 'Inactive', color: user?.isActive ? 'bg-green-500' : 'bg-red-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-black text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Personal Information
              </h3>
              <div className="space-y-1">
                <InfoRow label="Full Name" value={student?.name} />
                <InfoRow label="Email" value={student?.email} />
                <InfoRow label="Phone" value={student?.phone} />
                <InfoRow label="Father's Name" value={student?.fatherName} />
                <InfoRow label="Date of Birth" value={student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : null} />
                <InfoRow label="Address" value={student?.address} />
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-600" /> Academic Details
                </h3>
                <div className="space-y-1">
                  <InfoRow label="Roll Number" value={student?.rollNumber} />
                  <InfoRow label="Course" value={student?.courseName} />
                  <InfoRow label="Batch" value={student?.batch} />
                  <InfoRow label="Account Status" value={student?.isApproved ? '✅ Approved' : '⏳ Pending'} />
                </div>
              </div>

              {/* Branch Info */}
              {branch && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" /> My Branch
                  </h3>
                  <div className="space-y-1">
                    <InfoRow label="Branch Name" value={branch?.branchName} />
                    <InfoRow label="City" value={branch?.branchCity} />
                    <InfoRow label="Phone" value={branch?.phone} />
                    <InfoRow label="Email" value={branch?.email} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900">My Results ({results.length})</h2>
            {results.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400">No results published yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map(r => (
                  <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-black text-gray-900">{r.courseName}</h3>
                        <p className="text-sm text-gray-500">Roll No: {r.rollNumber} {r.batch ? `• Batch: ${r.batch}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-black ${r.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.status}
                        </span>
                        <div className="text-2xl font-black text-blue-600 mt-1">{r.grade}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-lg font-black text-gray-900">{r.obtainedMarks ?? '—'}</div>
                        <div className="text-xs text-gray-500">Obtained</div>
                      </div>
                      <div className="text-center border-x border-gray-200">
                        <div className="text-lg font-black text-gray-900">{r.totalMarks ?? '—'}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-blue-600">{r.percentage ? `${r.percentage}%` : '—'}</div>
                        <div className="text-xs text-gray-500">Percentage</div>
                      </div>
                    </div>
                    {r.subjects?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Subject-wise Marks</p>
                        <div className="space-y-2">
                          {r.subjects.map((sub, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{sub.name}</span>
                              <span className="font-bold text-gray-900">{sub.obtainedMarks}/{sub.maxMarks}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900">My Certificates ({certificates.length})</h2>
            {certificates.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400">No certificates issued yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {certificates.map(c => (
                  <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-black text-gray-900 mb-1">{c.courseName}</h3>
                      <p className="text-xs text-gray-500 mb-3">Certificate No: <span className="font-mono font-bold text-indigo-600">{c.certificateNumber}</span></p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Grade: <strong className="text-green-600">{c.grade || '—'}</strong></span>
                        <span>Issued: {c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN') : '—'}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Valid Certificate
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
