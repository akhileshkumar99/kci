import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, CheckCircle, AlertCircle,
  Calendar, MapPin, Clock, BookOpen,
  Save, Bell, Send, FileText, RefreshCw,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { examDate: '', examCenter: '', reportingTime: '9:00 AM', examType: 'Theory', instructions: '' };

export default function AdminAdmitCard() {
  const [enabled,   setEnabled]   = useState(false);
  const [schedule,  setSchedule]  = useState(EMPTY);
  const [saved,     setSaved]     = useState(null);   // last saved schedule from DB
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toggling,  setToggling]  = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState(null);

  // ── Load settings ──
  useEffect(() => {
    Promise.all([
      api.get('/admit-card/setting'),
      api.get('/admit-card/schedule'),
    ]).then(([settingRes, scheduleRes]) => {
      setEnabled(settingRes.data.enabled || false);
      if (scheduleRes.data.schedule) {
        const s = scheduleRes.data.schedule;
        setSchedule({
          examDate:      s.examDate ? s.examDate.slice(0, 10) : '',
          examCenter:    s.examCenter    || '',
          reportingTime: s.reportingTime || '9:00 AM',
          examType:      s.examType      || 'Theory',
          instructions:  s.instructions  || '',
        });
        setSaved(s);
      }
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  // ── Toggle visibility ──
  const toggle = async () => {
    setToggling(true);
    try {
      const newVal = !enabled;
      await api.post('/admit-card/toggle', { enabled: newVal });
      setEnabled(newVal);
      toast.success(`Admit Card ${newVal ? 'ENABLED' : 'DISABLED'} on Student Portal`);
    } catch { toast.error('Failed to update'); }
    setToggling(false);
  };

  // ── Save schedule ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!schedule.examDate) return toast.error('Exam date is required');
    setSaving(true);
    try {
      const { data } = await api.post('/admit-card/schedule', schedule);
      setSaved(data.schedule);
      toast.success('Exam schedule saved successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  // ── Send email notification ──
  const handleNotify = async () => {
    if (!saved) return toast.error('Save a schedule first before sending notifications.');
    if (!window.confirm('Send exam schedule email to ALL approved students?\n\nThis will send emails immediately.')) return;
    setNotifying(true);
    setNotifyResult(null);
    try {
      const { data } = await api.post('/admit-card/notify');
      setNotifyResult(data);
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Notification failed'); }
    setNotifying(false);
  };

  const examDateDisplay = saved?.examDate
    ? new Date(saved.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Admit Card & Exam Schedule</h1>
          <p className="text-sm text-gray-500">Set exam date, schedule, and notify all students via email</p>
        </div>
      </div>

      {/* ── Toggle Card ── */}
      <motion.div layout className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
        enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              enabled ? 'bg-green-100' : 'bg-gray-200'
            }`}>
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
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-60 ${
              enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}>
            <motion.div
              animate={{ x: enabled ? 28 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </button>
        </div>
      </motion.div>

      {/* ── Exam Schedule Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white" />
          <h2 className="text-white font-black">Set Exam Schedule</h2>
          {saved && (
            <span className="ml-auto text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
              Last saved: {examDateDisplay}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Exam Date */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Exam Date *
              </label>
              <input type="date" required value={schedule.examDate}
                onChange={e => setSchedule(p => ({ ...p, examDate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all" />
            </div>

            {/* Reporting Time */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Reporting Time
              </label>
              <input type="text" placeholder="e.g. 9:00 AM" value={schedule.reportingTime}
                onChange={e => setSchedule(p => ({ ...p, reportingTime: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all" />
            </div>

            {/* Exam Center */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Exam Center
              </label>
              <input type="text" placeholder="e.g. KCI Main Center, Ayodhya" value={schedule.examCenter}
                onChange={e => setSchedule(p => ({ ...p, examCenter: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all" />
            </div>

            {/* Exam Type */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Exam Type
              </label>
              <select value={schedule.examType}
                onChange={e => setSchedule(p => ({ ...p, examType: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all">
                {['Theory', 'Practical', 'Theory + Practical', 'Online', 'Viva'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Bell className="w-3.5 h-3.5 text-blue-500" /> Special Instructions (optional)
            </label>
            <textarea rows={3} placeholder="Add any special instructions for students..." value={schedule.instructions}
              onChange={e => setSchedule(p => ({ ...p, instructions: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all resize-none" />
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-60">
            {saving
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </form>
      </div>

      {/* ── Send Email Notification ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
          <Send className="w-5 h-5 text-white" />
          <h2 className="text-white font-black">Send Email Notification</h2>
        </div>

        <div className="p-6">
          {/* Schedule preview */}
          {saved ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { icon: Calendar, label: 'Exam Date',   value: examDateDisplay },
                { icon: MapPin,   label: 'Center',      value: saved.examCenter   || '-' },
                { icon: Clock,    label: 'Report Time', value: saved.reportingTime || '-' },
                { icon: BookOpen, label: 'Type',        value: saved.examType     || '-' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">{label}</span>
                  </div>
                  <div className="text-sm font-black text-blue-900">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-semibold">
              No schedule saved yet. Save an exam schedule above before sending notifications.
            </div>
          )}

          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
            <Bell className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              This will send a professional exam schedule email to <strong>all approved students</strong> with their roll number, course, and exam details. Emails are sent via Gmail.
            </p>
          </div>

          <button onClick={handleNotify} disabled={notifying || !saved}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50">
            {notifying
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />}
            {notifying ? 'Sending Emails...' : 'Send Email to All Students'}
          </button>

          {/* Result */}
          {notifyResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl border text-sm font-semibold ${
                notifyResult.sentCount > 0
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                {notifyResult.message}
              </div>
              <div className="text-xs text-gray-500">
                Sent: {notifyResult.sentCount} / Total: {notifyResult.totalStudents}
                {notifyResult.errors?.length > 0 && ` | ${notifyResult.errors.length} failed`}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Info Box ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-2">
        <p className="font-bold text-blue-800 text-sm">How it works:</p>
        <ul className="text-sm text-blue-700 space-y-1.5">
          {[
            'Set the exam date, center, reporting time and type above.',
            'Click "Save Schedule" — this updates all student admit cards immediately.',
            'Enable the toggle to make Admit Card tab visible on Student Portal.',
            'Click "Send Email to All Students" to send exam schedule notification emails.',
            'Students see exam details on their Admit Card in the Student Portal.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400 font-bold mt-0.5">{i + 1}.</span> {t}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
