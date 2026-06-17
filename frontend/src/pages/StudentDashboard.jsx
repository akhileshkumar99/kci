import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import {
  GraduationCap, Award, FileText, LogOut, User, Lock, BookMarked,
  Building2, Calendar, BookOpen, CheckCircle, CreditCard, Download, TrendingUp, ClipboardCheck, Clock, ChevronRight, Eye, KeyRound, QrCode,
  Mail, Phone, Users, MapPin, BadgeCheck, Hash, Layers, ShieldCheck, CalendarDays, MapPinned, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DevCredit from '../components/DevCredit';
import AdmitCardComponent from '../components/AdmitCard';

const ALL_TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'idcard', label: 'ID Card', icon: CreditCard },
  { id: 'admitcard', label: 'Admit Card', icon: FileText, adminControlled: true },
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

// â”€â”€â”€ Grade color helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CardInner({ W, H, student, branch, fields, qrDataUrl }) {
  const scale = W / 856;
  const HDR  = Math.round(H * 0.18);
  const FOOT = Math.round(H * 0.12);
  const BODY = H - HDR - FOOT;
  const s = (n) => Math.round(n * scale);
  return (
    <div style={{ width: W, height: H, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", border: s(3) + 'px solid #d4af37', borderRadius: s(18), overflow: 'hidden', background: '#f8f9fc', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>
      {/* HEADER */}
      <div style={{ height: HDR, background: '#081d5b', display: 'flex', alignItems: 'center', padding: '0 ' + s(20) + 'px', gap: s(14), flexShrink: 0, borderBottom: s(3) + 'px solid #d4af37', position: 'relative', zIndex: 1 }}>
        <div style={{ width: s(63), height: s(63), borderRadius: '50%', background: '#fff', border: s(2) + 'px solid #d4af37', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="KCI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <div style={{ color: '#ffffff', fontWeight: 900, fontSize: s(26), letterSpacing: 1, lineHeight: 1.15, textTransform: 'uppercase' }}>KEERTI COMPUTER INSTITUTE</div>
          <div style={{ color: '#b4c8f0', fontSize: s(13), marginTop: s(5), lineHeight: 1.6 }}>
            <span>&#128205; Ayodhya, Uttar Pradesh</span>&nbsp;&nbsp;
            <span>&#127760; www.kci.org.in</span>&nbsp;&nbsp;
            <span>&#128222; 9936384736</span>
          </div>
        </div>
        <div style={{ background: '#d4af37', borderRadius: s(10), padding: s(8) + 'px ' + s(13) + 'px', flexShrink: 0, textAlign: 'center', border: '1.5px solid #f0d060' }}>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(14), lineHeight: 1.4, whiteSpace: 'nowrap' }}>STUDENT</div>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(14), lineHeight: 1.4, whiteSpace: 'nowrap' }}>IDENTITY CARD</div>
        </div>
      </div>
      {/* BODY */}
      <div style={{ height: BODY, background: '#f8f9fc', display: 'flex', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: s(220), height: s(220), opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
          <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: '0 0 76%', padding: s(6) + 'px ' + s(14) + 'px ' + s(6) + 'px ' + s(20) + 'px', display: 'grid', gridTemplateRows: 'repeat(8, 1fr)', position: 'relative', zIndex: 1 }}>
          {fields.map(([lbl, val], i) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', borderBottom: i < fields.length - 1 ? '1px solid #dde4f0' : 'none' }}>
              <span style={{ color: '#0b1f5b', fontWeight: 700, fontSize: s(15), minWidth: s(150), flexShrink: 0, lineHeight: 1.4 }}>{lbl}</span>
              <span style={{ color: '#0b1f5b', fontWeight: 700, fontSize: s(15), width: s(20), flexShrink: 0 }}>:</span>
              <span style={{ color: '#111111', fontWeight: 700, fontSize: s(16), lineHeight: 1.4, flex: 1, overflow: 'hidden', whiteSpace: lbl === 'Address' ? 'normal' : 'nowrap', textOverflow: 'ellipsis' }}>{val || '-'}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: '0 0 24%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: s(8), padding: s(8) + 'px ' + s(10) + 'px ' + s(8) + 'px ' + s(4) + 'px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: s(140), height: s(170), border: '2.5px solid #d4af37', borderRadius: s(16), overflow: 'hidden', background: '#dce7f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {student?.photo
              ? <img src={student.photo} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}><User size={s(36)} color="#8aaad8" /><span style={{ color: '#8aaad8', fontSize: s(12), fontWeight: 700 }}>PHOTO</span></div>
            }
          </div>
          <div style={{ width: s(120), height: s(120), border: '2px solid #d4af37', borderRadius: s(10), background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: s(4) }}>
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
            <img src="/logo.png" alt="seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(pdfRef.current, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 856,
        height: 540,
        windowWidth: 856,
        windowHeight: 540,
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      doc.addImage(imgData, 'JPEG', 0, 0, 85.6, 54);
      doc.save('IDCard_' + uniqueId + '.pdf');
      toast.success('ID Card downloaded!');
    } catch { toast.error('Download failed'); }
    setExporting(false);
  };

  // Card 856x590px — slightly taller body to fit 8 fields
  const W = 856, H = 590;
  const HDR  = Math.round(H * 0.18); // 106px
  const FOOT = Math.round(H * 0.12); // 71px
  const BODY = H - HDR - FOOT;       // 413px

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

  const fields = [
    ['Form No',     uniqueId],
    ['Name',        student?.name],
    ['Father Name', student?.fatherName],
    ['Course',      student?.courseName],
    ['DOB',         dob],
    ['Branch Code', branch?.branchCode || branch?.code || 'N/A'],
    ['Branch Name', branch?.branchName || 'N/A'],
    ['Address',     student?.address],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      <button onClick={handleDownloadPDF} disabled={exporting}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', background: 'linear-gradient(135deg,#081d5b,#1a3a8f)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(8,29,91,0.4)' }}>
        <Download size={16} /> {exporting ? 'Generating PDF...' : 'Download ID Card PDF'}
      </button>

      {/* Hidden fixed PDF container - off-screen, always 856x540, never responsive */}
      <div
        ref={pdfRef}
        style={{
          position: 'fixed',
          top: '-99999px',
          left: '-99999px',
          width: 856,
          height: 540,
          minWidth: 856,
          minHeight: 540,
          overflow: 'visible',
          zIndex: -9999,
          pointerEvents: 'none',
        }}
      >
        <CardInner W={856} H={540} student={student} branch={branch} fields={fields} qrDataUrl={qrDataUrl} />
      </div>

      {/* Screen Preview - responsive */}
      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: 700,
          aspectRatio: '856/540',
          fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
          border: '3px solid #d4af37',
          borderRadius: 18,
          overflow: 'hidden',
          background: '#f8f9fc',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative',
        }}>
          <CardInner W={700} H={Math.round(700 * 540 / 856)} student={student} branch={branch} fields={fields} qrDataUrl={qrDataUrl} />
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

// â”€â”€â”€ PDF Download â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function downloadResultPDF(r, student, branch) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 10;

  // circular logo
  let logoDataUrl = null;
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png';
    });
    const sz = 400;
    const cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
    const cx = cv.getContext('2d');
    cx.beginPath(); cx.arc(sz/2, sz/2, sz/2, 0, Math.PI*2); cx.closePath(); cx.clip();
    cx.drawImage(img, 0, 0, sz, sz);
    logoDataUrl = cv.toDataURL('image/png');
  } catch (_) {}

  // OUTER RED BORDER
  doc.setDrawColor(214, 40, 40);
  doc.setLineWidth(1.2);
  doc.roundedRect(M, M, W - M*2, H - M*2, 5, 5, 'S');
  doc.setLineWidth(0.4);
  doc.roundedRect(M+2, M+2, W-M*2-4, H-M*2-4, 4, 4, 'S');

  let curY = M + 5;

  // GOVT BAR
  doc.setFillColor(214, 40, 40);
  doc.rect(M+3, curY, W-M*2-6, 6, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(6); doc.setFont('helvetica','bold');
  doc.text('Under Govt. of U.P Registration   |   Under Govt. of India (MHRD)   |   ISO Registration No. : UAS/2017/155491', W/2, curY+4, { align:'center' });
  curY += 8;

  // HEADER
  const hdrTop = curY;
  if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', M+5, hdrTop+1, 26, 26);

  doc.setTextColor(8,29,91); doc.setFontSize(17); doc.setFont('helvetica','bold');
  doc.text('KEERTI COMPUTER INSTITUTE', W/2, hdrTop+9, { align:'center' });
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
  doc.text('AN ISO 9001:2015 CERTIFIED ORGANIZATION', W/2, hdrTop+14.5, { align:'center' });
  doc.setFontSize(6.5); doc.setTextColor(100,100,100);
  doc.text('Regd. Under Govt. of U.P. & Govt. of India (MHRD)  |  Regd. No. KCI/2005/AYD', W/2, hdrTop+19.5, { align:'center' });
  doc.text('Head Office: KCI Building, Civil Lines, Ayodhya, U.P. - 224001', W/2, hdrTop+24, { align:'center' });
  doc.text('www.kci.org.in  |  info@kci.org.in  |  Mo.: 9936384736', W/2, hdrTop+28.5, { align:'center' });

  // right cert box
  const rbX = W-M-34;
  doc.setDrawColor(214,40,40); doc.setLineWidth(0.5);
  doc.rect(rbX, hdrTop+2, 31, 24, 'S');
  doc.setFontSize(5.5); doc.setFont('helvetica','bold'); doc.setTextColor(214,40,40);
  doc.text('AFFILIATED WITH', rbX+15.5, hdrTop+6, { align:'center' });
  doc.setFontSize(5); doc.setFont('helvetica','normal'); doc.setTextColor(40,40,40);
  doc.text('NSDC | MHRD | UP Govt.', rbX+15.5, hdrTop+10, { align:'center' });
  doc.text('NIELIT | DOEACC', rbX+15.5, hdrTop+14, { align:'center' });
  doc.text('ISO 9001:2015 CERTIFIED', rbX+15.5, hdrTop+18, { align:'center' });
  curY = hdrTop + 32;

  // RED DIVIDER
  doc.setDrawColor(214,40,40); doc.setLineWidth(1.0);
  doc.line(M+3, curY, W-M-3, curY);
  curY += 3;

  // DEPT HEADING green
  doc.setTextColor(15,123,15); doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text('(Department of Secondary and Higher Education)', W/2, curY+4, { align:'center' });
  curY += 8;

  // MEMORANDUM TITLE orange
  doc.setTextColor(255,140,0); doc.setFontSize(13); doc.setFont('helvetica','bold');
  doc.text('MEMORANDUM OF MARKS', W/2, curY+7, { align:'center' });
  const tw = doc.getTextWidth('MEMORANDUM OF MARKS');
  doc.setDrawColor(255,140,0); doc.setLineWidth(0.6);
  doc.line(W/2 - tw/2, curY+9, W/2 + tw/2, curY+9);
  curY += 14;

  // RED DIVIDER 2
  doc.setDrawColor(214,40,40); doc.setLineWidth(0.6);
  doc.line(M+3, curY, W-M-3, curY);
  curY += 4;

  // STUDENT INFO BOX
  const infoBoxTop = curY;
  const infoBoxH = 28;
  doc.setDrawColor(200,200,200); doc.setLineWidth(0.3);
  doc.rect(M+3, infoBoxTop, W-M*2-6, infoBoxH, 'S');
  doc.line(W/2+2, infoBoxTop, W/2+2, infoBoxTop+infoBoxH);

  const pct = r.percentage ?? (r.totalMarks ? Math.round((r.obtainedMarks/r.totalMarks)*100) : 0);
  const gradeCalc = (p) => p>=90?'S':p>=70?'A':p>=60?'B':p>=50?'C':p>=40?'D':'Fail';
  const grade = r.grade || gradeCalc(pct);

  const LX = M+6, RX = W/2+6;
  const leftRows = [
    ['Student Name', student?.name || r.studentName || '-'],
    ['Father Name',  student?.fatherName || '-'],
    ['Course',       r.courseName || '-'],
  ];
  const rightRows = [
    ['Enrollment No', student?.enrollmentNumber || student?.rollNumber || r.rollNumber || '-'],
    ['Reg. No',       student?.formNo || r.rollNumber || '-'],
    ['District',      student?.address?.split(',').pop()?.trim() || branch?.branchCity || '-'],
  ];
  doc.setFontSize(8);
  leftRows.forEach(([lbl,val],i) => {
    const y = infoBoxTop+7+i*8;
    doc.setFont('helvetica','bold'); doc.setTextColor(8,29,91); doc.text(lbl+' :', LX, y);
    const lw = doc.getTextWidth(lbl+' :');
    doc.setFont('helvetica','normal'); doc.setTextColor(17,17,17);
    doc.text(String(val), LX+lw+2, y, { maxWidth: W/2-LX-8 });
  });
  rightRows.forEach(([lbl,val],i) => {
    const y = infoBoxTop+7+i*8;
    doc.setFont('helvetica','bold'); doc.setTextColor(8,29,91); doc.text(lbl+' :', RX, y);
    const lw = doc.getTextWidth(lbl+' :');
    doc.setFont('helvetica','normal'); doc.setTextColor(17,17,17);
    doc.text(String(val), RX+lw+2, y, { maxWidth: W-M-6-RX-lw-2 });
  });
  curY = infoBoxTop + infoBoxH + 4;

  // WATERMARK behind table
  if (logoDataUrl) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.addImage(logoDataUrl, 'PNG', W/2-35, curY+15, 70, 70);
    doc.restoreGraphicsState();
  }

  // SUBJECT TABLE
  const kciSubjects = [
    'Computer Fundamentals (MS-DOS, Windows & I/O System)',
    'Microsoft Office (Word, Excel, PowerPoint & Access)',
    'Desktop Publishing (PageMaker, CorelDraw & Photoshop)',
    'Tally Accounting (Tally ERP)',
    'C & C++ Language',
    'HTML & DHTML',
    'Java & Visual Basic',
    'Printing, Multimedia & Internet',
    'Practical',
  ];

  const subjectRows = (r.subjects && r.subjects.length > 0)
    ? r.subjects.map((s, i) => [i+1, s.name || kciSubjects[i] || '-', s.maxMarks ?? 100, s.obtainedMarks ?? '-'])
    : kciSubjects.map((name, i) => [i+1, name, 100, '-']);

  autoTable(doc, {
    startY: curY,
    head: [['S.No', 'Subjects', 'Max Marks', 'Obtained Marks']],
    body: subjectRows,
    theme: 'grid',
    headStyles: { fillColor:[214,40,40], textColor:[255,255,255], fontStyle:'bold', fontSize:8, cellPadding:2.5, halign:'center' },
    bodyStyles: { fontSize:8, textColor:[17,17,17], cellPadding:2.2 },
    alternateRowStyles: { fillColor:[253,245,245] },
    columnStyles: {
      0: { halign:'center', cellWidth:12 },
      1: { cellWidth:100 },
      2: { halign:'center', cellWidth:24 },
      3: { halign:'center', cellWidth:24 },
    },
    tableLineColor: [214,40,40],
    tableLineWidth: 0.3,
    margin: { left:M+3, right:M+3 },
  });

  curY = doc.lastAutoTable.finalY + 2;

  // TOTALS ROW
  const totW = W-M*2-6;
  doc.setFillColor(8,29,91);
  doc.rect(M+3, curY, totW, 8, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont('helvetica','bold');
  const colX = M+3+12+100;
  doc.text('Total', M+3+56, curY+5.5, { align:'center' });
  doc.setDrawColor(255,255,255); doc.setLineWidth(0.3);
  doc.line(colX, curY, colX, curY+8);
  doc.text(String(r.totalMarks ?? (subjectRows.length*100)), colX+12, curY+5.5, { align:'center' });
  doc.line(colX+24, curY, colX+24, curY+8);
  doc.text(String(r.obtainedMarks ?? '-'), colX+36, curY+5.5, { align:'center' });
  curY += 11;

  // GRADE + RESULT BOXES
  const boxW = totW/4;
  const boxH = 20;
  const boxes = [
    { label:'Grade',       value: grade,         color:[15,123,15] },
    { label:'Total Marks', value: (r.obtainedMarks??'-')+' / '+(r.totalMarks??'-'), color:[8,29,91] },
    { label:'Issue Date',  value: new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), color:[8,29,91] },
    { label:'Percentage',  value: pct+'%',        color: pct>=40?[15,123,15]:[214,40,40] },
  ];
  boxes.forEach(({label,value,color},i) => {
    const bx = M+3+i*boxW;
    doc.setFillColor(253,245,245); doc.setDrawColor(214,40,40); doc.setLineWidth(0.4);
    doc.rect(bx, curY, boxW, boxH, 'FD');
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(100,100,100);
    doc.text(label, bx+boxW/2, curY+5.5, { align:'center' });
    doc.setFontSize(i===0?14:9.5); doc.setFont('helvetica','bold'); doc.setTextColor(...color);
    doc.text(String(value), bx+boxW/2, curY+15, { align:'center' });
  });
  curY += boxH + 4;

  // GRADE SCALE
  doc.setFillColor(253,245,245); doc.setDrawColor(214,40,40); doc.setLineWidth(0.4);
  doc.rect(M+3, curY, totW, 8, 'FD');
  doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(8,29,91);
  doc.text('Grade Scale :', M+7, curY+5);
  doc.setFont('helvetica','normal'); doc.setTextColor(40,40,40);
  doc.text('S=Above 90%   A=70-90%   B=60-69%   C=50-59%   D=40-49%   Fail=Below 40%', M+30, curY+5);
  curY += 12;

  // CERT LOGOS ROW
  const certLabels = ['ISO 9001:2015','NSDC Partner','NIELIT Approved','UP Govt. Regd.'];
  const certW = totW/certLabels.length;
  certLabels.forEach((lbl,i) => {
    const cx2 = M+3+i*certW;
    doc.setDrawColor(8,29,91); doc.setLineWidth(0.3);
    doc.circle(cx2+certW/2, curY+5, 4.5, 'S');
    doc.setFontSize(5.5); doc.setFont('helvetica','bold'); doc.setTextColor(8,29,91);
    doc.text(lbl, cx2+certW/2, curY+13, { align:'center' });
  });
  curY += 18;

  // SIGNATURES
  doc.setDrawColor(150,150,150); doc.setLineWidth(0.4);
  doc.line(M+8, curY+10, M+52, curY+10);
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60);
  doc.text("Student's Signature", M+30, curY+14, { align:'center' });

  if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', W/2-9, curY, 18, 18);
  doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(214,40,40);
  doc.text('OFFICIAL SEAL', W/2, curY+22, { align:'center' });

  doc.line(W-M-52, curY+10, W-M-8, curY+10);
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60);
  doc.text('Director Signature', W-M-30, curY+14, { align:'center' });

  // FOOTER RED BAR
  const fY = H-M-11;
  doc.setFillColor(214,40,40);
  doc.rect(M+3, fY, W-M*2-6, 9, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
  doc.text('Head Office: KCI Building, Civil Lines, Ayodhya, U.P. - 224001  |  www.kci.org.in  |  info@kci.org.in  |  Mo.: 9936384736', W/2, fY+6, { align:'center' });

  doc.save(`Result_${r.rollNumber}_${(r.courseName || 'KCI').replace(/\s+/g, '_')}.pdf`);
}

// â”€â”€â”€ Results Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ResultsSection({ results, student, branch }) {
  if (results.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
      <p className="text-gray-400">No results published yet</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">My Results <span className="text-blue-600">({results.length})</span></h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Click Download to save PDF</span>
      </div>

      {results.map((r, idx) => {
        const gc = gradeColor(r.grade);
        const pct = r.percentage ?? 0;
        return (
          <motion.div key={r._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* â”€â”€ Card Header â”€â”€ */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Result Card</p>
                <h3 className="text-white font-black text-lg leading-tight">{r.courseName}</h3>
                <p className="text-blue-300 text-xs mt-0.5">Roll No: <span className="font-mono font-bold text-yellow-300">{r.rollNumber}</span>{r.batch ? ` â€¢ Batch: ${r.batch}` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-black border-2 ${
                  r.status === 'Pass' ? 'bg-green-400/20 border-green-400 text-green-300' : 'bg-red-400/20 border-red-400 text-red-300'
                }`}>{r.status === 'Pass' ? 'âœ“ PASS' : 'âœ— FAIL'}</span>
                <div className={`text-3xl font-black ${gc.text.replace('text-', 'text-').replace('700', '300')}`} style={{ color: '#fde68a' }}>{r.grade}</div>
              </div>
            </div>

            {/* â”€â”€ Summary Strip â”€â”€ */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: 'Obtained', value: r.obtainedMarks ?? 'â€”', sub: 'marks' },
                { label: 'Total', value: r.totalMarks ?? 'â€”', sub: 'marks' },
                { label: 'Percentage', value: r.percentage ? `${r.percentage}%` : 'â€”', sub: 'score', highlight: true },
                { label: 'Grade', value: r.grade || 'â€”', sub: 'overall', highlight: true },
              ].map(({ label, value, sub, highlight }) => (
                <div key={label} className="py-4 text-center">
                  <div className={`text-xl font-black ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                  <div className="text-[9px] text-gray-300">{sub}</div>
                </div>
              ))}
            </div>

            {/* â”€â”€ Percentage Bar â”€â”€ */}
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

            {/* â”€â”€ Subject Table â”€â”€ */}
            {r.subjects?.length > 0 && (
              <div className="px-6 pb-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mt-2">Subject-wise Marks</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
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
                            <td className="px-4 py-3 text-center text-gray-600 font-bold">{sub.maxMarks ?? 'â€”'}</td>
                            <td className="px-4 py-3 text-center font-black text-gray-900">{sub.obtainedMarks ?? 'â€”'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs font-bold text-blue-600">{subPct ? `${subPct}%` : 'â€”'}</span>
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
                        <td className="px-4 py-3 text-center font-black text-blue-800">{r.totalMarks ?? 'â€”'}</td>
                        <td className="px-4 py-3 text-center font-black text-blue-800">{r.obtainedMarks ?? 'â€”'}</td>
                        <td className="px-4 py-3 text-center font-black text-blue-600">{r.percentage ? `${r.percentage}%` : 'â€”'}</td>
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

            {/* â”€â”€ Footer Actions â”€â”€ */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {r.examDate ? `Exam Date: ${new Date(r.examDate).toLocaleDateString('en-IN')}` : 'KCI Official Result'}
              </div>
              <button onClick={() => downloadResultPDF(r, student, branch).catch(() => toast.error('Download failed'))}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// â”€â”€â”€ Certificate PDF Download â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ OUTER DECORATIVE BORDER â”€â”€
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

  // â”€â”€ GOLD HEADER BG â”€â”€
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

  // â”€â”€ CERTIFICATE TITLE â”€â”€
  doc.setFontSize(28); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 100, 20);
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 72, { align: 'center' });
  // underline
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.8);
  doc.line(W/2 - 70, 75, W/2 + 70, 75);

  // â”€â”€ BODY TEXT â”€â”€
  // â”€â”€ Load Colonna MT font â”€â”€
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

  // Student name â€” Colonna MT font
  const nameText = c.studentName || student?.name || 'â€”';
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
  doc.text(c.courseName || 'â€”', W / 2, 128, { align: 'center' });

  doc.setFontSize(10.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  const rollText = `Roll No: ${c.rollNumber || 'â€”'}   |   Grade: ${c.grade || 'â€”'}   |   Issue Date: ${c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : 'â€”'}`;
  doc.text(rollText, W / 2, 139, { align: 'center' });

  // Branch
  if (branch?.branchName) {
    doc.setFontSize(9.5); doc.setTextColor(100, 100, 100);
    doc.text(`Branch: ${branch.branchName}${branch.branchCity ? ', ' + branch.branchCity : ''}`, W / 2, 147, { align: 'center' });
  }

  // â”€â”€ CERT NUMBER BADGE â”€â”€
  doc.setFillColor(245, 240, 220);
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.5);
  doc.roundedRect(W/2 - 45, 151, 90, 10, 2, 2, 'FD');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 70, 10);
  doc.text(`Certificate No: ${c.certificateNumber || 'â€”'}`, W / 2, 157.5, { align: 'center' });

  // â”€â”€ GRADE BADGE â”€â”€
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

  // â”€â”€ FOOTER SIGNATURES â”€â”€
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
            ← Go Back
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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
          ['Payment UTR', myExamForm.paymentUtr || '—'],
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

  // ── STEP: PAY ──
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

  // ── STEP: UTR ──
  if (step === 'utr') return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-center">
          <div className="text-white font-black text-lg">🔐 Verify Payment</div>
          <div className="text-blue-100 text-xs mt-1">Enter your UTR / Transaction ID</div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs text-blue-700 font-semibold text-center">
            ₹{AMOUNT} paid to <span className="font-mono font-black">{UPI_ID}</span>
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
            ← Back to Payment
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ── STEP: FORM ──
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

        <form onSubmit={e => { e.preventDefault(); setStep('pay'); }} className="p-6 space-y-5">
          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Student Name *</label>
                <input value={form.studentName} onChange={e => set('studentName', e.target.value)} required className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Father's Name *</label>
                <input value={form.fatherName} onChange={e => set('fatherName', e.target.value)} required className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Mother's Name</label>
                <input value={form.motherName} onChange={e => set('motherName', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Date of Birth *</label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} required className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Gender *</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} required className={sel}>
                  <option value="">-- Select --</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
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
                <input value={form.enrollmentNumber} onChange={e => set('enrollmentNumber', e.target.value)} required className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Course *</label>
                <select value={form.course} onChange={e => set('course', e.target.value)} required className={sel}>
                  <option value="">-- Select Course --</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Batch *</label>
                <input value={form.batch} onChange={e => set('batch', e.target.value)} required className={inp} />
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
                <input value={form.phone} onChange={e => set('phone', e.target.value)} required className={inp} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className={inp} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-600 mb-1 block">Address</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} className={inp} />
              </div>
            </div>
          </div>

          {/* Proceed to Pay */}
          <button type="button" onClick={e => { e.preventDefault(); setStep('pay'); }}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md">
            💳 Proceed to Pay ₹{AMOUNT}
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
    api.get('/notifications/my').then(r => { setNotifications(r.data.notifications || []); setUnreadCount(r.data.unreadCount || 0); }).catch(() => {});
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/'); };
  const { student, results, certificates, branch } = data;

  // Show Admit Card tab only when admin enabled it AND student submitted exam form
  const tabs = ALL_TABS.filter(t => !t.adminControlled || (admitCardEnabled && myExamForm));

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

    // â”€â”€ HEADER â”€â”€
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

    // â”€â”€ INFO BOX â”€â”€
    doc.setFillColor(245,248,255); doc.setDrawColor(200,210,240);
    doc.roundedRect(M, 54, W-M*2, 46, 3, 3, 'FD');
    // section label
    doc.setFillColor(15,40,110); doc.roundedRect(M, 54, 36, 7, 2, 2, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.text('TEST DETAILS', M+18, 58.8, { align:'center' });

    // PASS/FAIL badge â€” top right of info box
    const pass = attempt.percentage >= 33;
    doc.setFillColor(...(pass ? [22,163,74] : [220,38,38]));
    doc.roundedRect(W-M-26, 55, 24, 11, 2, 2, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(pass ? 'PASS' : 'FAIL', W-M-14, 62, { align:'center' });

    // Info rows â€” 2 columns, fixed positions
    // Left:  label @ M+4,  value @ M+30
    // Right: label @ W/2+4, value @ W/2+30
    const LL = M+4, LV = M+32;
    const RL = W/2+4, RV = W/2+32;
    const LMAX = W/2 - LV - 2;   // ~57mm
    const RMAX = W - M - RV - 2; // ~57mm

    const infoData = [
      ['Test Title', test?.title||'â€”',   'Month',      test?.month||'â€”'],
      ['Student',    attempt.studentName||'â€”', 'Roll No.', attempt.rollNumber||'â€”'],
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

    // â”€â”€ QUESTIONS TABLE â”€â”€
    const rows = (questions||[]).map((q, i) => [
      i+1,
      q.question,
      attempt.answers[i] !== undefined ? (q.options[attempt.answers[i]]||'â€”') : 'Not answered',
      q.options[correctAnswers[i]]||'â€”',
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

    // â”€â”€ SUMMARY BOX â”€â”€
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

    // â”€â”€ FOOTER â”€â”€
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-300 font-semibold text-sm animate-pulse">Loading your portal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-[#081d5b] to-[#0f2a8a] shadow-2xl transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-60' : 'w-0 lg:w-16 overflow-hidden'}`}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0 min-h-[60px]">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-black text-white text-sm leading-tight truncate">Student Portal</div>
              <div className="text-[10px] text-blue-300 font-bold font-mono truncate">{user?.rollNumber}</div>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-black text-base shadow shrink-0 overflow-hidden">
                {data.student?.photo ? <img src={data.student.photo} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-blue-300 truncate">{user?.courseName}</div>
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              title={!sidebarOpen ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 relative ${activeTab === id ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="flex-1 text-left truncate">{label}</span>}
              {id === 'notifications' && unreadCount > 0 && (
                sidebarOpen
                  ? <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 shrink-0">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  : <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
          {sidebarOpen && <DevCredit popupDown />}
          <button onClick={handleLogout} title={!sidebarOpen ? 'Logout' : undefined}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0 z-20 shrink-0">
          <div className="px-3 sm:px-5 h-14 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(p => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="font-black text-gray-900 text-sm">{tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}</div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={() => setActiveTab('notifications')}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 p-3 sm:p-5 space-y-4 sm:space-y-6 overflow-y-auto">

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
                        { label: 'Certificates', value: certificates.length, color: 'text-emerald-300' },
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
                      {student?.isApproved ? '✅ Approved' : 'â³ Pending'}
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
                      <div className="text-[10px] text-indigo-500">{branch?.branchCity} â€¢ KCI Authorized Center</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
                {[
                  { label: 'Exam Form', icon: FileText, color: 'from-blue-500 to-blue-600', tab: 'examform' },
                  { label: 'View ID Card', icon: CreditCard, color: 'from-cyan-500 to-blue-600', tab: 'idcard' },
                  { label: 'Admit Card', icon: FileText, color: 'from-indigo-500 to-indigo-600', tab: 'admitcard', adminControlled: true },
                  { label: 'My Results', icon: Award, color: 'from-yellow-500 to-orange-500', tab: 'results' },
                  { label: 'Certificates', icon: Award, color: 'from-teal-500 to-emerald-600', tab: 'certificates' },
                  { label: 'Study Material', icon: BookMarked, color: 'from-green-500 to-green-600', tab: 'studymaterial' },
                  { label: 'Take Test', icon: ClipboardCheck, color: 'from-violet-500 to-purple-600', tab: 'tests' },
                  { label: 'Change Password', icon: Lock, color: 'from-rose-500 to-red-600', tab: 'changepassword' },
                ].filter(a => !a.adminControlled || (admitCardEnabled && myExamForm)).map(({ label, icon: Icon, color, tab }) => (
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
            {/* Active test â€” timer + questions */}
            {activeTest ? (
              <div className="space-y-4">
                {/* Timer bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-gray-900">{activeTest.title}</h3>
                    <p className="text-xs text-gray-400">{activeTest.questions.length} questions â€¢ {activeTest.totalMarks} marks</p>
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
                  Submit Test â†’
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
                    <div><div className="text-2xl font-black">{testResult.attempt.percentage >= 33 ? 'âœ“ PASS' : 'âœ— FAIL'}</div><div className="text-white/70 text-xs">Result</div></div>
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
                        <p className="font-semibold text-gray-900 text-sm mb-2"><span className="font-black">{isRight ? '✅' : 'âŒ'} Q{qi+1}.</span> {q.question}</p>
                        <p className="text-xs text-gray-600">Your answer: <span className={`font-bold ${isRight ? 'text-green-700' : 'text-red-600'}`}>{selected !== undefined ? q.options[selected] : 'Not answered'}</span></p>
                        {!isRight && <p className="text-xs text-green-700 font-bold">Correct: {q.options[correct]}</p>}
                      </div>
                    );
                  })}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setTestResult(null); }}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      â† Back to Tests
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
                            ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">âœ“ Done</span>
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
            <AdmitCardComponent student={student} admitCard={admitCard} branch={branch} />
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
                <p className="text-xs text-gray-400 mt-1">Materials uploaded by your branch will appear here</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {studyMaterials.map((m, i) => (
                  <motion.div key={m._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <BookMarked className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 truncate">{m.title}</p>
                      <p className="text-xs text-gray-400">{m.subject || m.courseName || 'â€”'}</p>
                    </div>
                    <a href={`${import.meta.env.VITE_API_URL || ''}${m.fileUrl}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shrink-0">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </motion.div>
                ))}
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
                          <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                          {n.createdBy && (
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              From: {n.createdBy.branchName || n.createdBy.name || 'KCI Admin'}
                            </p>
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
        {activeTab === 'certificates' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">My Certificates <span className="text-blue-600">({certificates.length})</span></h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Click Download to save PDF</span>
            </div>
            {certificates.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-semibold">No certificates issued yet</p>
                <p className="text-xs text-gray-400 mt-1">Complete your course to receive a certificate</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {certificates.map((c, idx) => {
                  const gradeClr = { 'A+': 'from-emerald-500 to-green-600', 'A': 'from-blue-500 to-blue-700', 'B+': 'from-violet-500 to-purple-700', 'B': 'from-indigo-500 to-indigo-700', 'C': 'from-orange-400 to-orange-600' };
                  const gc = gradeClr[c.grade] || 'from-blue-600 to-indigo-700';
                  return (
                    <motion.div key={c._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                      className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">

                      {/* Gold header */}
                      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-white" />
                          <span className="text-white font-black text-sm tracking-wide">CERTIFICATE OF COMPLETION</span>
                        </div>
                        <span className="text-amber-900 bg-white/80 text-[10px] font-black px-2 py-0.5 rounded-full">KCI</span>
                      </div>

                      <div className="p-5">
                        {/* Institute + logo row */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-100">
                          <img src="/logo.png" alt="KCI" className="w-10 h-10 rounded-full object-cover border-2 border-amber-200 shadow" />
                          <div>
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Keerti Computer Institute</div>
                            <div className="text-[10px] text-gray-400">Govt. Recognised | Est. 2005</div>
                          </div>
                          {/* Grade badge */}
                          <div className={`ml-auto w-12 h-12 rounded-full bg-gradient-to-br ${gc} flex flex-col items-center justify-center shadow-lg border-2 border-white`}>
                            <span className="text-white text-[9px] font-bold leading-none">GRADE</span>
                            <span className="text-white text-lg font-black leading-tight">{c.grade || 'A'}</span>
                          </div>
                        </div>

                        {/* This certifies */}
                        <p className="text-center text-xs text-gray-400 italic mb-1">This is to certify that</p>
                        <p className="text-center text-lg font-black text-blue-900 mb-1" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{c.studentName || student?.name}</p>
                        <p className="text-center text-xs text-gray-400 italic mb-3">has successfully completed</p>
                        <p className="text-center text-sm font-black text-amber-700 mb-4 leading-tight">{c.courseName}</p>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {[
                            ['Enrollment No.', c.rollNumber],
                            ['Issue Date', c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'â€”'],
                          ].map(([l, v]) => (
                            <div key={l} className="bg-amber-50 rounded-xl p-2.5 border border-amber-100">
                              <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">{l}</div>
                              <div className="text-xs font-black text-gray-800 mt-0.5">{v}</div>
                            </div>
                          ))}
                        </div>

                        {/* Cert number */}
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-center">
                          <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Certificate Number</div>
                          <div className="font-mono font-black text-sm text-blue-800">{c.certificateNumber}</div>
                        </div>

                        {/* Valid badge + Download */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                            <CheckCircle className="w-4 h-4" />
                            {c.isValid !== false ? 'Valid Certificate' : 'Expired'}
                          </div>
                          <button onClick={() => downloadCertificatePDF(c, student, branch).catch(() => toast.error('Download failed'))}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-md">
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
