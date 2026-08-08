import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { generateStudyMaterialPDF } from '../utils/generateStudyMaterialPDF';
import {
  GraduationCap, Award, FileText, LogOut, User, Lock, BookMarked,
  Building2, Calendar, BookOpen, CheckCircle, CreditCard, Download, TrendingUp, ClipboardCheck, Clock, ChevronRight, Eye, KeyRound, QrCode,
  Mail, Phone, Users, MapPin, BadgeCheck, Hash, Layers, ShieldCheck, CalendarDays, MapPinned, Bell, XCircle, Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DevCredit from '../components/DevCredit';
import AdmitCardComponent from '../components/AdmitCard';

const ALL_TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'idcard', label: 'ID Card', icon: CreditCard },
  { id: 'admitcard', label: 'Admit Card', icon: FileText },
  { id: 'results', label: 'My Results', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'studymaterial', label: 'Study Material', icon: BookMarked },
  { id: 'tests', label: 'Monthly Tests', icon: ClipboardCheck },
  { id: 'changepassword', label: 'Change Password', icon: Lock },
  { id: 'examform', label: 'Exam Form', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value || '-'}</span>
    </div>
  );
}

// â‚¬â‚¬â‚¬ Grade color helper â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬
function CardInner({ W, H, student, branch, fields, qrDataUrl }) {
  const scale = W / 856;
  const s = (n) => Math.round(n * scale);
  const HDR  = s(130);
  const FOOT = s(72);
  return (
    <div style={{
      width: W,
      fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
      border: s(3) + 'px solid #d4af37',
      borderRadius: s(18),
      overflow: 'hidden',
      background: '#f8f9fc',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* HEADER */}
      <div style={{ background: '#081d5b', display: 'flex', alignItems: 'center', padding: s(14) + 'px ' + s(20) + 'px', gap: s(14), flexShrink: 0, borderBottom: s(3) + 'px solid #d4af37' }}>
        <div style={{ width: s(72), height: s(72), borderRadius: '50%', background: 'transparent', border: s(2) + 'px solid #d4af37', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="KCI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <div style={{ color: '#ffffff', fontWeight: 900, fontSize: s(24), letterSpacing: 1, lineHeight: 1.2 }}>KEERTI COMPUTER INSTITUTE</div>
          <div style={{ color: '#d4af37', fontSize: s(12), fontWeight: 700, marginTop: s(2) }}>The College of IT</div>
          <div style={{ color: '#b4c8f0', fontSize: s(10), marginTop: s(4), lineHeight: 1.6 }}>
            ISO Reg. No.: UAS/2017/155491 &nbsp;|&nbsp; MHRD Regd. &nbsp;|&nbsp; Society Reg. No.: 1373/2005
          </div>
          <div style={{ color: '#93b4e8', fontSize: s(10), lineHeight: 1.6 }}>
            info@kci.org.in &nbsp;|&nbsp; Mob: 9936384736 / 9919660880 &nbsp;|&nbsp; www.kci.org.in
          </div>
        </div>
        <div style={{ background: '#d4af37', borderRadius: s(10), padding: s(8) + 'px ' + s(13) + 'px', flexShrink: 0, textAlign: 'center', border: '1.5px solid #f0d060' }}>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(14), lineHeight: 1.4, whiteSpace: 'nowrap' }}>STUDENT</div>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(14), lineHeight: 1.4, whiteSpace: 'nowrap' }}>IDENTITY CARD</div>
        </div>
      </div>

      {/* BODY â€” height auto, never clipped */}
      <div style={{ background: '#f8f9fc', display: 'flex', flexShrink: 0, position: 'relative' }}>
        {/* Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: s(220), height: s(220), opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
          <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>

        {/* LEFT â€” fields, strict 3-column: label | colon | value */}
        <div style={{ flex: '0 0 76%', paddingTop: s(10), paddingBottom: s(10), paddingLeft: s(20), paddingRight: s(12), position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: s(4) }}>
          {fields.map(([lbl, val], i) => (
            <div key={lbl} style={{
              display: 'grid',
              gridTemplateColumns: s(120) + 'px ' + s(18) + 'px 1fr',
              alignItems: 'start',
              minHeight: s(28),
              borderBottom: i < fields.length - 1 ? '1px solid #dde4f0' : 'none',
              paddingBottom: s(4),
            }}>
              <span style={{ color: '#0b1f5b', fontWeight: 700, fontSize: s(14), lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'visible' }}>{lbl}</span>
              <span style={{ color: '#0b1f5b', fontWeight: 700, fontSize: s(14), lineHeight: 1.5, textAlign: 'center' }}>:</span>
              <span style={{
                color: '#111111',
                fontWeight: 600,
                fontSize: s(14),
                lineHeight: 1.5,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                whiteSpace: 'normal',
                display: '-webkit-box',
                WebkitLineClamp: (lbl === 'Course' || lbl === 'Address') ? 2 : undefined,
                WebkitBoxOrient: (lbl === 'Course' || lbl === 'Address') ? 'vertical' : undefined,
              }}>{val || '-'}</span>
            </div>
          ))}
        </div>

        {/* RIGHT â€” photo + QR */}
        <div style={{ flex: '0 0 24%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: s(8), padding: s(10) + 'px ' + s(10) + 'px ' + s(10) + 'px ' + s(4) + 'px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: s(140), height: s(170), border: '2.5px solid #d4af37', borderRadius: s(16), overflow: 'hidden', background: '#dce7f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {student?.photo
              ? <img src={student.photo} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}><User size={s(36)} color="#8aaad8" /><span style={{ color: '#8aaad8', fontSize: s(12), fontWeight: 700 }}>PHOTO</span></div>
            }
          </div>
          <div style={{ width: s(120), height: s(120), border: '2px solid #d4af37', borderRadius: s(10), background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: s(4) }}>
            {qrDataUrl
              ? <img src={qrDataUrl} alt="QR" style={{ width: s(104), height: s(104), objectFit: 'contain' }} />
              : <QrCode size={s(64)} color="#081d5b" />
            }
          </div>
          <span style={{ color: '#5070b4', fontSize: s(10), fontWeight: 700, textAlign: 'center' }}>Unique ID / QR Code</span>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ height: FOOT, background: '#081d5b', borderTop: s(3) + 'px solid #d4af37', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%' }}>
          <div style={{ borderTop: '1.5px solid rgba(180,200,240,0.6)', width: s(110), marginBottom: s(6) }} />
          <span style={{ color: '#b4c8f0', fontSize: s(13) }}>Student Signature</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%' }}>
          <div style={{ width: s(48), height: s(48), borderRadius: '50%', background: '#d4af37', border: '2px solid #fff', overflow: 'hidden', marginBottom: s(4) }}>
            <img src="/logo.png" alt="seal" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          </div>
          <span style={{ color: '#d4af37', fontSize: s(12), fontWeight: 700 }}>KCI Official Seal</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ borderTop: '1.5px solid rgba(180,200,240,0.6)', width: s(110), marginBottom: s(6) }} />
          <span style={{ color: '#b4c8f0', fontSize: s(13) }}>Principal Signature</span>
        </div>
      </div>
    </div>
  );
}

function IDCard({ student, branch }) {
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const dob = student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-';
  const uniqueId = student?.formNo || student?.rollNumber || student?.enrollmentNumber || 'KCI000';

  const pdfRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setExporting(true);
    try {
      const el = pdfRef.current;
      el.style.display = 'block';
      await new Promise(r => setTimeout(r, 80)); // let browser paint
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 856,
      });
      el.style.display = 'none';
      const pxW = canvas.width;
      const pxH = canvas.height;
      const mmW = 85.6;
      const mmH = (pxH / pxW) * mmW;
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [mmW, mmH] });
      doc.addImage(imgData, 'JPEG', 0, 0, mmW, mmH);
      doc.save('IDCard_' + uniqueId + '.pdf');
      toast.success('ID Card downloaded!');
    } catch { toast.error('Download failed'); }
    setExporting(false);
  };

  const W = 856;

  // Real dynamic QR via qrcode lib
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    const qrData = JSON.stringify({
      name: student?.name || '',
      formNo: uniqueId,
      course: student?.courseName || '',
      branchCode: branch?.branchCode || branch?.code || '',
      branchName: branch?.branchName || '',
      address: student?.address || '',
    });
    QRCode.toDataURL(qrData, { width: 300, margin: 1, color: { dark: '#081d5b', light: '#ffffff' } })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [student, branch, uniqueId]);

  const admDate = student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : '-';
  const fields = [
    ['Form No',        uniqueId],
    ['Name',           student?.name],
    ['Father Name',    student?.fatherName],
    ['Course',         student?.courseName],
    ['Branch',         branch?.branchName || student?.branchName || 'N/A'],
    ['Session',        student?.batch || '-'],
    ['Date of Admission', admDate],
    ['Date of Birth',  dob],
    ['Address',        student?.address],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={handleDownloadPDF} disabled={exporting}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'linear-gradient(135deg,#081d5b,#1a3a8f)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(8,29,91,0.4)' }}>
          <Download size={16} /> {exporting ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <button onClick={async () => {
          if (!pdfRef.current) return;
          const el = pdfRef.current;
          el.style.display = 'block';
          await new Promise(r => setTimeout(r, 80));
          const win = window.open('', '_blank', 'width=1000,height=700');
          win.document.write(`<html><head><title>ID Card â€” KCI</title><style>body{margin:0;padding:0;background:#fff;}@media print{body{margin:0;}@page{size:landscape;margin:0;}}</style></head><body>${el.innerHTML}</body></html>`);
          win.document.close(); win.focus();
          setTimeout(() => { win.print(); win.close(); }, 400);
          el.style.display = 'none';
        }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'linear-gradient(135deg,#065f46,#047857)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(6,95,70,0.4)' }}>
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Hidden PDF container â€” fixed 856px wide, never responsive, off-screen */}
      <div
        ref={pdfRef}
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: '-9999px',
          width: 856,
          minWidth: 856,
          zIndex: -9999,
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      >
        <CardInner W={856} student={student} branch={branch} fields={fields} qrDataUrl={qrDataUrl} />
      </div>

      {/* Screen Preview â€” scales responsively, does NOT affect PDF */}
      <div style={{ width: '100%', overflowX: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 856 }}>
          <div style={{
            transform: window.innerWidth < 480 ? 'scale(0.35)' : window.innerWidth < 768 ? 'scale(0.42)' : 'scale(0.55)',
            transformOrigin: 'top center',
            width: 856,
            marginLeft: window.innerWidth < 480 ? '-27%' : window.innerWidth < 768 ? '-22%' : '-10%',
            marginBottom: window.innerWidth < 480 ? -360 : window.innerWidth < 768 ? -310 : -230,
          }}>
            <CardInner W={856} student={student} branch={branch} fields={fields} qrDataUrl={qrDataUrl} />
          </div>
        </div>
      </div>
      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>â¬† Preview â€” Download PDF for print-ready card</p>
    </div>
  );
}
function gradeColor(grade) {
  const g = (grade || '').toUpperCase();
  if (g === 'A+' || g === 'O') return { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' };
  if (g === 'A') return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
  if (g === 'B+' || g === 'B') return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (g === 'C') return { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
}

// â‚¬â‚¬â‚¬ Results Section â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬
function ResultsSection({ results }) {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const fileUrl = (p) => {
    if (!p) return '';
    if (p.startsWith('http')) return p;
    return `${API_BASE}${p}`;
  };

  if (results.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
      <p className="text-gray-400">No results published yet</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900">My Results <span className="text-blue-600">({results.length})</span></h2>
      {results.map((r, idx) => (
        <motion.div key={r._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-4">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Result Card</p>
            <h3 className="text-white font-black text-lg leading-tight">{r.courseName || 'Result'}</h3>
            <p className="text-blue-300 text-xs mt-0.5">
              {r.studentName}{r.batch ? ` | Batch: ${r.batch}` : ''}
              {r.examDate ? ` | Exam: ${new Date(r.examDate).toLocaleDateString('en-IN')}` : ''}
            </p>
          </div>
          <div className="p-4">
            {r.fatherName && <p className="text-xs text-gray-500 mb-3">Father: <span className="font-semibold text-gray-700">{r.fatherName}</span></p>}
            {r.resultFile ? (
              <div className="flex flex-wrap gap-2">
                <a href={fileUrl(r.resultFile)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
                <button onClick={() => {
                  const win = window.open(fileUrl(r.resultFile), '_blank', 'width=900,height=650');
                  if (win) { win.onload = () => { win.focus(); win.print(); }; }
                }} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Result file not uploaded yet</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

      {results.map((r, idx) => {
        const gc = gradeColor(r.grade);
        const pct = r.percentage ?? 0;
        return (
          <motion.div key={r._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* â‚¬â‚¬ Card Header â‚¬â‚¬ */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Result Card</p>
                <h3 className="text-white font-black text-lg leading-tight">{r.courseName}</h3>
                <p className="text-blue-300 text-xs mt-0.5">Roll No: <span className="font-mono font-bold text-yellow-300">{r.rollNumber}</span>{r.batch ? ` | Batch: ${r.batch}` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-black border-2 ${
                  r.status === 'Pass' ? 'bg-green-400/20 border-green-400 text-green-300' : 'bg-red-400/20 border-red-400 text-red-300'
                }`}>{r.status === 'Pass' ? 'â€œ PASS' : 'FAIL'}</span>
                <div className={`text-3xl font-black ${gc.text.replace('text-', 'text-').replace('700', '300')}`} style={{ color: '#fde68a' }}>{r.grade}</div>
              </div>
            </div>

            {/* â‚¬â‚¬ Summary Strip â‚¬â‚¬ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: 'Obtained', value: r.obtainedMarks ?? 'â€â€', sub: 'marks' },
                { label: 'Total', value: r.totalMarks ?? 'â€â€', sub: 'marks' },
                { label: 'Percentage', value: r.percentage ? `${r.percentage}%` : 'â€â€', sub: 'score', highlight: true },
                { label: 'Grade', value: r.grade || 'â€â€', sub: 'overall', highlight: true },
              ].map(({ label, value, sub, highlight }) => (
                <div key={label} className="py-4 text-center">
                  <div className={`text-xl font-black ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                  <div className="text-[9px] text-gray-300">{sub}</div>
                </div>
              ))}
            </div>

            {/* â‚¬â‚¬ Percentage Bar â‚¬â‚¬ */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Performance</span>
                <span className="text-xs font-black text-blue-600">{pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, delay: idx * 0.05 + 0.3 }}
                  className={`h-full rounded-full ${gc.bar}`} />
              </div>
              <div className="flex justify-between text-[9px] text-gray-300 mt-1">
                <span>0%</span><span>33% (Pass)</span><span>60%</span><span>75%</span><span>100%</span>
              </div>
            </div>

            {/* â‚¬â‚¬ Subject Table â‚¬â‚¬ */}
            {r.subjects?.length > 0 && (
              <div className="px-4 sm:px-6 pb-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mt-2">Subject-wise Marks</p>
                <div className="border border-gray-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wide">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wide">Subject</th>
                        <th className="text-center px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wide">Max</th>
                        <th className="text-center px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wide">Obtained</th>
                        <th className="text-center px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wide">%</th>
                        <th className="text-center px-4 py-2.5 text-xs font-black text-gray-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.subjects.map((sub, i) => {
                        const subPct = sub.maxMarks ? ((sub.obtainedMarks / sub.maxMarks) * 100).toFixed(1) : null;
                        const pass = sub.obtainedMarks >= sub.maxMarks * 0.33;
                        return (
                          <tr key={i} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="px-4 py-3 text-gray-400 font-bold text-xs">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{sub.name}</td>
                            <td className="px-4 py-3 text-center text-gray-600 font-bold">{sub.maxMarks ?? 'â€â€'}</td>
                            <td className="px-4 py-3 text-center font-black text-gray-900">{sub.obtainedMarks ?? 'â€â€'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs font-bold text-blue-600">{subPct ? `${subPct}%` : 'â€â€'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                              }`}>{pass ? 'Pass' : 'Fail'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td colSpan={2} className="px-4 py-3 font-black text-blue-800 text-sm">TOTAL</td>
                        <td className="px-4 py-3 text-center font-black text-blue-800">{r.totalMarks ?? 'â€â€'}</td>
                        <td className="px-4 py-3 text-center font-black text-blue-800">{r.obtainedMarks ?? 'â€â€'}</td>
                        <td className="px-4 py-3 text-center font-black text-blue-600">{r.percentage ? `${r.percentage}%` : 'â€â€'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-black ${
                            r.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>{r.status}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {r.examDate && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-400">Exam Date: {new Date(r.examDate).toLocaleDateString('en-IN')}</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// â‚¬â‚¬â‚¬ Certificate PDF Download â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬â‚¬
async function downloadCertificatePDF(c, student, branch) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;

  // circular logo
  let logoUrl = null;
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png';
    });
    const sz = 300;
    const cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
    const cx2 = cv.getContext('2d');
    cx2.beginPath(); cx2.arc(sz/2, sz/2, sz/2, 0, Math.PI*2); cx2.closePath(); cx2.clip();
    cx2.drawImage(img, 0, 0, sz, sz);
    logoUrl = cv.toDataURL('image/png');
  } catch (_) {}

  // â‚¬â‚¬ OUTER DECORATIVE BORDER â‚¬â‚¬
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(3);
  doc.rect(6, 6, W - 12, H - 12);
  doc.setDrawColor(210, 170, 60); doc.setLineWidth(0.8);
  doc.rect(9, 9, W - 18, H - 18);
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.4);
  doc.rect(11, 11, W - 22, H - 22);

  // corner ornaments
  const corners = [[12,12],[W-12,12],[12,H-12],[W-12,H-12]];
  corners.forEach(([x, y]) => {
    doc.setFillColor(180, 140, 40);
    doc.circle(x, y, 2.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(x, y, 1.2, 'F');
  });

  // â‚¬â‚¬ GOLD HEADER BG â‚¬â‚¬
  doc.setFillColor(15, 40, 110);
  doc.rect(12, 12, W - 24, 38, 'F');
  doc.setFillColor(180, 140, 40);
  doc.rect(12, 50, W - 24, 1.5, 'F');

  // Logo
  if (logoUrl) doc.addImage(logoUrl, 'PNG', 18, 15, 28, 28);

  // Institute name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.text('KEERTI COMPUTER INSTITUTE', W / 2, 30, { align: 'center' });
  doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255);
  doc.text('Govt. Recognised  |  Est. 2005  |  Ayodhya, UP  |  www.kci.org.in', W / 2, 40, { align: 'center' });
  doc.setFontSize(8.5); doc.setTextColor(220, 200, 120);
  doc.text('ISO Certified Institute of Computer Education', W / 2, 48, { align: 'center' });

  // â‚¬â‚¬ CERTIFICATE TITLE â‚¬â‚¬
  doc.setFontSize(28); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 100, 20);
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 72, { align: 'center' });
  // underline
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.8);
  doc.line(W/2 - 70, 75, W/2 + 70, 75);

  // â‚¬â‚¬ BODY TEXT â‚¬â‚¬
  // â‚¬â‚¬ Load Colonna MT font â‚¬â‚¬
  let colonnaLoaded = false;
  try {
    const fontRes = await fetch('/colonna_b64.txt');
    const b64 = (await fontRes.text()).trim();
    doc.addFileToVFS('Colonna.ttf', b64);
    doc.addFont('Colonna.ttf', 'Colonna', 'normal');
    colonnaLoaded = true;
  } catch (_) {}

  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  doc.text('This is to certify that', W / 2, 88, { align: 'center' });

  // Student name â€â€ Colonna MT font
  const nameText = c.studentName || student?.name || 'â€â€';
  doc.setFontSize(28);
  doc.setFont(colonnaLoaded ? 'Colonna' : 'times', colonnaLoaded ? 'normal' : 'bolditalic');
  doc.setTextColor(15, 40, 110);
  doc.text(nameText, W / 2, 103, { align: 'center' });
  // name underline
  doc.setDrawColor(15, 40, 110); doc.setLineWidth(0.5);
  doc.line(W/2 - 55, 106, W/2 + 55, 106);

  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  doc.text('has successfully completed the course', W / 2, 116, { align: 'center' });

  // Course name
  doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 100, 20);
  doc.text(c.courseName || 'â€â€', W / 2, 128, { align: 'center' });

  doc.setFontSize(10.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  const rollText = `Roll No: ${c.rollNumber || 'â€â€'}   |   Grade: ${c.grade || 'â€â€'}   |   Issue Date: ${c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : 'â€â€'}`;
  doc.text(rollText, W / 2, 139, { align: 'center' });

  // Branch
  if (branch?.branchName) {
    doc.setFontSize(9.5); doc.setTextColor(100, 100, 100);
    doc.text(`Branch: ${branch.branchName}${branch.branchCity ? ', ' + branch.branchCity : ''}`, W / 2, 147, { align: 'center' });
  }

  // â‚¬â‚¬ CERT NUMBER BADGE â‚¬â‚¬
  doc.setFillColor(245, 240, 220);
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.5);
  doc.roundedRect(W/2 - 45, 151, 90, 10, 2, 2, 'FD');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 70, 10);
  doc.text(`Certificate No: ${c.certificateNumber || 'â€â€'}`, W / 2, 157.5, { align: 'center' });

  // â‚¬â‚¬ GRADE BADGE â‚¬â‚¬
  const gradeColors = { 'A+': [22,163,74], 'A': [37,99,235], 'B+': [124,58,237], 'B': [79,70,229], 'C': [217,119,6], 'D': [234,179,8] };
  const gc = gradeColors[c.grade] || [15, 40, 110];
  doc.setFillColor(...gc);
  doc.circle(W - 35, 105, 16, 'F');
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.8);
  doc.circle(W - 35, 105, 16, 'S');
  doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('GRADE', W - 35, 100, { align: 'center' });
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text(c.grade || 'A', W - 35, 110, { align: 'center' });

  // â‚¬â‚¬ FOOTER SIGNATURES â‚¬â‚¬
  const SY = H - 30;
  doc.setDrawColor(100, 100, 100); doc.setLineWidth(0.4);
  // left sig
  doc.line(25, SY, 85, SY);
  doc.setTextColor(80, 80, 80); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  doc.text('Student Signature', 55, SY + 5, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(120, 120, 120);
  doc.text(c.studentName || student?.name || '', 55, SY + 10, { align: 'center' });

  // center logo seal
  if (logoUrl) doc.addImage(logoUrl, 'PNG', W/2 - 10, SY - 12, 20, 20);
  doc.setTextColor(100, 70, 10); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text('KCI Official Seal', W / 2, SY + 10, { align: 'center' });

  // right sig
  doc.setDrawColor(100, 100, 100);
  doc.line(W - 85, SY, W - 25, SY);
  doc.setTextColor(80, 80, 80); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  doc.text('Principal Signature', W - 55, SY + 5, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(120, 120, 120);
  doc.text('Keerti Computer Institute', W - 55, SY + 10, { align: 'center' });

  // bottom strip
  doc.setFillColor(245, 240, 220);
  doc.rect(12, H - 16, W - 24, 8, 'F');
  doc.setTextColor(120, 90, 20); doc.setFontSize(7); doc.setFont('helvetica', 'italic');
  doc.text('This certificate is issued by Keerti Computer Institute and is valid subject to verification.  |  Ph: 9936384736', W / 2, H - 11, { align: 'center' });

  doc.save(`Certificate_${c.certificateNumber || c.rollNumber}.pdf`);
  toast.success('Certificate downloaded!');
}

// â”€â”€â”€ File URL helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const API_BASE = import.meta.env.VITE_API_URL || '';
function fileUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

// â”€â”€â”€ Certificate download helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function certDownloadUrl(filePath, studentName, certNumber) {
  const ext = filePath?.split('.').pop()?.split('?')[0] || 'pdf';
  const safeName = (studentName || 'Student').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const safeCertNo = (certNumber || '').replace(/\//g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = `KCI_Certificate_${safeName}_${safeCertNo}.${ext}`;

  // Cloudinary URL â€” add fl_attachment for forced download with filename
  if (filePath?.includes('cloudinary.com')) {
    // Insert fl_attachment:filename before /upload/
    return filePath.replace('/upload/', `/upload/fl_attachment:${filename.replace(/\./g, '_')}/`);
  }
  // Local file â€” return as-is (backend serves it)
  return fileUrl(filePath);
}

// â”€â”€â”€ Exam Form Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COURSES = [
  'Certificate In Fundamental (CIF)',
  'Certificate in Computer Application (CCA)',
  'Certificate In Office Package & Tally A/C (COPT)',
  'Tally Specialist Course With GST',
  'Advance Diploma in Computer Application (ADCA)',
  'Desktop Publishing (DTP)',
  'Computer Teacher Training Course',
  'Certificate In Computer Hardware (CICH)',
  'JAVA, VB.net, ASP.net, PHP',
  'Computer Typing (Hindi + English)',
  'C, C++ Programming',
  'Diploma in Computer Application (DCA)',
  'Certificate In Tally A/c With GST (CIT)',
  'Multimedia Animation Course (N-Mass)',
  'BCA / BBA / MCA / MBA / PGDCA & More',
  'Course On Computer Concept (CCC from NIELIT)',
];

async function downloadReceiptPDF(form) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, M = 15;

  // Logo
  let logoUrl = null;
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png'; });
    const sz = 300, cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
    const cx = cv.getContext('2d'); cx.beginPath(); cx.arc(sz/2,sz/2,sz/2,0,Math.PI*2); cx.closePath(); cx.clip(); cx.drawImage(img,0,0,sz,sz);
    logoUrl = cv.toDataURL('image/png');
  } catch(_) {}

  // Header
  doc.setFillColor(8,29,91); doc.rect(0,0,W,42,'F');
  doc.setFillColor(212,175,55); doc.rect(0,42,W,2,'F');
  if (logoUrl) doc.addImage(logoUrl,'PNG',M,7,24,24);
  doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text('KEERTI COMPUTER INSTITUTE', M+30, 18);
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(180,200,255);
  doc.text('Govt. Recognised | ISO Certified | Ayodhya, U.P. | www.kci.org.in', M+30, 26);
  // Receipt pill
  doc.setFillColor(212,175,55);
  doc.roundedRect(M+30, 30, 50, 8, 2, 2, 'F');
  doc.setTextColor(8,29,91); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
  doc.text('PAYMENT RECEIPT', M+55, 35.2, { align:'center' });

  let y = 56;

  // Receipt No & Date
  doc.setDrawColor(200,210,240); doc.setLineWidth(0.3);
  doc.roundedRect(M, y, W-M*2, 14, 2, 2, 'FD');
  doc.setFillColor(245,248,255); doc.roundedRect(M, y, W-M*2, 14, 2, 2, 'F');
  doc.setTextColor(8,29,91); doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text(`Receipt No: KCI-${form.enrollmentNumber}-${Date.now().toString().slice(-6)}`, M+4, y+6);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}`, W-M-4, y+6, { align:'right' });
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100);
  doc.text(`Status: ${form.status || 'Pending'} | Submitted: ${new Date(form.createdAt).toLocaleDateString('en-IN')}`, M+4, y+11);
  y += 20;

  // Section: Student Details
  doc.setFillColor(8,29,91); doc.roundedRect(M, y, W-M*2, 7, 1, 1, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text('STUDENT DETAILS', M+4, y+5);
  y += 10;

  const studentRows = [
    ['Student Name', form.studentName || '-'],
    ['Father Name', form.fatherName || '-'],
    ['Enrollment No.', form.enrollmentNumber || '-'],
    ['Course', form.course || '-'],
    ['Batch', form.batch || '-'],
    ['Phone', form.phone || '-'],
    ['Email', form.email || '-'],
    ['Address', form.address || '-'],
  ];
  studentRows.forEach(([l,v], i) => {
    doc.setFillColor(i%2===0?255:248,i%2===0?255:249,i%2===0?255:255);
    doc.rect(M, y, W-M*2, 8, 'F');
    doc.setDrawColor(220,225,240); doc.setLineWidth(0.2);
    doc.rect(M, y, W-M*2, 8, 'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(8,29,91);
    doc.text(l, M+3, y+5.5);
    doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30);
    doc.text(String(v), M+65, y+5.5, { maxWidth: W-M*2-68 });
    y += 8;
  });
  y += 5;

  // Section: Payment Details
  doc.setFillColor(22,101,52); doc.roundedRect(M, y, W-M*2, 7, 1, 1, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text('PAYMENT DETAILS', M+4, y+5);
  y += 10;

  const payRows = [
    ['Payment Method', 'UPI'],
    ['UPI ID', 'akhileshkumar5044@ybl'],
    ['Amount Paid', `\u20B9${form.amount || 1}`],
    ['UTR / Transaction ID', form.paymentUtr || '-'],
    ['Payment Status', 'Paid'],
  ];
  payRows.forEach(([l,v], i) => {
    doc.setFillColor(i%2===0?240:255, i%2===0?253:255, i%2===0?244:255);
    doc.rect(M, y, W-M*2, 8, 'F');
    doc.setDrawColor(187,247,208); doc.setLineWidth(0.2);
    doc.rect(M, y, W-M*2, 8, 'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(22,101,52);
    doc.text(l, M+3, y+5.5);
    doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30);
    doc.text(String(v), M+65, y+5.5);
    y += 8;
  });
  y += 8;

  // Total box
  doc.setFillColor(8,29,91); doc.roundedRect(M, y, W-M*2, 14, 3, 3, 'F');
  doc.setTextColor(212,175,55); doc.setFontSize(12); doc.setFont('helvetica','bold');
  doc.text('TOTAL PAID', M+6, y+9);
  doc.setFontSize(16);
  doc.text(`\u20B9${form.amount || 1}`, W-M-6, y+9, { align:'right' });
  y += 20;

  // Note
  doc.setFillColor(254,252,232); doc.setDrawColor(234,179,8); doc.setLineWidth(0.4);
  doc.roundedRect(M, y, W-M*2, 16, 2, 2, 'FD');
  doc.setTextColor(120,80,0); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
  doc.text('NOTE:', M+4, y+6);
  doc.setFont('helvetica','normal'); doc.setTextColor(80,60,0);
  doc.text('This is a computer-generated payment receipt for your exam form submission.', M+4, y+11, { maxWidth: W-M*2-8 });
  doc.text('Keep this receipt for your records. For queries: 9936384736', M+4, y+15.5, { maxWidth: W-M*2-8 });
  y += 22;

  // Footer
  doc.setFillColor(8,29,91); doc.rect(0, 275, W, 22, 'F');
  doc.setTextColor(180,200,255); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
  doc.text('Keerti Computer Institute | Civil Lines, Ayodhya, U.P. - 224001', W/2, 282, { align:'center' });
  doc.text('www.kci.org.in | info@kci.org.in | Mo: 9936384736', W/2, 288, { align:'center' });
  doc.setTextColor(212,175,55); doc.setFontSize(7);
  doc.text('This receipt is system generated and does not require a physical signature.', W/2, 293, { align:'center' });

  doc.save(`KCI_Receipt_${form.enrollmentNumber}_${Date.now()}.pdf`);
  toast.success('Receipt downloaded!');
}

function PayStep({ upiQr, upiId, amount, enrollmentNumber, onPaid, onBack }) {
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=Keerti Computer Institute&am=${amount}&cu=INR&tn=${encodeURIComponent('KCI-EXAM-' + enrollmentNumber)}`;
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!waiting) return;
    const onVisibility = () => { if (!document.hidden) onPaid(); };
    const onFocus = () => onPaid();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [waiting, onPaid]);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-center">
          <div className="text-white font-black text-lg">ðŸ’³ Pay Exam Fee</div>
          <div className="text-green-100 text-xs mt-1">Scan QR code or tap Pay Now to pay</div>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          {upiQr
            ? <img src={upiQr} alt="UPI QR" className="w-48 h-48 rounded-2xl border-4 border-green-200 shadow-lg" />
            : <div className="w-48 h-48 rounded-2xl border-2 border-green-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">Generating QR...</div>
          }
          <div className="w-full bg-green-50 rounded-xl p-3 border border-green-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">UPI ID</span>
              <span className="text-sm font-black text-green-700 font-mono">{upiId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">Amount</span>
              <span className="text-lg font-black text-green-700">â‚¹{amount}</span>
            </div>
          </div>

          <a href={upiDeepLink} onClick={() => setWaiting(true)}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-black text-sm text-center shadow-md transition-all">
            ðŸ“± Pay Now via UPI App
          </a>

          {waiting && (
            <div className="w-full py-3 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-700 font-bold text-sm">Waiting... return here after paying</span>
            </div>
          )}


          <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Back to Testsï¿½ Go Back
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ExamFormSection({ student, myExamForm, onSubmitted }) {
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [upiQr, setUpiQr] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'pay' | 'utr'
  const [errs, setErrs] = useState({});

  const UPI_ID = 'akhileshkumar5044@ybl';
  const AMOUNT = 1;

  // Generate UPI QR with student-specific txn note
  useEffect(() => {
    if (!student) return;
    const txnNote = `KCI-EXAM-${student.enrollmentNumber || student.rollNumber || Date.now()}`;
    const upiString = `upi://pay?pa=${UPI_ID}&pn=Keerti Computer Institute&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    QRCode.toDataURL(upiString, { width: 200, margin: 1, color: { dark: '#081d5b', light: '#ffffff' } })
      .then(setUpiQr).catch(() => {});
  }, [student]);

  // Auto-fill when student data loads
  useEffect(() => {
    if (myExamForm) return; // already submitted, don't overwrite
    if (!student) return;
    setForm(f => f ? f : {
      studentName:      student.name || '',
      fatherName:       student.fatherName || '',
      motherName:       '',
      dob:              student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      gender:           '',
      category:         'General',
      enrollmentNumber: student.enrollmentNumber || student.rollNumber || '',
      course:           student.courseName || '',
      batch:            student.batch || '',
      session:          '',
      qualification:    '',
      subjects:         '',
      phone:            student.phone || '',
      email:            student.email || '',
      address:          student.address || '',
      paymentUtr:       '',
    });
  }, [student, myExamForm]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: '' })); };

  const validate = (f) => {
    const e = {};
    if (!f.studentName.trim()) e.studentName = 'Required';
    if (!f.fatherName.trim()) e.fatherName = 'Required';
    if (!f.dob) e.dob = 'Required';
    if (!f.gender) e.gender = 'Required';
    if (!f.enrollmentNumber.trim()) e.enrollmentNumber = 'Required';
    if (!f.course) e.course = 'Required';
    if (!f.batch.trim()) e.batch = 'Required';
    if (!f.phone.trim()) e.phone = 'Required';
    else if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter valid 10-digit number';
    if (!f.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Invalid email';
    return e;
  };

  const statusColor = {
    Pending:  'bg-yellow-100 text-yellow-700 border-yellow-200',
    Approved: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
  };

  const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
  const sel = inp + ' cursor-pointer';

  if (myExamForm) return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-1">
          <CheckCircle className="w-6 h-6" />
          <h2 className="text-lg font-black">Exam Form Submitted</h2>
        </div>
        <p className="text-green-100 text-sm">Your examination registration form has been submitted.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-gray-900">Form Details</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${statusColor[myExamForm.status] || statusColor.Pending}`}>
              {myExamForm.status}
            </span>
            <button
              onClick={() => downloadReceiptPDF(myExamForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" /> Receipt
            </button>
          </div>
        </div>
        {[
          ['Student Name', myExamForm.studentName],
          ['Enrollment No.', myExamForm.enrollmentNumber],
          ['Course', myExamForm.course],
          ['Batch', myExamForm.batch],
          ['Phone', myExamForm.phone],
          ['Email', myExamForm.email],
          ['Payment UTR', myExamForm.paymentUtr || 'â€”'],
          ['Submitted', new Date(myExamForm.createdAt).toLocaleDateString('en-IN')],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-bold text-gray-500">{l}</span>
            <span className="text-sm font-bold text-gray-800">{v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  if (!form) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>;

  // â”€â”€ STEP: PAY â”€â”€
  if (step === 'pay') return (
    <PayStep
      upiQr={upiQr}
      upiId={UPI_ID}
      amount={AMOUNT}
      enrollmentNumber={form.enrollmentNumber}
      onPaid={() => setStep('utr')}
      onBack={() => setStep('form')}
    />
  );

  // â”€â”€ STEP: UTR â”€â”€
  if (step === 'utr') return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-center">
          <div className="text-white font-black text-lg">ðŸ” Verify Payment</div>
          <div className="text-blue-100 text-xs mt-1">Enter your UTR / Transaction ID</div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs text-blue-700 font-semibold text-center">
            â‚¹{AMOUNT} paid to <span className="font-mono font-black">{UPI_ID}</span>
          </div>
          <div>
            <label className="text-xs font-black text-gray-700 mb-2 block">UTR / Transaction ID <span className="text-red-500">*</span></label>
            <input
              autoFocus
              value={form.paymentUtr}
              onChange={e => set('paymentUtr', e.target.value)}
              placeholder="e.g. 426112345678"
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-center tracking-widest text-lg"
            />
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">Find UTR in your UPI app under transaction history. Each UTR can only be used once.</p>
          </div>
          <button
            onClick={async () => {
              if (!form.paymentUtr || form.paymentUtr.trim().length < 6)
                return toast.error('Enter valid UTR / Transaction ID');
              setSubmitting(true);
              try {
                const { data } = await api.post('/exam-forms', form);
                toast.success('Exam form submitted successfully!');
                onSubmitted(data.form);
              } catch (err) {
                toast.error(err.response?.data?.message || 'Submission failed');
              }
              setSubmitting(false);
            }}
            disabled={submitting || !form.paymentUtr}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-md">
            {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Examination Form'}
          </button>
          <button onClick={() => setStep('pay')} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
            Back to Testsï¿½ Back to Payment
          </button>
        </div>
      </div>
    </motion.div>
  );

  // â”€â”€ STEP: FORM â”€â”€
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Examination Registration Form</h2>
              <p className="text-blue-200 text-xs">Fields are auto-filled from your profile</p>
            </div>
          </div>
        </div>

        <form onSubmit={e => {
          e.preventDefault();
          const e2 = validate(form);
          if (Object.keys(e2).length) { setErrs(e2); return; }
          setStep('pay');
        }} className="p-6 space-y-5">
          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Student Name *</label>
                <input value={form.studentName} onChange={e => set('studentName', e.target.value)} className={`${inp} ${errs.studentName ? 'border-red-400' : ''}`} />
                {errs.studentName && <p className="text-red-500 text-[10px] mt-0.5">{errs.studentName}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Father's Name *</label>
                <input value={form.fatherName} onChange={e => set('fatherName', e.target.value)} className={`${inp} ${errs.fatherName ? 'border-red-400' : ''}`} />
                {errs.fatherName && <p className="text-red-500 text-[10px] mt-0.5">{errs.fatherName}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Mother's Name</label>
                <input value={form.motherName} onChange={e => set('motherName', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Date of Birth *</label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className={`${inp} ${errs.dob ? 'border-red-400' : ''}`} />
                {errs.dob && <p className="text-red-500 text-[10px] mt-0.5">{errs.dob}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Gender *</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={`${sel} ${errs.gender ? 'border-red-400' : ''}`}>
                  <option value="">-- Select --</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
                {errs.gender && <p className="text-red-500 text-[10px] mt-0.5">{errs.gender}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={sel}>
                  <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Enrollment Number *</label>
                <input value={form.enrollmentNumber} onChange={e => set('enrollmentNumber', e.target.value)} className={`${inp} ${errs.enrollmentNumber ? 'border-red-400' : ''}`} />
                {errs.enrollmentNumber && <p className="text-red-500 text-[10px] mt-0.5">{errs.enrollmentNumber}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Course *</label>
                <select value={form.course} onChange={e => set('course', e.target.value)} className={`${sel} ${errs.course ? 'border-red-400' : ''}`}>
                  <option value="">-- Select Course --</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errs.course && <p className="text-red-500 text-[10px] mt-0.5">{errs.course}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Batch *</label>
                <input value={form.batch} onChange={e => set('batch', e.target.value)} className={`${inp} ${errs.batch ? 'border-red-400' : ''}`} />
                {errs.batch && <p className="text-red-500 text-[10px] mt-0.5">{errs.batch}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Session</label>
                <input value={form.session} onChange={e => set('session', e.target.value)} placeholder="e.g. 2024-25" className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Qualification</label>
                <input value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="e.g. 12th Pass" className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Subjects</label>
                <input value={form.subjects} onChange={e => set('subjects', e.target.value)} placeholder="e.g. All" className={inp} />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Phone *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10} className={`${inp} ${errs.phone ? 'border-red-400' : ''}`} />
                {errs.phone && <p className="text-red-500 text-[10px] mt-0.5">{errs.phone}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Email *</label>
                <input value={form.email} onChange={e => set('email', e.target.value)} className={`${inp} ${errs.email ? 'border-red-400' : ''}`} />
                {errs.email && <p className="text-red-500 text-[10px] mt-0.5">{errs.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-600 mb-1 block">Address</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} className={inp} />
              </div>
            </div>
          </div>

          {/* Proceed to Pay */}
          <button type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md">
            ðŸ’³ Proceed to Pay â‚¹{AMOUNT}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState({ student: null, results: [], certificates: [], branch: null });
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [testStartTime, setTestStartTime] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [admitCard, setAdmitCard] = useState(null);
  const [admitCardEnabled, setAdmitCardEnabled] = useState(false);
  const [myExamForm, setMyExamForm] = useState(null);
  const [examFormData, setExamFormData] = useState(null);
  const [examFormLoading, setExamFormLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewedNotification, setViewedNotification] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { navigate('/login'); return; }
    setLoading(true);
    api.get('/branch/student/me')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load data'); setLoading(false); });
    api.get('/branch/student/tests').then(r => setTests(r.data.tests || [])).catch(() => {});
    api.get('/study-material').then(r => setStudyMaterials(r.data.materials || [])).catch(() => {});
    api.get('/admit-card/setting').then(r => setAdmitCardEnabled(r.data.enabled || false)).catch(() => {});
    api.get('/exam-forms/my').then(r => {
      setMyExamForm(r.data.form || null);
      setExamFormData(r.data.form || null);
      if (r.data.form) {
        api.get('/admit-card/my').then(r2 => setAdmitCard(r2.data.admitCard || null)).catch(() => {});
      }
    }).catch(() => {});
    // Fetch all certificates by enrollmentNumber/formNo
    api.get('/certificates/my-all').then(r => {
      if (r.data.certificates?.length) {
        setData(prev => ({ ...prev, certificates: r.data.certificates }));
      }
    }).catch(() => {});
    api.get('/notifications/my').then(r => { setNotifications(r.data.notifications || []); setUnreadCount(r.data.unreadCount || 0); }).catch(() => {});
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/'); };
  const { student, results, certificates, branch } = data;

  // All tabs always visible
  const tabs = ALL_TABS;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setPwLoading(false);
  };

  // Timer effect
  useEffect(() => {
    if (!activeTest || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); handleSubmitTest(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeTest]);

  const handleStartTest = async (test) => {
    try {
      const r = await api.get(`/branch/student/tests/${test._id}`);
      if (r.data.attempted) {
        const res = await api.get(`/branch/student/tests/${test._id}/result`);
        setTestResult(res.data);
        return;
      }
      setActiveTest(r.data.test);
      setTestAnswers(new Array(r.data.test.questions.length).fill(undefined));
      setTimeLeft(r.data.test.duration * 60);
      setTestStartTime(Date.now());
      setTestResult(null);
    } catch { toast.error('Failed to load test'); }
  };

  const handleSubmitTest = async (autoSubmit = false) => {
    if (!activeTest) return;
    const timeTaken = testStartTime ? Math.floor((Date.now() - testStartTime) / 1000) : 0;
    try {
      const r = await api.post(`/branch/student/tests/${activeTest._id}/submit`, { answers: testAnswers, timeTaken });
      setTestResult({ attempt: r.data.attempt, correctAnswers: r.data.correctAnswers, test: activeTest });
      setActiveTest(null);
      setTests(p => p.map(t => t._id === activeTest._id ? { ...t, attempted: true, myScore: r.data.attempt.score, myPercentage: r.data.attempt.percentage } : t));
      if (!autoSubmit) toast.success('Test submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Submit failed'); }
  };

  const downloadTestResult = async (attempt, test, questions, correctAnswers) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, M = 14;

    // Circular logo
    let logoUrl = null;
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png'; });
      const sz = 300, cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
      const cx = cv.getContext('2d'); cx.beginPath(); cx.arc(sz/2,sz/2,sz/2,0,Math.PI*2); cx.closePath(); cx.clip(); cx.drawImage(img,0,0,sz,sz);
      logoUrl = cv.toDataURL('image/png');
    } catch(_) {}

    // â‚¬â‚¬ HEADER â‚¬â‚¬
    doc.setFillColor(15,40,110); doc.rect(0,0,W,46,'F');
    doc.setFillColor(250,204,21); doc.rect(0,46,W,2.5,'F');
    if (logoUrl) doc.addImage(logoUrl,'PNG',M,7,28,28);
    doc.setTextColor(255,255,255); doc.setFontSize(15); doc.setFont('helvetica','bold');
    doc.text('KEERTI COMPUTER INSTITUTE', M+34, 18);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(180,210,255);
    doc.text('Govt. Recognised | Est. 2005 | www.kci.org.in', M+34, 26);
    // RESULT CARD pill
    doc.setFillColor(250,204,21);
    doc.roundedRect(M+34, 31, 44, 8, 2, 2, 'F');
    doc.setTextColor(15,40,110); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
    doc.text('TEST RESULT CARD', M+56, 36.2, { align:'center' });

    // â‚¬â‚¬ INFO BOX â‚¬â‚¬
    doc.setFillColor(245,248,255); doc.setDrawColor(200,210,240);
    doc.roundedRect(M, 54, W-M*2, 46, 3, 3, 'FD');
    // section label
    doc.setFillColor(15,40,110); doc.roundedRect(M, 54, 36, 7, 2, 2, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.text('TEST DETAILS', M+18, 58.8, { align:'center' });

    // PASS/FAIL badge â€â€ top right of info box
    const pass = attempt.percentage >= 33;
    doc.setFillColor(...(pass ? [22,163,74] : [220,38,38]));
    doc.roundedRect(W-M-26, 55, 24, 11, 2, 2, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(pass ? 'PASS' : 'FAIL', W-M-14, 62, { align:'center' });

    // Info rows â€â€ 2 columns, fixed positions
    // Left:  label @ M+4,  value @ M+30
    // Right: label @ W/2+4, value @ W/2+30
    const LL = M+4, LV = M+32;
    const RL = W/2+4, RV = W/2+32;
    const LMAX = W/2 - LV - 2;   // ~57mm
    const RMAX = W - M - RV - 2; // ~57mm

    const infoData = [
      ['Test Title', test?.title||'â€â€',   'Month',      test?.month||'â€â€'],
      ['Student',    attempt.studentName||'â€â€', 'Roll No.', attempt.rollNumber||'â€â€'],
      ['Score',      `${attempt.score} / ${attempt.totalMarks}`, 'Percentage', `${attempt.percentage}%`],
    ];

    infoData.forEach(([l1,v1,l2,v2], i) => {
      const y = 70 + i * 11;
      doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(80,100,160);
      doc.text(l1+' :', LL, y);
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(15,15,15);
      doc.text(String(v1), LV, y, { maxWidth: LMAX });

      doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(80,100,160);
      doc.text(l2+' :', RL, y);
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(15,15,15);
      doc.text(String(v2), RV, y, { maxWidth: RMAX });
    });

    // Time + Date below info box
    const metaY = 103;
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(100,100,100);
    if (attempt.timeTaken) doc.text(`Time Taken: ${Math.floor(attempt.timeTaken/60)}m ${attempt.timeTaken%60}s`, M, metaY);
    doc.text(`Date: ${new Date(attempt.submittedAt).toLocaleDateString('en-IN')}`, W-M, metaY, { align:'right' });

    // â‚¬â‚¬ QUESTIONS TABLE â‚¬â‚¬
    const rows = (questions||[]).map((q, i) => [
      i+1,
      q.question,
      attempt.answers[i] !== undefined ? (q.options[attempt.answers[i]]||'â€â€') : 'Not answered',
      q.options[correctAnswers[i]]||'â€â€',
      attempt.answers[i] === correctAnswers[i] ? 'Correct' : 'Wrong',
    ]);

    autoTable(doc, {
      startY: 107,
      head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Result']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor:[15,40,110], textColor:[255,255,255], fontStyle:'bold', fontSize:8, cellPadding:3 },
      bodyStyles: { fontSize:8, textColor:[20,20,20], cellPadding:3 },
      alternateRowStyles: { fillColor:[245,248,255] },
      columnStyles: {
        0: { halign:'center', cellWidth:10 },
        1: { cellWidth:66 },
        2: { cellWidth:36 },
        3: { cellWidth:36 },
        4: { halign:'center', cellWidth:20 },
      },
      didDrawCell: (data) => {
        if (data.section==='body' && data.column.index===4) {
          const v = data.cell.raw;
          const isCorrect = v === 'Correct';
          doc.setFillColor(isCorrect?220:255, isCorrect?255:220, isCorrect?220:220);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(isCorrect?22:180, isCorrect?120:30, isCorrect?22:30);
          doc.setFontSize(8); doc.setFont('helvetica','bold');
          doc.text(v, data.cell.x+data.cell.width/2, data.cell.y+data.cell.height/2+1.5, { align:'center' });
        }
      },
      margin: { left:M, right:M },
    });

    // â‚¬â‚¬ SUMMARY BOX â‚¬â‚¬
    const tY = doc.lastAutoTable.finalY + 7;
    doc.setFillColor(15,40,110); doc.roundedRect(M, tY, W-M*2, 26, 3, 3, 'F');
    doc.setFillColor(250,204,21); doc.roundedRect(M, tY, W-M*2, 2, 1, 1, 'F');

    const sumItems = [
      ['SCORE',      `${attempt.score}/${attempt.totalMarks}`],
      ['PERCENTAGE', `${attempt.percentage}%`],
      ['RESULT',     pass ? 'PASS' : 'FAIL'],
    ];
    const cW = (W-M*2)/3;
    sumItems.forEach(([lbl,val], i) => {
      const x = M + i*cW + cW/2;
      if (i>0) { doc.setDrawColor(255,255,255); doc.setLineWidth(0.3); doc.line(M+i*cW, tY+3, M+i*cW, tY+24); }
      doc.setTextColor(180,210,255); doc.setFontSize(7); doc.setFont('helvetica','normal');
      doc.text(lbl, x, tY+10, { align:'center' });
      const isResult = lbl==='RESULT';
      doc.setTextColor(isResult?250:255, isResult?204:255, isResult?21:255);
      doc.setFontSize(13); doc.setFont('helvetica','bold');
      doc.text(String(val), x, tY+22, { align:'center' });
    });

    // â‚¬â‚¬ FOOTER â‚¬â‚¬
    const fY = tY + 34;
    doc.setFillColor(245,248,255); doc.rect(0, fY, W, 12, 'F');
    doc.setTextColor(120,120,120); doc.setFontSize(7); doc.setFont('helvetica','italic');
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-IN')}  |  Keerti Computer Institute  |  9936384736`,
      W/2, fY+7, { align:'center' }
    );

    doc.save(`TestResult_${attempt.rollNumber}_${(test?.title||'KCI').replace(/\s+/g,'_')}.pdf`);
    toast.success('PDF downloaded!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#081d5b] via-blue-900 to-indigo-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-blue-300/30 border-t-blue-400 animate-spin" />
        <p className="text-blue-300 font-semibold text-sm tracking-wide animate-pulse">Loading your portal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* â”€â”€ SIDEBAR â”€â”€ */}
      <aside className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-40 h-screen
        flex flex-col bg-gradient-to-b from-[#060f2e] via-[#081d5b] to-[#0a2470]
        shadow-2xl transition-all duration-300 ease-in-out shrink-0
        ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[70px]'}
      `}>
        {/* Logo row */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0 min-h-[64px]">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
              <div className="font-black text-white text-sm leading-tight">Student Portal</div>
              <div className="text-[10px] text-blue-300 font-mono mt-0.5">{user?.rollNumber}</div>
            </motion.div>
          )}
        </div>

        {/* Student mini-profile */}
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="mx-3 my-3 p-3 bg-white/8 rounded-2xl border border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0 overflow-hidden border-2 border-white/20">
                {data.student?.photo
                  ? <img src={data.student.photo} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-white truncate leading-tight">{user?.name}</div>
                <div className="text-[10px] text-blue-300 truncate mt-0.5 leading-tight">{user?.courseName}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }, idx) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => { setActiveTab(id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              title={!sidebarOpen ? label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 relative group
                ${activeTab === id
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-200/80 hover:bg-white/10 hover:text-white'}
              `}>
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="flex-1 text-left truncate text-[13px]">{label}</span>}
              {activeTab === id && sidebarOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
              )}
              {id === 'notifications' && unreadCount > 0 && (
                sidebarOpen
                  ? <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 shrink-0 min-w-[18px] text-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  : <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#081d5b]" />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Bottom: DevCredit + Logout */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
          {sidebarOpen && <DevCredit popupDown />}
          <button onClick={handleLogout} title={!sidebarOpen ? 'Logout' : undefined}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* â”€â”€ MAIN AREA â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shrink-0">
          <div className="px-4 h-14 flex items-center justify-between gap-3">
            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(p => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title */}
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-gray-900 text-sm truncate">
                {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setActiveTab('notifications')}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm overflow-hidden">
                {data.student?.photo
                  ? <img src={data.student.photo} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto w-full">

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            {/* Profile Hero Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 rounded-3xl overflow-hidden shadow-2xl">
              {/* BG decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2" />

              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl overflow-hidden">
                      {student?.photo
                        ? <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                        : <span className="text-4xl font-black text-white">{student?.name?.[0]?.toUpperCase() || 'S'}</span>
                      }
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-green-400 rounded-xl border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Name + info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Student Profile</div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">{student?.name}</h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                      <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20">
                        <GraduationCap className="w-3.5 h-3.5" /> {student?.courseName || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-yellow-400/20 backdrop-blur-sm text-yellow-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-yellow-400/30 font-mono">
                        <BookOpen className="w-3.5 h-3.5" /> {student?.rollNumber || 'N/A'}
                      </span>
                      {student?.batch && (
                        <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20">
                          <Calendar className="w-3.5 h-3.5" /> Batch {student.batch}
                        </span>
                      )}
                      {student?.fatherName && (
                        <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20">
                          <Users className="w-3.5 h-3.5" /> {student.fatherName}
                        </span>
                      )}
                    </div>
                    {/* Quick stats */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                      {[
                        { label: 'Results', value: results.length, color: 'text-yellow-300' },
                        { label: 'Certificates', value: certificates.filter(c => c.certificateFile).length, color: 'text-emerald-300' },
                        { label: 'Tests', value: tests.length, color: 'text-violet-300' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                          <div className={`text-2xl font-black ${color}`}>{value}</div>
                          <div className="text-white/50 text-[10px] font-semibold uppercase tracking-wide">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0">
                    <div className={`px-4 py-2 rounded-2xl text-sm font-black border-2 ${
                      student?.isApproved
                        ? 'bg-green-400/20 border-green-400/50 text-green-300'
                        : 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
                    }`}>
                      {student?.isApproved ? 'Approved' : 'Â³ Pending'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

              {/* Personal Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-black text-sm">Personal Info</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { icon: User, label: 'Full Name', value: student?.name },
                    { icon: Mail, label: 'Email', value: student?.email },
                    { icon: Phone, label: 'Phone', value: student?.phone },
                    { icon: Users, label: "Father's Name", value: student?.fatherName },
                    { icon: Calendar, label: 'Date of Birth', value: student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : null },
                    { icon: MapPin, label: 'Address', value: student?.address },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-blue-400"><Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                        <div className="text-sm font-bold text-gray-800 truncate">{value || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Academic Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-3 flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-black text-sm">Academic Details</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { icon: BadgeCheck, label: 'Roll Number', value: student?.rollNumber, mono: true, highlight: true },
                    { icon: Hash, label: 'Enrollment No.', value: student?.enrollmentNumber, mono: true },
                    { icon: FileText, label: 'Form No.', value: student?.formNo, mono: true },
                    { icon: BookOpen, label: 'Course', value: student?.courseName },
                    { icon: Layers, label: 'Batch', value: student?.batch },
                    { icon: ShieldCheck, label: 'Account Status', value: student?.isApproved ? 'Approved' : 'Pending' },
                    { icon: CalendarDays, label: 'Admission Date', value: student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : null },
                  ].map(({ icon: Icon, label, value, mono, highlight }) => (
                    <div key={label} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-violet-400"><Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                        <div className={`text-sm font-bold truncate ${
                          highlight ? 'font-mono text-blue-600 text-base' : mono ? 'font-mono text-blue-600' : 'text-gray-800'
                        }`}>{value || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Performance mini bar */}
                <div className="px-4 pb-4">
                  <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-violet-700 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Academic Progress</span>
                      <span className="text-xs font-black text-violet-700">{results.length > 0 ? Math.round(results.reduce((a,r) => a + (r.percentage||0), 0) / results.length) : 0}% avg</span>
                    </div>
                    <div className="h-2 bg-violet-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${results.length > 0 ? Math.min(Math.round(results.reduce((a,r) => a + (r.percentage||0), 0) / results.length), 100) : 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }} className="h-full bg-violet-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Branch Info */}
              {branch && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-5 py-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-black text-sm">My Branch</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { icon: Building2, label: 'Branch Name', value: branch?.branchName },
                      { icon: MapPinned, label: 'City', value: branch?.branchCity },
                      { icon: Phone, label: 'Phone', value: branch?.phone },
                      { icon: Mail, label: 'Email', value: branch?.email },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                        <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-indigo-400"><Icon className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                          <div className="text-sm font-bold text-gray-800 truncate">{value || '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Branch map placeholder */}
                  <div className="mx-4 mb-4 bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-indigo-800">{branch?.branchName}</div>
                      <div className="text-[10px] text-indigo-500">{branch?.branchCity} | KCI Authorized Center</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Dashboard Status Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wide">My Status Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    label: 'Admission',
                    value: student?.isApproved ? 'Approved' : 'Pending',
                    icon: CheckCircle,
                    color: student?.isApproved ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700',
                    dot: student?.isApproved ? 'bg-green-500' : 'bg-yellow-500',
                    tab: null,
                  },
                  {
                    label: 'Exam Form',
                    value: myExamForm ? myExamForm.status : 'Not Submitted',
                    icon: FileText,
                    color: myExamForm?.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' : myExamForm?.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' : myExamForm ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-500',
                    dot: myExamForm?.status === 'Approved' ? 'bg-green-500' : myExamForm?.status === 'Rejected' ? 'bg-red-500' : myExamForm ? 'bg-yellow-500' : 'bg-gray-400',
                    tab: 'examform',
                  },
                  {
                    label: 'Admit Card',
                    value: admitCard ? 'Available' : myExamForm?.status === 'Approved' ? 'Not Released' : 'Pending',
                    icon: CreditCard,
                    color: admitCard ? 'bg-green-50 border-green-200 text-green-700' : myExamForm?.status === 'Approved' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500',
                    dot: admitCard ? 'bg-green-500' : myExamForm?.status === 'Approved' ? 'bg-blue-500' : 'bg-gray-400',
                    tab: 'admitcard',
                  },
                  {
                    label: 'Results',
                    value: results.length > 0 ? `${results.length} Published` : 'Not Published',
                    icon: Award,
                    color: results.length > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500',
                    dot: results.length > 0 ? 'bg-green-500' : 'bg-gray-400',
                    tab: 'results',
                  },
                  {
                    label: 'Certificate',
                    value: certificates.filter(c => c.certificateFile).length > 0 ? `${certificates.filter(c => c.certificateFile).length} Issued` : 'Not Issued',
                    icon: Award,
                    color: certificates.filter(c => c.certificateFile).length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500',
                    dot: certificates.filter(c => c.certificateFile).length > 0 ? 'bg-amber-500' : 'bg-gray-400',
                    tab: 'certificates',
                  },
                  {
                    label: 'ID Card',
                    value: student ? 'Download' : 'Pending',
                    icon: CreditCard,
                    color: student ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500',
                    dot: student ? 'bg-blue-500' : 'bg-gray-400',
                    tab: 'idcard',
                  },
                ].map(({ label, value, icon: Icon, color, dot, tab }) => (
                  <div key={label}
                    onClick={() => tab && setActiveTab(tab)}
                    className={`flex flex-col gap-2 p-3 rounded-xl border ${color} ${tab ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}>
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4" />
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</div>
                    <div className="text-xs font-black leading-tight">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
                {[
                  { label: 'Exam Form', icon: FileText, color: 'from-blue-500 to-blue-600', tab: 'examform' },
                  { label: 'View ID Card', icon: CreditCard, color: 'from-cyan-500 to-blue-600', tab: 'idcard' },
                  { label: 'Admit Card', icon: FileText, color: 'from-indigo-500 to-indigo-600', tab: 'admitcard' },
                  { label: 'My Results', icon: Award, color: 'from-yellow-500 to-orange-500', tab: 'results' },
                  { label: 'Certificates', icon: Award, color: 'from-teal-500 to-emerald-600', tab: 'certificates' },
                  { label: 'Study Material', icon: BookMarked, color: 'from-green-500 to-green-600', tab: 'studymaterial' },
                  { label: 'Take Test', icon: ClipboardCheck, color: 'from-violet-500 to-purple-600', tab: 'tests' },
                  { label: 'Change Password', icon: Lock, color: 'from-rose-500 to-red-600', tab: 'changepassword' },
                ].map(({ label, icon: Icon, color, tab }) => (
                  <button key={label} onClick={() => setActiveTab(tab)}
                    className={`flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${color} rounded-2xl text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all`}>
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-bold text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* ID Card Tab */}
        {activeTab === 'idcard' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900">My ID Card</h2>
            </div>
            <IDCard student={student} branch={branch} />
          </motion.div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <ResultsSection results={results} student={student} branch={branch} />
        )}

        {/* Monthly Tests Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-5">
            {/* Active test â€â€ timer + questions */}
            {activeTest ? (
              <div className="space-y-4">
                {/* Timer bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-gray-900">{activeTest.title}</h3>
                    <p className="text-xs text-gray-400">{activeTest.questions.length} questions | {activeTest.totalMarks} marks</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${
                    timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    <Clock className="w-5 h-5" />
                    {String(Math.floor(timeLeft/60)).padStart(2,'0')}:{String(timeLeft%60).padStart(2,'0')}
                  </div>
                </div>
                {/* Progress */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(testAnswers.filter(a => a !== undefined).length / activeTest.questions.length) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 text-right">{testAnswers.filter(a => a !== undefined).length}/{activeTest.questions.length} answered</p>
                {/* Questions */}
                {activeTest.questions.map((q, qi) => (
                  <div key={qi} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="font-semibold text-gray-900 mb-3"><span className="text-indigo-600 font-black">Q{qi+1}.</span> {q.question} <span className="text-xs text-gray-400">({q.marks} mark{q.marks>1?'s':''})</span></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <button key={oi} type="button" onClick={() => setTestAnswers(p => p.map((a,i) => i===qi ? oi : a))}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                            testAnswers[qi] === oi ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                          }`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            testAnswers[qi] === oi ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>{String.fromCharCode(65+oi)}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => handleSubmitTest(false)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base transition-colors shadow-lg">
                  Submit Test â†’â€™
                </button>
              </div>
            ) : testResult ? (
              /* Result view */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`px-6 py-5 text-white ${
                  testResult.attempt.percentage >= 60 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                  testResult.attempt.percentage >= 33 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-600 to-rose-600'
                }`}>
                  <h3 className="font-black text-xl">{testResult.test?.title}</h3>
                  <p className="text-white/80 text-sm">{testResult.test?.month}</p>
                  <div className="flex items-center gap-6 mt-3">
                    <div><div className="text-3xl font-black">{testResult.attempt.score}/{testResult.attempt.totalMarks}</div><div className="text-white/70 text-xs">Score</div></div>
                    <div><div className="text-3xl font-black">{testResult.attempt.percentage}%</div><div className="text-white/70 text-xs">Percentage</div></div>
                    <div><div className="text-2xl font-black">{testResult.attempt.percentage >= 33 ? 'â€œ PASS' : 'FAIL'}</div><div className="text-white/70 text-xs">Result</div></div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {testResult.test?.questions?.map((q, qi) => {
                    const selected = testResult.attempt.answers[qi];
                    const correct = testResult.correctAnswers[qi];
                    const isRight = selected === correct;
                    return (
                      <div key={qi} className={`p-4 rounded-xl border-2 ${
                        isRight ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <p className="font-semibold text-gray-900 text-sm mb-2"><span className="font-black">{isRight ? '' : 'Å’'} Q{qi+1}.</span> {q.question}</p>
                        <p className="text-xs text-gray-600">Your answer: <span className={`font-bold ${isRight ? 'text-green-700' : 'text-red-600'}`}>{selected !== undefined ? q.options[selected] : 'Not answered'}</span></p>
                        {!isRight && <p className="text-xs text-green-700 font-bold">Correct: {q.options[correct]}</p>}
                      </div>
                    );
                  })}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setTestResult(null); }}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      â†’Â Back to Tests
                    </button>
                    <button onClick={() => downloadTestResult(testResult.attempt, testResult.test, testResult.test?.questions, testResult.correctAnswers)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">
                      <Download className="w-4 h-4" /> Download Result
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Tests list */
              <div className="space-y-4">
                <h2 className="text-xl font-black text-gray-900">Monthly Tests <span className="text-indigo-600">({tests.length})</span></h2>
                {tests.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No tests available yet</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {tests.map(t => (
                      <motion.div key={t._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-black text-gray-900">{t.title}</h3>
                            <p className="text-xs text-indigo-600 font-semibold">{t.month}</p>
                          </div>
                          {t.attempted
                            ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">â€œ Done</span>
                            : <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">New</span>
                          }
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          {[['Questions', t.questions?.length||0], ['Marks', t.totalMarks||0], ['Duration', `${t.duration}m`]].map(([l,v]) => (
                            <div key={l} className="bg-gray-50 rounded-xl py-2">
                              <div className="text-sm font-black text-gray-900">{v}</div>
                              <div className="text-[10px] text-gray-400">{l}</div>
                            </div>
                          ))}
                        </div>
                        {t.attempted && t.myScore !== undefined && (
                          <div className="mb-3 px-3 py-2 bg-green-50 rounded-xl text-xs text-green-700 font-semibold">
                            Your Score: {t.myScore}/{t.totalMarks} ({t.myPercentage}%)
                          </div>
                        )}
                        <button onClick={() => handleStartTest(t)}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                            t.attempted ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                          }`}>
                          {t.attempted ? <><Eye className="w-4 h-4" /> View Result</> : <><ChevronRight className="w-4 h-4" /> Start Test</>}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admit Card Tab */}
        {activeTab === 'admitcard' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-black text-gray-900">My Admit Card</h2>
            </div>
            {/* Workflow status messages */}
            {!myExamForm && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-yellow-600" /></div>
                <div>
                  <p className="font-black text-yellow-800">Exam Form Not Submitted</p>
                  <p className="text-sm text-yellow-700 mt-1">Please submit your examination form first to get your Admit Card.</p>
                  <button onClick={() => setActiveTab('examform')} className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-xs font-bold transition-colors">Submit Exam Form â†’</button>
                </div>
              </div>
            )}
            {myExamForm && myExamForm.status === 'Pending' && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-orange-600" /></div>
                <div>
                  <p className="font-black text-orange-800">Examination Form Pending Approval</p>
                  <p className="text-sm text-orange-700 mt-1">Your examination form is under review. Admit Card will be available once approved by admin.</p>
                </div>
              </div>
            )}
            {myExamForm && myExamForm.status === 'Rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><XCircle className="w-5 h-5 text-red-600" /></div>
                <div>
                  <p className="font-black text-red-800">Examination Form Rejected</p>
                  <p className="text-sm text-red-700 mt-1">Your examination form was rejected. Please contact the institute administration.</p>
                </div>
              </div>
            )}
            {myExamForm && myExamForm.status === 'Approved' && !admitCard && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="font-black text-blue-800">Admit Card Not Released Yet</p>
                  <p className="text-sm text-blue-700 mt-1">Your exam form is approved. Admit Card will be available once the admin publishes the exam schedule and releases admit cards.</p>
                </div>
              </div>
            )}
            {admitCard && <AdmitCardComponent student={student} admitCard={admitCard} branch={branch} />}
          </motion.div>
        )}

        {/* Study Material Tab */}
        {activeTab === 'studymaterial' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-xl font-black text-gray-900">Study Material</h2>
            {studyMaterials.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <BookMarked className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-semibold">No study material available yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {studyMaterials.map((m, i) => {
                  const ytMatch = m.videoUrl && m.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
                  const ytThumb = ytMatch ? ('https://img.youtube.com/vi/' + ytMatch[1] + '/hqdefault.jpg') : null;
                  const thumb = m.thumbnailUrl || ytThumb;
                  const fixT = s => s ? s.replace(/-/g,'\u2013').replace(/-/g,'\u2014').replace(/ /g,' ') : s;
                  const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
                  const handleDownloadPdf = async () => {
                    const { default: jsPDF } = await import('jspdf');
                    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    const W = 210, M = 15;
                    let logoUrl = null;
                    try {
                      const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = '/logo.png'; });
                      const sz = 200, cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
                      const cx = cv.getContext('2d'); cx.beginPath(); cx.arc(sz/2,sz/2,sz/2,0,Math.PI*2); cx.closePath(); cx.clip(); cx.drawImage(img,0,0,sz,sz);
                      logoUrl = cv.toDataURL('image/png');
                    } catch(_) {}
                    doc.setFillColor(8,29,91); doc.rect(0,0,W,40,'F');
                    doc.setFillColor(212,175,55); doc.rect(0,40,W,2,'F');
                    if (logoUrl) doc.addImage(logoUrl,'PNG',M,7,24,24);
                    doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
                    doc.text('KEERTI COMPUTER INSTITUTE', M+30,18);
                    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(180,200,255);
                    doc.text('Govt. Recognised | ISO Certified | Ayodhya, U.P. | www.kci.org.in', M+30,26);
                    doc.setFillColor(212,175,55); doc.roundedRect(M+30,30,50,8,2,2,'F');
                    doc.setTextColor(8,29,91); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
                    doc.text('STUDY MATERIAL', M+55,35.5,{align:'center'});
                    let y = 52;
                    doc.setTextColor(8,29,91); doc.setFontSize(15); doc.setFont('helvetica','bold');
                    doc.text(fixT(m.title) || 'Study Material', W/2, y, {align:'center', maxWidth: W-M*2});
                    y += 8;
                    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100);
                    doc.text('Category: ' + (m.category ? m.category.replace('_',' ') : 'General') + '   |   Date: ' + (dateStr || 'N/A'), W/2, y, {align:'center'});
                    y += 5;
                    doc.setDrawColor(212,175,55); doc.setLineWidth(0.8); doc.line(M,y,W-M,y);
                    y += 8;
                    if (m.description) {
                      doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(40,40,40);
                      const lines = doc.splitTextToSize(m.description, W-M*2);
                      doc.text(lines, M, y); y += lines.length * 6 + 6;
                    }
                    if (thumb) {
                      try {
                        const imgEl = await new Promise((res,rej) => { const im = new Image(); im.crossOrigin='anonymous'; im.onload=()=>res(im); im.onerror=rej; im.src=thumb; });
                        const cvT = document.createElement('canvas'); cvT.width=imgEl.naturalWidth; cvT.height=imgEl.naturalHeight;
                        cvT.getContext('2d').drawImage(imgEl,0,0);
                        const imgH = Math.min(60, (imgEl.naturalHeight/imgEl.naturalWidth)*(W-M*2));
                        doc.addImage(cvT.toDataURL('image/jpeg',0.9),'JPEG',M,y,W-M*2,imgH);
                        y += imgH + 8;
                      } catch(_) {}
                    }
                    if (m.fileUrl) {
                      doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(8,29,91);
                      doc.text('Document Link:', M, y); y += 6;
                      doc.setFont('helvetica','normal'); doc.setTextColor(0,0,200);
                      doc.textWithLink(m.fileUrl, M, y, { url: m.fileUrl }); y += 10;
                    }
                    if (m.videoUrl) {
                      doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(8,29,91);
                      doc.text('Video Link:', M, y); y += 6;
                      doc.setFont('helvetica','normal'); doc.setTextColor(200,0,0);
                      doc.textWithLink(m.videoUrl, M, y, { url: m.videoUrl }); y += 10;
                    }
                    doc.setFillColor(8,29,91); doc.rect(0,275,W,22,'F');
                    doc.setTextColor(180,200,255); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
                    doc.text('Keerti Computer Institute | Civil Lines, Ayodhya, U.P. - 224001 | www.kci.org.in', W/2,284,{align:'center'});
                    doc.save((fixT(m.title)||'StudyMaterial').replace(/[^a-zA-Z0-9]/g,'_') + '.pdf');
                    toast.success('PDF downloaded!');
                  };
                  return (
                    <motion.div key={m._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {thumb ? (
                        <div className="relative">
                          <img src={thumb} alt={fixT(m.title)} className="w-full object-contain bg-white" style={{maxHeight:'160px'}} />
                          {m.videoUrl && (
                            <a href={m.videoUrl} target="_blank" rel="noreferrer"
                              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-36 bg-green-50 flex items-center justify-center">
                          <BookMarked className="w-10 h-10 text-green-300" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-black text-gray-900 leading-snug flex-1">{fixT(m.title)}</p>
                          {dateStr && <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{dateStr}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mb-3 capitalize">{m.category ? m.category.replace('_',' ') : ''}</p>
                        <div className="flex gap-2 flex-wrap">
                          {m.fileUrl && (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold">
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                          )}
                          <button onClick={handleDownloadPdf}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                          {m.videoUrl && (
                            <a href={m.videoUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Watch
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

                                {/* Change Password Tab */}
        {activeTab === 'changepassword' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-600 to-red-600 px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-white font-black">Change Password</h2>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {[['Current Password', 'current', 'Enter current password'], ['New Password', 'newPw', 'Min 6 characters'], ['Confirm New Password', 'confirm', 'Re-enter new password']].map(([label, key, placeholder]) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">{label}</label>
                    <input type="password" value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 bg-gray-50 focus:bg-white transition-all" />
                  </div>
                ))}
                <button type="submit" disabled={pwLoading}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all">
                  {pwLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                  {pwLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Notification View Modal */}
        {viewedNotification && (() => {
          const typeConfig = {
            exam: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Exam' },
            result: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Result' },
            course: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', label: 'Course' },
            fee: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Fee' },
            holiday: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', label: 'Holiday' },
            urgent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Urgent' },
            admission: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Admission' },
            general: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'General' },
          };
          const tc = typeConfig[viewedNotification.type] || typeConfig.general;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewedNotification(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#081d5b] to-[#1a3a8f] px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-black text-sm truncate">{viewedNotification.title}</span>
                  </div>
                  <button onClick={() => setViewedNotification(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white font-black text-base transition-colors shrink-0 ml-2">
                    Ã—
                  </button>
                </div>

                {/* Image (if exists) */}
                {viewedNotification.image && (
                  <div className="w-full bg-gray-100">
                    <img
                      src={viewedNotification.image}
                      alt={viewedNotification.title}
                      className="w-full max-h-56 object-cover"
                    />
                  </div>
                )}

                {/* Modal Body */}
                <div className="p-5 space-y-4">
                  <p className="text-gray-800 text-sm leading-relaxed">{viewedNotification.message}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tc.bg} ${tc.text} ${tc.border}`}>
                      {tc.label}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(viewedNotification.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {viewedNotification.createdBy && (
                      <span className="text-[11px] text-gray-400">
                        From: <span className="font-semibold text-gray-600">{viewedNotification.createdBy.branchName || viewedNotification.createdBy.name || 'KCI Admin'}</span>
                      </span>
                    )}
                  </div>

                  <button onClick={() => setViewedNotification(null)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#081d5b] to-[#1a3a8f] hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all">
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-gray-900">
                  Notifications {unreadCount > 0 && <span className="text-sm font-bold text-red-500 ml-1">({unreadCount} unread)</span>}
                </h2>
              </div>
              {unreadCount > 0 && (
                <button onClick={() => {
                  api.put('/notifications/mark-all-read').catch(() => {});
                  setNotifications(p => p.map(n => ({ ...n, isRead: true })));
                  setUnreadCount(0);
                }} className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-semibold">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">Notifications from admin and your branch will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n, i) => {
                  const typeConfig = {
                    exam:      { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'Exam' },
                    result:    { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  label: 'Result' },
                    course:    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', label: 'Course' },
                    fee:       { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Fee' },
                    holiday:   { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   label: 'Holiday' },
                    urgent:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    label: 'Urgent' },
                    admission: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Admission' },
                    general:   { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   label: 'General' },
                  };
                  const tc = typeConfig[n.type] || typeConfig.general;
                  const isFromBranch = !!n.branchId;
                  const markRead = () => {
                    if (!n.isRead) {
                      api.put(`/notifications/${n._id}/read`).catch(() => {});
                      setNotifications(p => p.map(x => x._id === n._id ? { ...x, isRead: true } : x));
                      setUnreadCount(p => Math.max(0, p - 1));
                    }
                  };
                  return (
                    <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={markRead}
                      className={`bg-white rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        !n.isRead ? 'border-l-4 border-l-blue-500 border-gray-100' : 'border-gray-100'
                      }`}>
                      <div className="flex items-start gap-4 p-4">
                        <div className={`w-10 h-10 ${tc.bg} rounded-xl flex items-center justify-center shrink-0`}>
                          <Bell className={`w-5 h-5 ${tc.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="font-black text-gray-900 text-sm truncate">{n.title}</span>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text} border ${tc.border}`}>
                              {tc.label}
                            </span>
                            {isFromBranch ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                Branch
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            {n.createdBy && (
                              <p className="text-[10px] text-gray-400">
                                From: {n.createdBy.branchName || n.createdBy.name || 'KCI Admin'}
                              </p>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); markRead(); setViewedNotification(n); }}
                              className="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0">
                              <Eye className="w-3 h-3" /> View
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Exam Form Tab */}
        {activeTab === 'examform' && (
          <ExamFormSection
            student={student}
            myExamForm={examFormData}
            onSubmitted={(form) => {
              setExamFormData(form);
              setMyExamForm(form);
            }}
          />
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (() => {
          const uploadedCerts = certificates.filter(c => c.certificateFile);
          return (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900">My Certificates <span className="text-blue-600">({uploadedCerts.length})</span></h2>
            {uploadedCerts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-semibold">Certificate abhi upload nahi hua hai.</p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold">ðŸ“ž 9936384736</div>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedCerts.map((c, idx) => (
                  <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-sm truncate">{c.courseName}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.certificateNumber}</p>
                        <p className="text-xs text-gray-400">{c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={certDownloadUrl(c.certificateFile, c.studentName, c.certificateNumber)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all"><Download className="w-3.5 h-3.5" /> PDF</a>
                      <button onClick={() => {
                        const url = fileUrl(c.certificateFile);
                        const win = window.open(url, '_blank', 'width=900,height=650');
                        if (win) { win.onload = () => { win.focus(); win.print(); }; }
                      }} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black transition-all"><Printer className="w-3.5 h-3.5" /> Print</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          );
                })()}
        </div>
        </div>
      </div>
    </div>
  );
}