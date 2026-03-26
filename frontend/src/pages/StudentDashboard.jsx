import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Award, Phone, Mail, MapPin, Edit2, Save, X, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    api.get('/results/my').then(({ data }) => setResult(data.result)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'result', label: 'My Result', icon: Award },
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-blue-200">Roll No: {user?.rollNumber || 'Not assigned'}</p>
            <p className="text-blue-200 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', icon: User, editable: true },
                  { label: 'Email', value: user?.email, icon: Mail, editable: false },
                  { label: 'Phone', key: 'phone', icon: Phone, editable: true },
                  { label: 'Roll Number', value: user?.rollNumber || 'Not assigned', icon: BookOpen, editable: false },
                ].map(({ label, key, value, icon: Icon, editable }) => (
                  <div key={label} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                    {editing && editable ? (
                      <input
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{value || form[key] || '—'}</div>
                    )}
                  </div>
                ))}

                <div className="sm:col-span-2 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Address
                  </div>
                  {editing ? (
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      rows={2}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{user?.address || '—'}</div>
                  )}
                </div>
              </div>
            </div>


          </motion.div>
        )}

        {/* Result Tab */}
        {activeTab === 'result' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Result</h2>
            {result ? (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{result.percentage}%</div>
                    <div className="text-gray-500 text-xs mt-1">Percentage</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{result.grade}</div>
                    <div className="text-gray-500 text-xs mt-1">Grade</div>
                  </div>
                  <div className={`${result.status === 'Pass' ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-4 text-center`}>
                    <div className={`text-2xl font-bold ${result.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>{result.status}</div>
                    <div className="text-gray-500 text-xs mt-1">Status</div>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 space-y-1">
                  <p><strong>Course:</strong> {result.courseName || result.course?.title}</p>
                  {result.batch && <p><strong>Batch:</strong> {result.batch}</p>}
                  {result.examDate && <p><strong>Exam Date:</strong> {new Date(result.examDate).toLocaleDateString('en-IN')}</p>}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 rounded-l-lg font-semibold text-gray-700">Subject</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Max Marks</th>
                        <th className="text-center p-3 rounded-r-lg font-semibold text-gray-700">Obtained</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects?.map((s, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-700">{s.name}</td>
                          <td className="p-3 text-center text-gray-600">{s.maxMarks}</td>
                          <td className="p-3 text-center font-semibold text-blue-700">{s.obtainedMarks}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold">
                        <td className="p-3 text-gray-900">Total</td>
                        <td className="p-3 text-center text-gray-900">{result.totalMarks}</td>
                        <td className="p-3 text-center text-blue-700">{result.obtainedMarks}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Award className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                <p className="font-medium">Result not yet published</p>
                <p className="text-sm mt-1">Please check back later or contact your branch.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
