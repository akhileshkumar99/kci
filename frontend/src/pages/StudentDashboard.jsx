import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  GraduationCap, Award, FileText, LogOut, User, Lock, BookMarked,
  Building2, Calendar, BookOpen, CheckCircle, CreditCard, Download, TrendingUp, ClipboardCheck, Clock, ChevronRight, Eye, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DevCredit from '../components/DevCredit';

const tabs = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'idcard', label: 'ID Card', icon: CreditCard },
  { id: 'admitcard', label: 'Admit Card', icon: FileText },
  { id: 'results', label: 'My Results', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'studymaterial', label: 'Study Material', icon: BookMarked },
  { id: 'tests', label: 'Monthly Tests', icon: ClipboardCheck },
  { id: 'changepassword', label: 'Change Password', icon: Lock },
];

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value || '—'}</span>
    </div>
  );
}

function IDCard({ student, branch }) {
  const issueYear = new Date().getFullYear();
  const validYear = issueYear + 1;
  const dob = student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '—';

  const handleDownloadPDF = async () => {
    // Standard ID card: 85.6 x 54 mm landscape
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
    const W = 85.6, H = 54;

    // ── Circular logo ──
    let logoUrl = null;
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png';
      });
      const sz = 200;
      const cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
      const cx2 = cv.getContext('2d');
      cx2.beginPath(); cx2.arc(sz/2, sz/2, sz/2, 0, Math.PI*2); cx2.closePath(); cx2.clip();
      cx2.drawImage(img, 0, 0, sz, sz);
      logoUrl = cv.toDataURL('image/png');
    } catch (_) {}

    // ── Student photo ──
    let photoUrl = null;
    if (student?.photo) {
      try {
        photoUrl = await new Promise((res) => {
          const img = new Image(); img.crossOrigin = 'anonymous';
          img.onload = () => {
            const cv = document.createElement('canvas');
            cv.width = img.naturalWidth; cv.height = img.naturalHeight;
            cv.getContext('2d').drawImage(img, 0, 0);
            res(cv.toDataURL('image/jpeg'));
          };
          img.onerror = () => res(null);
          img.src = student.photo;
        });
      } catch (_) {}
    }

    // ── CARD BG ──
    doc.setFillColor(15, 40, 110);
    doc.roundedRect(0, 0, W, H, 2, 2, 'F');
    // thin border
    doc.setDrawColor(100, 150, 230); doc.setLineWidth(0.3);
    doc.roundedRect(0.3, 0.3, W - 0.6, H - 0.6, 2, 2, 'S');

    // ── HEADER (0 to 13mm) ──
    doc.setFillColor(8, 24, 75);
    doc.roundedRect(0, 0, W, 13, 2, 2, 'F');
    doc.rect(0, 8, W, 5, 'F'); // square bottom corners
    // gold stripe
    doc.setFillColor(250, 204, 21);
    doc.rect(0, 13, W, 0.8, 'F');

    // Logo in header
    if (logoUrl) doc.addImage(logoUrl, 'PNG', 2, 1.5, 9, 9);

    // Institute name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
    doc.text('KEERTI COMPUTER INSTITUTE', 13, 6.5);
    doc.setFontSize(4); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 210, 255);
    doc.text('Govt. Recognised | Est. 2005 | www.kci.org.in', 13, 11);

    // STUDENT ID badge
    doc.setFillColor(250, 204, 21);
    doc.roundedRect(W - 20, 2, 18, 8, 1, 1, 'F');
    doc.setTextColor(15, 40, 110); doc.setFontSize(4.5); doc.setFont('helvetica', 'bold');
    doc.text('STUDENT ID', W - 11, 6.8, { align: 'center' });

    // ── PHOTO (right side) ──
    const PW = 16, PH = 20;
    const PX = W - PW - 2, PY = 15;
    doc.setFillColor(200, 215, 245);
    doc.setDrawColor(100, 150, 230); doc.setLineWidth(0.3);
    doc.roundedRect(PX, PY, PW, PH, 1, 1, 'FD');
    if (photoUrl) {
      doc.addImage(photoUrl, 'JPEG', PX + 0.3, PY + 0.3, PW - 0.6, PH - 0.6);
    } else {
      doc.setTextColor(140, 160, 210); doc.setFontSize(3.5);
      doc.text('No Photo', PX + PW / 2, PY + PH / 2 + 1, { align: 'center' });
    }

    // ── INFO ROWS (left side, 2 columns) ──
    // Col A: label  Col B: value  |  Col C: label  Col D: value
    const LA = 2,   VA = 16;          // left col
    const LC = 44,  VC = 56;          // right col (only for some rows)
    const VMAX_A = LC - VA - 1;       // ~27mm
    const VMAX_C = PX - VC - 1;       // ~7mm — short, only for small values

    // Row layout: y starts at 16, step 4.5mm
    const rows = [
      { lbl: 'Name',        val: student?.name || '—',                           lbl2: null,    val2: null },
      { lbl: 'Roll No.',    val: student?.rollNumber || '—',                      lbl2: 'Batch', val2: student?.batch || '—' },
      { lbl: 'Course',      val: student?.courseName || '—',                      lbl2: null,    val2: null },
      { lbl: 'DOB',         val: dob,                                              lbl2: 'Phone', val2: student?.phone || '—' },
      { lbl: 'Father',      val: student?.fatherName || '—',                      lbl2: null,    val2: null },
      { lbl: 'Address',     val: student?.address || '—',                         lbl2: null,    val2: null },
      { lbl: 'Branch',      val: (branch?.branchName || student?.branchName || '—'), lbl2: null, val2: null },
    ];

    rows.forEach(({ lbl, val, lbl2, val2 }, i) => {
      const y = 17.5 + i * 4.5;
      // left label
      doc.setFont('helvetica', 'bold'); doc.setFontSize(3.8); doc.setTextColor(160, 195, 240);
      doc.text(lbl + ':', LA, y);
      // left value
      const isRoll = lbl === 'Roll No.';
      doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5);
      doc.setTextColor(isRoll ? 253 : 240, isRoll ? 224 : 245, isRoll ? 71 : 255);
      doc.text(String(val), VA, y, { maxWidth: lbl2 ? VMAX_A : PX - VA - 2 });
      // right col (if exists)
      if (lbl2) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(3.8); doc.setTextColor(160, 195, 240);
        doc.text(lbl2 + ':', LC, y);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(4.5); doc.setTextColor(240, 245, 255);
        doc.text(String(val2), VC, y, { maxWidth: PX - VC - 2 });
      }
    });

    // ── FOOTER (bottom 8mm) ──
    const FY = H - 8;
    doc.setFillColor(6, 18, 60);
    doc.rect(0, FY, W, 8, 'F');
    doc.setFillColor(250, 204, 21);
    doc.rect(0, FY, W, 0.6, 'F');

    // 3 sections: valid | status | contact
    doc.setTextColor(160, 195, 240); doc.setFontSize(3.2); doc.setFont('helvetica', 'normal');
    doc.text('Valid Period', 4, FY + 3);
    doc.text('Status', W / 2, FY + 3, { align: 'center' });
    doc.text('Contact', W - 4, FY + 3, { align: 'right' });

    doc.setTextColor(255, 255, 255); doc.setFontSize(4); doc.setFont('helvetica', 'bold');
    doc.text(`${issueYear} - ${validYear}`, 4, FY + 6.5);
    doc.setTextColor(student?.isActive ? 100 : 255, student?.isActive ? 230 : 100, 100);
    doc.text(student?.isActive ? 'ACTIVE' : 'INACTIVE', W / 2, FY + 6.5, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.text('9936384736', W - 4, FY + 6.5, { align: 'right' });

    doc.save(`IDCard_${student?.rollNumber || 'KCI'}.pdf`);
    toast.success('ID Card downloaded!');
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <button onClick={handleDownloadPDF}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md">
        <Download className="w-4 h-4" /> Download ID Card PDF
      </button>

      {/* ID Card Preview */}
      <div className="w-full max-w-sm">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-blue-300/40" style={{ background: 'linear-gradient(135deg, #0f2876 0%, #1d4ed8 60%, #4f46e5 100%)' }}>
          {/* Header */}
          <div className="px-5 py-3 flex items-center gap-3 border-b-2 border-yellow-400">
            <img src="/logo.png" alt="KCI" className="w-11 h-11 rounded-full object-cover border-2 border-white/50 shadow-lg shrink-0" />
            <div className="flex-1">
              <div className="text-white font-black text-sm leading-tight">KEERTI COMPUTER INSTITUTE</div>
              <div className="text-blue-300 text-[10px]">Govt. Recognised | Est. 2005</div>
            </div>
            <div className="bg-yellow-400 rounded-lg px-2 py-1 text-center shrink-0">
              <div className="text-blue-900 font-black text-[10px] leading-tight">STUDENT</div>
              <div className="text-blue-900 font-black text-[10px]">ID CARD</div>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 flex gap-4">
            {/* Photo */}
            <div className="shrink-0">
              <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-white/40 shadow-lg bg-white/10 flex items-center justify-center">
                {student?.photo
                  ? <img src={student.photo} alt={student?.name} className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-1">
                      <User className="w-8 h-8 text-white/50" />
                      <span className="text-white/40 text-[9px]">No Photo</span>
                    </div>
                }
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 space-y-1.5">
              {[['Name', student?.name], ['Roll No.', student?.rollNumber], ['Course', student?.courseName], ['Batch', student?.batch], ['DOB', dob]].map(([l, v]) => (
                <div key={l}>
                  <div className="text-white/50 text-[9px] font-bold uppercase tracking-wider">{l}</div>
                  <div className={`font-bold text-xs leading-tight ${l === 'Roll No.' ? 'text-yellow-300 font-mono' : 'text-white'}`}>{v || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Father + Phone + Address */}
          <div className="px-5 pb-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {[['Father', student?.fatherName], ['Phone', student?.phone], ['Address', student?.address]].map(([l, v]) => (
              <div key={l} className={l === 'Address' ? 'col-span-2' : ''}>
                <div className="text-white/50 text-[9px] font-bold uppercase tracking-wider">{l}</div>
                <div className="text-white font-bold text-xs leading-tight">{v || '—'}</div>
              </div>
            ))}
          </div>

          {/* Branch */}
          <div className="px-5 pb-2">
            <div className="text-white/50 text-[9px] font-bold uppercase tracking-wider">Branch / Center</div>
            <div className="text-white font-bold text-xs">{branch?.branchName || student?.branchName || '—'}{branch?.branchCity ? ` — ${branch.branchCity}` : ''}</div>
          </div>

          {/* Footer */}
          <div className="px-5 py-2 flex items-center justify-between border-t-2 border-yellow-400" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div><div className="text-white/50 text-[9px] font-bold uppercase">Valid</div><div className="text-white font-bold text-xs">{issueYear}–{validYear}</div></div>
            <div><div className="text-white/50 text-[9px] font-bold uppercase">Status</div><div className={`font-black text-xs ${student?.isActive ? 'text-green-300' : 'text-red-300'}`}>{student?.isActive ? '● ACTIVE' : '● INACTIVE'}</div></div>
            <div><div className="text-white/50 text-[9px] font-bold uppercase">Contact</div><div className="text-white font-bold text-[10px]">9936384736</div></div>
          </div>
        </div>

        {/* Signature strip */}
        <div className="mt-2 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="text-center"><div className="w-20 border-b border-gray-400 mb-1" /><div className="text-[9px] text-gray-500 font-semibold">Student Signature</div></div>
          <div className="text-center"><img src="/logo.png" alt="KCI" className="w-8 h-8 rounded-full mx-auto mb-1 opacity-60" /><div className="text-[9px] text-gray-500 font-semibold">KCI Official Seal</div></div>
          <div className="text-center"><div className="w-20 border-b border-gray-400 mb-1" /><div className="text-[9px] text-gray-500 font-semibold">Principal Signature</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── Grade color helper ───────────────────────────────────────────────────────
function gradeColor(grade) {
  const g = (grade || '').toUpperCase();
  if (g === 'A+' || g === 'O') return { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' };
  if (g === 'A') return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
  if (g === 'B+' || g === 'B') return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (g === 'C') return { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
}

// ─── PDF Download ─────────────────────────────────────────────────────────────
async function downloadResultPDF(r, student, branch) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, M = 14;

  // ── Circular logo via canvas ──────────────────────────────────────────────
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

  // ── HEADER ────────────────────────────────────────────────────────────────
  // Deep blue bg
  doc.setFillColor(15, 40, 110);
  doc.rect(0, 0, W, 48, 'F');
  // Accent stripe
  doc.setFillColor(250, 204, 21);
  doc.rect(0, 48, W, 2.5, 'F');

  // Logo — left side, big
  const LS = 34;
  if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', M, 7, LS, LS);

  // Institute text — right of logo
  const tx = M + LS + 6;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('KEERTI COMPUTER INSTITUTE', tx, 18);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 210, 255);
  doc.text('Govt. Recognised | Est. 2005 | www.kci.org.in', tx, 26);

  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 255);
  doc.text('Excellence in Computer Education Since 2005', tx, 33);

  // RESULT CARD pill
  doc.setFillColor(250, 204, 21);
  doc.roundedRect(tx, 37, 48, 8, 2, 2, 'F');
  doc.setTextColor(15, 40, 110);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RESULT CARD', tx + 24, 42.5, { align: 'center' });

  // ── STUDENT INFO BOX ─────────────────────────────────────────────────────
  doc.setFillColor(245, 248, 255);
  doc.setDrawColor(200, 210, 240);
  doc.roundedRect(M, 56, W - M*2, 46, 3, 3, 'FD');

  // Section label
  doc.setFillColor(15, 40, 110);
  doc.roundedRect(M, 56, 38, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT DETAILS', M + 19, 60.8, { align: 'center' });

  // Fixed column positions — label | value | label | value
  // Left:  label@18  value@46   (max width = 90-46 = 44mm)
  // Right: label@108 value@132  (max width = 196-132 = 64mm)
  const LBL1 = M + 4;        // 18
  const VAL1 = M + 32;       // 46  — value starts here
  const LBL2 = W / 2 + 2;   // 107
  const VAL2 = W / 2 + 26;  // 131
  const VMAXL = W / 2 - VAL1 - 4;   // ~49mm — left value max width
  const VMAXR = W - M - VAL2 - 2;   // ~63mm — right value max width

  const infoRows = [
    ['Student Name', student?.name || r.studentName || '—', 'Roll No.', r.rollNumber || '—'],
    ['Course',       r.courseName || '—',                   'Batch',    r.batch || '—'],
    ['Branch',       branch?.branchName || '—',             'Exam Date', r.examDate ? new Date(r.examDate).toLocaleDateString('en-IN') : '—'],
  ];
  infoRows.forEach(([l1, v1, l2, v2], i) => {
    const y = 70 + i * 11;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 100, 160);
    doc.text(l1 + ' :', LBL1, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(15, 15, 15);
    doc.text(String(v1), VAL1, y, { maxWidth: VMAXL });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 100, 160);
    doc.text(l2 + ' :', LBL2, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(15, 15, 15);
    doc.text(String(v2), VAL2, y, { maxWidth: VMAXR });
  });

  // ── SUBJECT TABLE ─────────────────────────────────────────────────────────
  const subjectRows = (r.subjects || []).map((s, i) => [
    i + 1,
    s.name || '—',
    s.maxMarks ?? '—',
    s.obtainedMarks ?? '—',
    s.maxMarks && s.obtainedMarks != null ? ((s.obtainedMarks / s.maxMarks) * 100).toFixed(1) + '%' : '—',
    s.obtainedMarks >= s.maxMarks * 0.33 ? 'Pass' : 'Fail',
  ]);

  autoTable(doc, {
    startY: 108,
    head: [['#', 'Subject Name', 'Max Marks', 'Obtained', 'Percentage', 'Status']],
    body: subjectRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 40, 110], textColor: [255,255,255], fontStyle: 'bold', fontSize: 9, cellPadding: 3 },
    bodyStyles: { fontSize: 9, textColor: [20, 20, 20], cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 68 },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'center', cellWidth: 24 },
      4: { halign: 'center', cellWidth: 24 },
      5: { halign: 'center', cellWidth: 20 },
    },
    didDrawCell: (data) => {
      // Color Pass/Fail cells
      if (data.section === 'body' && data.column.index === 5) {
        const val = data.cell.raw;
        doc.setFillColor(val === 'Pass' ? 220 : 255, val === 'Pass' ? 255 : 220, val === 'Pass' ? 220 : 220);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(val === 'Pass' ? 22 : 180, val === 'Pass' ? 120 : 30, val === 'Pass' ? 22 : 30);
        doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.text(val, data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2 + 1.5, { align: 'center' });
      }
    },
    margin: { left: M, right: M },
  });

  // ── SUMMARY BOX ───────────────────────────────────────────────────────────
  const tY = doc.lastAutoTable.finalY + 7;
  doc.setFillColor(15, 40, 110);
  doc.roundedRect(M, tY, W - M*2, 32, 3, 3, 'F');
  // Gold top border
  doc.setFillColor(250, 204, 21);
  doc.roundedRect(M, tY, W - M*2, 2, 1, 1, 'F');

  const sumItems = [
    ['TOTAL MARKS', `${r.obtainedMarks ?? '—'} / ${r.totalMarks ?? '—'}`],
    ['PERCENTAGE', r.percentage ? `${r.percentage}%` : '—'],
    ['GRADE', r.grade || '—'],
    ['RESULT', r.status || '—'],
  ];
  const cW = (W - M*2) / 4;
  sumItems.forEach(([lbl, val], i) => {
    const x = M + i * cW + cW / 2;
    // divider
    if (i > 0) { doc.setDrawColor(255,255,255,0.2); doc.line(M + i*cW, tY+4, M + i*cW, tY+30); }
    doc.setTextColor(180, 210, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(lbl, x, tY + 11, { align: 'center' });
    // highlight result/grade
    const isSpecial = lbl === 'RESULT' || lbl === 'GRADE';
    doc.setTextColor(isSpecial ? 250 : 255, isSpecial ? 204 : 255, isSpecial ? 21 : 255);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(String(val), x, tY + 24, { align: 'center' });
  });

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const fY = tY + 42;
  // Signature lines
  doc.setDrawColor(150, 150, 150);
  doc.line(M, fY, M + 50, fY);
  doc.line(W - M - 50, fY, W - M, fY);
  doc.setTextColor(80, 80, 80); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('Student Signature', M + 25, fY + 5, { align: 'center' });
  doc.text('Principal Signature', W - M - 25, fY + 5, { align: 'center' });

  // Small logo watermark center
  if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', W/2 - 8, fY - 10, 16, 16);

  // Bottom note
  doc.setFillColor(245, 248, 255);
  doc.rect(0, fY + 10, W, 12, 'F');
  doc.setTextColor(120, 120, 120); doc.setFontSize(7);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN')}  |  This is a computer-generated document.  |  KCI Official Result`,
    W / 2, fY + 17, { align: 'center' }
  );

  doc.save(`Result_${r.rollNumber}_${(r.courseName || 'KCI').replace(/\s+/g, '_')}.pdf`);
}

// ─── Results Section ──────────────────────────────────────────────────────────
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

            {/* ── Card Header ── */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Result Card</p>
                <h3 className="text-white font-black text-lg leading-tight">{r.courseName}</h3>
                <p className="text-blue-300 text-xs mt-0.5">Roll No: <span className="font-mono font-bold text-yellow-300">{r.rollNumber}</span>{r.batch ? ` • Batch: ${r.batch}` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-black border-2 ${
                  r.status === 'Pass' ? 'bg-green-400/20 border-green-400 text-green-300' : 'bg-red-400/20 border-red-400 text-red-300'
                }`}>{r.status === 'Pass' ? '✓ PASS' : '✗ FAIL'}</span>
                <div className={`text-3xl font-black ${gc.text.replace('text-', 'text-').replace('700', '300')}`} style={{ color: '#fde68a' }}>{r.grade}</div>
              </div>
            </div>

            {/* ── Summary Strip ── */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: 'Obtained', value: r.obtainedMarks ?? '—', sub: 'marks' },
                { label: 'Total', value: r.totalMarks ?? '—', sub: 'marks' },
                { label: 'Percentage', value: r.percentage ? `${r.percentage}%` : '—', sub: 'score', highlight: true },
                { label: 'Grade', value: r.grade || '—', sub: 'overall', highlight: true },
              ].map(({ label, value, sub, highlight }) => (
                <div key={label} className="py-4 text-center">
                  <div className={`text-xl font-black ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                  <div className="text-[9px] text-gray-300">{sub}</div>
                </div>
              ))}
            </div>

            {/* ── Percentage Bar ── */}
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

            {/* ── Subject Table ── */}
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
                            <td className="px-4 py-3 text-center text-gray-600 font-bold">{sub.maxMarks ?? '—'}</td>
                            <td className="px-4 py-3 text-center font-black text-gray-900">{sub.obtainedMarks ?? '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs font-bold text-blue-600">{subPct ? `${subPct}%` : '—'}</span>
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
                        <td className="px-4 py-3 text-center font-black text-blue-800">{r.totalMarks ?? '—'}</td>
                        <td className="px-4 py-3 text-center font-black text-blue-800">{r.obtainedMarks ?? '—'}</td>
                        <td className="px-4 py-3 text-center font-black text-blue-600">{r.percentage ? `${r.percentage}%` : '—'}</td>
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

            {/* ── Footer Actions ── */}
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

// ─── Certificate PDF Download ────────────────────────────────────────────────────
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

  // ── OUTER DECORATIVE BORDER ──
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

  // ── GOLD HEADER BG ──
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

  // ── CERTIFICATE TITLE ──
  doc.setFontSize(28); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 100, 20);
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 72, { align: 'center' });
  // underline
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.8);
  doc.line(W/2 - 70, 75, W/2 + 70, 75);

  // ── BODY TEXT ──
  // ── Load Colonna MT font ──
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

  // Student name — Colonna MT font
  const nameText = c.studentName || student?.name || '—';
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
  doc.text(c.courseName || '—', W / 2, 128, { align: 'center' });

  doc.setFontSize(10.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  const rollText = `Roll No: ${c.rollNumber || '—'}   |   Grade: ${c.grade || '—'}   |   Issue Date: ${c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : '—'}`;
  doc.text(rollText, W / 2, 139, { align: 'center' });

  // Branch
  if (branch?.branchName) {
    doc.setFontSize(9.5); doc.setTextColor(100, 100, 100);
    doc.text(`Branch: ${branch.branchName}${branch.branchCity ? ', ' + branch.branchCity : ''}`, W / 2, 147, { align: 'center' });
  }

  // ── CERT NUMBER BADGE ──
  doc.setFillColor(245, 240, 220);
  doc.setDrawColor(180, 140, 40); doc.setLineWidth(0.5);
  doc.roundedRect(W/2 - 45, 151, 90, 10, 2, 2, 'FD');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 70, 10);
  doc.text(`Certificate No: ${c.certificateNumber || '—'}`, W / 2, 157.5, { align: 'center' });

  // ── GRADE BADGE ──
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

  // ── FOOTER SIGNATURES ──
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

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
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

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { navigate('/login'); return; }
    setLoading(true);
    api.get('/branch/student/me')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load data'); setLoading(false); });
    api.get('/branch/student/tests').then(r => setTests(r.data.tests || [])).catch(() => {});
    api.get('/study-material').then(r => setStudyMaterials(r.data.materials || [])).catch(() => {});
    api.get('/admit-card/my').then(r => setAdmitCard(r.data.admitCard || null)).catch(() => {});
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/'); };
  const { student, results, certificates, branch } = data;

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

    // ── HEADER ──
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

    // ── INFO BOX ──
    doc.setFillColor(245,248,255); doc.setDrawColor(200,210,240);
    doc.roundedRect(M, 54, W-M*2, 46, 3, 3, 'FD');
    // section label
    doc.setFillColor(15,40,110); doc.roundedRect(M, 54, 36, 7, 2, 2, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.text('TEST DETAILS', M+18, 58.8, { align:'center' });

    // PASS/FAIL badge — top right of info box
    const pass = attempt.percentage >= 33;
    doc.setFillColor(...(pass ? [22,163,74] : [220,38,38]));
    doc.roundedRect(W-M-26, 55, 24, 11, 2, 2, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(pass ? 'PASS' : 'FAIL', W-M-14, 62, { align:'center' });

    // Info rows — 2 columns, fixed positions
    // Left:  label @ M+4,  value @ M+30
    // Right: label @ W/2+4, value @ W/2+30
    const LL = M+4, LV = M+32;
    const RL = W/2+4, RV = W/2+32;
    const LMAX = W/2 - LV - 2;   // ~57mm
    const RMAX = W - M - RV - 2; // ~57mm

    const infoData = [
      ['Test Title', test?.title||'—',   'Month',      test?.month||'—'],
      ['Student',    attempt.studentName||'—', 'Roll No.', attempt.rollNumber||'—'],
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

    // ── QUESTIONS TABLE ──
    const rows = (questions||[]).map((q, i) => [
      i+1,
      q.question,
      attempt.answers[i] !== undefined ? (q.options[attempt.answers[i]]||'—') : 'Not answered',
      q.options[correctAnswers[i]]||'—',
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

    // ── SUMMARY BOX ──
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

    // ── FOOTER ──
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">

      {/* ── HEADER ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-gray-900 text-sm leading-tight">Student Portal</div>
              <div className="text-[10px] text-blue-600 font-bold font-mono truncate">{user?.rollNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-right hidden md:block">
                <div className="text-sm font-black text-gray-900 leading-tight truncate max-w-[120px]">{user?.name}</div>
                <div className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">{user?.courseName}</div>
              </div>
            </div>
            {/* Dev credit */}
            <DevCredit />
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-all whitespace-nowrap">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ── TABS ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'
              }`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {label}
            </button>
          ))}
        </div>

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
                          👨 {student.fatherName}
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
                      {student?.isApproved ? '✅ Approved' : '⏳ Pending'}
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
                    { icon: '👤', label: 'Full Name', value: student?.name },
                    { icon: '📧', label: 'Email', value: student?.email },
                    { icon: '📱', label: 'Phone', value: student?.phone },
                    { icon: '👨', label: "Father's Name", value: student?.fatherName },
                    { icon: '🎂', label: 'Date of Birth', value: student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : null },
                    { icon: '📍', label: 'Address', value: student?.address },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-base shrink-0 mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                        <div className="text-sm font-bold text-gray-800 truncate">{value || '—'}</div>
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
                    { icon: '🎫', label: 'Roll Number', value: student?.rollNumber, mono: true, highlight: true },
                    { icon: '📋', label: 'Enrollment No.', value: student?.enrollmentNumber, mono: true },
                    { icon: '📝', label: 'Form No.', value: student?.formNo, mono: true },
                    { icon: '📚', label: 'Course', value: student?.courseName },
                    { icon: '📅', label: 'Batch', value: student?.batch },
                    { icon: '✅', label: 'Account Status', value: student?.isApproved ? 'Approved ✓' : 'Pending' },
                    { icon: '📆', label: 'Admission Date', value: student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : null },
                  ].map(({ icon, label, value, mono, highlight }) => (
                    <div key={label} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-base shrink-0 mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                        <div className={`text-sm font-bold truncate ${
                          highlight ? 'font-mono text-blue-600 text-base' : mono ? 'font-mono text-blue-600' : 'text-gray-800'
                        }`}>{value || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Performance mini bar */}
                <div className="px-4 pb-4">
                  <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-violet-700">📊 Academic Progress</span>
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
                      { icon: '🏢', label: 'Branch Name', value: branch?.branchName },
                      { icon: '📍', label: 'City', value: branch?.branchCity },
                      { icon: '📞', label: 'Phone', value: branch?.phone },
                      { icon: '📧', label: 'Email', value: branch?.email },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-base shrink-0 mt-0.5">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                          <div className="text-sm font-bold text-gray-800 truncate">{value || '—'}</div>
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
                      <div className="text-[10px] text-indigo-500">{branch?.branchCity} • KCI Authorized Center</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wide">⚡ Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
                {[
                  { label: 'View ID Card', icon: CreditCard, color: 'from-blue-500 to-blue-600', tab: 'idcard' },
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
            {/* Active test — timer + questions */}
            {activeTest ? (
              <div className="space-y-4">
                {/* Timer bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-gray-900">{activeTest.title}</h3>
                    <p className="text-xs text-gray-400">{activeTest.questions.length} questions • {activeTest.totalMarks} marks</p>
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
                  Submit Test →
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
                    <div><div className="text-2xl font-black">{testResult.attempt.percentage >= 33 ? '✓ PASS' : '✗ FAIL'}</div><div className="text-white/70 text-xs">Result</div></div>
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
                        <p className="font-semibold text-gray-900 text-sm mb-2"><span className="font-black">{isRight ? '✅' : '❌'} Q{qi+1}.</span> {q.question}</p>
                        <p className="text-xs text-gray-600">Your answer: <span className={`font-bold ${isRight ? 'text-green-700' : 'text-red-600'}`}>{selected !== undefined ? q.options[selected] : 'Not answered'}</span></p>
                        {!isRight && <p className="text-xs text-green-700 font-bold">Correct: {q.options[correct]}</p>}
                      </div>
                    );
                  })}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setTestResult(null); }}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      ← Back to Tests
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
                            ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Done</span>
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
            <h2 className="text-xl font-black text-gray-900">My Admit Card</h2>
            {admitCard ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Exam Name</p>
                    <p className="font-black text-gray-900">{admitCard.examName || '—'}</p>
                  </div>
                  <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || ''}${admitCard.fileUrl}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
                {[['Roll Number', admitCard.rollNumber], ['Exam Date', admitCard.examDate ? new Date(admitCard.examDate).toLocaleDateString('en-IN') : '—'], ['Exam Center', admitCard.examCenter || '—'], ['Course', admitCard.courseName || '—']].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-bold text-gray-400">{l}</span>
                    <span className="text-sm font-bold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-semibold">No Admit Card issued yet</p>
                <p className="text-xs text-gray-400 mt-1">Your admit card will appear here once issued by your branch</p>
              </div>
            )}
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
                      <p className="text-xs text-gray-400">{m.subject || m.courseName || '—'}</p>
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
                            ['Issue Date', c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'],
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
  );
}
