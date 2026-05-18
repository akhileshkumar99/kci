import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, AlertCircle, FileText, Shield, Clock, MapPin } from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../utils/api';

/* ── helpers ── */
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

// Generate barcode-style lines (Code-39 visual simulation)
function drawBarcode(doc, text, x, y, w = 60, h = 12) {
  const bars = [...text].map(c => c.charCodeAt(0));
  const unitW = w / (bars.length * 9 + 2);
  let cx = x;
  doc.setFillColor(0, 0, 0);
  bars.forEach(code => {
    const pattern = (code % 9).toString(2).padStart(9, '0');
    [...pattern].forEach(bit => {
      if (bit === '1') doc.rect(cx, y, unitW * 1.5, h, 'F');
      cx += unitW * 2;
    });
  });
  doc.setFontSize(6);
  doc.setTextColor(0);
  doc.text(text, x + w / 2, y + h + 4, { align: 'center' });
}

// QR-like decorative block
function drawQR(doc, x, y, size = 22) {
  const cell = size / 7;
  const pattern = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
  ];
  doc.setFillColor(30, 64, 175);
  pattern.forEach((row, r) =>
    row.forEach((bit, c) => {
      if (bit) doc.rect(x + c * cell, y + r * cell, cell - 0.3, cell - 0.3, 'F');
    })
  );
}

function generateAdmitCardPDF(card) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const pad = 12;

  /* ── BACKGROUND ── */
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, H, 'F');

  // Subtle grid watermark
  doc.setDrawColor(220, 230, 245);
  doc.setLineWidth(0.2);
  for (let i = 0; i < W; i += 8) doc.line(i, 0, i, H);
  for (let j = 0; j < H; j += 8) doc.line(0, j, W, j);

  // WATERMARK text
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.04 }));
  doc.setFontSize(52);
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('KCI', W / 2, H / 2 - 10, { align: 'center', angle: 45 });
  doc.text('ADMIT CARD', W / 2, H / 2 + 20, { align: 'center', angle: 45 });
  doc.restoreGraphicsState();

  /* ── OUTER BORDER ── */
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1.2);
  doc.roundedRect(pad, pad, W - pad * 2, H - pad * 2, 4, 4, 'S');
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.4);
  doc.roundedRect(pad + 2, pad + 2, W - (pad + 2) * 2, H - (pad + 2) * 2, 3, 3, 'S');

  /* ── HEADER BAND ── */
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(pad, pad, W - pad * 2, 38, 4, 4, 'F');
  doc.setFillColor(30, 64, 175);
  doc.rect(pad, pad + 20, W - pad * 2, 18, 'F'); // flatten bottom corners

  // Accent stripe
  doc.setFillColor(99, 102, 241);
  doc.rect(pad, pad + 34, W - pad * 2, 4, 'F');

  // Institute name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('KEERTI COMPUTER INSTITUTE', W / 2, pad + 14, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 200, 255);
  doc.text('Government Recognized  |  ISO Certified  |  NIELIT Affiliated  |  www.keerti.org.in', W / 2, pad + 22, { align: 'center' });

  /* ── TITLE BAR ── */
  doc.setFillColor(79, 70, 229);
  doc.rect(pad, pad + 38, W - pad * 2, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setCharSpace(3);
  doc.text('EXAMINATION ADMIT CARD', W / 2, pad + 45, { align: 'center' });
  doc.setCharSpace(0);

  /* ── SERIAL / ROLL NUMBER BADGE ── */
  const rollY = pad + 54;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.roundedRect(pad + 4, rollY, W - (pad + 4) * 2, 14, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ROLL NUMBER', pad + 14, rollY + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(30, 64, 175);
  doc.text(card.rollNumber || card.enrollmentNumber, pad + 14, rollY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SERIAL NO.', W - pad - 50, rollY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text(card.serialNumber || String(card._id || '').slice(-6).toUpperCase() || '000001', W - pad - 50, rollY + 12);

  // Status badge
  doc.setFillColor(220, 252, 231);
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(W - pad - 38, rollY + 2, 34, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text('✓  APPROVED', W - pad - 21, rollY + 8.5, { align: 'center' });

  /* ── PHOTO PLACEHOLDER ── */
  const photoX = W - pad - 36, photoY = rollY + 20;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.roundedRect(photoX, photoY, 32, 38, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('PHOTO', photoX + 16, photoY + 18, { align: 'center' });
  doc.text('(Paste Here)', photoX + 16, photoY + 24, { align: 'center' });
  // Corner marks
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.8);
  [[photoX, photoY],[photoX+32, photoY],[photoX, photoY+38],[photoX+32, photoY+38]].forEach(([cx, cy]) => {
    const dx = cx === photoX ? 1 : -1, dy = cy === photoY ? 1 : -1;
    doc.line(cx, cy, cx + dx * 4, cy);
    doc.line(cx, cy, cx, cy + dy * 4);
  });

  /* ── STUDENT INFO SECTION ── */
  const infoY = rollY + 20;
  const infoW = W - pad * 2 - 40;

  // Student name large
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(card.studentName?.toUpperCase() || '', pad + 4, infoY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CANDIDATE NAME', pad + 4, infoY + 13);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(pad + 4, infoY + 16, pad + infoW - 4, infoY + 16);

  // Info fields — 2 columns
  const fields = [
    ['Enrollment No.', card.enrollmentNumber],
    ['Course', card.course],
    ["Father's Name", card.fatherName],
    ["Mother's Name", card.motherName || '—'],
    ['Date of Birth', card.dob],
    ['Gender', card.gender],
    ['Category', card.category],
    ['Batch', card.batch],
    ['Session', card.session || '—'],
    ['Qualification', card.qualification || '—'],
    ['Exam Type', card.examType || 'Regular'],
    ['Exam Center', card.examCenter || 'Main Center'],
  ];

  const colW = (infoW - 8) / 2;
  fields.forEach(([label, val], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = pad + 4 + col * (colW + 4);
    const fy = infoY + 22 + row * 14;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(fx, fy, colW, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), fx + 3, fy + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const valStr = String(val || '—');
    doc.text(valStr.length > 28 ? valStr.slice(0, 26) + '…' : valStr, fx + 3, fy + 9.5);
  });

  // Address full width
  const addrY = infoY + 22 + Math.ceil(fields.length / 2) * 14;
  if (card.address) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(pad + 4, addrY, infoW - 4, 12, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('ADDRESS', pad + 7, addrY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const addr = card.address.length > 80 ? card.address.slice(0, 78) + '…' : card.address;
    doc.text(addr, pad + 7, addrY + 9.5);
  }

  /* ── EXAM SCHEDULE BOX ── */
  const schedY = (card.address ? addrY : infoY + 22 + Math.ceil(fields.length / 2) * 14) + 16;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.roundedRect(pad + 4, schedY, W - (pad + 4) * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text('📅  EXAMINATION SCHEDULE', pad + 10, schedY + 7);

  const schedItems = [
    ['Exam Date', card.examDate || 'As per schedule'],
    ['Exam Center', card.examCenter || 'Main Center, KCI'],
    ['Reporting Time', '30 min before exam'],
    ['Exam Type', card.examType || 'Regular'],
  ];
  schedItems.forEach(([k, v], i) => {
    const sx = pad + 10 + i * 46;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k, sx, schedY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(v, sx, schedY + 19);
  });

  /* ── INSTRUCTIONS ── */
  const instY = schedY + 28;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.5);
  doc.roundedRect(pad + 4, instY, W - (pad + 4) * 2, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text('⚠  IMPORTANT INSTRUCTIONS FOR CANDIDATES', pad + 10, instY + 7);

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
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15);
    doc.text(line, pad + 10, instY + 14 + i * 4);
  });

  /* ── BARCODE ── */
  const bcY = instY + 40;
  drawBarcode(doc, card.enrollmentNumber || 'KCI000001', pad + 4, bcY, 70, 10);

  /* ── QR CODE (decorative) ── */
  drawQR(doc, W - pad - 30, bcY - 2, 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan to Verify', W - pad - 18, bcY + 26, { align: 'center' });

  /* ── SIGNATURE SECTION ── */
  const sigY = bcY + 18;
  // Candidate signature
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(pad + 10, sigY + 10, pad + 55, sigY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Candidate's Signature", pad + 32, sigY + 14, { align: 'center' });

  // Authority signature
  doc.line(W - pad - 55, sigY + 10, W - pad - 10, sigY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 64, 175);
  doc.text('Authorized Signatory', W - pad - 32, sigY + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Principal / Director, KCI', W - pad - 32, sigY + 18, { align: 'center' });

  /* ── FOOTER ── */
  const ftY = H - pad - 14;
  doc.setFillColor(30, 64, 175);
  doc.rect(pad, ftY, W - pad * 2, 14, 'F');
  doc.setFillColor(79, 70, 229);
  doc.rect(pad, ftY, W - pad * 2, 4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 200, 255);
  doc.text(`Issued on: ${today()}`, pad + 6, ftY + 9);
  doc.text('www.keerti.org.in  |  This is a computer-generated document — no signature required', W / 2, ftY + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`SN: ${card.serialNumber || String(card._id || '').slice(-6).toUpperCase() || '000001'}`, W - pad - 6, ftY + 9, { align: 'right' });

  doc.save(`AdmitCard_${card.rollNumber || card.enrollmentNumber}.pdf`);
}

/* ── COMPONENT ── */
export default function AdmitCard() {
  const [enrollment, setEnrollment] = useState('');
  const [card, setCard]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSearch = async e => {
    e.preventDefault();
    if (!enrollment.trim()) return;
    setLoading(true); setError(''); setCard(null);
    try {
      const { data } = await api.get(`/admit-card/${enrollment.trim()}`);
      setCard(data.admitCard);
    } catch (err) {
      setError(err.response?.data?.message || 'No admit card found for this enrollment number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Download Admit Card</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your enrollment number to generate your official admit card PDF</p>
        </motion.div>

        {/* Search */}
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Enrollment / Roll Number</label>
          <div className="flex gap-3">
            <input value={enrollment} onChange={e => setEnrollment(e.target.value)}
              placeholder="e.g. KCI20260004"
              className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 text-sm transition-all" />
            <button type="submit" disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </motion.form>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </motion.div>
        )}

        {/* Card Found */}
        {card && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Preview Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-800 overflow-hidden mb-5">

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-indigo-700 px-6 py-4 flex items-center gap-4">
                <img src="/logo.png" alt="KCI" className="w-14 h-14 rounded-full border-2 border-white/30 object-cover" />
                <div>
                  <h2 className="text-white font-black text-lg tracking-wide">KEERTI COMPUTER INSTITUTE</h2>
                  <p className="text-blue-200 text-xs">Government Recognized | ISO Certified | NIELIT Affiliated</p>
                </div>
              </div>

              {/* Title */}
              <div className="bg-indigo-600 text-white text-center py-2 font-black tracking-[3px] text-xs uppercase">
                EXAMINATION ADMIT CARD
              </div>

              {/* Roll + Serial */}
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Roll Number</p>
                  <p className="text-blue-800 font-black text-lg">{card.rollNumber || card.enrollmentNumber}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Serial No.</p>
                  <p className="text-indigo-600 font-black text-lg">
                    {card.serialNumber || String(card._id || '').slice(-6).toUpperCase() || '000001'}
                  </p>
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

                {/* Instructions */}
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

              {/* Footer */}
              <div className="bg-gray-50 border-t-2 border-dashed border-gray-200 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Issued: {today()}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Verified Document
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {card.examCenter || 'Main Center'}
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button onClick={() => generateAdmitCardPDF(card)}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-base hover:shadow-xl hover:scale-[1.01] transition-all">
              <Download className="w-5 h-5" />
              Download Official Admit Card PDF
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              PDF includes barcode, QR code, serial number, watermark & official layout
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
