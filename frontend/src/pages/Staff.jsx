import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Building2, Search, Users, Star, Award, Laptop, Wrench, Smartphone } from 'lucide-react';
import api from '../utils/api';
import SectionTitle from '../components/SectionTitle';

const deptConfig = {
  'Management':                                      { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   grad: 'from-blue-600 to-indigo-700',   Icon: Users },
  'Software Department':                             { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200',  grad: 'from-emerald-600 to-teal-700',  Icon: Laptop },
  'Hardware Department & English Spoken':            { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', grad: 'from-amber-600 to-orange-700', Icon: Wrench },
  'Mobile Eng. & Software & Hardware Department':    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', grad: 'from-purple-600 to-violet-700', Icon: Smartphone },
};

const getDept = (dept) => deptConfig[dept] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', grad: 'from-slate-600 to-slate-800', Icon: User };

const avatarColors = [
  'from-blue-600 to-indigo-700', 'from-violet-600 to-purple-700', 'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700', 'from-pink-600 to-rose-700', 'from-cyan-600 to-blue-700',
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
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-4 text-amber-300 shadow-md">
            <Users className="w-4 h-4 text-amber-400" /> KCI Experienced Faculty & Staff
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
            Our <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">Faculty & Team</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Meet the experienced educators and technical specialists behind Keerti Computer Institute
          </p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="FACULTY" title="Staff Directory" subtitle="Our experienced faculty and management team" />

          {/* Controls Bar */}
          <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-5 mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by staff name or designation..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs sm:text-sm font-medium" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setView('grid')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${view === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
                  Grid View
                </button>
                <button onClick={() => setView('table')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${view === 'table' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>
                  Table View
                </button>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex gap-2 flex-wrap">
              {depts.map(dept => {
                const d = dept === 'All' ? null : getDept(dept);
                return (
                  <button key={dept} onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedDept === dept
                        ? dept === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : `bg-gradient-to-r ${d.grad} text-white border-transparent shadow-md`
                        : 'bg-slate-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}>
                    {dept === 'All' ? 'All Departments' : dept}
                    <span className="ml-1 opacity-80 font-extrabold">
                      ({dept === 'All' ? staff.length : staff.filter(s => s.department === dept).length})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-6">
            Showing <strong className="text-gray-900 font-bold">{filtered.length}</strong> staff member{filtered.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : view === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((member, i) => {
                const dept = getDept(member.department);
                const DeptIcon = dept.Icon;
                const isHead = member.designation && (member.designation.toLowerCase().includes('head') || member.designation?.toLowerCase().includes('director'));
                return (
                  <motion.div key={member._id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 8) * 0.06 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col"
                  >
                    <div className={`bg-gradient-to-br ${dept.grad} p-5 relative overflow-hidden text-white`}>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
                      {isHead && (
                        <div className="absolute top-2 right-2">
                          <span className="flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            <Star className="w-3 h-3 fill-slate-950" /> HOD
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-md mb-3 overflow-hidden`}>
                          {member.photo
                            ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                            : <span className="text-white font-black text-2xl">{member.name.charAt(0)}</span>
                          }
                        </div>
                        <div className="text-white font-black text-sm text-center leading-tight group-hover:text-amber-200 transition-colors">
                          {member.name}
                        </div>
                        {member.designation && (
                          <div className="text-white/80 text-[11px] font-medium mt-0.5 text-center">{member.designation}</div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className={`flex items-center gap-2 px-3 py-1.5 ${dept.bg} rounded-xl border ${dept.border}`}>
                        <DeptIcon className={`w-3.5 h-3.5 ${dept.text} shrink-0`} />
                        <span className={`text-[11px] font-bold ${dept.text} truncate`}>{member.department}</span>
                      </div>
                      {member.phone ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${member.phone.split(',')[0].trim()}`}
                            className="text-xs font-bold text-gray-700 hover:text-emerald-700 transition-colors font-mono truncate">
                            {member.phone}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                          <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          <span className="text-xs text-gray-400 font-medium">Contact unavailable</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-slate-950 text-white">
                    <th className="text-left px-5 py-4 font-bold w-10">#</th>
                    <th className="text-left px-5 py-4 font-bold">Staff Member</th>
                    <th className="text-left px-5 py-4 font-bold hidden sm:table-cell">Department</th>
                    <th className="text-left px-5 py-4 font-bold">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, i) => {
                    const dept = getDept(member.department);
                    const DeptIcon = dept.Icon;
                    return (
                      <tr key={member._id} className="border-t border-gray-100 hover:bg-blue-50/40 transition-colors">
                        <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-xs text-white font-black text-xs overflow-hidden">
                              {member.photo
                                ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                : member.name.charAt(0)
                              }
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xs sm:text-sm">{member.name}</div>
                              {member.designation && <div className="text-blue-600 text-[11px] font-medium">{member.designation}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${dept.bg} ${dept.text} border ${dept.border}`}>
                            <DeptIcon className="w-3.5 h-3.5" /> {member.department}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {member.phone
                            ? <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <a href={`tel:${member.phone.split(',')[0].trim()}`}
                                  className="font-mono text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors">{member.phone}</a>
                              </div>
                            : <span className="text-gray-400 text-xs">—</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
