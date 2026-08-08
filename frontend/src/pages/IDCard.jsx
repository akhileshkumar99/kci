import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || '';

const CARD_W = 638; // ~54mm @ 300dpi
const CARD_H = 1016; // ~86mm @ 300dpi

function getPhotoUrl(photo) {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `${API_URL}${photo}`;
}

function fmt(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── ID Card Component (renders the actual card DOM) ──────────────
export function KCIIDCard({ student, settings = {}, forPrint = false }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const barcodeRef = useRef();
  const photoUrl = getPhotoUrl(student?.photo);

  const verifyUrl = `${window.location.origin}/verify-certificate?roll=${student?.rollNumber || ''}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { width: 120, margin: 1, color: { dark: '#0b1f5b', light: '#ffffff' } })
      .then(setQrDataUrl).catch(() => {});
  }, [verifyUrl]);

  // Draw simple barcode on canvas
  useEffect(() => {
    const canvas = barcodeRef.current;
    if (!canvas || !student?.rollNumber) return;
    const text = student.rollNumber;
    const ctx = canvas.getContext('2d');
    canvas.width = 280; canvas.height = 36;
    ctx.clearRect(0, 0, 280, 36);
    // Simple CODE128-style bars from char codes
    let x = 4;
    const barW = 2;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      for (let b = 7; b >= 0; b--) {
        ctx.fillStyle = (code >> b) & 1 ? '#0b1f5b' : 'transparent';
        if ((code >> b) & 1) ctx.fillRect(x, 0, barW, 36);
        x += barW;
      }
      x += 1;
    }
  }, [student?.rollNumber]);

  const scale = forPrint ? 1 : 0.52;

  const rows = [
    ['Roll No.', student?.rollNumber],
    ['Course', student?.courseName],
    ['Form No.', student?.formNo],
    ['Enroll No.', student?.enrollmentNumber],
    ['Name', student?.name],
    ["Father's Name", student?.fatherName],
    ['Date of Birth', fmt(student?.dob)],
    ['Mobile', student?.phone],
    ['Branch', student?.branchId?.branchName || student?.branchName],
    ['Branch Code', student?.branchId?.branchCode || student?.branchCode],
    ['Branch City', student?.branchId?.branchCity || student?.branchCity],
    ['Session', student?.batch],
    ['Admission Date', fmt(student?.admissionDate)],
    ['Validity', settings.validTo ? `${fmt(settings.validFrom)} – ${fmt(settings.validTo)}` : fmt(student?.admissionDate)],
    ['Status', student?.isApproved ? 'Active' : 'Pending'],
  ];

  return (
    <div
      style={{
        width: CARD_W, height: CARD_H,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        fontFamily: "'Arial', sans-serif",
        background: '#ffffff',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: forPrint ? 'none' : '0 20px 60px rgba(0,0,0,0.35)',
        border: forPrint ? 'none' : '2px solid #d4af37',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ position: 'relative', background: '#0b1f5b', height: 210, overflow: 'hidden' }}>
        {/* Diagonal white shape */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderStyle: 'solid',
          borderWidth: '0 260px 210px 0',
          borderColor: 'transparent #ffffff transparent transparent',
        }} />
        {/* Red divider line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 6, background: 'linear-gradient(90deg, #cc0000, #ff4444)',
        }} />

        {/* KCI Logo left */}
        <div style={{ position: 'absolute', top: 18, left: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            border: '3px solid #d4af37',
            overflow: 'hidden', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <img src="/logo.png" alt="KCI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ color: '#d4af37', fontSize: 11, fontWeight: 900, position: 'absolute', top: 10, left: 80 }}>TM</span>
        </div>

        {/* NIELIT logo right (white area) */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: '#0b1f5b', borderRadius: 6, padding: '4px 10px',
          border: '1.5px solid #d4af37',
        }}>
          <div style={{ color: '#d4af37', fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>NIELIT</div>
          <div style={{ color: '#aac0f0', fontSize: 7, textAlign: 'center' }}>Authorized</div>
        </div>

        {/* Center text */}
        <div style={{ position: 'absolute', top: 22, left: 110, right: 90 }}>
          <div style={{ color: '#ffffff', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
            An ISO 9001:2015 Certified Organization
          </div>
          <div style={{ color: '#d4af37', fontSize: 9, marginTop: 3 }}>
            ISO Reg. No.: {settings.isoRegNo || 'QMS/2024/KCI/001'}
          </div>
          <div style={{ color: '#aac0f0', fontSize: 9, marginTop: 1 }}>
            MHRD Reg. No.: {settings.mhrdRegNo || 'MHRD/2024/KCI/001'}
          </div>
          <div style={{ color: '#aac0f0', fontSize: 9, marginTop: 1 }}>
            Office: {settings.officePhone || '9936384736'}
          </div>
          <div style={{ color: '#aac0f0', fontSize: 9, marginTop: 1 }}>
            Mobile: {settings.mobilePhone || '9936384736'}
          </div>
        </div>

        {/* Institute name bottom of header */}
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, letterSpacing: 1.5, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
            KEERTI COMPUTER INSTITUTE
          </div>
          <div style={{ color: '#d4af37', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginTop: 2 }}>
            The College Of IT
          </div>
        </div>
      </div>

      {/* ── INSTITUTE META ── */}
      <div style={{ background: '#f0f4ff', borderBottom: '2px solid #0b1f5b', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 8.5, color: '#0b1f5b' }}>
          <span style={{ fontWeight: 700 }}>Web:</span> {settings.website || 'www.kci.org.in'}
        </div>
        <div style={{ fontSize: 8.5, color: '#0b1f5b' }}>
          <span style={{ fontWeight: 700 }}>Soc. Reg.:</span> {settings.societyReg || 'N/A'}
        </div>
      </div>

      {/* ── IDENTITY CARD BADGE ── */}
      <div style={{
        background: 'linear-gradient(90deg, #0b1f5b, #1a3a8f)',
        textAlign: 'center', padding: '8px 0',
        color: '#d4af37', fontSize: 14, fontWeight: 900, letterSpacing: 3,
      }}>
        STUDENT  IDENTITY  CARD
      </div>

      {/* ── PHOTO SECTION ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 8px', background: '#fff' }}>
        <div style={{
          width: 130, height: 160,
          border: '3px solid #0b1f5b',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#e8edf8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(11,31,91,0.2)',
        }}>
          {photoUrl ? (
            <img src={photoUrl} alt={student?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#7a8fc0' }}>
              <div style={{ fontSize: 40 }}>👤</div>
              <div style={{ fontSize: 10, marginTop: 4 }}>PHOTO</div>
            </div>
          )}
        </div>
      </div>

      {/* ── STUDENT INFO TABLE ── */}
      <div style={{ padding: '0 14px 8px', background: '#fff' }}>
        {rows.map(([label, val], i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'flex-start',
            borderBottom: i < rows.length - 1 ? '1px solid #e8edf8' : 'none',
            padding: '4px 0',
          }}>
            <span style={{
              minWidth: 110, fontSize: 9.5, fontWeight: 700,
              color: '#0b1f5b', flexShrink: 0,
            }}>{label}</span>
            <span style={{ fontSize: 9.5, color: '#333', marginLeft: 4, fontWeight: label === 'Name' || label === 'Roll No.' ? 700 : 400 }}>
              : {val || 'N/A'}
            </span>
          </div>
        ))}
      </div>

      {/* ── QR + BARCODE ROW ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 14px', background: '#f0f4ff', borderTop: '1.5px solid #d4af37',
      }}>
        {qrDataUrl && (
          <div style={{ textAlign: 'center' }}>
            <img src={qrDataUrl} alt="QR" style={{ width: 64, height: 64 }} />
            <div style={{ fontSize: 7, color: '#0b1f5b', marginTop: 2 }}>Scan to Verify</div>
          </div>
        )}
        <div style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
          <canvas ref={barcodeRef} style={{ maxWidth: '100%', height: 36 }} />
          <div style={{ fontSize: 7.5, color: '#0b1f5b', marginTop: 1, fontFamily: 'monospace' }}>
            {student?.rollNumber || ''}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#0b1f5b', border: '2px solid #d4af37',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#d4af37', fontSize: 9, fontWeight: 900 }}>KCI</span>
            <span style={{ color: '#aac0f0', fontSize: 7 }}>SEAL</span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: '#0b1f5b', padding: '8px 14px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1.5px solid #aac0f0', width: 100, marginBottom: 3 }} />
            <div style={{ color: '#aac0f0', fontSize: 8 }}>Student Signature</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#d4af37', fontSize: 8, fontWeight: 700, marginBottom: 2 }}>Managing Director</div>
            <div style={{ borderTop: '1.5px solid #d4af37', width: 110, marginBottom: 3 }} />
            <div style={{ color: '#aac0f0', fontSize: 8 }}>Authorized Signature</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: '#7a8fc0', fontSize: 7.5, borderTop: '1px solid #1a3a8f', paddingTop: 5 }}>
          {settings.headOffice || 'Head Office: Keerti Computer Institute, Ayodhya, U.P. | Ph: 9936384736'}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function IDCardPage() {
  const { user, refreshUser } = useAuth();
  const cardRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    refreshUser?.();
    api.get('/certificates/idcard-settings').then(r => setSettings(r.data.settings || {})).catch(() => {});
  }, []);

  const captureCard = useCallback(async () => {
    const el = cardRef.current;
    if (!el) return null;
    return html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
  }, []);

  const handleDownload = async () => {
    if (!user) return toast.error('Please login first');
    setDownloading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) throw new Error('Capture failed');
      const imgData = canvas.toDataURL('image/png');
      // Portrait PDF: 54mm × 86mm
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86] });
      doc.addImage(imgData, 'PNG', 0, 0, 54, 86);
      doc.save(`KCI_IDCard_${user.rollNumber || user.enrollmentNumber || 'student'}.pdf`);
      toast.success('ID Card PDF downloaded!');
    } catch { toast.error('Download failed'); }
    setDownloading(false);
  };

  const handlePrint = async () => {
    if (!user) return toast.error('Please login first');
    setPrinting(true);
    try {
      const canvas = await captureCard();
      if (!canvas) throw new Error('Capture failed');
      const imgData = canvas.toDataURL('image/png');
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>KCI ID Card</title>
        <style>
          @page { size: 54mm 86mm; margin: 0; }
          body { margin: 0; display: flex; align-items: center; justify-content: center; }
          img { width: 54mm; height: 86mm; display: block; }
        </style></head>
        <body><img src="${imgData}" /></body></html>
      `);
      win.document.close();
      win.onload = () => { win.print(); win.close(); };
    } catch { toast.error('Print failed'); }
    setPrinting(false);
  };

  if (!user) return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Please login to view your ID card</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Login</a>
      </div>
    </div>
  );

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
          <p className="text-blue-200">Your official KCI student identity card</p>
        </motion.div>
      </section>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Card preview wrapper — scales the 638×1016 card to fit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mb-8 flex justify-center"
          style={{ height: Math.round(CARD_H * 0.52), overflow: 'visible' }}
        >
          <div ref={cardRef} style={{ display: 'inline-block' }}>
            <KCIIDCard student={user} settings={settings} />
          </div>
        </motion.div>

        <div className="flex gap-3">
          <motion.button
            onClick={handleDownload} disabled={downloading || printing}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-r from-[#0b1f5b] to-[#1a3a8f] text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {downloading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
            {downloading ? 'Generating...' : 'Download PDF'}
          </motion.button>
          <motion.button
            onClick={handlePrint} disabled={downloading || printing}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {printing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Printer className="w-5 h-5" />}
            {printing ? 'Preparing...' : 'Print Card'}
          </motion.button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">* Official KCI student ID card — keep it safe.</p>
      </div>
    </div>
  );
}
