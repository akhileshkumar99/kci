import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, User, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import api from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || '';

// ─── Constants (all in mm, PVC standard 85.6 × 54) ───────────────
const W = 85.6, H = 54;
const NAVY = [11, 31, 91];
const GOLD = [212, 175, 55];
const WHITE = [255, 255, 255];
const LIGHT = [220, 228, 248];
const HDR_H = 10, BADGE_H = 5;
const BODY_Y = HDR_H + BADGE_H, BODY_H = H - BODY_Y - 7, FOOT_Y = H - 7;
const PAD = 2.5, LEFT_W = 50, RIGHT_X = PAD + LEFT_W + 2, RIGHT_W = W - RIGHT_X - PAD;

const DEFAULT_FIELDS = [
  { key: 'name',             label: 'Student Name', x: 50, y: 44, fontSize: 18, bold: true,  color: '#ffffff' },
  { key: 'fatherName',       label: 'Father Name',  x: 50, y: 53, fontSize: 13, bold: false, color: '#dce4f8' },
  { key: 'courseName',       label: 'Course',       x: 50, y: 61, fontSize: 13, bold: false, color: '#dce4f8' },
  { key: 'enrollmentNumber', label: 'Enroll No.',   x: 50, y: 69, fontSize: 12, bold: false, color: '#d4af37' },
  { key: 'dob',              label: 'DOB',          x: 50, y: 77, fontSize: 11, bold: false, color: '#aac0f0' },
];

export default function IDCardPage() {
  const { user } = useAuth();
  const cardRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [idCardTemplate, setIdCardTemplate] = useState(null);
  const idCardFields = DEFAULT_FIELDS;

  useEffect(() => {
    api.get('/certificates/idcard-template/public')
      .then(r => { if (r.data.templateUrl) setIdCardTemplate(`${API_URL}${r.data.templateUrl}`); })
      .catch(() => {});
  }, []);

  // ─── PDF helpers ────────────────────────────────────────────────
  const setColor = (doc, rgb, type = 'fill') =>
    type === 'fill' ? doc.setFillColor(...rgb) : doc.setTextColor(...rgb);
  const setDraw = (doc, rgb) => doc.setDrawColor(...rgb);

  const drawHeader = (doc) => {
    setColor(doc, WHITE); doc.rect(0, 0, W, HDR_H, 'F');
    setColor(doc, NAVY); doc.circle(PAD + 3.5, HDR_H / 2, 3.5, 'F');
    doc.setFontSize(3.8); doc.setFont('helvetica', 'bold');
    setColor(doc, WHITE, 'text');
    doc.text('KCI', PAD + 3.5, HDR_H / 2 + 1.3, { align: 'center' });
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
    setColor(doc, NAVY, 'text');
    doc.text('KEERTI COMPUTER INSTITUTE', W / 2, 4.2, { align: 'center' });
    doc.setFontSize(3.2); doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Ayodhya, U.P.  |  www.kci.org.in  |  Ph: 9936384736', W / 2, 7.5, { align: 'center' });
    setColor(doc, GOLD); doc.rect(0, HDR_H - 0.5, W, 0.5, 'F');
  };

  const drawBadge = (doc) => {
    setColor(doc, GOLD); doc.rect(0, HDR_H, W, BADGE_H, 'F');
    doc.setFontSize(5.2); doc.setFont('helvetica', 'bold');
    setColor(doc, NAVY, 'text');
    doc.text('STUDENT  IDENTITY  CARD', W / 2, HDR_H + 3.5, { align: 'center' });
  };

  const drawBody = (doc) => {
    setColor(doc, NAVY); doc.rect(0, BODY_Y, W, BODY_H, 'F');
    let y = BODY_Y + 4;
    const lh = 5.0;
    doc.setFontSize(3.5); doc.setFont('helvetica', 'normal');
    setColor(doc, GOLD, 'text');
    doc.text(`Form No: ${user?.formNo || 'N/A'}`, PAD, y);
    y += 4.2;
    [['Name', user?.name], ['Father', user?.fatherName], ['Course', user?.courseName],
     ['DOB', user?.dob ? new Date(user.dob).toLocaleDateString('en-IN') : null]
    ].forEach(([label, val]) => {
      doc.setFontSize(3.8); doc.setFont('helvetica', 'bold');
      setColor(doc, LIGHT, 'text');
      doc.text(`${label}:`, PAD, y);
      doc.setFontSize(4.2); doc.setFont('helvetica', 'bold');
      setColor(doc, WHITE, 'text');
      const lines = doc.splitTextToSize(String(val || 'N/A'), LEFT_W - 14);
      doc.text(lines.slice(0, 2), PAD + 13, y);
      y += lines.length > 1 ? lh + 2 : lh;
    });
    const photoX = RIGHT_X, photoY = BODY_Y + 2, photoW = RIGHT_W, photoH = BODY_H - 14;
    setColor(doc, [180, 195, 230]); doc.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'F');
    setDraw(doc, GOLD); doc.setLineWidth(0.4);
    doc.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'S');
    doc.setFontSize(3.2); doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 80, 120);
    doc.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2 + 1, { align: 'center' });
    const qrY = photoY + photoH + 2, qrSize = RIGHT_W - 2;
    setColor(doc, WHITE); doc.roundedRect(photoX + 1, qrY, qrSize, qrSize, 1, 1, 'F');
    setDraw(doc, GOLD); doc.setLineWidth(0.3);
    doc.roundedRect(photoX + 1, qrY, qrSize, qrSize, 1, 1, 'S');
    doc.setFontSize(2.8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 50, 120);
    doc.text('QR', photoX + 1 + qrSize / 2, qrY + qrSize / 2 + 0.8, { align: 'center' });
  };

  const drawFooter = (doc) => {
    setColor(doc, [8, 20, 65]); doc.rect(0, FOOT_Y, W, H - FOOT_Y, 'F');
    setColor(doc, GOLD); doc.rect(0, FOOT_Y, W, 0.4, 'F');
    const midY = FOOT_Y + 3.5;
    doc.setFontSize(3); doc.setFont('helvetica', 'normal');
    setDraw(doc, LIGHT); doc.setLineWidth(0.25);
    doc.line(PAD, midY, PAD + 18, midY);
    setColor(doc, LIGHT, 'text');
    doc.text('Student Sign', PAD + 9, midY + 2.5, { align: 'center' });
    setColor(doc, GOLD); doc.circle(W / 2, midY + 0.5, 3.2, 'F');
    doc.setFontSize(2.6); doc.setFont('helvetica', 'bold');
    setColor(doc, NAVY, 'text');
    doc.text('KCI', W / 2, midY - 0.3, { align: 'center' });
    doc.text('SEAL', W / 2, midY + 2.1, { align: 'center' });
    doc.setLineWidth(0.25); setDraw(doc, LIGHT);
    doc.line(W - PAD - 18, midY, W - PAD, midY);
    setColor(doc, LIGHT, 'text');
    doc.setFontSize(3); doc.setFont('helvetica', 'normal');
    doc.text('Principal Sign', W - PAD - 9, midY + 2.5, { align: 'center' });
  };

  // ─── Main download handler ───────────────────────────────────────
  const handleDownload = async () => {
    if (!user) return toast.error('Please login first');
    setDownloading(true);

    // ── Template-based canvas download ──────────────────────────
    if (idCardTemplate) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = idCardTemplate;
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const drawFields = () => {
          idCardFields.forEach(f => {
            const val = f.key === 'dob'
              ? (user[f.key] ? new Date(user[f.key]).toLocaleDateString('en-IN') : '')
              : (user[f.key] || '');
            if (!val) return;
            ctx.font = `${f.bold ? 'bold ' : ''}${(f.fontSize / 100) * img.width * 0.08}px sans-serif`;
            ctx.fillStyle = f.color; ctx.textAlign = 'center';
            ctx.fillText(val, (f.x / 100) * img.width, (f.y / 100) * img.height);
          });
          const a = document.createElement('a');
          a.download = `KCI_ID_${user.enrollmentNumber || user.rollNumber || 'card'}.png`;
          a.href = canvas.toDataURL('image/png'); a.click();
          toast.success('ID Card downloaded!');
          setDownloading(false);
        };
        if (user.photo) {
          const photoImg = new Image();
          photoImg.crossOrigin = 'anonymous';
          photoImg.src = user.photo.startsWith('http') ? user.photo : `${API_URL}${user.photo}`;
          photoImg.onload = () => {
            const pw = img.width * 0.18, ph = img.width * 0.22;
            const px = img.width * 0.72, py = img.height * 0.22;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(px, py, pw, ph, 8);
            ctx.clip();
            ctx.drawImage(photoImg, px, py, pw, ph);
            ctx.restore();
            drawFields();
          };
          photoImg.onerror = drawFields;
        } else { drawFields(); }
      };
      img.onerror = () => { toast.error('Template load failed'); setDownloading(false); };
      return;
    }

    // ── Fallback: jsPDF default design ───────────────────────────
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });
      setDraw(doc, GOLD); doc.setLineWidth(0.6);
      doc.rect(0.3, 0.3, W - 0.6, H - 0.6);
      drawHeader(doc); drawBadge(doc); drawBody(doc); drawFooter(doc);
      doc.save(`KCI_ID_${user.formNo || user.rollNumber || 'card'}.pdf`);
      toast.success('ID Card downloaded!');
    } catch { toast.error('Download failed'); }
    setDownloading(false);
  };

  if (!user) return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Please login to view your ID card</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Login</a>
      </div>
    </div>
  );

  const dob = user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'N/A';

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-[#0b1f5b] to-[#1a3a8f] py-10 text-white text-center overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Student <span className="text-yellow-400">ID Card</span></h1>
          <p className="text-blue-200">Download your official KCI student identity card</p>
        </motion.div>
      </section>

      <div className="max-w-xl mx-auto px-4 py-10">

        {/* ── Template-based Preview ── */}
        {idCardTemplate ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-8 relative rounded-xl overflow-hidden shadow-2xl" style={{ maxWidth: 520 }}>
            <img src={idCardTemplate} alt="ID Card" className="w-full rounded-xl border-2 border-yellow-400" />
            <div className="absolute inset-0 pointer-events-none">
              {idCardFields.map(f => {
                const val = f.key === 'dob'
                  ? (user[f.key] ? new Date(user[f.key]).toLocaleDateString('en-IN') : '')
                  : (user[f.key] || '');
                if (!val) return null;
                return (
                  <span key={f.key} style={{
                    position: 'absolute',
                    left: `${f.x}%`, top: `${f.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${f.fontSize * 0.55}px`,
                    fontWeight: f.bold ? 700 : 400,
                    color: f.color,
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}>{val}</span>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ── Default jsPDF Preview Card ── */
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl"
            style={{
              width: '100%', maxWidth: 520, aspectRatio: `${W}/${H}`,
              border: '2px solid #d4af37', background: '#0b1f5b',
              fontFamily: 'helvetica, sans-serif', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ background: '#fff', borderBottom: '2px solid #d4af37', display: 'flex', alignItems: 'center', padding: '4px 8px', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #d4af37', overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                <img src="/logo.png" alt="KCI" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ color: '#0b1f5b', fontWeight: 900, fontSize: 11, letterSpacing: 0.4 }}>KEERTI COMPUTER INSTITUTE</div>
                <div style={{ color: '#555', fontSize: 7.5, marginTop: 1 }}>Ayodhya, U.P. | www.kci.org.in | Ph: 9936384736</div>
              </div>
            </div>
            <div style={{ background: '#d4af37', textAlign: 'center', padding: '3px 0', fontSize: 8.5, fontWeight: 900, color: '#0b1f5b', letterSpacing: 1.2, flexShrink: 0 }}>
              STUDENT &nbsp; IDENTITY &nbsp; CARD
            </div>
            <div style={{ flex: 1, display: 'flex', padding: '6px 8px', gap: 8, minHeight: 0 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <div style={{ color: '#d4af37', fontSize: 7, fontWeight: 600 }}>Form No: {user.formNo || 'N/A'}</div>
                {[['Name', user.name], ['Father', user.fatherName], ['Course', user.courseName], ['DOB', dob]].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    <span style={{ color: '#aac0f0', fontSize: 7, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 36 }}>{lbl}:</span>
                    <span style={{ color: '#fff', fontSize: 7.5, fontWeight: 700, wordBreak: 'break-word', lineHeight: 1.35 }}>{val || 'N/A'}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0, width: 54 }}>
                <div style={{ flex: 1, border: '1.5px solid #d4af37', borderRadius: 6, background: '#b4c3e6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 44 }}>
                  {user.photo ? <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="#4a5fa0" />}
                </div>
                <div style={{ border: '1px solid #d4af37', borderRadius: 4, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3 }}>
                  <QrCode size={28} color="#0b1f5b" />
                </div>
              </div>
            </div>
            <div style={{ background: '#080e3f', borderTop: '1.5px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 10px', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #aac0f0', width: 56, marginBottom: 2 }} />
                <span style={{ color: '#aac0f0', fontSize: 6.5 }}>Student Sign</span>
              </div>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#d4af37', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#0b1f5b', fontSize: 6, fontWeight: 900, lineHeight: 1.2 }}>KCI</span>
                <span style={{ color: '#0b1f5b', fontSize: 5.5, fontWeight: 700, lineHeight: 1.2 }}>SEAL</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #aac0f0', width: 56, marginBottom: 2 }} />
                <span style={{ color: '#aac0f0', fontSize: 6.5 }}>Principal Sign</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={handleDownload}
          disabled={downloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-[#0b1f5b] to-[#1a3a8f] text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60"
        >
          {downloading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-6 h-6" />}
          {downloading ? 'Generating...' : idCardTemplate ? 'Download ID Card PNG' : 'Download ID Card PDF'}
        </motion.button>

        <p className="text-center text-xs text-gray-400 mt-4">* Official KCI student ID card — keep it safe.</p>
      </div>
    </div>
  );
}
