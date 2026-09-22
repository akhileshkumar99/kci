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

// Fixed internal coordinate system (1000px x 1625px)
const CARD_W = 1000;
const CARD_H = 1625;

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

// ── Official PVC ID Card Component (Fixed 1000px x 1625px Canvas) ──
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
      width: 300,
      margin: 1,
      color: { dark: '#0052CC', light: '#FFFFFF' },
    })
      .then(setQrUrl)
      .catch(() => { });
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
        borderRadius: 36,
        overflow: 'hidden',
        boxShadow: forPrint ? 'none' : '0 20px 60px rgba(0, 51, 153, 0.25)',
        border: forPrint ? 'none' : '3px solid #0052CC',
        position: 'relative',
        flexShrink: 0,
        boxSizing: 'border-box',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
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
          width: 1000,
          height: 1625,
          objectFit: 'fill',
          zIndex: 0,
        }}
      />

      {/* ── 2. DYNAMIC WEBSITE LOGO OVERLAY (IF CUSTOM LOGO SET IN ADMIN) ── */}
      {logoUrl && (
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 26,
            width: 165,
            height: 165,
            borderRadius: '50%',
            background: '#FFFFFF',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            padding: 6,
          }}
        >
          <img src={logoUrl} alt="Website Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}

      {/* ── 3. DYNAMIC VALIDITY YEARS OVERLAY (ALIGNED AFTER "Valid From- ") ── */}
      <div
        style={{
          position: 'absolute',
          top: 652,
          left: 218,
          width: 150,
          height: 30,
          background: '#FFFFFF',
          zIndex: 4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 652,
          left: 220,
          color: '#0052CC',
          fontSize: 24,
          fontWeight: 900,
          zIndex: 5,
          fontFamily: "'Arial', 'Helvetica', sans-serif",
          letterSpacing: 0.5,
        }}
      >
        {validFromYear} to {validToYear}
      </div>

      {/* ── 4. EXACTLY ONE STUDENT PHOTO CONTAINER (EXACT FRAME ALIGNMENT & NO CROP BUG) ── */}
      <div
        style={{
          position: 'absolute',
          top: 671,
          left: 372,
          width: 258,
          height: 310,
          borderRadius: 4,
          overflow: 'hidden',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          boxSizing: 'border-box',
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={student?.name || 'Student Photo'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = `
                  <div style="text-align: center; color: #64748B; padding: 10px;">
                    <svg viewBox="0 0 100 120" style="width: 130px; height: 150px; margin: 0 auto; fill: #94A3B8;">
                      <path d="M 50 15 A 25 25 0 1 0 50 65 A 25 25 0 1 0 50 15 Z M 15 105 C 15 80 30 75 50 75 C 70 75 85 80 85 105 Z" />
                    </svg>
                    <div style="font-size: 19px; font-weight: 900; color: #475569; margin-top: 4px;">PHOTO HERE</div>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#64748B', padding: 10 }}>
            <svg viewBox="0 0 100 120" style={{ width: 130, height: 150, margin: '0 auto', fill: '#94A3B8' }}>
              <path d="M 50 15 A 25 25 0 1 0 50 65 A 25 25 0 1 0 50 15 Z M 15 105 C 15 80 30 75 50 75 C 70 75 85 80 85 105 Z" />
            </svg>
            <div style={{ fontSize: 19, fontWeight: 900, color: '#475569', marginTop: 4 }}>PHOTO HERE</div>
          </div>
        )}
      </div>

      {/* ── 5. DYNAMIC FIELD VALUES (PERFECTLY ALIGNED AFTER LABELS & NO OVERLAPPING) ── */}

      {/* Course - (Starts right after "Course - ") */}
      <div
        style={{
          position: 'absolute',
          top: 1053,
          left: 455,
          right: 40,
          color: '#D32F2F',
          fontSize: 27,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
          fontFamily: "'Arial', 'Helvetica', sans-serif",
        }}
      >
        {courseVal}
      </div>

      {/* Form No.- (Starts right after "Form No.- ") */}
      <div
        style={{
          position: 'absolute',
          top: 1107,
          left: 492,
          right: 40,
          color: '#0052CC',
          fontSize: 27,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
          fontFamily: "'Arial', 'Helvetica', sans-serif",
        }}
      >
        {formNoVal}
      </div>

      {/* Father’s Name- (Starts right after "Father’s Name- ") */}
      <div
        style={{
          position: 'absolute',
          top: 1161,
          left: 508,
          right: 40,
          color: '#0052CC',
          fontSize: 27,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
          fontFamily: "'Arial', 'Helvetica', sans-serif",
        }}
      >
        {fatherVal}
      </div>

      {/* DOB- (Clean white cover over template's "__/__/___" + formatted date overlay) */}
      <div
        style={{
          position: 'absolute',
          top: 1215,
          left: 418,
          width: 230,
          height: 36,
          background: '#FFFFFF',
          zIndex: 4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 1216,
          left: 422,
          right: 40,
          color: '#0052CC',
          fontSize: 27,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
          fontFamily: "'Arial', 'Helvetica', sans-serif",
          letterSpacing: 0.5,
        }}
      >
        {dobVal}
      </div>

      {/* Mobile- (Starts right after "Mobile- ") */}
      <div
        style={{
          position: 'absolute',
          top: 1270,
          left: 431,
          right: 40,
          color: '#0052CC',
          fontSize: 27,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
          fontFamily: "'Arial', 'Helvetica', sans-serif",
        }}
      >
        {mobileVal}
      </div>

      {/* Branch - (Starts right after "Branch - " & bounded to avoid QR overlap) */}
      <div
        style={{
          position: 'absolute',
          top: 1322,
          left: 455,
          right: 200,
          color: '#0052CC',
          fontSize: 27,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 5,
          fontFamily: "'Arial', 'Helvetica', sans-serif",
        }}
      >
        {branchVal}
      </div>

      {/* ── 6. DYNAMIC QR VERIFICATION CODE (BOTTOM RIGHT) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 122,
            height: 122,
            border: '3px solid #FFCC00',
            borderRadius: 12,
            background: '#FFFFFF',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {qrUrl ? (
            <img src={qrUrl} alt="QR Verification" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: 13, color: '#0052CC', fontWeight: 'bold' }}>QR Code</div>
          )}
        </div>
        <span style={{ color: '#0052CC', fontSize: 13, fontWeight: 900, letterSpacing: 0.5, fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
          🔒 SCAN TO VERIFY
        </span>
      </div>
    </div>
  );
}

// ── Responsive Scaled Card Wrapper (Proportional Canvas Scaling) ──
export function KCIIDCardWrapper({ student, settings = {}, className = '' }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parentW = containerRef.current.clientWidth || 360;
      const targetW = Math.min(parentW - 16, 500);
      setScale(targetW / 1000);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-center overflow-hidden ${className}`}
      style={{
        height: Math.round(1625 * scale) + 10,
        minHeight: 300,
      }}
    >
      <div
        style={{
          width: 1000,
          height: 1625,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          flexShrink: 0,
        }}
      >
        <KCIIDCard student={student} settings={settings} />
      </div>
    </div>
  );
}

// ── Standalone Page Component ──────────────────────────────────────────
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
      width: 1000,
      height: 1625,
    });
  }, []);

  const handleDownload = async () => {
    if (!user) return toast.error('Please login first');
    setDownloading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) throw new Error('Capture failed');
      const imgData = canvas.toDataURL('image/png', 1.0);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86.5] });
      doc.addImage(imgData, 'PNG', 0, 0, 54, 86.5);
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
              @page { size: 54mm 86.5mm; margin: 0; }
              html, body { margin: 0; padding: 0; width: 54mm; height: 86.5mm; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              img { width: 54mm; height: 86.5mm; display: block; object-fit: fill; }
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
        <div className="w-full flex justify-center items-center overflow-hidden my-4" style={{ maxWidth: 520 }}>
          <KCIIDCardWrapper student={user} settings={settings} />
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
