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
  if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
  return `${API_URL}${photo.startsWith('/') ? photo : `/${photo}`}`;
}

function fmt(date) {
  if (!date) return '__/ __/ ____';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Official PVC ID Card Component (using exact image background template + dynamic overlays) ──
export function KCIIDCard({ student, settings = {}, forPrint = false }) {
  const [qrUrl, setQrUrl] = useState('');
  const photoUrl = getPhotoUrl(student?.photo);

  const websiteLogo = settings?.logo || settings?.websiteLogo || null;
  const logoUrl = websiteLogo ? getPhotoUrl(websiteLogo) : null;

  // Dynamic Verification QR URL
  useEffect(() => {
    const rollOrEnroll = student?.rollNumber || student?.enrollmentNumber || student?.formNo || '';
    const verifyUrl = `${window.location.origin}/verify-certificate?roll=${encodeURIComponent(rollOrEnroll)}`;

    QRCode.toDataURL(verifyUrl, {
      width: 250,
      margin: 1,
      color: { dark: '#0052CC', light: '#FFFFFF' },
    })
      .then(setQrUrl)
      .catch(() => {});
  }, [student]);

  // Validity dates
  const currentYear = new Date().getFullYear();
  const validFromYear = settings?.validFrom || student?.batch?.split('-')[0] || currentYear;
  const validToYear = settings?.validTo || (parseInt(validFromYear, 10) + 1) || (currentYear + 1);

  const courseVal = student?.courseName || student?.course?.title || student?.course || '—';
  const formNoVal = student?.formNo || student?.enrollmentNumber || student?.rollNumber || '—';
  const fatherVal = student?.fatherName || '—';
  const dobVal = fmt(student?.dob);
  const mobileVal = student?.phone || student?.mobile || '—';
  const branchVal = student?.branchId?.branchName || student?.branchName || 'Main Campus';

  return (
    <div
      className="pvc-idcard-exact-template-container"
      style={{
        width: CARD_W,
        height: CARD_H,
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        background: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: forPrint ? 'none' : '0 16px 48px rgba(0, 51, 153, 0.25)',
        border: forPrint ? 'none' : '2px solid #0052CC',
        position: 'relative',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* ── 1. EXACT TEMPLATE BACKGROUND IMAGE ── */}
      <img
        src="/idcard_bg.jpg"
        alt="KCI ID Card Template"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          zIndex: 0,
        }}
      />

      {/* ── 2. DYNAMIC WEBSITE LOGO OVERLAY (IF CUSTOM LOGO SET IN ADMIN) ── */}
      {logoUrl && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: '#FFFFFF',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            padding: 4,
          }}
        >
          <img src={logoUrl} alt="Website Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}

      {/* ── 3. DYNAMIC VALIDITY YEARS OVERLAY ── */}
      <div
        style={{
          position: 'absolute',
          top: 412,
          left: 124,
          width: 110,
          height: 16,
          background: '#FFFFFF',
          zIndex: 4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 411,
          left: 126,
          color: '#0052CC',
          fontSize: 14.5,
          fontWeight: 900,
          zIndex: 5,
        }}
      >
        {validFromYear} to {validToYear}
      </div>

      {/* ── 4. DYNAMIC STUDENT PHOTO ── */}
      <div
        style={{
          position: 'absolute',
          top: 425,
          left: 236,
          width: 165,
          height: 200,
          borderRadius: 4,
          overflow: 'hidden',
          background: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={student?.name || 'Student Photo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#64748B' }}>
            <svg viewBox="0 0 100 120" style={{ width: 85, height: 105, margin: '0 auto', fill: '#94A3B8' }}>
              <path d="M 50 15 A 25 25 0 1 0 50 65 A 25 25 0 1 0 50 15 Z M 15 105 C 15 80 30 75 50 75 C 70 75 85 80 85 105 Z" />
            </svg>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#475569', marginTop: 2 }}>PHOTO HERE</div>
          </div>
        )}
      </div>

      {/* ── 5. DYNAMIC STUDENT DETAILS OVERLAY (ON TOP OF UNDERLINES) ── */}
      {/* Course */}
      <div
        style={{
          position: 'absolute',
          top: 666,
          left: 300,
          right: 35,
          color: '#D32F2F',
          fontSize: 17,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
        }}
      >
        {courseVal}
      </div>

      {/* Form No. */}
      <div
        style={{
          position: 'absolute',
          top: 700,
          left: 320,
          right: 35,
          color: '#0052CC',
          fontSize: 17,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
        }}
      >
        {formNoVal}
      </div>

      {/* Father's Name */}
      <div
        style={{
          position: 'absolute',
          top: 734,
          left: 283,
          right: 35,
          color: '#0052CC',
          fontSize: 17,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
        }}
      >
        {fatherVal}
      </div>

      {/* DOB cover & text */}
      <div
        style={{
          position: 'absolute',
          top: 775,
          left: 270,
          width: 152,
          height: 18,
          background: '#FFFFFF',
          zIndex: 4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 770,
          left: 274,
          right: 35,
          color: '#0052CC',
          fontSize: 17,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
        }}
      >
        {dobVal}
      </div>

      {/* Mobile */}
      <div
        style={{
          position: 'absolute',
          top: 802,
          left: 275,
          right: 35,
          color: '#0052CC',
          fontSize: 17,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
        }}
      >
        {mobileVal}
      </div>

      {/* Branch */}
      <div
        style={{
          position: 'absolute',
          top: 835,
          left: 270,
          right: 35,
          color: '#0052CC',
          fontSize: 17,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
        }}
      >
        {branchVal}
      </div>

      {/* ── 6. DYNAMIC QR VERIFICATION CODE (BOTTOM RIGHT) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 45,
          right: 25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            border: '2px solid #FFCC00',
            borderRadius: 8,
            background: '#FFFFFF',
            padding: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          }}
        >
          {qrUrl ? (
            <img src={qrUrl} alt="QR Verification" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: 9, color: '#0052CC', fontWeight: 'bold' }}>QR Code</div>
          )}
        </div>
        <span style={{ color: '#0052CC', fontSize: 8.5, fontWeight: 900, letterSpacing: 0.5 }}>
          🔒 SCAN TO VERIFY
        </span>
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────
export default function IDCardPage() {
  const { user, refreshUser } = useAuth();
  const printCardRef = useRef();
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    refreshUser?.();
    api
      .get('/certificates/idcard-settings')
      .then((r) => setSettings(r.data.settings || {}))
      .catch(() => { });
  }, []);

  const captureCard = useCallback(async () => {
    const el = printCardRef.current;
    if (!el) return null;

    // Ensure all images inside el are loaded before capturing
    const imgs = Array.from(el.querySelectorAll('img'));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = resolve;
            img.onerror = resolve;
          })
      )
    );

    return html2canvas(el, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: 638,
      height: 1016,
    });
  }, []);

  const handleDownload = async () => {
    if (!user) return toast.error('Please login first');
    setDownloading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) throw new Error('Capture failed');
      const imgData = canvas.toDataURL('image/png', 1.0);
      // Portrait PVC PDF: 54mm × 86mm
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86] });
      doc.addImage(imgData, 'PNG', 0, 0, 54, 86);
      doc.save(`KCI_IDCard_${(user.rollNumber || user.enrollmentNumber || 'student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      toast.success('ID Card downloaded in high resolution PDF format!');
    } catch (err) {
      console.error('ID Card download error:', err);
      toast.error('Download failed. Please try again.');
    }
    setDownloading(false);
  };

  const handlePrint = async () => {
    if (!user) return toast.error('Please login first');
    setPrinting(true);
    try {
      const canvas = await captureCard();
      if (!canvas) throw new Error('Capture failed');
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Print via hidden iframe (bypasses popup blockers on all browsers)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>KCI Student ID Card</title>
            <style>
              @page { size: 54mm 86mm; margin: 0; }
              html, body { margin: 0; padding: 0; width: 54mm; height: 86mm; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              img { width: 54mm; height: 86mm; display: block; object-fit: fill; }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 2000);
      }, 300);
    } catch (err) {
      console.error('ID Card print error:', err);
      toast.error('Print failed. Please try again.');
    }
    setPrinting(false);
  };

  if (!user)
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please login to view your ID card</p>
          <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">
            Login
          </a>
        </div>
      </div>
    );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Off-screen unscaled 1:1 card for PDF and Print capture */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -9999, pointerEvents: 'none' }}>
        <div ref={printCardRef}>
          <KCIIDCard student={user} settings={settings} forPrint={true} />
        </div>
      </div>

      <section className="relative bg-gradient-to-br from-[#003399] to-[#0052CC] py-10 text-white text-center overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">
            Student <span className="text-yellow-400">ID Card</span>
          </h1>
          <p className="text-blue-100 font-medium">Official Digital PVC Student Identity Card</p>
        </motion.div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Card preview wrapper — scaled to fit screen perfectly */}
        <div className="w-full flex justify-center items-center overflow-hidden my-4" style={{ minHeight: 650 }}>
          <div style={{ transform: 'scale(0.62)', transformOrigin: 'top center', width: 638, height: 1016, marginBottom: -380 }}>
            <KCIIDCard student={user} settings={settings} />
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={handleDownload}
            disabled={downloading || printing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-r from-[#003399] to-[#0052CC] text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {downloading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </motion.button>
          <motion.button
            onClick={handlePrint}
            disabled={downloading || printing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {printing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Printer className="w-5 h-5" />}
            {printing ? 'Preparing...' : 'Print Card'}
          </motion.button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">* Official Computer Institute Digital PVC ID Card.</p>
      </div>
    </div>
  );
}
