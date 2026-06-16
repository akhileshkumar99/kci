import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, CheckCircle, AlertCircle,
  Calendar, MapPin, Clock, BookOpen,
  Save, Bell, Send, FileText, RefreshCw,
  Plus, Trash2, ChevronDown,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EXAM_TYPES = ['Theory', 'Practical', 'Theory + Practical', 'Online', 'Viva'];
const EMPTY_ROW  = () => ({ course: '', examDate: '', reportingTime: '', examType: '' });

export default function AdminAdmitCard() {
  const [enabled,      setEnabled]      = useState(false);
  const [toggling,     setToggling]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [notifying,    setNotifying]    = useState(false);
  const [notifyResult, setNotifyResult] = useState(null);
  const [saved,        setSaved]        = useState(null);

  // dropdown data
  const [branches, setBranches] = useState([]);
  const [courses,  setCourses]  = useState([]);

  // form state
  const [examCenter,    setExamCenter]    = useState('');
  const [customCenter,  setCustomCenter]  = useState('');
  const [reportingTime, setReportingTime] = useState('9:00 AM');
  const [examType,      setExamType]      = useState('Theory');
  const [instructions,  setInstructions]  = useState('');
  const [rows,          setRows]          = useState([EMPTY_ROW()]);

  // ── Load all data ──
  useEffect(() => {
    Promise.all([
      api.get('/admit-card/setting'),
      api.get('/admit-card/schedule'),
      api.get('/admit-card/schedule/options'),
    ]).then(([settingR, scheduleR, optionsR]) => {
      setEnabled(settingR.data.enabled || false);
      setBranches(optionsR.data.branches || []);
      setCourses(optionsR.data.courses   || []);

      const s = scheduleR.data.schedule;
      if (s) {
        setSaved(s);
        setExamCenter(s.examCenter    || '');
        setReportingTime(s.reportingTime || '9:00 AM');
        setExamType(s.examType        || 'Theory');
        setInstructions(s.instructions || '');
        setRows(s.courseSchedules?.length ? s.courseSchedules.map(r => ({
          course:        r.course        || '',
          examDate:      r.examDate ? r.examDate.slice(0, 10) : '',
          reportingTime: r.reportingTime || '',
          examType:      r.examType      || '',
        })) : [EMPTY_ROW()]);
      }
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  // ── Toggle ──
  const toggle = async () => {
    setToggling(true);
    try {
      const v = !enabled;
      await api.post('/admit-card/toggle', { enabled: v });
      setEnabled(v);
      toast.success(`Admit Card ${v ? 'ENABLED' : 'DISABLED'} on Student Portal`);
    } catch { toast.error('Toggle failed'); }
    setToggling(false);
  };

  // ── Row helpers ──
  const updateRow = (i, field, value) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const addRow    = () => setRows(prev => [...prev, EMPTY_ROW()]);
  const removeRow = i  => setRows(prev => prev.filter((_, idx) => idx !== i));

  // The actual center used (custom overrides dropdown)
  const finalCenter = customCenter.trim() || examCenter;

  // ── Save ──
  const handleSave = async (e) => {
    e.preventDefault();
    const validRows = rows.filter(r => r.course && r.examDate);
    if (!validRows.length) return toast.error('Add at least one course with a date.');
    setSaving(true);
    try {
      const { data } = await api.post('/admit-card/schedule', {
        examCenter:    finalCenter,
        reportingTime, examType, instructions,
        courseSchedules: validRows.map(r => ({
          course:        r.course,
          examDate:      r.examDate,
          reportingTime: r.reportingTime || reportingTime,
          examType:      r.examType      || examType,
        })),
      });
      setSaved(data.schedule);
      toast.success('Exam schedule saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  // ── Notify ──
  const handleNotify = async () => {
    if (!saved) return toast.error('Save a schedule first.');
    if (!window.confirm('Send exam schedule emails to ALL approved students now?')) return;
    setNotifying(true); setNotifyResult(null);
    try {
      const { data } = await api.post('/admit-card/notify');
      setNotifyResult(data);
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Notification failed'); }
    setNotifying(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Admit Card & Exam Schedule</h1>
          <p className="text-sm text-gray-500">Set course-wise exam dates, exam center, and notify students via email</p>
        </div>
      </div>

      {/* ── Toggle ── */}
      <motion.div layout className={`rounded-2xl border-2 p-5 transition-all ${
        enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
              {enabled ? <Eye className="w-6 h-6 text-green-600" /> : <EyeOff className="w-6 h-6 text-gray-400" />}
            </div>
            <div>
              <p className="font-black text-gray-900">Admit Card Visibility</p>
              <div className="flex items-center gap-2 mt-0.5">
                {enabled
                  ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-semibold text-sm">Visible on Student Portal</span></>
                  : <><AlertCircle className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-400 font-semibold text-sm">Hidden from Student Portal</span></>
                }
              </div>
            </div>
          </div>
          <button onClick={toggle} disabled={toggling}
            className={`relative w-14 h-7 rounded-full transition-all focus:outline-none disabled:opacity-60 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
            <motion.div animate={{ x: enabled ? 28 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md" />
          </button>
        </div>
      </motion.div>

      {/* ── Schedule Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white" />
          <h2 className="text-white font-black">Set Exam Schedule</h2>
          {saved && (
            <span className="ml-auto text-xs bg-white/20 text-white px-3 py-1 rounded-full">
              Last saved: {new Date(saved.updatedAt).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">

          {/* ── Global Settings Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Exam Center — Branch Selector */}
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Exam Center
              </label>
              <div className="relative">
                <select value={examCenter} onChange={e => { setExamCenter(e.target.value); setCustomCenter(''); }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-9">
                  <option value="">-- Select Branch --</option>
                  {branches.map(b => (
                    <option key={b._id} value={`${b.name}, ${b.city}`}>{b.name} — {b.city}</option>
                  ))}
                  <option value="__custom__">+ Type Custom Center</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              {(examCenter === '__custom__' || customCenter) && (
                <input type="text" placeholder="Type exam center name" value={customCenter}
                  onChange={e => setCustomCenter(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 border border-blue-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
              )}
            </div>

            {/* Default Reporting Time */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Default Reporting Time
              </label>
              <input type="text" placeholder="e.g. 9:00 AM" value={reportingTime}
                onChange={e => setReportingTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50" />
            </div>

            {/* Default Exam Type */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Default Exam Type
              </label>
              <div className="relative">
                <select value={examType} onChange={e => setExamType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-9">
                  {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Course-wise Schedule Rows ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Course-wise Exam Dates
              </label>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all border border-indigo-200">
                <Plus className="w-3.5 h-3.5" /> Add Course Row
              </button>
            </div>

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 mb-1 px-1">
              <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Course</div>
              <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Exam Date</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Time (override)</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Type (override)</div>
              <div className="col-span-1" />
            </div>

            <AnimatePresence>
              {rows.map((row, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-12 gap-2 mb-2 items-center">

                  {/* Course selector */}
                  <div className="col-span-12 sm:col-span-4 relative">
                    <select value={row.course} onChange={e => updateRow(i, 'course', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-8">
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c._id} value={c.title}>{c.title}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>

                  {/* Exam Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <input type="date" value={row.examDate} onChange={e => updateRow(i, 'examDate', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50" />
                  </div>

                  {/* Reporting Time override */}
                  <div className="col-span-3 sm:col-span-2">
                    <input type="text" placeholder={reportingTime} value={row.reportingTime}
                      onChange={e => updateRow(i, 'reportingTime', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50" />
                  </div>

                  {/* Exam Type override */}
                  <div className="col-span-2 sm:col-span-2 relative">
                    <select value={row.examType} onChange={e => updateRow(i, 'examType', e.target.value)}
                      className="w-full px-2 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-6">
                      <option value="">Default</option>
                      {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-3 pointer-events-none" />
                  </div>

                  {/* Delete row */}
                  <div className="col-span-1 flex justify-center">
                    {rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(i)}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <p className="text-[10px] text-gray-400 mt-1">
              Time and Type columns are optional — leave blank to use the defaults above.
            </p>
          </div>

          {/* ── Instructions ── */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Bell className="w-3.5 h-3.5 text-blue-500" /> Special Instructions (included in email)
            </label>
            <textarea rows={3} placeholder="e.g. Bring original ID proof. No electronic devices allowed." value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 resize-none" />
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-60">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </form>
      </div>

      {/* ── Send Email Notification ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
          <Send className="w-5 h-5 text-white" />
          <h2 className="text-white font-black">Send Email Notification to All Students</h2>
        </div>

        <div className="p-6">
          {/* Saved schedule preview */}
          {saved?.courseSchedules?.length > 0 ? (
            <div className="mb-5 overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Course', 'Exam Date', 'Time', 'Type'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {saved.courseSchedules.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{r.course || '-'}</td>
                      <td className="px-4 py-2.5 text-blue-700 font-bold">
                        {r.examDate ? new Date(r.examDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{r.reportingTime || saved.reportingTime || '-'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.examType || saved.examType || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">
                Center: <strong>{saved.examCenter || '-'}</strong>
              </p>
            </div>
          ) : (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-semibold">
              No schedule saved yet. Save course-wise schedule above before sending notifications.
            </div>
          )}

          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
            <Bell className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Each student receives an email with their <strong>course-specific exam date</strong>, center, time, and type. Students without a matching course row receive the default schedule.
            </p>
          </div>

          <button onClick={handleNotify} disabled={notifying || !saved}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50">
            {notifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {notifying ? 'Sending Emails...' : 'Send Email to All Students'}
          </button>

          {notifyResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl border text-sm font-semibold ${
                notifyResult.sentCount > 0
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" /> {notifyResult.message}
              </div>
              <div className="text-xs text-gray-500">
                Sent: {notifyResult.sentCount} / Total: {notifyResult.totalStudents}
                {notifyResult.errors?.length > 0 && ` | ${notifyResult.errors.length} failed`}
              </div>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}
