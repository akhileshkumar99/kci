import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { generateStudyMaterialPDF } from '../utils/generateStudyMaterialPDF';
import {
  GraduationCap, Award, FileText, LogOut, User, Lock, BookMarked,
  Building2, Calendar, BookOpen, CheckCircle, CreditCard, Download,
  TrendingUp, ClipboardCheck, Clock, ChevronRight, Eye, KeyRound, QrCode,
  Mail, Phone, Users, MapPin, BadgeCheck, Hash, Layers, ShieldCheck,
  CalendarDays, MapPinned, Bell, XCircle, Printer, Home, Menu, X, Search, Sun, Moon, ArrowRight
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

// €€€ Grade color helper €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€
function CardInner({ W, H, student, branch, fields, qrDataUrl }) {
  const scale = W / 856;
  const s = (n) => Math.round(n * scale);
  const HDR = s(130);
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

      {/* BODY — height auto, never clipped */}
      <div style={{ background: '#f8f9fc', display: 'flex', flexShrink: 0, position: 'relative' }}>
        {/* Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: s(220), height: s(220), opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
          <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>

        {/* LEFT — fields, strict 3-column: label | colon | value */}
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

        {/* RIGHT — photo + QR */}
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
      .catch(() => { });
  }, [student, branch, uniqueId]);

  const admDate = student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : '-';
  const fields = [
    ['Form No', uniqueId],
    ['Name', student?.name],
    ['Father Name', student?.fatherName],
    ['Course', student?.courseName],
    ['Branch', branch?.branchName || student?.branchName || 'N/A'],
    ['Session', student?.batch || '-'],
    ['Date of Admission', admDate],
    ['Date of Birth', dob],
    ['Address', student?.address],
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
          win.document.write(`<html><head><title>ID Card — KCI</title><style>body{margin:0;padding:0;background:#fff;}@media print{body{margin:0;}@page{size:landscape;margin:0;}}</style></head><body>${el.innerHTML}</body></html>`);
          win.document.close(); win.focus();
          setTimeout(() => { win.print(); win.close(); }, 400);
          el.style.display = 'none';
        }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'linear-gradient(135deg,#065f46,#047857)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(6,95,70,0.4)' }}>
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Hidden PDF container — fixed 856px wide, never responsive, off-screen */}
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

      {/* Screen Preview — scales responsively, does NOT affect PDF */}
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
      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>⬆ Preview — Download PDF for print-ready card</p>
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

const API_BASE = import.meta.env.VITE_API_URL || '';
function fileUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

function ResultsSection({ results, fileResults }) {
  // Merge both arrays and deduplicate by _id — only show results with a PNG file
  const seen = new Set();
  const allResults = [...(fileResults || []), ...(results || [])]
    .filter(r => r.resultFile)
    .filter(r => {
      if (seen.has(r._id)) return false;
      seen.add(r._id);
      return true;
    });

  if (allResults.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
      <p className="text-gray-500 font-semibold">Result not uploaded yet.</p>
      <p className="text-xs text-gray-400 mt-1">Contact your branch or admin for result status.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-gray-900">My Results <span className="text-blue-600">({allResults.length})</span></h2>
      {allResults.map((r, idx) => (
        <motion.div key={r._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Result Card</p>
              <h3 className="text-white font-black text-lg leading-tight">{r.courseName || 'Result'}</h3>
              <p className="text-blue-300 text-xs mt-0.5">
                {r.rollNumber && <>Roll No: <span className="font-mono font-bold text-yellow-300">{r.rollNumber}</span></>}
                {r.formNo && <> | Form No: <span className="font-mono font-bold text-yellow-200">{r.formNo}</span></>}
                {r.batch && <> | Batch: {r.batch}</>}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {r.branch && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{r.branch}</span>}
              {r.examDate && <span className="text-blue-200 text-xs">{new Date(r.examDate).toLocaleDateString('en-IN')}</span>}
            </div>
          </div>
          <div className="p-5">
            {(r.studentName || r.fatherName) && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {r.studentName && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Student</div>
                    <div className="font-black text-gray-900 text-sm">{r.studentName}</div>
                  </div>
                )}
                {r.fatherName && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Father</div>
                    <div className="font-bold text-gray-700 text-sm">{r.fatherName}</div>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              <img src={fileUrl(r.resultFile)} alt="Result" className="w-full rounded-xl border border-gray-200 object-contain" />
              <div className="flex gap-2">
                <a href={fileUrl(r.resultFile)} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all">
                  <Eye className="w-4 h-4" /> View
                </a>
                <a href={fileUrl(r.resultFile)} download
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-black transition-all">
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}


// €€€ Certificate PDF Download €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€
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
    cx2.beginPath(); cx2.arc(sz / 2, sz / 2, sz / 2, 0, Math.PI * 2); cx2.closePath(); cx2.clip();
    cx2.drawImage(img, 0, 0, sz, sz);
    logoUrl = cv.toDataURL('image/png');
  } catch (_) { }

  // €€ OUTER DECORATIVE BORDER €€
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(3);
  doc.rect(6, 6, W - 12, H - 12);
  doc.setDrawColor(210, 170, 60); doc.setLineWidth(0.8);
  doc.rect(9, 9, W - 18, H - 18);
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.4);
  doc.rect(11, 11, W - 22, H - 22);

  // corner ornaments
  const corners = [[12, 12], [W - 12, 12], [12, H - 12], [W - 12, H - 12]];
  corners.forEach(([x, y]) => {
    doc.setFillColor(180, 140, 40);
    doc.circle(x, y, 2.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(x, y, 1.2, 'F');
  });

  // €€ GOLD HEADER BG €€
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

  // €€ CERTIFICATE TITLE €€
  doc.setFontSize(28); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 100, 20);
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 72, { align: 'center' });
  // underline
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.8);
  doc.line(W / 2 - 70, 75, W / 2 + 70, 75);

  // €€ BODY TEXT €€
  // €€ Load Colonna MT font €€
  let colonnaLoaded = false;
  try {
    const fontRes = await fetch('/colonna_b64.txt');
    const b64 = (await fontRes.text()).trim();
    doc.addFileToVFS('Colonna.ttf', b64);
    doc.addFont('Colonna.ttf', 'Colonna', 'normal');
    colonnaLoaded = true;
  } catch (_) { }

  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  doc.text('This is to certify that', W / 2, 88, { align: 'center' });

  // Student name ”” Colonna MT font
  const nameText = c.studentName || student?.name || '””';
  doc.setFontSize(28);
  doc.setFont(colonnaLoaded ? 'Colonna' : 'times', colonnaLoaded ? 'normal' : 'bolditalic');
  doc.setTextColor(15, 40, 110);
  doc.text(nameText, W / 2, 103, { align: 'center' });
  // name underline
  doc.setDrawColor(15, 40, 110); doc.setLineWidth(0.5);
  doc.line(W / 2 - 55, 106, W / 2 + 55, 106);

  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  doc.text('has successfully completed the course', W / 2, 116, { align: 'center' });

  // Course name
  doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 100, 20);
  doc.text(c.courseName || '””', W / 2, 128, { align: 'center' });

  doc.setFontSize(10.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  const rollText = `Roll No: ${c.rollNumber || '””'}   |   Grade: ${c.grade || '””'}   |   Issue Date: ${c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '””'}`;
  doc.text(rollText, W / 2, 139, { align: 'center' });

  // Branch
  if (branch?.branchName) {
    doc.setFontSize(9.5); doc.setTextColor(100, 100, 100);
    doc.text(`Branch: ${branch.branchName}${branch.branchCity ? ', ' + branch.branchCity : ''}`, W / 2, 147, { align: 'center' });
  }

  // €€ CERT NUMBER BADGE €€
  doc.setFillColor(245, 240, 220);
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.5);
  doc.roundedRect(W / 2 - 45, 151, 90, 10, 2, 2, 'FD');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 70, 10);
  doc.text(`Certificate No: ${c.certificateNumber || '””'}`, W / 2, 157.5, { align: 'center' });

  // €€ GRADE BADGE €€
  const gradeColors = { 'A+': [22, 163, 74], 'A': [37, 99, 235], 'B+': [124, 58, 237], 'B': [79, 70, 229], 'C': [217, 119, 6], 'D': [234, 179, 8] };
  const gc = gradeColors[c.grade] || [15, 40, 110];
  doc.setFillColor(...gc);
  doc.circle(W - 35, 105, 16, 'F');
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.8);
  doc.circle(W - 35, 105, 16, 'S');
  doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('GRADE', W - 35, 100, { align: 'center' });
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text(c.grade || 'A', W - 35, 110, { align: 'center' });

  // €€ FOOTER SIGNATURES €€
  const SY = H - 30;
  doc.setDrawColor(100, 100, 100); doc.setLineWidth(0.4);
  // left sig
  doc.line(25, SY, 85, SY);
  doc.setTextColor(80, 80, 80); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  doc.text('Student Signature', 55, SY + 5, { align: 'center' });
  doc.setFontSize(7.5); doc.setTextColor(120, 120, 120);
  doc.text(c.studentName || student?.name || '', 55, SY + 10, { align: 'center' });

  // center logo seal
  if (logoUrl) doc.addImage(logoUrl, 'PNG', W / 2 - 10, SY - 12, 20, 20);
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

// ─── Certificate download helper ─────────────────────────────────────────────
function certDownloadUrl(filePath, studentName, certNumber) {
  const ext = filePath?.split('.').pop()?.split('?')[0] || 'pdf';
  const safeName = (studentName || 'Student').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const safeCertNo = (certNumber || '').replace(/\//g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = `KCI_Certificate_${safeName}_${safeCertNo}.${ext}`;

  // Cloudinary URL — add fl_attachment for forced download with filename
  if (filePath?.includes('cloudinary.com')) {
    // Insert fl_attachment:filename before /upload/
    return filePath.replace('/upload/', `/upload/fl_attachment:${filename.replace(/\./g, '_')}/`);
  }
  // Local file — return as-is (backend serves it)
  return fileUrl(filePath);
}

// ─── Exam Form Section ───────────────────────────────────────────────────────
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
  const W = 210, M = 14;

  // Logo loading with emblem fallback
  let logoUrl = null;
  try {
    const img = await new Promise((res, rej) => { 
      const i = new Image(); 
      i.onload = () => res(i); 
      i.onerror = rej; 
      i.src = '/logo.png'; 
    });
    const sz = 300, cv = document.createElement('canvas'); 
    cv.width = sz; cv.height = sz;
    const cx = cv.getContext('2d'); 
    cx.beginPath(); 
    cx.arc(sz / 2, sz / 2, sz / 2, 0, Math.PI * 2); 
    cx.closePath(); 
    cx.clip(); 
    cx.drawImage(img, 0, 0, sz, sz);
    logoUrl = cv.toDataURL('image/png');
  } catch (_) { }

  // 1. TOP HEADER BANNER
  doc.setFillColor(11, 25, 44); doc.rect(0, 0, W, 44, 'F');
  doc.setFillColor(212, 175, 55); doc.rect(0, 44, W, 2.5, 'F'); // Gold accent bar

  // Logo / Emblem
  if (logoUrl) {
    doc.setFillColor(255, 255, 255);
    doc.circle(M + 12, 22, 14, 'F');
    doc.addImage(logoUrl, 'PNG', M, 10, 24, 24);
  } else {
    doc.setFillColor(212, 175, 55); doc.circle(M + 12, 22, 14, 'F');
    doc.setFillColor(11, 25, 44); doc.circle(M + 12, 22, 12, 'F');
    doc.setTextColor(212, 175, 55); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('KCI', M + 12, 25.5, { align: 'center' });
  }

  // Header Title & Subtitle
  doc.setTextColor(255, 255, 255); doc.setFontSize(15); doc.setFont('helvetica', 'bold');
  doc.text('KEERTI COMPUTER INSTITUTE', M + 30, 17);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 220, 255);
  doc.text('Govt. Recognised | ISO 9001:2015 Certified | Ayodhya, U.P. | www.kci.org.in', M + 30, 25);

  // Payment Receipt Pill Badge
  doc.setFillColor(212, 175, 55);
  doc.roundedRect(M + 30, 29.5, 56, 8.5, 2, 2, 'F');
  doc.setTextColor(11, 25, 44); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', M + 58, 35, { align: 'center' });

  let y = 54;

  // 2. RECEIPT METADATA CARD
  const receiptNo = `KCI/REC/${new Date().getFullYear()}/${(form.enrollmentNumber || 'ENR').replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;
  doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, W - M * 2, 16, 3, 3, 'FD');

  doc.setTextColor(11, 25, 44); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${receiptNo}`, M + 4, y + 6);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, W - M - 4, y + 6, { align: 'right' });

  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 101, 52);
  doc.text(`Status: ${form.status || 'Approved'}`, M + 4, y + 12);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
  doc.text(`Submitted: ${new Date(form.createdAt || Date.now()).toLocaleDateString('en-IN')}`, M + 42, y + 12);

  y += 22;

  // 3. STUDENT DETAILS SECTION
  doc.setFillColor(11, 25, 44); doc.roundedRect(M, y, W - M * 2, 7.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text('STUDENT DETAILS', M + 4, y + 5.2);
  y += 10.5;

  const studentRows = [
    ['Student Name', form.studentName || '—'],
    ["Father's Name", form.fatherName || '—'],
    ['Enrollment No.', form.enrollmentNumber || '—'],
    ['Course Enrolled', form.course || '—'],
    ['Batch / Session', form.batch || '2026'],
    ['Mobile Number', form.phone || '—'],
    ['Email Address', form.email || '—'],
    ['Residential Address', form.address || '—'],
  ];

  studentRows.forEach(([label, value], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(M, y, W - M * 2, 8, 'F');
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.2);
    doc.rect(M, y, W - M * 2, 8, 'S');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(11, 25, 44);
    doc.text(label, M + 4, y + 5.3);

    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 41, 59);
    doc.text(String(value), M + 65, y + 5.3, { maxWidth: W - M * 2 - 68 });
    y += 8;
  });

  y += 6;

  // 4. PAYMENT DETAILS SECTION
  doc.setFillColor(21, 128, 61); doc.roundedRect(M, y, W - M * 2, 7.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', M + 4, y + 5.2);
  y += 10.5;

  const payAmount = form.amount || 500;
  const payRows = [
    ['Payment Method', 'UPI (Instant Verification)'],
    ['UPI Receiver ID', 'akhileshkumar5044@ybl'],
    ['Amount Paid', `Rs. ${payAmount}`],
    ['UTR / Transaction ID', form.paymentUtr || '56666666666'],
    ['Payment Status', 'SUCCESSFUL / PAID'],
  ];

  payRows.forEach(([label, value], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 240 : 255, idx % 2 === 0 ? 253 : 255, idx % 2 === 0 ? 244 : 255);
    doc.rect(M, y, W - M * 2, 8, 'F');
    doc.setDrawColor(187, 247, 208); doc.setLineWidth(0.2);
    doc.rect(M, y, W - M * 2, 8, 'S');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(21, 128, 61);
    doc.text(label, M + 4, y + 5.3);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(30, 41, 59);
    doc.text(String(value), M + 65, y + 5.3);
    y += 8;
  });

  y += 7;

  // 5. TOTAL PAID HIGHLIGHT BOX
  doc.setFillColor(11, 25, 44); doc.roundedRect(M, y, W - M * 2, 15, 3, 3, 'F');
  doc.setDrawColor(212, 175, 55); doc.setLineWidth(0.5);
  doc.roundedRect(M, y, W - M * 2, 15, 3, 3, 'S');

  doc.setTextColor(212, 175, 55); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT PAID', M + 6, y + 9.5);
  doc.setFontSize(15);
  doc.text(`Rs. ${payAmount}`, W - M - 6, y + 9.5, { align: 'right' });

  y += 22;

  // 6. NOTE & HOTLINE BOX
  doc.setFillColor(254, 252, 232); doc.setDrawColor(234, 179, 8); doc.setLineWidth(0.4);
  doc.roundedRect(M, y, W - M * 2, 16, 2, 2, 'FD');
  doc.setTextColor(161, 98, 7); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT NOTE:', M + 4, y + 6);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(113, 63, 18); doc.setFontSize(7.5);
  doc.text('This is an official computer-generated payment receipt for your examination form submission.', M + 4, y + 11);
  doc.text('Keep this receipt for your records. For any support or queries: Call / WhatsApp 9936384736', M + 4, y + 15);

  // 7. FOOTER BANNER
  doc.setFillColor(11, 25, 44); doc.rect(0, 274, W, 23, 'F');
  doc.setTextColor(203, 213, 225); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('Keerti Computer Institute | Civil Lines, Ayodhya, U.P. - 224001', W / 2, 281, { align: 'center' });
  doc.text('www.kci.org.in | info@kci.org.in | Helpline: +91 9936384736', W / 2, 286.5, { align: 'center' });
  doc.setTextColor(212, 175, 55); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  doc.text('This receipt is digitally verified by KCI Examination Board and requires no physical signature.', W / 2, 292, { align: 'center' });

  doc.save(`KCI_Payment_Receipt_${(form.enrollmentNumber || 'Student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  toast.success('Receipt downloaded successfully!');
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
          <div className="text-white font-black text-lg">💳 Pay Exam Fee</div>
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
              <span className="text-lg font-black text-green-700">₹{amount}</span>
            </div>
          </div>

          <a href={upiDeepLink} onClick={() => setWaiting(true)}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-black text-sm text-center shadow-md transition-all">
            📱 Pay Now via UPI App
          </a>

          {waiting && (
            <div className="w-full py-3 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-700 font-bold text-sm">Waiting... return here after paying</span>
            </div>
          )}


          <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Back to Tests� Go Back
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
  const [step, setStep] = useState('form'); // 'form' | 'pay'
  const [payMethod, setPayMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [errs, setErrs] = useState({});

  // Payment form states
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const UPI_ID = 'akhileshkumar5044@ybl';
  const AMOUNT = 500;

  // Generate UPI QR with student-specific txn note
  useEffect(() => {
    if (!student) return;
    const txnNote = `KCI-EXAM-${student.enrollmentNumber || student.rollNumber || Date.now()}`;
    const upiString = `upi://pay?pa=${UPI_ID}&pn=Keerti Computer Institute&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    QRCode.toDataURL(upiString, { width: 220, margin: 1, color: { dark: '#081d5b', light: '#ffffff' } })
      .then(setUpiQr).catch(() => { });
  }, [student]);

  // Auto-fill when student data loads
  useEffect(() => {
    if (myExamForm) return; // already submitted
    if (!student) return;
    setForm(f => f ? f : {
      studentName: student.name || '',
      fatherName: student.fatherName || '',
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      gender: 'Male',
      category: 'General',
      enrollmentNumber: student.enrollmentNumber || student.rollNumber || '',
      course: student.courseName || '',
      batch: student.batch || '',
      examType: 'Regular',
      phone: student.phone || '',
      email: student.email || '',
      address: student.address || '',
      paymentUtr: '',
      amount: AMOUNT,
    });
  }, [student, myExamForm]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: '' })); };

  const validateForm = (f) => {
    const e = {};
    if (!f.studentName.trim()) e.studentName = 'Student name is required';
    if (!f.fatherName.trim()) e.fatherName = "Father's name is required";
    if (!f.dob) e.dob = 'Date of Birth is required';
    if (!f.gender) e.gender = 'Gender is required';
    if (!f.enrollmentNumber.trim()) e.enrollmentNumber = 'Enrollment Number is required';
    if (!f.course) e.course = 'Course selection is required';
    if (!f.batch.trim()) e.batch = 'Batch/Year is required';
    if (!f.phone.trim()) e.phone = 'Mobile Number is required';
    else if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter valid 10-digit mobile number';
    if (!f.email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter valid email address';
    if (!f.address.trim()) e.address = 'Address is required';
    return e;
  };

  const handleFinalSubmit = async (utrCode) => {
    if (!utrCode || utrCode.trim().length < 6) return toast.error('Enter a valid 12-digit UTR / Transaction ID');
    setSubmitting(true);
    try {
      const payload = { ...form, paymentUtr: utrCode.trim(), amount: AMOUNT, paymentStatus: 'Paid' };
      const { data } = await api.post('/exam-forms', payload);
      toast.success('🎉 Exam Form Submitted & Fee Paid Successfully!');
      onSubmitted(data.form);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please check payment UTR.');
    }
    setSubmitting(false);
  };

  const statusColor = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-300',
    Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  const inp = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium text-slate-800';
  const sel = inp + ' cursor-pointer';

  // ── 1. ALREADY SUBMITTED RECEIPT VIEW ──
  if (myExamForm) return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-1">
          <CheckCircle className="w-6 h-6 text-amber-300" />
          <h2 className="text-lg font-black tracking-wide">Exam Registration Active & Paid</h2>
        </div>
        <p className="text-emerald-100 text-xs sm:text-sm">Your examination form and fee payment (₹{myExamForm.amount || AMOUNT}) are verified.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-base">Registration Details</h3>
            <p className="text-xs text-slate-400">Transaction Ref: KCI-EXAM-{myExamForm.enrollmentNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${statusColor[myExamForm.status] || statusColor.Pending}`}>
              {myExamForm.status || 'Approved'}
            </span>
            <button
              type="button"
              onClick={() => downloadReceiptPDF(myExamForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer">
              <Download className="w-4 h-4" /> Download PDF Receipt
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {[
            ['Student Name', myExamForm.studentName],
            ['Enrollment No.', myExamForm.enrollmentNumber],
            ['Father\'s Name', myExamForm.fatherName],
            ['Course', myExamForm.course],
            ['Batch', myExamForm.batch],
            ['Exam Type', myExamForm.examType || 'Regular'],
            ['Phone Number', myExamForm.phone],
            ['Email Address', myExamForm.email],
            ['Payment Amount', `₹${myExamForm.amount || AMOUNT} (Paid)`],
            ['Payment UTR', myExamForm.paymentUtr || 'VERIFIED-ONLINE'],
            ['Submission Date', new Date(myExamForm.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
          ].map(([l, v]) => (
            <div key={l} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-500 text-xs">{l}</span>
              <span className="font-extrabold text-slate-900 text-xs">{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (!form) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  // ── 2. PAYMENT GATEWAY STEP ──
  if (step === 'pay') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-6 text-white text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2 border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL Secure Payment
            </div>
            <h2 className="text-2xl font-black tracking-tight">KCI Examination Fee Payment</h2>
            <p className="text-blue-200 text-xs mt-1">Student: <span className="text-white font-bold">{form.studentName}</span> | Roll: <span className="font-mono text-amber-300 font-bold">{form.enrollmentNumber}</span></p>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-around items-center">
              <div>
                <div className="text-[10px] text-blue-300 uppercase tracking-wider font-bold">Total Fee</div>
                <div className="text-2xl font-black text-amber-400">₹{AMOUNT}</div>
              </div>
              <div className="h-8 w-[1px] bg-white/20" />
              <div>
                <div className="text-[10px] text-blue-300 uppercase tracking-wider font-bold">Course</div>
                <div className="text-xs font-bold text-white max-w-[150px] truncate">{form.course}</div>
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD TABS */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setPayMethod('upi')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${payMethod === 'upi' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>📱 UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${payMethod === 'card' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>💳 Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('netbanking')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${payMethod === 'netbanking' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>🏦 Net Banking</span>
              </button>
            </div>

            {/* TAB 1: UPI / QR */}
            {payMethod === 'upi' && (
              <div className="space-y-4 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                  {upiQr ? (
                    <img src={upiQr} alt="UPI QR" className="w-48 h-48 mx-auto rounded-xl border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Official UPI ID</div>
                    <div className="font-mono font-bold text-blue-900 text-sm select-all">{UPI_ID}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(UPI_ID); toast.success('UPI ID copied!'); }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700"
                  >
                    Copy UPI
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 text-left mb-1.5">
                    Enter UTR / Transaction Ref ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.paymentUtr}
                    onChange={e => set('paymentUtr', e.target.value.toUpperCase())}
                    placeholder="e.g. 426112345678"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-center font-mono text-base tracking-widest text-slate-900 focus:border-blue-600 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-left">
                    Find the 12-digit UTR number in your PhonePe / Google Pay / Paytm transaction history.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleFinalSubmit(form.paymentUtr)}
                  disabled={submitting || !form.paymentUtr}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{submitting ? 'Verifying & Submitting...' : 'Verify UTR & Submit Form'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: DEBIT / CREDIT CARD */}
            {payMethod === 'card' && (
              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardForm.name}
                    onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Name as on Card"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardForm.number}
                    onChange={e => setCardForm(p => ({ ...p, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() }))}
                    placeholder="4532 •••• •••• 8910"
                    className={inp}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardForm.expiry}
                      onChange={e => setCardForm(p => ({ ...p, expiry: e.target.value }))}
                      placeholder="MM/YY"
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CVV Code</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardForm.cvv}
                      onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value }))}
                      placeholder="•••"
                      className={inp}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!cardForm.name || !cardForm.number || !cardForm.expiry || !cardForm.cvv) {
                      return toast.error('Please enter all card details');
                    }
                    setShowOtpModal(true);
                  }}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
                >
                  <Lock className="w-4 h-4" /> Pay ₹{AMOUNT} via Card
                </button>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {payMethod === 'netbanking' && (
              <div className="space-y-4 text-left">
                <label className="block text-xs font-bold text-slate-700">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${selectedBank === bank ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      🏦 {bank}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedBank) return toast.error('Please select a bank');
                    const simulatedUtr = `NB-${selectedBank.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`;
                    handleFinalSubmit(simulatedUtr);
                  }}
                  disabled={submitting || !selectedBank}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer mt-2"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Proceed to {selectedBank || 'Net Banking'}</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full text-xs text-slate-500 hover:text-slate-800 font-bold py-1 transition-colors"
            >
              ← Edit Examination Form Details
            </button>
          </div>
        </div>

        {/* SIMULATED 3D SECURE CARD OTP MODAL */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">3D Secure OTP Verification</h3>
              <p className="text-xs text-slate-500">Enter 6-digit OTP sent to your registered mobile number for payment of ₹{AMOUNT}</p>
              <div className="p-2 bg-blue-50 rounded-xl text-xs font-mono font-bold text-blue-800">Demo OTP Code: 123456</div>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-center font-mono text-lg tracking-widest outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (otpInput.trim() !== '123456' && otpInput.trim().length !== 6) return toast.error('Enter valid 6-digit OTP (123456)');
                    setShowOtpModal(false);
                    const simulatedUtr = `CARD-PAY-${Date.now().toString().slice(-10)}`;
                    handleFinalSubmit(simulatedUtr);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                >
                  Confirm & Pay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  // ── 3. EXAMINATION REGISTRATION FORM ──
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-black text-xl">Student Examination Registration</h2>
              <p className="text-blue-200 text-xs">Fill out the required examination details to proceed to fee payment</p>
            </div>
          </div>
        </div>

        <form onSubmit={e => {
          e.preventDefault();
          const e2 = validateForm(form);
          if (Object.keys(e2).length) { setErrs(e2); toast.error('Please fill all required fields correctly'); return; }
          setStep('pay');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} className="p-6 sm:p-8 space-y-6">

          {/* SECTION 1: PERSONAL DETAILS */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" /> Personal Details (Required)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Student Full Name *</label>
                <input value={form.studentName} onChange={e => set('studentName', e.target.value)} className={`${inp} ${errs.studentName ? 'border-red-500' : ''}`} placeholder="Full Name" />
                {errs.studentName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.studentName}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Father's Name *</label>
                <input value={form.fatherName} onChange={e => set('fatherName', e.target.value)} className={`${inp} ${errs.fatherName ? 'border-red-500' : ''}`} placeholder="Father's Name" />
                {errs.fatherName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.fatherName}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Date of Birth *</label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className={`${inp} ${errs.dob ? 'border-red-500' : ''}`} />
                {errs.dob && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.dob}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Gender *</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={`${sel} ${errs.gender ? 'border-red-500' : ''}`}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC & EXAM DETAILS */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Academic & Exam Details (Required)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Enrollment / Roll Number *</label>
                <input value={form.enrollmentNumber} onChange={e => set('enrollmentNumber', e.target.value)} className={`${inp} ${errs.enrollmentNumber ? 'border-red-500' : ''}`} placeholder="e.g. KCI-2024-001" />
                {errs.enrollmentNumber && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.enrollmentNumber}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Select Course *</label>
                <select value={form.course} onChange={e => set('course', e.target.value)} className={`${sel} ${errs.course ? 'border-red-500' : ''}`}>
                  <option value="">-- Select Course --</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errs.course && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.course}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Batch / Year *</label>
                <input value={form.batch} onChange={e => set('batch', e.target.value)} className={`${inp} ${errs.batch ? 'border-red-500' : ''}`} placeholder="e.g. 2024 Morning Batch" />
                {errs.batch && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.batch}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Exam Type *</label>
                <select value={form.examType} onChange={e => set('examType', e.target.value)} className={sel}>
                  <option value="Regular">Regular Examination</option>
                  <option value="Ex-Student">Ex-Student Examination</option>
                  <option value="Improvement">Improvement / Back</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTACT INFORMATION */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Phone className="w-4 h-4 text-blue-600" /> Contact Details (Required)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Mobile Number *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10} className={`${inp} ${errs.phone ? 'border-red-500' : ''}`} placeholder="10-digit Mobile Number" />
                {errs.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.phone}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Email Address *</label>
                <input value={form.email} onChange={e => set('email', e.target.value)} className={`${inp} ${errs.email ? 'border-red-500' : ''}`} placeholder="Email Address" />
                {errs.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 mb-1 block">Permanent Address *</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} className={`${inp} ${errs.address ? 'border-red-500' : ''}`} placeholder="Complete Residential Address" />
                {errs.address && <p className="text-red-500 text-[10px] mt-1 font-bold">{errs.address}</p>}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.99] cursor-pointer"
          >
            <span>Proceed to Pay Exam Fee (₹{AMOUNT})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function StudentSidebarContent({ tabs, activeTab, setActiveTab, onCloseMobile, student, user, unreadCount, handleLogout }) {
  return (
    <div className="flex flex-col h-full bg-[#0D1527] text-white overflow-hidden select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/40 shrink-0 bg-white p-0.5 shadow-md flex items-center justify-center">
            <img src="/logo.png" alt="KCI Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-black text-xs sm:text-sm tracking-wide leading-tight truncate">KEERTI</div>
            <div className="text-[10px] font-bold text-slate-300 leading-tight truncate">COMPUTER INSTITUTE</div>
            <div className="text-blue-400 text-[9px] font-semibold tracking-wider">Learn • Grow • Succeed</div>
          </div>
        </div>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 ml-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${isActive
                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1 truncate">{label}</span>
              {id === 'notifications' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 shrink-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Promo Card & Logout */}
      <div className="p-3.5 border-t border-slate-800/80 shrink-0 space-y-3 bg-[#090F1C]">
        <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 text-white overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-black leading-tight">Upgrade Your Skills</div>
              <div className="text-[10px] text-blue-200">Build a Brighter Future</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('kci_student_theme') === 'dark');

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('kci_student_theme', next ? 'dark' : 'light');
      return next;
    });
  };
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
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [admitCard, setAdmitCard] = useState(null);
  const [admitCardEnabled, setAdmitCardEnabled] = useState(false);
  const [myExamForm, setMyExamForm] = useState(null);
  const [examFormData, setExamFormData] = useState(null);
  const [examFormLoading, setExamFormLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewedNotification, setViewedNotification] = useState(null);
  const [fileResults, setFileResults] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { navigate('/login'); return; }
    setLoading(true);
    api.get('/branch/student/me')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load data'); setLoading(false); });
    api.get('/branch/student/tests').then(r => setTests(r.data.tests || [])).catch(() => { });
    api.get('/study-material').then(r => setStudyMaterials(r.data.materials || [])).catch(() => { });
    api.get('/admit-card/setting').then(r => setAdmitCardEnabled(r.data.enabled || false)).catch(() => { });
    api.get('/exam-forms/my').then(r => {
      setMyExamForm(r.data.form || null);
      setExamFormData(r.data.form || null);
      if (r.data.form) {
        api.get('/admit-card/my').then(r2 => setAdmitCard(r2.data.admitCard || null)).catch(() => { });
      }
    }).catch(() => { });
    // Fetch file-based results uploaded by admin/branch
    api.get('/results/my').then(r => setFileResults(r.data.results || [])).catch(() => { });
    // Fetch all certificates by enrollmentNumber/formNo
    api.get('/certificates/my-all').then(r => {
      if (r.data.certificates?.length) {
        setData(prev => ({ ...prev, certificates: r.data.certificates }));
      }
    }).catch(() => { });
    api.get('/notifications/my').then(r => { setNotifications(r.data.notifications || []); setUnreadCount(r.data.unreadCount || 0); }).catch(() => { });
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
      setPwShow({ current: false, newPw: false, confirm: false });
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
      const cx = cv.getContext('2d'); cx.beginPath(); cx.arc(sz / 2, sz / 2, sz / 2, 0, Math.PI * 2); cx.closePath(); cx.clip(); cx.drawImage(img, 0, 0, sz, sz);
      logoUrl = cv.toDataURL('image/png');
    } catch (_) { }

    // €€ HEADER €€
    doc.setFillColor(15, 40, 110); doc.rect(0, 0, W, 46, 'F');
    doc.setFillColor(250, 204, 21); doc.rect(0, 46, W, 2.5, 'F');
    if (logoUrl) doc.addImage(logoUrl, 'PNG', M, 7, 28, 28);
    doc.setTextColor(255, 255, 255); doc.setFontSize(15); doc.setFont('helvetica', 'bold');
    doc.text('KEERTI COMPUTER INSTITUTE', M + 34, 18);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 210, 255);
    doc.text('Govt. Recognised | Est. 2005 | www.kci.org.in', M + 34, 26);
    // RESULT CARD pill
    doc.setFillColor(250, 204, 21);
    doc.roundedRect(M + 34, 31, 44, 8, 2, 2, 'F');
    doc.setTextColor(15, 40, 110); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
    doc.text('TEST RESULT CARD', M + 56, 36.2, { align: 'center' });

    // €€ INFO BOX €€
    doc.setFillColor(245, 248, 255); doc.setDrawColor(200, 210, 240);
    doc.roundedRect(M, 54, W - M * 2, 46, 3, 3, 'FD');
    // section label
    doc.setFillColor(15, 40, 110); doc.roundedRect(M, 54, 36, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('TEST DETAILS', M + 18, 58.8, { align: 'center' });

    // PASS/FAIL badge ”” top right of info box
    const pass = attempt.percentage >= 33;
    doc.setFillColor(...(pass ? [22, 163, 74] : [220, 38, 38]));
    doc.roundedRect(W - M - 26, 55, 24, 11, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(pass ? 'PASS' : 'FAIL', W - M - 14, 62, { align: 'center' });

    // Info rows ”” 2 columns, fixed positions
    // Left:  label @ M+4,  value @ M+30
    // Right: label @ W/2+4, value @ W/2+30
    const LL = M + 4, LV = M + 32;
    const RL = W / 2 + 4, RV = W / 2 + 32;
    const LMAX = W / 2 - LV - 2;   // ~57mm
    const RMAX = W - M - RV - 2; // ~57mm

    const infoData = [
      ['Test Title', test?.title || '””', 'Month', test?.month || '””'],
      ['Student', attempt.studentName || '””', 'Roll No.', attempt.rollNumber || '””'],
      ['Score', `${attempt.score} / ${attempt.totalMarks}`, 'Percentage', `${attempt.percentage}%`],
    ];

    infoData.forEach(([l1, v1, l2, v2], i) => {
      const y = 70 + i * 11;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 100, 160);
      doc.text(l1 + ' :', LL, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(15, 15, 15);
      doc.text(String(v1), LV, y, { maxWidth: LMAX });

      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 100, 160);
      doc.text(l2 + ' :', RL, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(15, 15, 15);
      doc.text(String(v2), RV, y, { maxWidth: RMAX });
    });

    // Time + Date below info box
    const metaY = 103;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
    if (attempt.timeTaken) doc.text(`Time Taken: ${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`, M, metaY);
    doc.text(`Date: ${new Date(attempt.submittedAt).toLocaleDateString('en-IN')}`, W - M, metaY, { align: 'right' });

    // €€ QUESTIONS TABLE €€
    const rows = (questions || []).map((q, i) => [
      i + 1,
      q.question,
      attempt.answers[i] !== undefined ? (q.options[attempt.answers[i]] || '””') : 'Not answered',
      q.options[correctAnswers[i]] || '””',
      attempt.answers[i] === correctAnswers[i] ? 'Correct' : 'Wrong',
    ]);

    autoTable(doc, {
      startY: 107,
      head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Result']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [15, 40, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: [20, 20, 20], cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 66 },
        2: { cellWidth: 36 },
        3: { cellWidth: 36 },
        4: { halign: 'center', cellWidth: 20 },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const v = data.cell.raw;
          const isCorrect = v === 'Correct';
          doc.setFillColor(isCorrect ? 220 : 255, isCorrect ? 255 : 220, isCorrect ? 220 : 220);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(isCorrect ? 22 : 180, isCorrect ? 120 : 30, isCorrect ? 22 : 30);
          doc.setFontSize(8); doc.setFont('helvetica', 'bold');
          doc.text(v, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1.5, { align: 'center' });
        }
      },
      margin: { left: M, right: M },
    });

    // €€ SUMMARY BOX €€
    const tY = doc.lastAutoTable.finalY + 7;
    doc.setFillColor(15, 40, 110); doc.roundedRect(M, tY, W - M * 2, 26, 3, 3, 'F');
    doc.setFillColor(250, 204, 21); doc.roundedRect(M, tY, W - M * 2, 2, 1, 1, 'F');

    const sumItems = [
      ['SCORE', `${attempt.score}/${attempt.totalMarks}`],
      ['PERCENTAGE', `${attempt.percentage}%`],
      ['RESULT', pass ? 'PASS' : 'FAIL'],
    ];
    const cW = (W - M * 2) / 3;
    sumItems.forEach(([lbl, val], i) => {
      const x = M + i * cW + cW / 2;
      if (i > 0) { doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.3); doc.line(M + i * cW, tY + 3, M + i * cW, tY + 24); }
      doc.setTextColor(180, 210, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.text(lbl, x, tY + 10, { align: 'center' });
      const isResult = lbl === 'RESULT';
      doc.setTextColor(isResult ? 250 : 255, isResult ? 204 : 255, isResult ? 21 : 255);
      doc.setFontSize(13); doc.setFont('helvetica', 'bold');
      doc.text(String(val), x, tY + 22, { align: 'center' });
    });

    // €€ FOOTER €€
    const fY = tY + 34;
    doc.setFillColor(245, 248, 255); doc.rect(0, fY, W, 12, 'F');
    doc.setTextColor(120, 120, 120); doc.setFontSize(7); doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-IN')}  |  Keerti Computer Institute  |  9936384736`,
      W / 2, fY + 7, { align: 'center' }
    );

    doc.save(`TestResult_${attempt.rollNumber}_${(test?.title || 'KCI').replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-300 font-semibold text-sm animate-pulse">Loading your portal...</p>
      </div>
    </div>
  );

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good Morning ☀️' : hr < 17 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙';

  return (
    <div className={`min-h-screen font-sans w-full lg:grid lg:grid-cols-[240px_minmax(0,1fr)] student-portal transition-colors duration-300 ${darkMode ? 'bg-[#0B132B] text-slate-100 dark' : 'bg-[#F4F7FC] text-[#172033]'}`}>
      <style>{`
        .student-portal.dark .bg-white {
          background-color: #131F3F !important;
          border-color: #1E293B !important;
          color: #F8FAFC !important;
        }
        .student-portal.dark .bg-gray-50,
        .student-portal.dark .bg-slate-50 {
          background-color: #0F172A !important;
          border-color: #1E293B !important;
          color: #F8FAFC !important;
        }
        .student-portal.dark .bg-gray-100,
        .student-portal.dark .bg-slate-100 {
          background-color: #1E293B !important;
          color: #CBD5E1 !important;
        }
        .student-portal.dark .text-gray-900,
        .student-portal.dark .text-slate-900,
        .student-portal.dark .text-gray-800,
        .student-portal.dark .text-slate-800,
        .student-portal.dark .text-[#172033] {
          color: #FFFFFF !important;
        }
        .student-portal.dark .text-gray-700,
        .student-portal.dark .text-slate-700 {
          color: #E2E8F0 !important;
        }
        .student-portal.dark .text-gray-600,
        .student-portal.dark .text-slate-600 {
          color: #CBD5E1 !important;
        }
        .student-portal.dark .text-gray-500,
        .student-portal.dark .text-slate-500,
        .student-portal.dark .text-gray-400,
        .student-portal.dark .text-slate-400 {
          color: #94A3B8 !important;
        }
        .student-portal.dark .border-gray-100,
        .student-portal.dark .border-gray-200,
        .student-portal.dark .border-slate-100,
        .student-portal.dark .border-slate-200 {
          border-color: #1E293B !important;
        }
        .student-portal.dark input,
        .student-portal.dark select,
        .student-portal.dark textarea {
          background-color: #0F172A !important;
          color: #F8FAFC !important;
          border-color: #334155 !important;
        }
      `}</style>

      {/* DESKTOP PERMANENT DARK SIDEBAR (Visible >= 1024px) */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 z-40 bg-[#151D2C] border-r border-slate-800 shrink-0">
        <StudentSidebarContent
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          student={data.student}
          user={user}
          unreadCount={unreadCount}
          handleLogout={handleLogout}
        />
      </aside>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY & ASIDE (< 1024px) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-[60] w-[260px] max-w-[78vw] flex flex-col shadow-2xl lg:hidden"
            >
              <StudentSidebarContent
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onCloseMobile={() => setSidebarOpen(false)}
                student={data.student}
                user={user}
                unreadCount={unreadCount}
                handleLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN AREA */}
      <div className={`min-w-0 w-full flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0B132B]' : 'bg-[#F4F7FC]'}`}>

        {/* TOP HEADER */}
        <header className={`backdrop-blur-md sticky top-0 z-40 shrink-0 h-[64px] sm:h-[72px] px-4 sm:px-6 flex items-center justify-between shadow-xs transition-colors duration-300 ${darkMode ? 'bg-[#131F3F]/90 border-b border-slate-800 text-white' : 'bg-white/95 border-b border-slate-200/80'
          }`}>
          {/* Left Header Controls */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="lg:hidden w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                <img src="/logo.png" alt="KCI" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className={`font-black text-base sm:text-lg lg:text-xl leading-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {tabs.find(t => t.id === activeTab)?.label || 'Student Portal'}
                </h1>
                <p className={`hidden sm:block text-xs font-semibold truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Welcome back, {data.student?.name || user?.name || 'Student'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Dark / Light Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer shadow-xs ${darkMode
                ? 'bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 border border-slate-200/80 hover:bg-slate-200'
                }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </motion.button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 p-1 rounded-xl transition-colors cursor-pointer ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-black flex items-center justify-center overflow-hidden border border-slate-300 shadow-sm shrink-0">
                {data.student?.photo ? (
                  <img src={data.student.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  ((data.student?.name?.[0] || user?.name?.[0] || 'S').toUpperCase())
                )}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <div className={`text-xs font-black leading-tight truncate max-w-[120px] ${darkMode ? 'text-white' : 'text-slate-900'}`}>{data.student?.name || user?.name}</div>
                <div className="text-[10px] text-blue-500 font-bold font-mono truncate">{data.student?.rollNumber || 'Student'}</div>
              </div>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1 box-border pb-28 lg:pb-8">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">

              {/* ── TOP SEARCH & USER HEADER (DESKTOP) ── */}
              <div className={`hidden lg:flex items-center justify-between gap-4 rounded-2xl p-3 px-5 shadow-xs border transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/80'
                }`}>
                <div className={`flex items-center gap-3 rounded-xl px-4 py-2 flex-1 max-w-md border transition-colors duration-300 ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-100/80 border-slate-200/60 text-slate-700'
                  }`}>
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input type="text" placeholder="Search anything..." className="bg-transparent text-xs sm:text-sm outline-none w-full font-medium" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDarkMode}
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                  </motion.button>
                  <button onClick={() => setActiveTab('notifications')} className={`relative p-2 rounded-xl transition-colors cursor-pointer ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-600'
                    }`}>
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  </button>
                  <div className={`h-6 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                      {data.student?.photo ? <img src={data.student.photo} alt="" className="w-full h-full object-cover" /> : ((data.student?.name?.[0] || user?.name?.[0] || 'S').toUpperCase())}
                    </div>
                    <div className="text-left">
                      <div className={`text-xs font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{data.student?.name || user?.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Student</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── MAIN HERO BANNER (MATCHES REFERENCE IMAGE HERO) ── */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="relative rounded-[24px] overflow-hidden shadow-xl text-white p-6 sm:p-8"
                style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #172C63 50%, #10245A 100%)' }}>
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-200">Welcome Back 👋</span>
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                        {data.student?.name || user?.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-200 mt-1 font-medium">Your learning journey continues...</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified Student
                      </span>
                      <span className="text-xs italic font-serif text-purple-300 tracking-wide">
                        “Learn Apply Grow Succeed”
                      </span>
                    </div>

                    {/* Bottom Metadata Bar inside Hero */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-200 font-mono">
                        <Hash className="w-3.5 h-3.5 text-blue-400" />
                        <span>{data.student?.rollNumber || data.student?.formNo || '2026010005'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-200">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold">{data.student?.courseName || 'DCA'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-200 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Batch {data.student?.batch || '2026'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side banner graphic & card (Desktop) */}
                  <div className="hidden lg:flex flex-col items-end gap-3 shrink-0">
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-200 font-medium">
                      📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right max-w-[220px] shadow-lg">
                      <div className="text-xs font-black text-white">Better Skills Brighter Future</div>
                      <div className="text-[10px] text-blue-200 mt-1">Keerti Computer Institute</div>
                      {data.branch && (
                        <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-bold text-amber-300 flex items-center justify-end gap-1">
                          <Building2 className="w-3 h-3" /> {data.branch.branchName || 'Ayodhya Branch'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── TOP STAT CARDS ROW (3 CARDS - ACTUAL DATA, PREMIUM LAYOUT) ── */}
              {/* ── ACADEMIC PROGRESS CARD (TOP SECTION) ── */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ delay: 0.1 }}
                onClick={() => setActiveTab('results')}
                className={`rounded-[24px] p-5 sm:p-6 cursor-pointer transition-all duration-300 border shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-xl group ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
                  }`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">🟣</div>
                    <h3 className={`font-black text-sm sm:text-base ${darkMode ? 'text-white' : 'text-[#172033]'}`}>Academic Progress</h3>
                  </div>
                  <span className="text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">View Details →</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* SVG Ring Meter */}
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className={darkMode ? "text-slate-800" : "text-slate-100"} strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-500" strokeDasharray="75, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>75%</span>
                    </div>
                  </div>

                  {/* Right info & bar columns */}
                  <div className="flex-1 min-w-0 space-y-3 w-full">
                    <div>
                      <div className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Overall Course Progress</div>
                      <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>You are doing great! Keep it up.</div>
                    </div>
                    <div className={`flex items-end gap-2 h-16 pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      {[40, 60, 45, 80, 75, 90, 85].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-t-md relative overflow-hidden transition-colors ${darkMode ? 'bg-slate-800' : 'bg-blue-100'}`} style={{ height: `${h}%` }}>
                          <div className="absolute bottom-0 inset-x-0 bg-blue-600 rounded-t-md group-hover:bg-blue-500 transition-colors" style={{ height: '70%' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── TOP STAT CARDS ROW (3 CARDS BELOW ACADEMIC PROGRESS) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Results Published Card */}
                <motion.div
                  whileHover={{ scale: 1.025, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('results')}
                  className={`relative overflow-hidden rounded-[24px] border p-5 sm:p-6 transition-all duration-300 cursor-pointer group flex flex-col justify-between ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white shadow-xl hover:border-emerald-500/50' : 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.05)] hover:shadow-2xl hover:border-emerald-300'
                    }`}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />

                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-xs ${darkMode ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${darkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Data
                    </span>
                  </div>

                  <div>
                    <div className={`text-3xl sm:text-4xl font-black tracking-tight transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {results?.length ?? 0}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Results Published
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-black text-emerald-500 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span>View Examination Results</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                {/* Certificates Issued Card */}
                <motion.div
                  whileHover={{ scale: 1.025, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('certificates')}
                  className={`relative overflow-hidden rounded-[24px] border p-5 sm:p-6 transition-all duration-300 cursor-pointer group flex flex-col justify-between ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white shadow-xl hover:border-purple-500/50' : 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.05)] hover:shadow-2xl hover:border-purple-300'
                    }`}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-purple-500/10 blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-300" />

                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-xs ${darkMode ? 'bg-purple-950/50 border-purple-800/80 text-purple-400 group-hover:bg-purple-600 group-hover:text-white' : 'bg-purple-50 border-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                      }`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${darkMode ? 'bg-purple-950/60 text-purple-300 border-purple-800/60' : 'bg-purple-50 text-purple-700 border-purple-200/60'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      Verified
                    </span>
                  </div>

                  <div>
                    <div className={`text-3xl sm:text-4xl font-black tracking-tight transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {certificates ? certificates.filter(c => c.certificateFile).length : 0}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Certificates Issued
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-black text-purple-400 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span>View Certificates</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                {/* Tests Completed Card */}
                <motion.div
                  whileHover={{ scale: 1.025, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('tests')}
                  className={`relative overflow-hidden rounded-[24px] border p-5 sm:p-6 transition-all duration-300 cursor-pointer group flex flex-col justify-between ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white shadow-xl hover:border-blue-500/50' : 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.05)] hover:shadow-2xl hover:border-blue-300'
                    }`}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-300" />

                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-xs ${darkMode ? 'bg-blue-950/50 border-blue-800/80 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                      }`}>
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${darkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200/60'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Active Module
                    </span>
                  </div>

                  <div>
                    <div className={`text-3xl sm:text-4xl font-black tracking-tight transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {tests?.length ?? 0}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Tests Completed
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-black text-blue-400 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span>View Monthly Tests</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </div>

              {/* ── MAIN DASHBOARD 2-COLUMN GRID (60% LEFT / 40% RIGHT) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-6">

                  {/* Personal Information Card */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ delay: 0.15 }}
                    onClick={() => setActiveTab('profile')}
                    className={`rounded-[20px] p-5 sm:p-6 border transition-all duration-300 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-xl cursor-pointer group ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
                      }`}>
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-[#172033]'}`}>Personal Information</h3>
                      </div>
                      <span className="text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">View All →</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: User, label: 'Full Name', value: data.student?.name || 'Abhishek Gautam' },
                        { icon: Mail, label: 'Email', value: data.student?.email || 'dev212akhilesh@gmail.com' },
                        { icon: Phone, label: 'Phone', value: data.student?.phone || '07985875044' },
                        { icon: Users, label: "Father's Name", value: data.student?.fatherName || 'Ram' },
                        { icon: Calendar, label: 'Date of Birth', value: data.student?.dob ? new Date(data.student.dob).toLocaleDateString('en-IN') : '23/4/2009' },
                        { icon: MapPin, label: 'Address', value: data.student?.address || 'Nand Nagar Basti Uttar Pradesh' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3 py-1">
                          <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-blue-500"><Icon className="w-4 h-4" /></div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                            <div className={`text-xs font-bold truncate ${darkMode ? 'text-slate-100' : 'text-[#172033]'}`}>{value || '-'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Academic Details Card */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ delay: 0.2 }}
                    onClick={() => setActiveTab('profile')}
                    className={`rounded-[20px] p-5 sm:p-6 border transition-all duration-300 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-xl cursor-pointer group ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
                      }`}>
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-[#172033]'}`}>Academic Details</h3>
                      </div>
                      <span className="text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">View All →</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: BadgeCheck, label: 'Roll Number', value: data.student?.rollNumber || '2026010005', mono: true },
                        { icon: Hash, label: 'Enrollment No.', value: data.student?.enrollmentNumber || 'KCI/ENR/2026/0005', mono: true },
                        { icon: FileText, label: 'Form No.', value: data.student?.formNo || 'KCI/FORM/2026/0005', mono: true },
                        { icon: BookOpen, label: 'Course', value: data.student?.courseName || 'DCA' },
                        { icon: Layers, label: 'Batch', value: data.student?.batch || '2026' },
                        { icon: ShieldCheck, label: 'Account Status', value: data.student?.isApproved ? 'Approved' : 'Approved', pill: true },
                        { icon: CalendarDays, label: 'Admission Date', value: data.student?.admissionDate ? new Date(data.student.admissionDate).toLocaleDateString('en-IN') : '14/6/2026' },
                      ].map(({ icon: Icon, label, value, mono, pill }) => (
                        <div key={label} className="flex items-start gap-3 py-1">
                          <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-purple-500"><Icon className="w-4 h-4" /></div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                            {pill ? (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">Approved</span>
                            ) : (
                              <div className={`text-xs font-bold truncate ${mono ? (darkMode ? 'font-mono text-blue-400' : 'font-mono text-blue-600') : (darkMode ? 'text-slate-100' : 'text-[#172033]')}`}>{value || '-'}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* My Branch Card */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ delay: 0.25 }}
                    onClick={() => setActiveTab('profile')}
                    className={`rounded-[20px] p-5 sm:p-6 border transition-all duration-300 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-xl cursor-pointer group ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
                      }`}>
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-[#172033]'}`}>My Branch</h3>
                      </div>
                      <span className="text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">View All →</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {[
                        { icon: Building2, label: 'Branch Name', value: data.branch?.branchName || 'Ambedkarnagar' },
                        { icon: MapPinned, label: 'City', value: data.branch?.branchCity || 'Ambedkarnagar' },
                        { icon: Phone, label: 'Phone', value: data.branch?.phone || '9919660880' },
                        { icon: Mail, label: 'Email', value: data.branch?.email || 'fullstackgenius1@gmail.com' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3 py-1">
                          <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-indigo-500"><Icon className="w-4 h-4" /></div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                            <div className={`text-xs font-bold truncate ${darkMode ? 'text-slate-100' : 'text-[#172033]'}`}>{value || '-'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`rounded-xl p-3.5 border flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
                      }`}>
                      <div>
                        <div className={`text-xs font-black ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>{data.branch?.branchName || 'Ambedkarnagar'}</div>
                        <div className="text-[10px] font-semibold text-blue-400">KCI Authorized Center</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </div>

                {/* RIGHT COLUMN (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-6">

                  {/* Today's Schedule Card */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={`rounded-[20px] p-5 sm:p-6 border shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
                      }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">📅</div>
                        <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-[#172033]'}`}>Today's Schedule</h3>
                      </div>
                      <span onClick={() => setActiveTab('tests')} className="text-xs font-bold text-blue-500 hover:underline cursor-pointer">View All →</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: 'DCA Practical Exam', time: '10:00 AM - 12:00 PM', badge: 'Upcoming', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', tab: 'tests' },
                        { title: 'Assignment Submission', time: '11:59 PM', badge: 'Pending', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', tab: 'studymaterial' },
                        { title: 'Project Viva', time: '02:00 PM - 03:00 PM', badge: 'Scheduled', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', tab: 'examform' },
                      ].map(({ title, time, badge, bg, tab }) => (
                        <motion.div
                          key={title}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab(tab)}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 ${darkMode ? 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-white' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-300 hover:shadow-md text-slate-900'
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-black truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</div>
                            <div className={`text-[10px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{time}</div>
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${bg} shrink-0`}>{badge}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Quick Actions Grid */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className={`rounded-[20px] p-5 sm:p-6 border shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
                      }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">⚡</div>
                        <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-[#172033]'}`}>Quick Actions</h3>
                      </div>
                      <span className="text-xs font-bold text-blue-500 hover:underline cursor-pointer">View All →</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Exam Form', icon: FileText, grad: 'from-[#2563EB] to-[#1D4ED8]', tab: 'examform' },
                        { label: 'ID Card', icon: CreditCard, grad: 'from-[#0284C7] to-[#0369A1]', tab: 'idcard' },
                        { label: 'Admit Card', icon: FileText, grad: 'from-[#7C3AED] to-[#6D28D9]', tab: 'admitcard' },
                        { label: 'Results', icon: Award, grad: 'from-[#D97706] to-[#B45309]', tab: 'results' },
                        { label: 'Certificates', icon: Award, grad: 'from-[#059669] to-[#047857]', tab: 'certificates' },
                        { label: 'Study', icon: BookMarked, grad: 'from-[#10B981] to-[#059669]', tab: 'studymaterial' },
                        { label: 'Tests', icon: ClipboardCheck, grad: 'from-[#C026D3] to-[#9333EA]', tab: 'tests' },
                        { label: 'Password', icon: Lock, grad: 'from-[#E11D48] to-[#BE123C]', tab: 'changepassword' },
                      ].map(({ label, icon: Icon, grad, tab }) => (
                        <motion.button
                          key={label}
                          whileHover={{ scale: 1.08, y: -4 }}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => setActiveTab(tab)}
                          type="button"
                          className={`min-h-[85px] p-2.5 rounded-[18px] bg-gradient-to-br ${grad} text-white flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer group`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-center leading-tight text-white">{label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Status Overview Grid (All Clickable with Motion) */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`rounded-[20px] p-5 sm:p-6 border shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${darkMode ? 'bg-[#131F3F]/90 border-slate-800 text-white' : 'bg-white border-slate-200/80 text-slate-900'
                      }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">🛡️</div>
                        <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-[#172033]'}`}>Status Overview</h3>
                      </div>
                      <span className="text-xs font-bold text-blue-500 hover:underline cursor-pointer">View All →</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Admission', value: data.student?.isApproved ? 'Approved' : 'Pending', icon: CheckCircle, color: darkMode ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : (data.student?.isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'), dot: 'bg-emerald-500', tab: 'profile' },
                        { label: 'Exam Form', value: myExamForm ? myExamForm.status : 'Pending', icon: FileText, color: darkMode ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500', tab: 'examform' },
                        { label: 'Admit Card', value: admitCard ? 'Available' : 'Pending', icon: CreditCard, color: darkMode ? 'bg-blue-950/40 border-blue-800/60 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800', dot: 'bg-blue-500', tab: 'admitcard' },
                        { label: 'Results', value: results.length > 0 ? `${results.length} Published` : '1 Published', icon: Award, color: darkMode ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500', tab: 'results' },
                        { label: 'Certificate', value: certificates.filter(c => c.certificateFile).length > 0 ? `${certificates.filter(c => c.certificateFile).length} Issued` : '1 Issued', icon: Award, color: darkMode ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500', tab: 'certificates' },
                        { label: 'ID Card', value: 'Download', icon: CreditCard, color: darkMode ? 'bg-blue-950/40 border-blue-800/60 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800', dot: 'bg-blue-500', tab: 'idcard' },
                      ].map(({ label, value, icon: Icon, color, dot, tab }) => (
                        <motion.div
                          key={label}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab(tab)}
                          className={`p-3 rounded-2xl border ${color} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[90px] cursor-pointer group`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
                          </div>
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-wider opacity-70">{label}</div>
                            <div className="text-xs font-black leading-tight truncate flex items-center justify-between">
                              {value}
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* ID Card Tab */}
          {activeTab === 'idcard' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-gray-900">My Results</h2>
              </div>
              <ResultsSection results={results} fileResults={fileResults} />
            </div>
          )}

          {/* Monthly Tests Tab */}
          {activeTab === 'tests' && (
            <div className="space-y-5">
              {!activeTest && !testResult && (
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Monthly Tests</h2>
                </div>
              )}
              {/* Active test ”” timer + questions */}
              {activeTest ? (
                <div className="space-y-4">
                  {/* Timer bar */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-gray-900">{activeTest.title}</h3>
                      <p className="text-xs text-gray-400">{activeTest.questions.length} questions | {activeTest.totalMarks} marks</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                      <Clock className="w-5 h-5" />
                      {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
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
                      <p className="font-semibold text-gray-900 mb-3"><span className="text-indigo-600 font-black">Q{qi + 1}.</span> {q.question} <span className="text-xs text-gray-400">({q.marks} mark{q.marks > 1 ? 's' : ''})</span></p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <button key={oi} type="button" onClick={() => setTestAnswers(p => p.map((a, i) => i === qi ? oi : a))}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${testAnswers[qi] === oi ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                              }`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${testAnswers[qi] === oi ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>{String.fromCharCode(65 + oi)}</span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => handleSubmitTest(false)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base transition-colors shadow-lg">
                    Submit Test →’
                  </button>
                </div>
              ) : testResult ? (
                /* Result view */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className={`px-6 py-5 text-white ${testResult.attempt.percentage >= 60 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                    testResult.attempt.percentage >= 33 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-600 to-rose-600'
                    }`}>
                    <h3 className="font-black text-xl">{testResult.test?.title}</h3>
                    <p className="text-white/80 text-sm">{testResult.test?.month}</p>
                    <div className="flex items-center gap-6 mt-3">
                      <div><div className="text-3xl font-black">{testResult.attempt.score}/{testResult.attempt.totalMarks}</div><div className="text-white/70 text-xs">Score</div></div>
                      <div><div className="text-3xl font-black">{testResult.attempt.percentage}%</div><div className="text-white/70 text-xs">Percentage</div></div>
                      <div><div className="text-2xl font-black">{testResult.attempt.percentage >= 33 ? '“ PASS' : 'FAIL'}</div><div className="text-white/70 text-xs">Result</div></div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {testResult.test?.questions?.map((q, qi) => {
                      const selected = testResult.attempt.answers[qi];
                      const correct = testResult.correctAnswers[qi];
                      const isRight = selected === correct;
                      return (
                        <div key={qi} className={`p-4 rounded-xl border-2 ${isRight ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                          }`}>
                          <p className="font-semibold text-gray-900 text-sm mb-2"><span className="font-black">{isRight ? '' : 'Œ'} Q{qi + 1}.</span> {q.question}</p>
                          <p className="text-xs text-gray-600">Your answer: <span className={`font-bold ${isRight ? 'text-green-700' : 'text-red-600'}`}>{selected !== undefined ? q.options[selected] : 'Not answered'}</span></p>
                          {!isRight && <p className="text-xs text-green-700 font-bold">Correct: {q.options[correct]}</p>}
                        </div>
                      );
                    })}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => { setTestResult(null); }}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        → Back to Tests
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
                              ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">“ Done</span>
                              : <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">New</span>
                            }
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center mb-4">
                            {[['Questions', t.questions?.length || 0], ['Marks', t.totalMarks || 0], ['Duration', `${t.duration}m`]].map(([l, v]) => (
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
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${t.attempted ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
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
                <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
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
                    <button onClick={() => setActiveTab('examform')} className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-xs font-bold transition-colors">Submit Exam Form →</button>
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
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <BookMarked className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Study Material</h2>
              </div>
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
                    const fixT = s => s ? s.replace(/-/g, '\u2013').replace(/-/g, '\u2014').replace(/ /g, ' ') : s;
                    const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
                    const handleDownloadPdf = async () => {
                      const { default: jsPDF } = await import('jspdf');
                      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                      const W = 210, M = 15;
                      let logoUrl = null;
                      try {
                        const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = '/logo.png'; });
                        const sz = 200, cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
                        const cx = cv.getContext('2d'); cx.beginPath(); cx.arc(sz / 2, sz / 2, sz / 2, 0, Math.PI * 2); cx.closePath(); cx.clip(); cx.drawImage(img, 0, 0, sz, sz);
                        logoUrl = cv.toDataURL('image/png');
                      } catch (_) { }
                      doc.setFillColor(8, 29, 91); doc.rect(0, 0, W, 40, 'F');
                      doc.setFillColor(212, 175, 55); doc.rect(0, 40, W, 2, 'F');
                      if (logoUrl) doc.addImage(logoUrl, 'PNG', M, 7, 24, 24);
                      doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
                      doc.text('KEERTI COMPUTER INSTITUTE', M + 30, 18);
                      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 200, 255);
                      doc.text('Govt. Recognised | ISO Certified | Ayodhya, U.P. | www.kci.org.in', M + 30, 26);
                      doc.setFillColor(212, 175, 55); doc.roundedRect(M + 30, 30, 50, 8, 2, 2, 'F');
                      doc.setTextColor(8, 29, 91); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
                      doc.text('STUDY MATERIAL', M + 55, 35.5, { align: 'center' });
                      let y = 52;
                      doc.setTextColor(8, 29, 91); doc.setFontSize(15); doc.setFont('helvetica', 'bold');
                      doc.text(fixT(m.title) || 'Study Material', W / 2, y, { align: 'center', maxWidth: W - M * 2 });
                      y += 8;
                      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
                      doc.text('Category: ' + (m.category ? m.category.replace('_', ' ') : 'General') + '   |   Date: ' + (dateStr || 'N/A'), W / 2, y, { align: 'center' });
                      y += 5;
                      doc.setDrawColor(212, 175, 55); doc.setLineWidth(0.8); doc.line(M, y, W - M, y);
                      y += 8;
                      if (m.description) {
                        doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40);
                        const lines = doc.splitTextToSize(m.description, W - M * 2);
                        doc.text(lines, M, y); y += lines.length * 6 + 6;
                      }
                      if (thumb) {
                        try {
                          const imgEl = await new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = thumb; });
                          const cvT = document.createElement('canvas'); cvT.width = imgEl.naturalWidth; cvT.height = imgEl.naturalHeight;
                          cvT.getContext('2d').drawImage(imgEl, 0, 0);
                          const imgH = Math.min(60, (imgEl.naturalHeight / imgEl.naturalWidth) * (W - M * 2));
                          doc.addImage(cvT.toDataURL('image/jpeg', 0.9), 'JPEG', M, y, W - M * 2, imgH);
                          y += imgH + 8;
                        } catch (_) { }
                      }
                      if (m.fileUrl) {
                        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(8, 29, 91);
                        doc.text('Document Link:', M, y); y += 6;
                        doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 200);
                        doc.textWithLink(m.fileUrl, M, y, { url: m.fileUrl }); y += 10;
                      }
                      if (m.videoUrl) {
                        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(8, 29, 91);
                        doc.text('Video Link:', M, y); y += 6;
                        doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 0, 0);
                        doc.textWithLink(m.videoUrl, M, y, { url: m.videoUrl }); y += 10;
                      }
                      doc.setFillColor(8, 29, 91); doc.rect(0, 275, W, 22, 'F');
                      doc.setTextColor(180, 200, 255); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
                      doc.text('Keerti Computer Institute | Civil Lines, Ayodhya, U.P. - 224001 | www.kci.org.in', W / 2, 284, { align: 'center' });
                      doc.save((fixT(m.title) || 'StudyMaterial').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
                      toast.success('PDF downloaded!');
                    };
                    return (
                      <motion.div key={m._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {thumb ? (
                          <div className="relative">
                            <img src={thumb} alt={fixT(m.title)} className="w-full object-contain bg-white" style={{ maxHeight: '160px' }} />
                            {m.videoUrl && (
                              <a href={m.videoUrl} target="_blank" rel="noreferrer"
                                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-5 h-5 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
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
                          <p className="text-xs text-gray-400 mb-3 capitalize">{m.category ? m.category.replace('_', ' ') : ''}</p>
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
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> Watch
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
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <h2 className="text-xl font-black text-gray-900">Change Password</h2>
              </div>
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
                      <div className="relative">
                        <input
                          type={pwShow[key] ? 'text' : 'password'}
                          value={pwForm[key]}
                          onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder} required
                          className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 bg-gray-50 focus:bg-white transition-all"
                        />
                        <button type="button" onClick={() => setPwShow(p => ({ ...p, [key]: !p[key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {pwShow[key]
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          }
                        </button>
                      </div>
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
                      ×
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
                  <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">
                    Notifications {unreadCount > 0 && <span className="text-sm font-bold text-red-500 ml-1">({unreadCount} unread)</span>}
                  </h2>
                </div>
                {unreadCount > 0 && (
                  <button onClick={() => {
                    api.put('/notifications/mark-all-read').catch(() => { });
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
                      exam: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Exam' },
                      result: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Result' },
                      course: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', label: 'Course' },
                      fee: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Fee' },
                      holiday: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', label: 'Holiday' },
                      urgent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Urgent' },
                      admission: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Admission' },
                      general: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'General' },
                    };
                    const tc = typeConfig[n.type] || typeConfig.general;
                    const isFromBranch = !!n.branchId;
                    const markRead = () => {
                      if (!n.isRead) {
                        api.put(`/notifications/${n._id}/read`).catch(() => { });
                        setNotifications(p => p.map(x => x._id === n._id ? { ...x, isRead: true } : x));
                        setUnreadCount(p => Math.max(0, p - 1));
                      }
                    };
                    return (
                      <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        onClick={markRead}
                        className={`bg-white rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${!n.isRead ? 'border-l-4 border-l-blue-500 border-gray-100' : 'border-gray-100'
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Exam Form</h2>
              </div>
              <ExamFormSection
                student={student}
                myExamForm={examFormData}
                onSubmitted={(form) => {
                  setExamFormData(form);
                  setMyExamForm(form);
                }}
              />
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (() => {
            const uploadedCerts = certificates.filter(c => c.certificateFile);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">My Certificates <span className="text-blue-600">({uploadedCerts.length})</span></h2>
                </div>
                {uploadedCerts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-500 font-semibold">Certificate abhi upload nahi hua hai.</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold">☎️ 9936384736</div>
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
                            <p className="text-xs text-gray-400">{c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</p>
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
        </main>

        <nav className={`fixed bottom-0 left-0 right-0 z-40 md:hidden backdrop-blur-xl border-t px-3 py-2 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] rounded-t-[22px] h-[72px] transition-colors duration-300 ${darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-200/80 text-slate-600'
          }`}>
          {[
            { id: 'profile', icon: Home, label: 'Home' },
            { id: 'results', icon: Award, label: 'Results' },
            { id: 'certificates', icon: GraduationCap, label: 'Certs' },
            { id: 'notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
            { id: 'menu', icon: Menu, label: 'Menu', action: () => setSidebarOpen(true) },
          ].map(({ id, icon: Icon, label, badge, action }) => {
            const isActive = activeTab === id && id !== 'menu';
            return (
              <button
                key={id}
                type="button"
                onClick={action || (() => setActiveTab(id))}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all relative min-w-[56px] cursor-pointer ${isActive ? 'text-[#2563EB] font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'
                  }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl relative transition-colors ${isActive ? 'bg-[#2563EB]/10 text-[#2563EB]' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {badge > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#2563EB] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
