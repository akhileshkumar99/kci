import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Building2, Search, Users, Star, Award } from 'lucide-react';
import api from '../utils/api';
import SectionTitle from '../components/SectionTitle';

const deptConfig = {
  'Management':                                      { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   grad: 'from-blue-500 to-blue-600',   icon: '👔' },
  'Software Department':                             { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  grad: 'from-green-500 to-green-600',  icon: '💻' },
  'Hardware Department & English Spoken':            { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', grad: 'from-orange-500 to-orange-600', icon: '🔧' },
  'Mobile Eng. & Software & Hardware Department':    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', grad: 'from-purple-500 to-purple-600', icon: '📱' },
};

const getDept = (dept) => deptConfig[dept] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', grad: 'from-gray-500 to-gray-600', icon: '👤' };

const avatarColors = [
  'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-emerald-400 to-emerald-600',
  'from-orange-400 to-orange-600', 'from-pink-400 to-pink-600', 'from-teal-400 to-teal-600',
  'from-indigo-400 to-indigo-600', 'from-rose-400 to-rose-600', 'from-cyan-400 to-cyan-600',
];

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [view, setView] = useState('grid'); // grid | table

  useEffect(() => {
    api.get('/staff').then(({ data }) => setStaff(data.staff)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const depts = ['All', ...Array.from(new Set(staff.map(s => s.department))).filter(Boolean)];

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || (s.department || '').toLowerCase().includes(q) || (s.designation || '').toLowerCase().includes(q))
      && (selectedDept === 'All' || s.department === selectedDept);
  });

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-10 text-white text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-400/10 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <Users className="w-4 h-4 text-yellow-400" /> KCI Team
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Staff <span className="text-yellow-400">Details</span></h1>
          <p className="text-blue-200">Meet our dedicated team at Keerti Computer Institute</p>
          <div className="flex justify-center gap-10 mt-5">
            {[['13+', 'Staff Members'], ['4', 'Departments'], ['18+', 'Years Experience']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-yellow-400">{val}</div>
                <div className="text-blue-200 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Staff List — Head Office" subtitle="Our experienced faculty and management team" />

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, department..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm" />
              </div>
              {/* View toggle */}
              <div className="flex gap-2">
                <button onClick={() => setView('grid')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Grid
                </button>
                <button onClick={() => setView('table')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === 'table' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Table
                </button>
              </div>
            </div>
            {/* Dept filters */}
            <div className="flex gap-2 flex-wrap">
              {depts.map(dept => {
                const d = dept === 'All' ? null : getDept(dept);
                return (
                  <button key={dept} onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      selectedDept === dept
                        ? dept === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : `bg-gradient-to-r ${d.grad} text-white border-transparent shadow-md`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}>
                    {dept === 'All' ? 'All Departments' : `${getDept(dept).icon} ${dept}`}
                    <span className="ml-1 opacity-70">
                      ({dept === 'All' ? staff.length : staff.filter(s => s.department === dept).length})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count */}
          <p className="text-gray-500 text-sm mb-5">
            Showing <span className="font-bold text-gray-800">{filtered.length}</span> staff member{filtered.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : view === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((member, i) => {
                const dept = getDept(member.department);
                const isHead = member.designation && member.designation.toLowerCase().includes('head') || member.designation?.toLowerCase().includes('director');
                return (
                  <motion.div key={member._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 8) * 0.07 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                  >
                    {/* Card top */}
                    <div className={`bg-gradient-to-br ${dept.grad} p-5 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
                      {isHead && (
                        <div className="absolute top-2 right-2">
                          <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5 fill-yellow-900" /> HOD
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center shadow-lg mb-3 ring-2 ring-white/30`}>
                          {member.photo
                            ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                            : <span className="text-white font-black text-2xl">{member.name.charAt(0)}</span>
                          }
                        </div>
                        <div className="text-white font-black text-sm text-center leading-tight group-hover:text-yellow-100 transition-colors">
                          {member.name}
                        </div>
                        {member.designation && (
                          <div className="text-white/70 text-[10px] mt-0.5 text-center">{member.designation}</div>
                        )}
                      </div>
                    </div>

                    {/* Card bottom */}
                    <div className="p-4 space-y-2.5">
                      <div className={`flex items-center gap-2 px-3 py-1.5 ${dept.bg} rounded-xl`}>
                        <span className="text-sm">{dept.icon}</span>
                        <span className={`text-xs font-semibold ${dept.text} truncate`}>{member.department}</span>
                      </div>
                      {member.phone ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl">
                          <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <a href={`tel:${member.phone.split(',')[0].trim()}`}
                            className="text-xs text-gray-700 hover:text-green-600 transition-colors font-mono truncate">
                            {member.phone}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                          <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          <span className="text-xs text-gray-300">Not available</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
                    <th className="text-left px-5 py-4 font-semibold w-10">#</th>
                    <th className="text-left px-5 py-4 font-semibold">Staff Name</th>
                    <th className="text-left px-5 py-4 font-semibold hidden sm:table-cell">Department</th>
                    <th className="text-left px-5 py-4 font-semibold">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, i) => {
                    const dept = getDept(member.department);
                    return (
                      <motion.tr key={member._id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                        className={`border-t border-gray-100 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                      >
                        <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center shrink-0 shadow-sm`}>
                              {member.photo
                                ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover rounded-xl" />
                                : <span className="text-white font-black text-sm">{member.name.charAt(0)}</span>
                              }
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{member.name}</div>
                              {member.designation && <div className="text-blue-600 text-xs">{member.designation}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${dept.bg} ${dept.text}`}>
                            <span>{dept.icon}</span>{member.department}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {member.phone
                            ? <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                <a href={`tel:${member.phone.split(',')[0].trim()}`}
                                  className="font-mono text-xs text-gray-700 hover:text-blue-600 transition-colors">{member.phone}</a>
                              </div>
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-t border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                  <Award className="w-4 h-4" /> Total Staff: {filtered.length}
                </div>
                <div className="text-blue-400 text-xs">Head Office — KCI</div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
