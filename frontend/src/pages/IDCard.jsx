import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, User, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

// ─── Constants (all in mm, PVC standard 85.6 × 54) ───────────────
const W = 85.6, H = 54;
const NAVY = [11, 31, 91];       // #0b1f5b
const GOLD = [212, 175, 55];     // #d4af37
const WHITE = [255, 255, 255];
const LIGHT = [220, 228, 248];

// ─── Zone heights (mm) ───────────────────────────────────────────
const HDR_H  = 10;   // header
const BADGE_H = 5;   // yellow badge strip
const BODY_Y  = HDR_H + BADGE_H;          // 15
const BODY_H  = H - BODY_Y - 7;           // ~32
const FOOT_Y  = H - 7;

// ─── Body columns ────────────────────────────────────────────────
const PAD     = 2.5;
const LEFT_W  = 50;                        // info column width
const RIGHT_X = PAD + LEFT_W + 2;         // photo column start ≈55
const RIGHT_W = W - RIGHT_X - PAD;        // ≈28

export default function IDCardPage() {
  const { user } = useAuth();
  const cardRef = useRef();
  const [downloading, setDownloading] = useState(false);

  // ─── PDF helpers ────────────────────────────────────────────────
  const setColor  = (doc, rgb, type = 'fill') =>
    type === 'fill' ? doc.setFillColor(...rgb) : doc.setTextColor(...rgb);
  const setDraw   = (doc, rgb) => doc.setDrawColor(...rgb);

  const drawHeader = (doc) => {
    // white bg
    setColor(doc, WHITE); doc.rect(0, 0, W, HDR_H, 'F');

    // Logo circle top-left
    setColor(doc, NAVY); doc.circle(PAD + 3.5, HDR_H / 2, 3.5, 'F');
    doc.setFontSize(3.8); doc.setFont('helvetica', 'bold');
    setColor(doc, WHITE, 'text');
    doc.text('KCI', PAD + 3.5, HDR_H / 2 + 1.3, { align: 'center' });

    // Institute name centred
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
    setColor(doc, NAVY, 'text');
    doc.text('KEERTI COMPUTER INSTITUTE', W / 2, 4.2, { align: 'center' });

    // Address line
    doc.setFontSize(3.2); doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Ayodhya, U.P.  |  www.kci.org.in  |  Ph: 9936384736', W / 2, 7.5, { align: 'center' });

    // Gold border bottom of header
    setColor(doc, GOLD); doc.rect(0, HDR_H - 0.5, W, 0.5, 'F');
  };

  const drawBadge = (doc) => {
    // Full-width gold badge
    setColor(doc, GOLD); doc.rect(0, HDR_H, W, BADGE_H, 'F');
    doc.setFontSize(5.2); doc.setFont('helvetica', 'bold');
    setColor(doc, NAVY, 'text');
    doc.text('STUDENT  IDENTITY  CARD', W / 2, HDR_H + 3.5, { align: 'center' });
  };

  const drawBody = (doc) => {
    // Navy body background
    setColor(doc, NAVY); doc.rect(0, BODY_Y, W, BODY_H, 'F');

    // ── LEFT: student fields ──────────────────────────────────────
    let y = BODY_Y + 4;
    const lh = 5.0; // line height

    // Form No (gold, small)
    doc.setFontSize(3.5); doc.setFont('helvetica', 'normal');
    setColor(doc, GOLD, 'text');
    doc.text(`Form No: ${user?.formNo || 'N/A'}`, PAD, y);
    y += 4.2;

    const fields = [
      { label: 'Name',   val: user?.name },
      { label: 'Father', val: user?.fatherName },
      { label: 'Course', val: user?.courseName },
      { label: 'DOB',    val: user?.dob ? new Date(user.dob).toLocaleDateString('en-IN') : null },
    ];

    fields.forEach(({ label, val }) => {
      // label
      doc.setFontSize(3.8); doc.setFont('helvetica', 'bold');
      setColor(doc, LIGHT, 'text');
      doc.text(`${label}:`, PAD, y);

      // value — wrap if long (max width = LEFT_W - 14)
      doc.setFontSize(4.2); doc.setFont('helvetica', 'bold');
      setColor(doc, WHITE, 'text');
      const maxVW = LEFT_W - 14;
      const lines = doc.splitTextToSize(String(val || 'N/A'), maxVW);
      doc.text(lines.slice(0, 2), PAD + 13, y);
      y += lines.length > 1 ? lh + 2 : lh;
    });

    // ── RIGHT: photo ──────────────────────────────────────────────
    const photoX = RIGHT_X, photoY = BODY_Y + 2;
    const photoW = RIGHT_W, photoH = BODY_H - 14;

    setColor(doc, [180, 195, 230]); doc.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'F');
    setDraw(doc, GOLD); doc.setLineWidth(0.4);
    doc.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'S');
    doc.setFontSize(3.2); doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 80, 120);
    doc.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2 + 1, { align: 'center' });

    // ── RIGHT: QR placeholder below photo ────────────────────────
    const qrY = photoY + photoH + 2;
    const qrSize = RIGHT_W - 2;
    setColor(doc, WHITE); doc.roundedRect(photoX + 1, qrY, qrSize, qrSize, 1, 1, 'F');
    setDraw(doc, GOLD); doc.setLineWidth(0.3);
    doc.roundedRect(photoX + 1, qrY, qrSize, qrSize, 1, 1, 'S');
    doc.setFontSize(2.8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 50, 120);
    doc.text('QR', photoX + 1 + qrSize / 2, qrY + qrSize / 2 + 0.8, { align: 'center' });
  };

  const drawFooter = (doc) => {
    // Dark navy footer strip
    setColor(doc, [8, 20, 65]); doc.rect(0, FOOT_Y, W, H - FOOT_Y, 'F');
    // Gold top border
    setColor(doc, GOLD); doc.rect(0, FOOT_Y, W, 0.4, 'F');

    const midY = FOOT_Y + 3.5;
    doc.setFontSize(3); doc.setFont('helvetica', 'normal');
    setDraw(doc, LIGHT); doc.setLineWidth(0.25);

    // Student Sign
    doc.line(PAD, midY, PAD + 18, midY);
    setColor(doc, LIGHT, 'text');
    doc.text('Student Sign', PAD + 9, midY + 2.5, { align: 'center' });

    // Seal circle centre
    setColor(doc, GOLD); doc.circle(W / 2, midY + 0.5, 3.2, 'F');
    doc.setFontSize(2.6); doc.setFont('helvetica', 'bold');
    setColor(doc, NAVY, 'text');
    doc.text('KCI', W / 2, midY - 0.3, { align: 'center' });
    doc.text('SEAL', W / 2, midY + 2.1, { align: 'center' });

    // Principal Sign
    doc.setLineWidth(0.25);
    setDraw(doc, LIGHT);
    doc.line(W - PAD - 18, midY, W - PAD, midY);
    setColor(doc, LIGHT, 'text');
    doc.setFontSize(3); doc.setFont('helvetica', 'normal');
    doc.text('Principal Sign', W - PAD - 9, midY + 2.5, { align: 'center' });
  };

  // ─── Main download handler ───────────────────────────────────────
  const handleDownload = async () => {
    if (!user) return toast.error('Please login first');
    setDownloading(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });

      // Gold outer border
      setDraw(doc, GOLD); doc.setLineWidth(0.6);
      doc.rect(0.3, 0.3, W - 0.6, H - 0.6);

      drawHeader(doc);
      drawBadge(doc);
      drawBody(doc);
      drawFooter(doc);

      doc.save(`KCI_ID_${user.formNo || user.rollNumber || 'card'}.pdf`);
      toast.success('ID Card downloaded!');
    } catch {
      toast.error('Download failed');
    }
    setDownloading(false);
  };

  // ─── Not logged in ───────────────────────────────────────────────
  if (!user) return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Please login to view your ID card</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Login</a>
      </div>
    </div>
  );

  // ─── Preview card (mirrors PDF layout) ──────────────────────────
  const dob = user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'N/A';

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Page hero */}
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

        {/* ── Preview Card ── */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl"
          style={{
            width: '100%',
            maxWidth: 520,
            aspectRatio: `${W}/${H}`,
            border: '2px solid #d4af37',
            background: '#0b1f5b',
            fontFamily: 'helvetica, sans-serif',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#fff',
            borderBottom: '2px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            gap: 6,
            flexShrink: 0,
          }}>
            {/* Logo */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#0b1f5b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: 8, fontWeight: 900, letterSpacing: 0 }}>KCI</span>
            </div>
            {/* Name + address */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ color: '#0b1f5b', fontWeight: 900, fontSize: 11, letterSpacing: 0.4 }}>
                KEERTI COMPUTER INSTITUTE
              </div>
              <div style={{ color: '#555', fontSize: 7.5, marginTop: 1 }}>
                Ayodhya, U.P. | www.kci.org.in | Ph: 9936384736
              </div>
            </div>
          </div>

          {/* Badge */}
          <div style={{
            background: '#d4af37',
            textAlign: 'center',
            padding: '3px 0',
            fontSize: 8.5,
            fontWeight: 900,
            color: '#0b1f5b',
            letterSpacing: 1.2,
            flexShrink: 0,
          }}>
            STUDENT &nbsp; IDENTITY &nbsp; CARD
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: 'flex', padding: '6px 8px', gap: 8, minHeight: 0 }}>

            {/* Left — fields */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              {/* Form No */}
              <div style={{ color: '#d4af37', fontSize: 7, fontWeight: 600 }}>
                Form No: {user.formNo || 'N/A'}
              </div>
              {[
                ['Name',   user.name],
                ['Father', user.fatherName],
                ['Course', user.courseName],
                ['DOB',    dob],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <span style={{ color: '#aac0f0', fontSize: 7, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 36 }}>
                    {lbl}:
                  </span>
                  <span style={{
                    color: '#fff', fontSize: 7.5, fontWeight: 700,
                    wordBreak: 'break-word', lineHeight: 1.35,
                  }}>
                    {val || 'N/A'}
                  </span>
                </div>
              ))}
            </div>

            {/* Right — photo + QR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0, width: 54 }}>
              {/* Photo */}
              <div style={{
                flex: 1,
                border: '1.5px solid #d4af37',
                borderRadius: 6,
                background: '#b4c3e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                minHeight: 44,
              }}>
                {user.photo
                  ? <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={20} color="#4a5fa0" />
                }
              </div>
              {/* QR */}
              <div style={{
                border: '1px solid #d4af37',
                borderRadius: 4,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
              }}>
                <QrCode size={28} color="#0b1f5b" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: '#080e3f',
            borderTop: '1.5px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 10px',
            flexShrink: 0,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #aac0f0', width: 56, marginBottom: 2 }} />
              <span style={{ color: '#aac0f0', fontSize: 6.5 }}>Student Sign</span>
            </div>
            {/* Seal */}
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#d4af37',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#0b1f5b', fontSize: 6, fontWeight: 900, lineHeight: 1.2 }}>KCI</span>
              <span style={{ color: '#0b1f5b', fontSize: 5.5, fontWeight: 700, lineHeight: 1.2 }}>SEAL</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #aac0f0', width: 56, marginBottom: 2 }} />
              <span style={{ color: '#aac0f0', fontSize: 6.5 }}>Principal Sign</span>
            </div>
          </div>
        </motion.div>

        {/* Download button */}
        <motion.button
          onClick={handleDownload}
          disabled={downloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-[#0b1f5b] to-[#1a3a8f] text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60"
        >
          {downloading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Download className="w-6 h-6" />
          }
          {downloading ? 'Generating PDF...' : 'Download ID Card PDF'}
        </motion.button>

        <p className="text-center text-xs text-gray-400 mt-4">
          * Official KCI student ID card — keep it safe.
        </p>
      </div>
    </div>
  );
}
