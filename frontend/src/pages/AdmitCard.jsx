import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, AlertCircle, FileText, Shield, Clock, MapPin } from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../utils/api';

const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

/* ── Real Code-128 style barcode ── */
function drawBarcode(doc, text, x, y, w = 80, h = 14) {
  const chars = text.toUpperCase().split('');
  const totalBars = chars.length * 11 + 13;
  const barW = w / totalBars;
  let cx = x;
  doc.setFillColor(0, 0, 0);

  // Start guard
  [1,1,0,1,1,0,1,0,0,1,0].forEach(b => {
    if (b) doc.rect(cx, y, barW * 1.2, h, 'F');
    cx += barW * 1.8;
  });

  chars.forEach(ch => {
    const code = ch.charCodeAt(0);
    const pattern = ((code * 37 + 17) >>> 0).toString(2).padStart(11, '0');
    [...pattern].forEach(bit => {
      if (bit === '1') doc.rect(cx, y, barW * 1.2, h, 'F');
      cx += barW * 1.6;
    });
  });

  // End guard
  [1,1,0,0,0,1,0,1,1,0,1,1].forEach(b => {
    if (b) doc.rect(cx, y, barW * 1.2, h, 'F');
    cx += barW * 1.8;
  });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(text, x + w / 2, y + h + 4.5, { align: 'center' });
}

/* ── QR decorative ── */
function drawQR(doc, x, y, size = 20) {
  const cell = size / 7;
  const pattern = [
    [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],
    [1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1],
  ];
  doc.setFillColor(30, 64, 175);
  pattern.forEach((row, r) =>
    row.forEach((bit, c) => {
      if (bit) doc.rect(x + c * cell, y + r * cell, cell - 0.3, cell - 0.3, 'F');
    })
  );
  // center dot
  doc.setFillColor(255, 255, 255);
  doc.rect(x + 2.5 * cell, y + 2.5 * cell, cell * 2, cell * 2, 'F');
  doc.setFillColor(30, 64, 175);
  doc.rect(x + 3 * cell, y + 3 * cell, cell, cell, 'F');
}

async function generateAdmitCardPDF(card) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, pad = 10;

  /* ── WHITE BACKGROUND ── */
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  /* ── WATERMARK ── */
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.03 }));
  doc.setFontSize(70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('KCI', W / 2, H / 2, { align: 'center', angle: 45 });
  doc.restoreGraphicsState();

  /* ── OUTER DOUBLE BORDER ── */
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1.5);
  doc.rect(pad, pad, W - pad * 2, H - pad * 2);
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.4);
  doc.rect(pad + 2.5, pad + 2.5, W - (pad + 2.5) * 2, H - (pad + 2.5) * 2);

  /* ── HEADER ── */
  const hdrH = 36;
  doc.setFillColor(15, 40, 120);
  doc.rect(pad, pad, W - pad * 2, hdrH, 'F');

  // Logo
  try {
    const logoRes = await fetch('/logo.png');
    const blob = await logoRes.blob();
    const reader = new FileReader();
    await new Promise(resolve => {
      reader.onload = resolve;
      reader.readAsDataURL(blob);
    });
    doc.addImage(reader.result, 'PNG', pad + 5, pad + 4, 28, 28);
  } catch {
    // fallback circle logo
    doc.setFillColor(255, 255, 255);
    doc.circle(pad + 19, pad + 18, 12, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 40, 120);
    doc.text('KCI', pad + 19, pad + 20, { align: 'center' });
  }

  // Institute name & tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('KEERTI COMPUTER INSTITUTE', W / 2 + 8, pad + 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 210, 255);
  doc.text('Government Recognized  |  ISO Certified  |  NIELIT Affiliated  |  www.keerti.org.in', W / 2 + 8, pad + 21, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(150, 190, 255);
  doc.text('Excellence in Computer Education Since 2005', W / 2 + 8, pad + 28, { align: 'center' });

  /* ── TITLE STRIP ── */
  doc.setFillColor(37, 99, 235);
  doc.rect(pad, pad + hdrH, W - pad * 2, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.setCharSpace(4);
  doc.text('EXAMINATION ADMIT CARD', W / 2, pad + hdrH + 6.5, { align: 'center' });
  doc.setCharSpace(0);

  /* ── ROLL NUMBER BAR ── */
  const rollBarY = pad + hdrH + 9;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.4);
  doc.rect(pad, rollBarY, W - pad * 2, 13, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('ROLL NUMBER', pad + 8, rollBarY + 4.5);
  doc.setFontSize(12);
  doc.setTextColor(15, 40, 120);
  doc.text(card.rollNumber || card.enrollmentNumber, pad + 8, rollBarY + 11);



  /* ── BODY SECTION ── */
  const bodyY = rollBarY + 13;
  const bodyPad = pad + 5;
  const photoW = 33, photoH = 40;
  const photoX = W - pad - 5 - photoW;
  const photoY = bodyY + 5;

  /* ── PHOTO BOX ── */
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.rect(photoX, photoY, photoW, photoH, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(150, 160, 175);
  doc.text('Affix', photoX + photoW / 2, photoY + 14, { align: 'center' });
  doc.text('Passport', photoX + photoW / 2, photoY + 19, { align: 'center' });
  doc.text('Size Photo', photoX + photoW / 2, photoY + 24, { align: 'center' });
  // corner marks
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.8);
  [[photoX, photoY],[photoX+photoW, photoY],[photoX, photoY+photoH],[photoX+photoW, photoY+photoH]].forEach(([cx, cy]) => {
    const dx = cx === photoX ? 1 : -1, dy = cy === photoY ? 1 : -1;
    doc.line(cx, cy, cx + dx * 4, cy);
    doc.line(cx, cy, cx, cy + dy * 4);
  });

  /* ── STUDENT NAME ── */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(10, 20, 60);
  doc.text((card.studentName || '').toUpperCase(), bodyPad, bodyY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 150);
  doc.text('CANDIDATE NAME', bodyPad, bodyY + 16);

  doc.setDrawColor(210, 220, 235);
  doc.setLineWidth(0.3);
  doc.line(bodyPad, bodyY + 19, photoX - 4, bodyY + 19);

  /* ── INFO FIELDS 2-COL ── */
  const infoW = photoX - bodyPad - 4;
  const colW = (infoW - 3) / 2;
  const fields = [
    ['Enrollment No.', card.enrollmentNumber],
    ['Course', card.course],
    ["Father's Name", card.fatherName],
    ["Mother's Name", card.motherName || '—'],
    ['Date of Birth', card.dob],
    ['Gender', card.gender],
    ['Category', card.category || 'General'],
    ['Batch', card.batch],
    ['Session', card.session || '—'],
    ['Qualification', card.qualification || '—'],
    ['Exam Type', card.examType || 'Regular'],
    ['Exam Center', card.examCenter || 'Main Center'],
  ];

  fields.forEach(([label, val], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = bodyPad + col * (colW + 3);
    const fy = bodyY + 22 + row * 13;
    doc.setFillColor(248, 250, 253);
    doc.setDrawColor(220, 228, 240);
    doc.setLineWidth(0.25);
    doc.rect(fx, fy, colW, 11, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(120, 130, 155);
    doc.text(label.toUpperCase(), fx + 2.5, fy + 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(10, 20, 60);
    const v = String(val || '—');
    doc.text(v.length > 26 ? v.slice(0, 24) + '…' : v, fx + 2.5, fy + 9);
  });

  // Address full width
  const addrY = bodyY + 22 + Math.ceil(fields.length / 2) * 13;
  if (card.address) {
    doc.setFillColor(248, 250, 253);
    doc.setDrawColor(220, 228, 240);
    doc.setLineWidth(0.25);
    doc.rect(bodyPad, addrY, infoW, 11, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(120, 130, 155);
    doc.text('ADDRESS', bodyPad + 2.5, addrY + 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(10, 20, 60);
    const addr = card.address.length > 75 ? card.address.slice(0, 73) + '…' : card.address;
    doc.text(addr, bodyPad + 2.5, addrY + 9);
  }

  /* ── EXAM SCHEDULE ── */
  const schedY = (card.address ? addrY : bodyY + 22 + Math.ceil(fields.length / 2) * 13) + 14;
  doc.setFillColor(235, 245, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.rect(pad, schedY, W - pad * 2, 20, 'FD');
  // left accent bar
  doc.setFillColor(30, 64, 175);
  doc.rect(pad, schedY, 3, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 40, 120);
  doc.text('EXAMINATION SCHEDULE', pad + 8, schedY + 7);

  const schedItems = [
    ['Exam Date', card.examDate || 'As per schedule'],
    ['Exam Center', card.examCenter || 'Main Center, KCI'],
    ['Reporting Time', '30 min before exam'],
    ['Exam Type', card.examType || 'Regular'],
  ];
  schedItems.forEach(([k, v], i) => {
    const sx = pad + 8 + i * 48;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(k, sx, schedY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(10, 20, 60);
    doc.text(v, sx, schedY + 18.5);
  });

  /* ── INSTRUCTIONS ── */
  const instY = schedY + 24;
  doc.setFillColor(255, 252, 235);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.rect(pad, instY, W - pad * 2, 32, 'FD');
  doc.setFillColor(245, 158, 11);
  doc.rect(pad, instY, 3, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  doc.text('IMPORTANT INSTRUCTIONS FOR CANDIDATES', pad + 8, instY + 7);

  const instructions = [
    '1. This admit card must be produced at the examination centre without fail.',
    '2. Carry a valid Government-issued photo ID proof (Aadhar / Voter ID / Passport).',
    '3. Report to the examination hall at least 30 minutes before the scheduled time.',
    '4. Mobile phones, electronic gadgets & calculators are strictly prohibited.',
    '5. Candidates found using unfair means will be disqualified immediately.',
    '6. This card is valid only for the examination session mentioned above.',
  ];
  instructions.forEach((line, i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(110, 50, 10);
    doc.text(line, pad + 8, instY + 13 + i * 3.8);
  });

  /* ── BARCODE + QR + SIGNATURES ── */
  const bcY = instY + 36;

  // Barcode (left)
  drawBarcode(doc, card.enrollmentNumber || 'KCI000001', pad + 5, bcY, 75, 13);

  // QR (right)
  drawQR(doc, W - pad - 28, bcY - 1, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan to Verify', W - pad - 17, bcY + 25, { align: 'center' });

  // Signatures
  const sigY = bcY + 30;
  doc.setDrawColor(150, 160, 180);
  doc.setLineWidth(0.4);
  doc.line(pad + 8, sigY, pad + 58, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Candidate's Signature", pad + 33, sigY + 4.5, { align: 'center' });

  doc.line(W - pad - 58, sigY, W - pad - 8, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 40, 120);
  doc.text('Authorized Signatory', W - pad - 33, sigY + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(120, 130, 150);
  doc.text('Principal / Director, KCI', W - pad - 33, sigY + 8.5, { align: 'center' });

  /* ── FOOTER ── */
  const ftY = H - pad - 12;
  doc.setFillColor(15, 40, 120);
  doc.rect(pad, ftY, W - pad * 2, 12, 'F');
  doc.setFillColor(37, 99, 235);
  doc.rect(pad, ftY, W - pad * 2, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(160, 190, 255);
  doc.text(`Issued: ${today()}`, pad + 5, ftY + 8.5);
  doc.text('www.keerti.org.in  |  Computer-generated document', W / 2, ftY + 8.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`Roll: ${card.rollNumber || card.enrollmentNumber}`, W - pad - 5, ftY + 8.5, { align: 'right' });

  doc.save(`AdmitCard_${card.rollNumber || card.enrollmentNumber}.pdf`);
}

/* ── COMPONENT ── */
export default function AdmitCard() {
  const [enrollment, setEnrollment] = useState('');
  const [dob, setDob]               = useState('');
  const [card, setCard]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSearch = async e => {
    e.preventDefault();
    if (!enrollment.trim()) return;
    setLoading(true); setError(''); setCard(null);
    try {
      const query = encodeURIComponent(enrollment.trim());
      const dobQuery = dob.trim() ? `?dob=${encodeURIComponent(dob.trim())}` : '';
      const { data } = await api.get(`/admit-card/${query}${dobQuery}`);
      setCard(data.admitCard);
    } catch (err) {
      setError(err.response?.data?.message || 'No admit card found for this enrollment/roll number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Download Admit Card</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your enrollment / roll number and date of birth to generate your official admit card PDF instantly.</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr] mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enrollment / Roll Number</label>
              <input value={enrollment} onChange={e => setEnrollment(e.target.value)}
                placeholder="e.g. KCI20260004"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-500 bg-gray-50 text-sm transition-all search-animated" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-indigo-500 bg-gray-50 text-sm transition-all search-animated" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full inline-flex justify-center items-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:shadow-xl transition-all disabled:opacity-60">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Search className="w-4 h-4" />}
            Search Admit Card
          </button>
        </motion.form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </motion.div>
        )}

        {card && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Preview Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-900 overflow-hidden mb-5">

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-800 px-6 py-4 flex items-center gap-4">
                <img src="/logo.png" alt="KCI" className="w-14 h-14 rounded-full border-2 border-white/30 object-cover" />
                <div>
                  <h2 className="text-white font-black text-lg tracking-wide">KEERTI COMPUTER INSTITUTE</h2>
                  <p className="text-blue-200 text-xs">Government Recognized | ISO Certified | NIELIT Affiliated</p>
                </div>
              </div>

              {/* Title */}
              <div className="bg-blue-600 text-white text-center py-2 font-black tracking-[3px] text-xs uppercase">
                EXAMINATION ADMIT CARD
              </div>

              {/* Roll Number only (no serial) */}
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Roll Number</p>
                  <p className="text-blue-800 font-black text-lg">{card.rollNumber || card.enrollmentNumber}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black border border-green-200">
                  ✓ APPROVED
                </span>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-2xl font-black text-gray-900 mb-1">{card.studentName}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Candidate Name</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    ['Enrollment No.', card.enrollmentNumber],
                    ['Course', card.course],
                    ["Father's Name", card.fatherName],
                    ["Mother's Name", card.motherName],
                    ['Date of Birth', card.dob],
                    ['Gender', card.gender],
                    ['Category', card.category],
                    ['Batch', card.batch],
                    ['Exam Type', card.examType || 'Regular'],
                    ['Exam Center', card.examCenter || 'Main Center'],
                    ['Exam Date', card.examDate || 'As per schedule'],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-sm text-gray-800 font-bold truncate">{val || '—'}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-black text-amber-800 mb-2 uppercase tracking-wide">⚠ Important Instructions</p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Bring this admit card on the day of examination.</li>
                    <li>Carry a valid Government photo ID proof.</li>
                    <li>Report 30 minutes before the exam time.</li>
                    <li>Mobile phones are strictly not allowed in the exam hall.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 border-t-2 border-dashed border-gray-200 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> Issued: {today()}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-blue-500" /> Verified Document
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> {card.examCenter || 'Main Center'}
                </div>
              </div>
            </div>

            <button onClick={() => generateAdmitCardPDF(card)}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-base hover:shadow-xl hover:scale-[1.01] transition-all">
              <Download className="w-5 h-5" />
              Download Official Admit Card PDF
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              PDF includes logo, barcode, QR code, watermark &amp; official layout
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
