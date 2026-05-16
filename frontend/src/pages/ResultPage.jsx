import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Award, CheckCircle, XCircle, Download, BookOpen, Calendar, User, Hash, GraduationCap, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

const gradeColor = {
  'A+': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'A':  'text-blue-600 bg-blue-50 border-blue-200',
  'B+': 'text-violet-600 bg-violet-50 border-violet-200',
  'B':  'text-indigo-600 bg-indigo-50 border-indigo-200',
  'C':  'text-orange-600 bg-orange-50 border-orange-200',
  'D':  'text-yellow-600 bg-yellow-50 border-yellow-200',
  'F':  'text-red-600 bg-red-50 border-red-200',
};

export default function ResultPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [year, setYear] = useState('');
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.courses || [])).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return toast.error('Please enter roll number');
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/results/roll/${rollNumber.trim()}`);
      setResult(data.result);
    } catch {
      setResult(null);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setRollNumber(''); setYear(''); setCourse('');
    setResult(null); setSearched(false);
  };

  const getImageBase64 = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = () => resolve(null);
      img.src = url + '?t=' + Date.now();
    });

  const handleDownload = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14;

    // circular logo
    let logoDataUrl = null;
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png';
      });
      const sz = 300;
      const cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
      const cx = cv.getContext('2d');
      cx.beginPath(); cx.arc(sz/2, sz/2, sz/2, 0, Math.PI*2); cx.closePath(); cx.clip();
      cx.drawImage(img, 0, 0, sz, sz);
      logoDataUrl = cv.toDataURL('image/png');
    } catch (_) {}

    // HEADER
    const HDR_H = 52;
    doc.setFillColor(15, 40, 110); doc.rect(0, 0, W, HDR_H, 'F');
    doc.setFillColor(250, 204, 21); doc.rect(0, HDR_H, W, 3, 'F');

    const LS = 36;
    if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', M, (HDR_H - LS) / 2, LS, LS);

    const TX = M + LS + 7;
    const TEXT_MAX_W = W - TX - M;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('KEERTI COMPUTER INSTITUTE', TX, 20, { maxWidth: TEXT_MAX_W });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 210, 255);
    doc.text('Govt. Recognised  |  Est. 2005  |  www.kci.org.in', TX, 29, { maxWidth: TEXT_MAX_W });
    doc.setFontSize(7.5); doc.setTextColor(200, 225, 255);
    doc.text('Excellence in Computer Education Since 2005', TX, 37, { maxWidth: TEXT_MAX_W });
    const PILL_W = 52;
    doc.setFillColor(250, 204, 21); doc.roundedRect(TX, 41, PILL_W, 9, 2, 2, 'F');
    doc.setTextColor(15, 40, 110); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
    doc.text('RESULT CARD', TX + PILL_W / 2, 47, { align: 'center' });

    // STUDENT INFO BOX
    const INFO_Y = HDR_H + 8;
    doc.setFillColor(245, 248, 255); doc.setDrawColor(210, 220, 245);
    doc.roundedRect(M, INFO_Y, W - M * 2, 50, 3, 3, 'FD');
    doc.setFillColor(15, 40, 110); doc.roundedRect(M, INFO_Y, 42, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('STUDENT DETAILS', M + 21, INFO_Y + 5.5, { align: 'center' });

    const LBL1 = M + 4, VAL1 = M + 32;
    const LBL2 = W / 2 + 2, VAL2 = W / 2 + 26;
    const VMAXL = W / 2 - VAL1 - 4;
    const VMAXR = W - M - VAL2 - 2;

    const infoRows = [
      ['Student Name', result.studentName || '—',                          'Roll No.',  result.rollNumber || '—'],
      ['Course',       result.courseName || result.course?.title || '—',   'Batch',     result.batch || '—'],
      ['Branch',       result.branchName || '—',                            'Exam Date', result.examDate ? new Date(result.examDate).toLocaleDateString('en-IN') : '—'],
      ['Father Name',  result.fatherName || '—',                            'Phone',     result.phone || '—'],
    ];
    infoRows.forEach(([l1, v1, l2, v2], i) => {
      const y = INFO_Y + 16 + i * 10;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 100, 160);
      doc.text(l1 + ' :', LBL1, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(15, 15, 15);
      doc.text(String(v1), VAL1, y, { maxWidth: VMAXL });
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 100, 160);
      doc.text(l2 + ' :', LBL2, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(15, 15, 15);
      doc.text(String(v2), VAL2, y, { maxWidth: VMAXR });
    });

    // SUBJECT TABLE
    const TABLE_Y = INFO_Y + 50 + 6;

    const subjectRows = (result.subjects || []).map((s, i) => [
      i + 1, s.name || '—', s.maxMarks ?? '—', s.obtainedMarks ?? '—',
      s.maxMarks ? ((s.obtainedMarks / s.maxMarks) * 100).toFixed(1) + '%' : '—',
      (s.obtainedMarks ?? 0) >= (s.maxMarks ?? 0) * 0.33 ? 'Pass' : 'Fail',
    ]);

    autoTable(doc, {
      startY: TABLE_Y,
      head: [['#', 'Subject Name', 'Max Marks', 'Obtained', 'Percentage', 'Status']],
      body: subjectRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 40, 110], textColor: [255,255,255], fontStyle: 'bold', fontSize: 9, cellPadding: { top:4, bottom:4, left:3, right:3 }, halign: 'center' },
      bodyStyles: { fontSize: 9, textColor: [20,20,20], cellPadding: { top:3.5, bottom:3.5, left:3, right:3 } },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left',   cellWidth: 70 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 24 },
        5: { halign: 'center', cellWidth: 22 },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = data.cell.raw;
          const isPass = val === 'Pass';
          doc.setFillColor(isPass ? 220 : 255, isPass ? 252 : 220, isPass ? 220 : 220);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(isPass ? 21 : 180, isPass ? 128 : 30, isPass ? 21 : 30);
          doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
          doc.text(val, data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2 + 1.5, { align: 'center' });
        }
      },
      margin: { left: M, right: M },
    });

    // SUMMARY BOX
    const SUM_Y = doc.lastAutoTable.finalY + 8;
    const SUM_H = 34;
    doc.setFillColor(15, 40, 110); doc.roundedRect(M, SUM_Y, W - M*2, SUM_H, 3, 3, 'F');
    doc.setFillColor(250, 204, 21); doc.roundedRect(M, SUM_Y, W - M*2, 2.5, 1, 1, 'F');
    const sumItems = [
      ['TOTAL MARKS', `${result.obtainedMarks ?? '—'} / ${result.totalMarks ?? '—'}`],
      ['PERCENTAGE',  result.percentage ? `${result.percentage}%` : '—'],
      ['GRADE',       result.grade || '—'],
      ['RESULT',      result.status || '—'],
    ];
    const CW = (W - M*2) / 4;
    sumItems.forEach(([lbl, val], i) => {
      const cx = M + i * CW + CW / 2;
      if (i > 0) { doc.setDrawColor(255,255,255); doc.setLineWidth(0.3); doc.line(M + i*CW, SUM_Y+5, M + i*CW, SUM_Y+SUM_H-5); }
      doc.setTextColor(160,195,255); doc.setFontSize(7); doc.setFont('helvetica','normal');
      doc.text(lbl, cx, SUM_Y + 13, { align: 'center' });
      const gold = lbl === 'GRADE' || lbl === 'RESULT';
      doc.setTextColor(gold ? 250 : 255, gold ? 204 : 255, gold ? 21 : 255);
      doc.setFontSize(14); doc.setFont('helvetica','bold');
      doc.text(String(val), cx, SUM_Y + 27, { align: 'center' });
    });

    // FOOTER
    const FTR_Y = SUM_Y + SUM_H + 14;
    doc.setDrawColor(160,160,160); doc.setLineWidth(0.4);
    doc.line(M, FTR_Y, M+55, FTR_Y);
    doc.line(W-M-55, FTR_Y, W-M, FTR_Y);
    doc.setTextColor(80,80,80); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text('Student Signature', M+27, FTR_Y+5, { align: 'center' });
    doc.text('Principal Signature', W-M-27, FTR_Y+5, { align: 'center' });
    if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', W/2-9, FTR_Y-12, 18, 18);
    doc.setTextColor(140,140,140); doc.setFontSize(6.5);
    doc.text('KCI Official Seal', W/2, FTR_Y+5, { align: 'center' });
    const BOT_Y = FTR_Y + 12;
    doc.setFillColor(240,244,255); doc.rect(0, BOT_Y, W, 11, 'F');
    doc.setTextColor(130,130,130); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}   |   Computer-generated document   |   KCI Official`, W/2, BOT_Y+7, { align: 'center', maxWidth: W - M*2 });

    doc.save(`Result_${result.rollNumber}.pdf`);
    toast.success('PDF downloaded!');
  };

  const isPass = result?.status === 'Pass';

  return (
    <div className="pt-16 min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-12 text-white text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-400/10 rounded-full translate-x-1/3 -translate-y-1/3" />
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white/5"
            style={{ width: 80 + i * 60, height: 80 + i * 60, left: `${20 + i * 25}%`, top: '30%' }}
            animate={{ y: [0, -15, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }} />
        ))}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" className="w-full" preserveAspectRatio="none">
            <path d="M0,25 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <Award className="w-4 h-4 text-yellow-400" /> KCI Result Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Check <span className="text-yellow-400">Result</span></h1>
          <p className="text-blue-200 mb-6">Enter your roll number to view your marksheet</p>
          <div className="flex justify-center gap-10">
            {[['10K+', 'Students'], ['25+', 'Courses'], ['18+', 'Years']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-xl font-black text-yellow-400">{v}</div>
                <div className="text-blue-300 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">

          {/* Search Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white">Search Your Result</h2>
                <p className="text-blue-200 text-xs">Enter details to find your marksheet</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="p-6 space-y-4">
              {/* Roll Number */}
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value.toUpperCase())}
                  placeholder="Roll Number (e.g. KCI20240001)"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 font-medium tracking-wide placeholder-gray-400" />
              </div>

              {/* Year + Course */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={year} onChange={e => setYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 appearance-none">
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={course} onChange={e => setCourse(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800 appearance-none">
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-base">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Searching...</>
                  : <><Search className="w-5 h-5" /> Search Result</>}
              </motion.button>

              {/* Quick fill */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Try:</span>
                {['KCI20240001', 'KCI20230001'].map(r => (
                  <button key={r} type="button" onClick={() => setRollNumber(r)}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-100">
                    {r}
                  </button>
                ))}
                {searched && (
                  <button type="button" onClick={handleReset}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-100 ml-auto">
                    Clear
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          {/* Result */}
          <AnimatePresence>
            {searched && !loading && (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
                {result ? (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* Result Header */}
                    <div className={`px-6 py-5 ${isPass ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                          {isPass
                            ? <CheckCircle className="w-8 h-8 text-white" />
                            : <XCircle className="w-8 h-8 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-white font-black text-xl">{result.studentName}</h2>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-white/80 text-sm flex items-center gap-1">
                              <Hash className="w-3.5 h-3.5" /> {result.rollNumber}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${isPass ? 'bg-white text-emerald-600' : 'bg-white text-red-600'}`}>
                              {result.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                          <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                          <div className="text-2xl font-black text-blue-700">{result.percentage}%</div>
                          <div className="text-gray-500 text-xs font-medium">Percentage</div>
                        </div>
                        <div className={`rounded-2xl p-4 text-center border ${gradeColor[result.grade] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          <Award className="w-5 h-5 mx-auto mb-1 opacity-70" />
                          <div className="text-2xl font-black">{result.grade}</div>
                          <div className="text-xs font-medium opacity-70">Grade</div>
                        </div>
                        <div className={`rounded-2xl p-4 text-center border ${isPass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                          <GraduationCap className={`w-5 h-5 mx-auto mb-1 ${isPass ? 'text-emerald-500' : 'text-red-500'}`} />
                          <div className={`text-2xl font-black ${isPass ? 'text-emerald-700' : 'text-red-700'}`}>{result.obtainedMarks}</div>
                          <div className="text-gray-500 text-xs font-medium">/ {result.totalMarks}</div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: BookOpen, label: 'Course', val: result.courseName || result.course?.title || '—' },
                          { icon: User, label: 'Batch', val: result.batch || '—' },
                          { icon: Calendar, label: 'Exam Date', val: result.examDate ? new Date(result.examDate).toLocaleDateString('en-IN') : '—' },
                          { icon: Hash, label: 'Roll No', val: result.rollNumber },
                        ].map(({ icon: Icon, label, val }) => (
                          <div key={label} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                            <Icon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                              <div className="text-gray-800 text-sm font-semibold truncate">{val}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Subjects Table */}
                      <div className="rounded-2xl overflow-hidden border border-gray-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                              <th className="text-left px-4 py-3 font-semibold">Subject</th>
                              <th className="text-center px-4 py-3 font-semibold">Max</th>
                              <th className="text-center px-4 py-3 font-semibold">Obtained</th>
                              <th className="text-center px-4 py-3 font-semibold">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.subjects?.map((s, i) => (
                              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                <td className="px-4 py-3 text-gray-700 font-medium">{s.name}</td>
                                <td className="px-4 py-3 text-center text-gray-500">{s.maxMarks}</td>
                                <td className="px-4 py-3 text-center font-bold text-blue-700">{s.obtainedMarks}</td>
                                <td className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                                  {s.maxMarks > 0 ? ((s.obtainedMarks / s.maxMarks) * 100).toFixed(0) + '%' : '—'}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 font-bold border-t-2 border-blue-200">
                              <td className="px-4 py-3 text-blue-800">Total</td>
                              <td className="px-4 py-3 text-center text-blue-700">{result.totalMarks}</td>
                              <td className="px-4 py-3 text-center text-blue-700">{result.obtainedMarks}</td>
                              <td className="px-4 py-3 text-center text-blue-700">{result.percentage}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Download */}
                      <motion.button onClick={handleDownload}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200">
                        <Download className="w-5 h-5" /> Download Marksheet PDF
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Result Found</h3>
                    <p className="text-gray-500 text-sm mb-4">No result found for <strong className="text-gray-700">"{rollNumber}"</strong></p>
                    <p className="text-xs text-gray-400">Please check your roll number or contact KCI Head Office</p>
                    <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                      📞 <strong>9936384736</strong> / <strong>9919660880</strong>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
