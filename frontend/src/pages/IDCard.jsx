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

// ── Managing Director Red Cursive Signature SVG Component ──────────
function MDSignatureSVG({ signatureUrl, style = {} }) {
  if (signatureUrl) {
    return <img src={getPhotoUrl(signatureUrl)} alt="Managing Director Signature" style={{ height: 48, objectFit: 'contain', ...style }} />;
  }
  // Vector SVG rendering of the red cursive MD signature from original design
  return (
    <svg viewBox="0 0 160 55" style={{ height: 48, width: 140, ...style }}>
      <path
        d="M 10 40 Q 20 10 35 35 T 50 15 Q 60 45 75 25 T 95 38 Q 110 5 125 35 T 150 20 M 25 45 C 50 50 100 48 145 42"
        fill="none"
        stroke="#D32F2F"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Official Digital PVC ID Card Component ──────────────────────────
export function KCIIDCard({ student, settings = {}, forPrint = false }) {
  const photoUrl = getPhotoUrl(student?.photo);

  const websiteLogo = settings?.logo || settings?.websiteLogo || '/logo.png';
  const logoUrl = getPhotoUrl(websiteLogo);

  const instituteName = settings?.instituteName || 'KEERTI COMPUTER INSTITUTE';
  const tagline = settings?.tagline || 'The College of IT';
  const isoRegNo = settings?.isoRegNo || 'VKCI26052306978';
  const msmeRegNo = settings?.msmeRegNo || '198952612-COL';
  const societyRegNo = settings?.societyReg || settings?.societyRegNo || '781';
  const website = settings?.website || 'www.kci.org.in';
  const officePhone = settings?.officePhone || '6716159476';
  const mobilePhone = settings?.mobilePhone || '9936384736';
  const headOffice = settings?.headOffice || settings?.address || 'H.O.- Sahjanand Road, Shringar Hat, Ayodhya- Faizabad, U.P.- 224001';

  // Validity formatting
  const currentYear = new Date().getFullYear();
  const validFromYear = settings?.validFrom || student?.batch?.split('-')[0] || currentYear;
  const validToYear = settings?.validTo || (parseInt(validFromYear, 10) + 1) || (currentYear + 1);
  const courseVal = student?.courseName || student?.course?.title || student?.course || '';
  const formNoVal = student?.formNo || student?.enrollmentNumber || student?.rollNumber || '';
  const fatherVal = student?.fatherName || '';
  const dobVal = fmt(student?.dob);
  const mobileVal = student?.phone || student?.mobile || '';
  const branchVal = student?.branchId?.branchName || student?.branchName || 'Main Campus';

  return (
    <div
      className="pvc-idcard-digital-container"
      style={{
        width: CARD_W,
        height: CARD_H,
        fontFamily: "'Inter', 'Arial', sans-serif",
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
      {/* ── 1. DIAGONAL BLUE TOP HEADER & RED ACCENT STRIPE ── */}
      <div style={{ position: 'relative', width: CARD_W, height: 260, overflow: 'hidden' }}>
        {/* Background Canvas: White with Blue Slanted Swoop */}
        <svg viewBox="0 0 638 260" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {/* Blue Swoop */}
          <path d="M 0 0 L 638 0 L 638 90 L 0 240 Z" fill="url(#blueGradient)" />
          {/* Red Accent Stripe */}
          <path d="M 0 240 L 638 90 L 638 102 L 0 252 Z" fill="#D32F2F" />

          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052CC" />
              <stop offset="100%" stopColor="#003399" />
            </linearGradient>
          </defs>
        </svg>

        {/* Top Left: Official Website Logo Badge (ZOOMED IN) */}
        <div style={{ position: 'absolute', top: 12, left: 16, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10 }}>
          <div
            style={{
              width: 106,
              height: 106,
              borderRadius: '50%',
              border: '4px solid #FFCC00',
              background: '#FFFFFF',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              padding: 4,
            }}
          >
            <img src={logoUrl} alt="Website Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ color: '#FFCC00', fontSize: 14, fontWeight: 900, marginTop: -45, marginLeft: 2 }}>TM</span>
        </div>

        {/* Top Right: NIELIT Authorization Badge & Contact Phones */}
        <div style={{ position: 'absolute', top: 12, right: 18, zIndex: 10, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 4 }}>
            {/* NIELIT Icon Badge */}
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0052CC', fontWeight: 'bold', fontSize: 13, border: '1.5px solid #FFCC00' }}>
              🌐
            </div>
            <span style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 950, letterSpacing: 1 }}>NIELIT</span>
          </div>
          <div style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 900, lineHeight: 1.3 }}>
            Office-{officePhone}
          </div>
          <div style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 900, lineHeight: 1.3 }}>
            Mobile-{mobilePhone}
          </div>
        </div>
      </div>

      {/* ── 2. INSTITUTE DETAILS HEADER TEXT ── */}
      <div style={{ marginTop: -15, textAlign: 'center', padding: '0 20px', zIndex: 5, position: 'relative' }}>
        {/* ISO Line */}
        <div style={{ color: '#0F172A', fontSize: 15, fontWeight: 900, letterSpacing: 0.3 }}>
          An ISO 9001:2015 Certified Organization
        </div>

        {/* ISO Reg + MSME Line */}
        <div style={{ color: '#334155', fontSize: 12, fontWeight: 800, marginTop: 2 }}>
          ISO. Reg. No.- <span style={{ fontWeight: 900 }}>{isoRegNo}</span> &nbsp;&nbsp;&nbsp; MSME Reg. No.- <span style={{ fontWeight: 900 }}>{msmeRegNo}</span>
        </div>

        {/* Large Institute Name */}
        <div style={{ fontSize: 29, fontWeight: 950, letterSpacing: 0.8, marginTop: 4, lineHeight: 1.15 }}>
          <span style={{ color: '#D32F2F' }}>KEERTI </span>
          <span style={{ color: '#0052CC' }}>COMPUTER </span>
          <span style={{ color: '#D32F2F' }}>INSTITUTE</span>
        </div>

        {/* Website + Soc Reg + Tagline */}
        <div style={{ color: '#1E293B', fontSize: 12.5, fontWeight: 800, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span>Website-{website}</span>
          <span>Soc. Reg. No.- {societyRegNo}</span>
          <span style={{ color: '#D32F2F', fontWeight: 950 }}>{tagline}</span>
        </div>

        {/* Valid From Line */}
        <div style={{ textAlign: 'left', color: '#0052CC', fontSize: 15, fontWeight: 900, marginTop: 8, paddingLeft: 10 }}>
          Valid From- {validFromYear} to {validToYear}
        </div>
      </div>

      {/* ── 3. CENTRAL STUDENT PHOTO SECTION ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 175,
            height: 215,
            border: '3px solid #475569',
            background: '#F1F5F9',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            position: 'relative',
          }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt={student?.name || 'Student Photo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#64748B' }}>
              {/* Silhouette SVG */}
              <svg viewBox="0 0 100 120" style={{ width: 90, height: 110, margin: '0 auto', fill: '#94A3B8' }}>
                <path d="M 50 15 A 25 25 0 1 0 50 65 A 25 25 0 1 0 50 15 Z M 15 105 C 15 80 30 75 50 75 C 70 75 85 80 85 105 Z" />
              </svg>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#475569', marginTop: 4 }}>PHOTO HERE</div>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. RED DIVIDER STRIPE ABOVE STUDENT DETAILS ── */}
      <div style={{ width: '68%', margin: '0 auto 14px', height: 3.5, background: '#D32F2F', borderRadius: 2 }} />

      {/* ── 5. DYNAMIC STUDENT DETAILS LIST WITH UNDERLINES ── */}
      <div style={{ padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Course */}
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, fontWeight: 900 }}>
          <span style={{ color: '#D32F2F', width: 140, flexShrink: 0 }}>Course -</span>
          <span style={{ flex: 1, borderBottom: '2.5px solid #D32F2F', color: '#D32F2F', paddingBottom: 2, paddingLeft: 6, minHeight: 24 }}>
            {courseVal}
          </span>
        </div>

        {/* Form No. */}
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, fontWeight: 900 }}>
          <span style={{ color: '#0052CC', width: 140, flexShrink: 0 }}>Form No.-</span>
          <span style={{ flex: 1, borderBottom: '2.5px solid #0052CC', color: '#0052CC', paddingBottom: 2, paddingLeft: 6, minHeight: 24 }}>
            {formNoVal}
          </span>
        </div>

        {/* Father's Name */}
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, fontWeight: 900 }}>
          <span style={{ color: '#0052CC', width: 140, flexShrink: 0 }}>Father's Name-</span>
          <span style={{ flex: 1, borderBottom: '2.5px solid #0052CC', color: '#0052CC', paddingBottom: 2, paddingLeft: 6, minHeight: 24 }}>
            {fatherVal}
          </span>
        </div>

        {/* DOB */}
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, fontWeight: 900 }}>
          <span style={{ color: '#0052CC', width: 140, flexShrink: 0 }}>DOB-</span>
          <span style={{ flex: 1, borderBottom: '2.5px solid #0052CC', color: '#0052CC', paddingBottom: 2, paddingLeft: 6, minHeight: 24 }}>
            {dobVal}
          </span>
        </div>

        {/* Mobile */}
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, fontWeight: 900 }}>
          <span style={{ color: '#0052CC', width: 140, flexShrink: 0 }}>Mobile-</span>
          <span style={{ flex: 1, borderBottom: '2.5px solid #0052CC', color: '#0052CC', paddingBottom: 2, paddingLeft: 6, minHeight: 24 }}>
            {mobileVal}
          </span>
        </div>

        {/* Branch */}
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16, fontWeight: 900 }}>
          <span style={{ color: '#0052CC', width: 140, flexShrink: 0 }}>Branch -</span>
          <span style={{ flex: 1, borderBottom: '2.5px solid #0052CC', color: '#0052CC', paddingBottom: 2, paddingLeft: 6, minHeight: 24 }}>
            {branchVal}
          </span>
        </div>
      </div>

      {/* ── 6. SIGNATURE (BOTTOM LEFT) & DIAGONAL BLUE WEDGE (BOTTOM RIGHT) ── */}
      <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, height: 110, overflow: 'hidden' }}>
        {/* Bottom Right Blue Swoop with Red Stripe */}
        <svg viewBox="0 0 638 110" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <path d="M 330 110 L 638 30 L 638 110 Z" fill="#0052CC" />
          <path d="M 315 110 L 638 18 L 638 30 L 330 110 Z" fill="#D32F2F" />
        </svg>

        {/* Bottom Left: Managing Director Signature */}
        <div style={{ position: 'absolute', bottom: 10, left: 30, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <MDSignatureSVG signatureUrl={settings?.signature} />
          <div style={{ color: '#D32F2F', fontSize: 17, fontWeight: 950, marginTop: -2 }}>
            Managing Director
          </div>
        </div>
      </div>

      {/* ── 7. BOTTOM FOOTER TEXT ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#0F172A',
          fontSize: 11.5,
          fontWeight: 800,
          zIndex: 15,
        }}
      >
        {headOffice}
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
    return html2canvas(el, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
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
      console.error(err);
      toast.error('Download failed');
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
      const win = window.open('', '_blank');
      win.document.write(`
        <!DOCTYPE html>
        <html><head><title>KCI Student ID Card</title>
        <style>
          @page { size: 54mm 86mm; margin: 0; }
          html, body { margin: 0; padding: 0; width: 54mm; height: 86mm; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          img { width: 54mm; height: 86mm; display: block; object-fit: fill; }
        </style></head>
        <body><img src="${imgData}" /></body></html>
      `);
      win.document.close();
      win.onload = () => {
        win.print();
        win.close();
      };
    } catch (err) {
      console.error(err);
      toast.error('Print failed');
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
