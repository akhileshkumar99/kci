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
  if (!date) return '__ / __ / ____';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Pure Vector / HTML CSS PVC ID Card Component (No Background Image) ──
export function KCIIDCard({ student, settings = {}, forPrint = false }) {
  const [qrUrl, setQrUrl] = useState('');
  const photoUrl = getPhotoUrl(student?.photo);

  const websiteLogo = settings?.logo || settings?.websiteLogo || null;
  const logoUrl = websiteLogo ? getPhotoUrl(websiteLogo) : '/logo.png';

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
  const branchVal = student?.branchId?.branchName || student?.branchName || 'Ambedkarnagar';

  return (
    <div
      className="pvc-idcard-pure-digital-container"
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
      {/* ── 1. VECTOR SVG BACKGROUND SHAPES (ENLARGED TOP BLUE HEADER BEHIND LOGO) ── */}
      <svg
        viewBox="0 0 1000 1625"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1000,
          height: 1625,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="blueHeaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052CC" />
            <stop offset="100%" stopColor="#003399" />
          </linearGradient>
        </defs>
        {/* White Base Card */}
        <rect width="1000" height="1625" fill="#FFFFFF" />

        {/* Top Diagonal Blue Header (Encloses top-left logo completely) */}
        <polygon points="0,0 950,0 0,430" fill="url(#blueHeaderGrad)" />

        {/* Top Red Diagonal Accent Stripe */}
        <polygon points="0,430 950,0 968,0 0,448" fill="#D32F2F" />

        {/* Bottom Right Blue Corner Polygon */}
        <polygon points="1000,1625 1000,1228 538,1625" fill="url(#blueHeaderGrad)" />

        {/* Bottom Right Red Accent Stripe */}
        <polygon points="1000,1210 520,1625 538,1625 1000,1228" fill="#D32F2F" />
      </svg>

      {/* ── 2. TOP LEFT OFFICIAL KCI SEAL LOGO (NO YELLOW OUTLINE) ── */}
      <div style={{ position: 'absolute', top: 25, left: 35, width: 280, height: 280, zIndex: 5 }}>
      <div style={{ position: 'absolute', top: 25, left: 35, width: 330, height: 280, zIndex: 5 }}>
        <div
          style={{
            position: 'relative',
            width: 270,
            height: 270,
            borderRadius: '50%',
            overflow: 'hidden',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={logoUrl}
            alt="KCI Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%',
            }}
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
        </div>
        {/* TM Superscript */}
        {/* TM Superscript with clear space from circular logo */}
        <span
          style={{
            position: 'absolute',
            top: 20,
            right: 0,
            left: 285,
            color: '#FFCC00',
            fontSize: 26,
            fontWeight: 900,
            fontFamily: 'Arial, sans-serif',
            zIndex: 6,
          }}
        >
          TM
        </span>
      </div>

      {/* ── 3. TOP RIGHT OFFICIAL NIELIT LOGO IMAGE (ENLARGED & SHIFTED DOWN) ── */}
      <div
        style={{
          position: 'absolute',
          top: 85,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          zIndex: 5,
        }}
      >
        <img
          src="/nielit.png"
          alt="NIELIT Logo"
          style={{
            height: 98,
            maxWidth: 340,
            objectFit: 'contain',
            marginBottom: 6,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div style={{ color: '#000000', fontSize: 24, fontWeight: 900, fontFamily: 'Arial, sans-serif', lineHeight: '1.3' }}>
          Office-6716159476
        </div>
        <div style={{ color: '#000000', fontSize: 24, fontWeight: 900, fontFamily: 'Arial, sans-serif', lineHeight: '1.3' }}>
          Mobile-9936384736
        </div>
      </div>

      {/* ── 4. CENTER HEADER CERTIFICATION & INSTITUTION TEXT (SINGLE LINE REGISTRATION NUMBERS) ── */}
      <div
        style={{
          position: 'absolute',
          top: 325,
          left: 0,
          width: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 5,
        }}
      >
        <div style={{ color: '#000000', fontSize: 30, fontWeight: 900, fontFamily: "'Times New Roman', serif", marginBottom: 4 }}>
          An ISO 9001:2015 Certified Organization
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            color: '#000000',
            fontSize: 20,
            fontWeight: 900,
            fontFamily: 'Arial, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>ISO. Reg. No.- VKCI26052306978</span>
          <span style={{ whiteSpace: 'nowrap' }}>MSME Reg. No.- 198952612-COL</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 405,
          left: 0,
          width: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 5,
        }}
      >
        {/* KEERTI COMPUTER INSTITUTE Main Heading */}
        <div style={{ fontSize: 48, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 1, marginBottom: 4 }}>
          <span style={{ color: '#D32F2F' }}>KEERTI </span>
          <span style={{ color: '#0052CC' }}>COMPUTER </span>
          <span style={{ color: '#D32F2F' }}>INSTITUTE</span>
        </div>

        {/* Sub-header Website & Soc Reg Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 23, fontWeight: 900, fontFamily: 'Arial, sans-serif' }}>
          <span style={{ color: '#0052CC' }}>Website-www.kci.org.in</span>
          <span style={{ color: '#000000' }}>Soc. Reg. No.- 781</span>
          <span style={{ color: '#D32F2F' }}>The College of IT</span>
        </div>
      </div>

      {/* ── 5. VALIDITY PERIOD SECTION (TWO-LINE STACKED TO ELIMINATE PHOTO OVERLAP) ── */}
      <div
        style={{
          position: 'absolute',
          top: 545,
          left: 45,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          color: '#0052CC',
          fontSize: 24,
          fontWeight: 900,
          fontFamily: 'Arial, sans-serif',
          zIndex: 5,
        }}
      >
        <span>Valid From-</span>
        <span style={{ color: '#0052CC', letterSpacing: '0.5px' }}>{validFromYear} to {validToYear}</span>
      </div>

      {/* ── 6. EXACTLY ONE STUDENT PHOTO FRAME (SHIFTED DOWN TO TOP 535) ── */}
      <div
        style={{
          position: 'absolute',
          top: 535,
          left: 370,
          width: 260,
          height: 320,
          borderRadius: 4,
          border: '3px solid #333333',
          background: '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          boxSizing: 'border-box',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
                    <svg viewBox="0 0 100 120" style="width: 140px; height: 160px; margin: 0 auto; fill: #94A3B8;">
                      <path d="M 50 15 A 25 25 0 1 0 50 65 A 25 25 0 1 0 50 15 Z M 15 105 C 15 80 30 75 50 75 C 70 75 85 80 85 105 Z" />
                    </svg>
                    <div style="font-size: 20px; font-weight: 900; color: #475569; margin-top: 4px;">PHOTO HERE</div>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#64748B', padding: 10 }}>
            <svg viewBox="0 0 100 120" style={{ width: 140, height: 160, margin: '0 auto', fill: '#94A3B8' }}>
              <path d="M 50 15 A 25 25 0 1 0 50 65 A 25 25 0 1 0 50 15 Z M 15 105 C 15 80 30 75 50 75 C 70 75 85 80 85 105 Z" />
            </svg>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#475569', marginTop: 4 }}>PHOTO HERE</div>
          </div>
        )}
      </div>

      {/* ── 7. HORIZONTAL RED SEPARATOR LINE BELOW PHOTO ── */}
      <div
        style={{
          position: 'absolute',
          top: 885,
          left: 260,
          width: 480,
          height: 4,
          background: '#D32F2F',
          borderRadius: 2,
          zIndex: 5,
        }}
      />

      {/* ── 8. DYNAMIC FIELD VALUES (AUTO-FITTING FONT SIZES TO PREVENT TEXT CLIPPING) ── */}
      <div
        style={{
          position: 'absolute',
          top: 910,
          left: 170,
          width: 660,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          zIndex: 5,
        }}
      >
        {/* Course */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, width: '100%' }}>
          <span style={{ color: '#D32F2F', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
            Course -
          </span>
          <div style={{ flex: 1, borderBottom: '3px solid #D32F2F', paddingBottom: 2, overflow: 'hidden' }}>
            <span
              style={{
                color: '#D32F2F',
                fontSize: courseVal.length > 32 ? 22 : courseVal.length > 24 ? 25 : 30,
                fontWeight: 900,
                whiteSpace: 'nowrap',
                display: 'block',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: courseVal.length > 30 ? '-0.5px' : 'normal',
              }}
            >
              {courseVal}
            </span>
          </div>
        </div>

        {/* Form No. */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, width: '100%' }}>
          <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
            Form No.-
          </span>
          <div style={{ flex: 1, borderBottom: '3px solid #0052CC', paddingBottom: 2, overflow: 'hidden' }}>
            <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontFamily: 'Arial, sans-serif' }}>
              {formNoVal}
            </span>
          </div>
        </div>

        {/* Father’s Name */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, width: '100%' }}>
          <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
            Father’s Name-
          </span>
          <div style={{ flex: 1, borderBottom: '3px solid #0052CC', paddingBottom: 2, overflow: 'hidden' }}>
            <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontFamily: 'Arial, sans-serif' }}>
              {fatherVal}
            </span>
          </div>
        </div>

        {/* DOB */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, width: '100%' }}>
          <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
            DOB-
          </span>
          <div style={{ flex: 1, borderBottom: '3px solid #0052CC', paddingBottom: 2, overflow: 'hidden' }}>
            <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
              {dobVal}
            </span>
          </div>
        </div>

        {/* Mobile */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, width: '100%' }}>
          <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
            Mobile-
          </span>
          <div style={{ flex: 1, borderBottom: '3px solid #0052CC', paddingBottom: 2, overflow: 'hidden' }}>
            <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontFamily: 'Arial, sans-serif' }}>
              {mobileVal}
            </span>
          </div>
        </div>

        {/* Branch */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, width: '100%' }}>
          <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
            Branch -
          </span>
          <div style={{ flex: 1, borderBottom: '3px solid #0052CC', paddingBottom: 2, overflow: 'hidden' }}>
            <span style={{ color: '#0052CC', fontSize: 30, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', fontFamily: 'Arial, sans-serif' }}>
              {branchVal}
            </span>
          </div>
        </div>
      </div>

      {/* ── 9. BOTTOM LEFT MANAGING DIRECTOR SIGNATURE & ADDRESS (SHIFTED TO BOTTOM 35) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 35,
          left: 45,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: 5,
        }}
      >
        {/* Red Vector Signature */}
        <svg viewBox="0 0 300 110" style={{ width: 290, height: 100, marginBottom: 2 }}>
          <path
            d="M 20 80 C 40 15 60 10 75 55 C 85 85 95 25 110 45 C 125 65 135 20 150 70 C 165 105 145 85 190 70 C 230 55 270 65 290 60"
            fill="none"
            stroke="#D32F2F"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 50 90 C 90 85 170 80 250 80"
            fill="none"
            stroke="#D32F2F"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        <div style={{ color: '#D32F2F', fontSize: 34, fontWeight: 900, fontFamily: "'Times New Roman', serif", marginBottom: 6 }}>
          Managing Director
        </div>
        <div style={{ color: '#000000', fontSize: 19, fontWeight: 900, fontFamily: 'Arial, sans-serif' }}>
          H.O.- Sahjanand Road, Shringar Hat, Ayodhya- Faizabad, U.P.- 224001
        </div>
      </div>

      {/* ── 10. DYNAMIC QR VERIFICATION CODE (BOTTOM RIGHT) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 45,
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
            width: 135,
            height: 135,
            border: '3px solid #FFCC00',
            borderRadius: 14,
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
        <span style={{ color: '#FFCC00', fontSize: 13, fontWeight: 900, letterSpacing: 0.5, fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
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

  const scaledH = Math.round(1625 * scale);

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-center overflow-hidden ${className}`}
      className={`w-full flex justify-center items-start overflow-hidden ${className}`}
      style={{
        height: Math.round(1625 * scale) + 10,
        minHeight: 300,
        height: scaledH > 0 ? scaledH : 'auto',
      }}
    >
      <div
        style={{
          width: 1000,
          height: 1625,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: -(1625 - scaledH),
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
        <div className="w-full flex justify-center items-start overflow-hidden my-4" style={{ maxWidth: 520 }}>
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
