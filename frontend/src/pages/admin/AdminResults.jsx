import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Save, Pencil, User, Upload } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const COURSES = [
  'Certificate In Fundamental (CIF)',
  'Certificate in Computer Application (CCA)',
  'Certificate In Office Package & Tally A/C (COPT)',
  'Tally Specialist Course With GST',
  'Advance Diploma in Computer Application (ADCA)',
  'Desktop Publishing (DTP)',
  'Computer Teacher Training Course',
  'I.G.D. Bombay',
  'Certificate In Computer Hardware (CICH)',
  'JAVA, VB.net, ASP.net, PHP',
  'Computer Typing (Hindi + English)',
  'C, C++ Programming',
  'Internet Course',
  'Diploma in Computer Application (DCA)',
  'Certificate In Tally A/c With GST (CIT)',
  'Personality Development',
  'Diploma in Yoga Education (DYEd./DYT)',
  'PG Diploma In Yoga Education (PGDYEd.)',
  'Multimedia Animation Course (N-Mass)',
  'BCA / BBA / MCA / MBA / PGDCA & More',
  'Course On Computer Concept (CCC from NIELIT)',
];

const SUBJECTS = [
  'Computer Competency', 'MS DOS', 'Windows XP/07/10', 'MS Word 2007/2010', 'MS Excel 2007/2010',
  'MS PowerPoint 2007/2010', 'MS Access 2007/2010', 'Information Technology', 'I/O System',
  'Storage Technology', 'Basic of Multimedia', 'Printing Technology', 'Kundli', 'Hardware Concept',
  'Internet', 'Tally Prime With GST', 'GST Filing', 'Accounting Basics', 'Payroll Management',
  'Inventory Management', 'Banking & Finance', 'Web Technology', 'Networking Concept', 'PageMaker',
  'Corel Draw', 'Photoshop', 'C Language', 'Python Programming', 'HTML', 'JavaScript', 'VB Script',
  'Project', 'Graphic Design Fundamentals', 'Industrial Design', 'Print Media', 'Digital Design',
  'Fundamental of Computer Hardware', 'Basic Electronic & Maintenance', 'Number System',
  'Architecture & Operating System', 'Computer Peripheral & Device', 'Computer Assembling',
  'Hard Disk Partition', 'Software Installation', 'Keyboard Repairing', 'Mouse Repairing',
  'Printer Installation', 'Troubleshooting', 'Java Programming', 'VB.net', 'ASP.net', 'PHP',
  'Web Development', 'Hindi Typing', 'English Typing', 'Speed Building', 'Accuracy Practice',
  'C Language Basics', 'Control Structures', 'Functions & Arrays', 'Pointers', 'C++ OOP Concepts',
  'Classes & Objects', 'Inheritance', 'Internet Basics', 'Web Browsing', 'Email', 'Online Services',
  'Social Media', 'Online Safety', 'Communication Skills', 'Confidence Building',
  'Interview Preparation', 'Soft Skills', 'Leadership', 'Yoga Philosophy', 'Asanas & Pranayama',
  'Meditation', 'Anatomy', 'Teaching Methodology', 'Practical Training', '2D Animation',
  '3D Animation', 'Video Editing', 'VFX Basics', 'Multimedia Production', 'Operating System',
  'Elements of Word Processing', 'Spread Sheet', 'Introduction to Internet & Web Browser',
  'Communication & Collaboration', 'Applications of Presentation', 'Applications of Digital Financial Service',
  'Computer Fundamentals', 'MS Office', 'MS Office Suite',
];

const emptySubject = { name: '', maxMarks: '', obtainedMarks: '' };
const emptyForm = { rollNumber: '', studentName: '', courseName: '', batch: '', examDate: '', subjects: [{ ...emptySubject }] };

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const studentNames = [...new Set(results.map(r => r.studentName).filter(Boolean))];

  useEffect(() => { fetchResults(); }, []);
  const fetchResults = async () => {
    try {
      const { data } = await api.get('/results');
      setResults(data.results);
      const nums = data.results.map(r => parseInt(r.rollNumber?.replace(/\D/g, '')) || 0);
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      setForm(f => ({ ...f, rollNumber: `KCI${new Date().getFullYear()}${String(next).padStart(4, '0')}` }));
    } catch {}
    setLoading(false);
  };

  const addSubject = () => setForm(f => ({ ...f, subjects: [...f.subjects, { ...emptySubject }] }));
  const removeSubject = (i) => setForm(f => ({ ...f, subjects: f.subjects.filter((_, idx) => idx !== i) }));
  const updateSubject = (i, field, val) => setForm(f => ({ ...f, subjects: f.subjects.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.rollNumber || !form.studentName) return toast.error('Fill required fields');
    setSaving(true);
    try {
      await api.post('/results', form);
      toast.success('Result added');
      setModal(false);
      fetchResults();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const openEdit = (r) => { setEditing(r); setEditName(r.studentName); setEditFile(null); setEditModal(true); };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return toast.error('Student name required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('studentName', editName);
      if (editFile) fd.append('resultFile', editFile);
      await api.put(`/results/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Result updated');
      setEditModal(false);
      fetchResults();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return;
    try { await api.delete(`/results/${id}`); toast.success('Deleted'); fetchResults(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <button onClick={() => { 
          const nums = results.map(r => parseInt(r.rollNumber?.replace(/\D/g, '')) || 0);
          const next = (nums.length ? Math.max(...nums) : 0) + 1;
          const autoRoll = `KCI${new Date().getFullYear()}${String(next).padStart(4, '0')}`;
          setForm({ ...emptyForm, rollNumber: autoRoll }); 
          setModal(true); 
        }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Result
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>{['Roll No.', 'Student', 'Course', 'Percentage', 'Grade', 'Status', 'Actions'].map(h => <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>)}</tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-blue-700">{r.rollNumber}</td>
                  <td className="p-4 font-medium text-gray-900">{r.studentName}</td>
                  <td className="p-4 text-gray-600">{r.courseName || r.course?.title}</td>
                  <td className="p-4 font-semibold text-blue-700">{r.percentage}%</td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold">{r.grade}</span></td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.status === 'Pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span></td>
                  <td className="p-4 flex items-center gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No results yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Edit Result</h2>
              <button onClick={() => setEditModal(false)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="relative">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><User className="w-3.5 h-3.5" /> Student Name *</label>
                <input
                  value={editName}
                  onChange={e => { setEditName(e.target.value); setNameSearch(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search or type student name"
                  autoComplete="off"
                />
                {showSuggestions && (() => {
                  const filtered = studentNames.filter(n => n.toLowerCase().includes(editName.toLowerCase()) && n !== editName);
                  return filtered.length > 0 ? (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {filtered.map(n => (
                        <li key={n} onMouseDown={() => { setEditName(n); setShowSuggestions(false); }}
                          className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{n}</li>
                      ))}
                    </ul>
                  ) : null;
                })()}
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Upload className="w-3.5 h-3.5" /> Result File (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setEditFile(e.target.files[0])} />
                  {editFile ? <span className="text-sm text-blue-600 font-medium px-4 text-center truncate max-w-full">{editFile.name}</span> : <><Upload className="w-5 h-5 text-gray-400 mb-1" /><span className="text-xs text-gray-400">Click to upload PDF / Image</span></>}
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Updating...' : 'Update Result'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Add Result</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Roll Number *</label>
                  <input value={form.rollNumber} readOnly className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-xl text-sm font-mono text-blue-700 font-semibold cursor-not-allowed" />
                </div>
                {[['studentName', 'Student Name *'], ['batch', 'Batch']].map(([name, label]) => (
                  <div key={name}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                    <input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Course Name</label>
                  <select value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">-- Select Course --</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Exam Date</label>
                  <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Subjects</label>
                  <button type="button" onClick={addSubject} className="text-xs text-blue-600 hover:underline">+ Add Subject</button>
                </div>
                {form.subjects.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={s.name} onChange={(e) => updateSubject(i, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">-- Subject --</option>
                      {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                    <input placeholder="Max" type="number" value={s.maxMarks} onChange={(e) => updateSubject(i, 'maxMarks', e.target.value)} className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input placeholder="Got" type="number" value={s.obtainedMarks} onChange={(e) => updateSubject(i, 'obtainedMarks', e.target.value)} className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {form.subjects.length > 1 && <button type="button" onClick={() => removeSubject(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Result'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
