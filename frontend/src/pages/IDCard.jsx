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
export const CARD_W = 1000;
export const CARD_H = 1625;

export function getPhotoUrl(photo) {
  if (!photo) return null;
  if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
  return `${API_URL}${photo.startsWith('/') ? photo : `/${photo}`}`;
}

export function fmt(date) {
  if (!date) return '__ / __ / ____';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Convert any image URL to a base64 Data URI to avoid CORS & offscreen capture issues on mobile
export async function imageToDataUri(url) {
  if (!url || url.startsWith('data:')) return url;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth || img.width || 300;
        cvs.height = img.naturalHeight || img.height || 300;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(cvs.toDataURL('image/png'));
      } catch (e) {
        resolve(url);
      }
    };
    img.onerror = () => {
      resolve(url);
    };
    img.src = url;
  });
}

// Load an image as HTMLImageElement (handles data URIs and URLs)
function loadImg(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Draw the KCI ID card directly onto a canvas — no html2canvas, no DOM capture issues
export async function captureIDCardCanvas(studentData, settingsData) {
  const W = CARD_W, H = CARD_H;
  const cvs = document.createElement('canvas');
  cvs.width = W * 2;   // 2x for high DPI
  cvs.height = H * 2;
  const ctx = cvs.getContext('2d');
  ctx.scale(2, 2);

  // ── Background white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // ── SVG polygons drawn as canvas paths
  // Top blue triangle
  ctx.fillStyle = '#0040B8';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(950,0); ctx.lineTo(0,430); ctx.closePath(); ctx.fill();
  // Top red stripe
  ctx.fillStyle = '#D32F2F';
  ctx.beginPath(); ctx.moveTo(0,430); ctx.lineTo(950,0); ctx.lineTo(968,0); ctx.lineTo(0,448); ctx.closePath(); ctx.fill();
  // Bottom right blue corner
  ctx.fillStyle = '#0040B8';
  ctx.beginPath(); ctx.moveTo(1000,1625); ctx.lineTo(1000,1228); ctx.lineTo(538,1625); ctx.closePath(); ctx.fill();
  // Bottom right red stripe
  ctx.fillStyle = '#D32F2F';
  ctx.beginPath(); ctx.moveTo(1000,1210); ctx.lineTo(520,1625); ctx.lineTo(538,1625); ctx.lineTo(1000,1228); ctx.closePath(); ctx.fill();

  // ── Load images
  const websiteLogo = settingsData?.logo || settingsData?.websiteLogo || null;
  const logoSrc = websiteLogo ? getPhotoUrl(websiteLogo) : '/logo.png';
  const photoSrc = getPhotoUrl(studentData?.photo);

  const [logoDataUri, photoDataUri, nielitDataUri] = await Promise.all([
    imageToDataUri(logoSrc),
    photoSrc ? imageToDataUri(photoSrc) : Promise.resolve(null),
    imageToDataUri('/nielit.png'),
  ]);

  const [logoImg, photoImg, nielitImg] = await Promise.all([
    loadImg(logoDataUri),
    photoDataUri ? loadImg(photoDataUri) : Promise.resolve(null),
    loadImg(nielitDataUri),
  ]);

  // ── KCI Logo (top left, circular clip)
  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(35 + 135, 25 + 135, 135, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, 35, 25, 270, 270);
    ctx.restore();
  }
  // TM text
  ctx.fillStyle = '#FFCC00';
  ctx.font = 'bold 26px Arial';
  ctx.fillText('TM', 320, 55);

  // ── NIELIT logo (top right)
  if (nielitImg) {
    const nH = 98, nW = Math.min(340, nielitImg.naturalWidth * (98 / nielitImg.naturalHeight));
    ctx.drawImage(nielitImg, 960 - nW, 85, nW, nH);
  }
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('Office-6716159476', 960, 200);
  ctx.fillText('Mobile-9936384736', 960, 228);
  ctx.textAlign = 'left';

  // ── ISO / Cert text
  ctx.fillStyle = '#000000';
  ctx.font = "bold 30px 'Times New Roman', serif";
  ctx.textAlign = 'center';
  ctx.fillText('An ISO 9001:2015 Certified Organization', 500, 355);
  ctx.font = 'bold 20px Arial';
  ctx.fillText('ISO. Reg. No.- VKCI26052306978', 340, 383);
  ctx.fillText('MSME Reg. No.- 198952612-COL', 680, 383);

  // ── KEERTI COMPUTER INSTITUTE heading (drawn once, centered)
  ctx.font = "bold 48px 'Times New Roman', serif";
  const k = 'KEERTI ', c = 'COMPUTER ', ins = 'INSTITUTE';
  const kW = ctx.measureText(k).width, cW = ctx.measureText(c).width, insW = ctx.measureText(ins).width;
  let hx = (W - kW - cW - insW) / 2;
  ctx.fillStyle = '#D32F2F'; ctx.fillText(k, hx, 445); hx += kW;
  ctx.fillStyle = '#0052CC'; ctx.fillText(c, hx, 445); hx += cW;
  ctx.fillStyle = '#D32F2F'; ctx.fillText(ins, hx, 445);

  // Sub-header
  ctx.font = 'bold 23px Arial';
  const sub1 = 'Website-www.kci.org.in', sub2 = 'Soc. Reg. No.- 781', sub3 = 'The College of IT';
  const s1W = ctx.measureText(sub1).width, s2W = ctx.measureText(sub2).width, s3W = ctx.measureText(sub3).width;
  const gap = 20;
  let sx = (W - s1W - s2W - s3W - gap * 2) / 2;
  ctx.fillStyle = '#0052CC'; ctx.fillText(sub1, sx, 480); sx += s1W + gap;
  ctx.fillStyle = '#000000'; ctx.fillText(sub2, sx, 480); sx += s2W + gap;
  ctx.fillStyle = '#D32F2F'; ctx.fillText(sub3, sx, 480);
  ctx.textAlign = 'left';

  // ── Validity
  const currentYear = new Date().getFullYear();
  const validFrom = settingsData?.validFrom || studentData?.batch?.split('-')[0] || currentYear;
  const validTo = settingsData?.validTo || (parseInt(validFrom, 10) + 1) || (currentYear + 1);
  ctx.fillStyle = '#0052CC';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Valid From-', 45, 575);
  ctx.fillText(`${validFrom} to ${validTo}`, 45, 603);

  // ── Student photo frame
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.rect(370, 535, 260, 320);
  ctx.fill();
  ctx.stroke();
  if (photoImg) {
    ctx.save();
    ctx.beginPath(); ctx.rect(370, 535, 260, 320); ctx.clip();
    ctx.drawImage(photoImg, 370, 535, 260, 320);
    ctx.restore();
  } else {
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO HERE', 500, 700);
    ctx.textAlign = 'left';
  }

  // ── Red separator line
  ctx.fillStyle = '#D32F2F';
  ctx.fillRect(260, 885, 480, 4);

  // ── Field values
  const courseVal = studentData?.courseName || studentData?.course?.title || studentData?.course || '—';
  const formNoVal = studentData?.formNo || studentData?.enrollmentNumber || studentData?.rollNumber || '—';
  const fatherVal = studentData?.fatherName || '—';
  const dobVal = fmt(studentData?.dob);
  const mobileVal = studentData?.phone || studentData?.mobile || '—';
  const branchVal = studentData?.branchId?.branchName || studentData?.branchName || 'Ambedkarnagar';

  const fields = [
    { label: 'Course -', value: courseVal, lc: '#D32F2F', vc: '#D32F2F' },
    { label: 'Form No.-', value: formNoVal, lc: '#0052CC', vc: '#0052CC' },
    { label: "Father's Name-", value: fatherVal, lc: '#0052CC', vc: '#0052CC' },
    { label: 'DOB-', value: dobVal, lc: '#0052CC', vc: '#0052CC' },
    { label: 'Mobile-', value: mobileVal, lc: '#0052CC', vc: '#0052CC' },
    { label: 'Branch -', value: branchVal, lc: '#0052CC', vc: '#0052CC' },
  ];

  let fy = 950;
  fields.forEach(({ label, value, lc, vc }) => {
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = lc;
    ctx.fillText(label, 170, fy);
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = vc;
    const maxVW = 660 - lw - 20;
    let fontSize = 30;
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(value).width > maxVW && fontSize > 16) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    ctx.fillText(value, 170 + lw + 10, fy);
    // underline
    ctx.strokeStyle = vc;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(170 + lw + 10, fy + 5);
    ctx.lineTo(830, fy + 5);
    ctx.stroke();
    fy += 90;
  });

  // ── Signature SVG path (drawn as canvas)
  ctx.strokeStyle = '#D32F2F';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(45+20, H-35-110+80);
  ctx.bezierCurveTo(45+40,H-35-110+15, 45+60,H-35-110+10, 45+75,H-35-110+55);
  ctx.bezierCurveTo(45+85,H-35-110+85, 45+95,H-35-110+25, 45+110,H-35-110+45);
  ctx.bezierCurveTo(45+125,H-35-110+65, 45+135,H-35-110+20, 45+150,H-35-110+70);
  ctx.bezierCurveTo(45+165,H-35-110+105, 45+145,H-35-110+85, 45+190,H-35-110+70);
  ctx.bezierCurveTo(45+230,H-35-110+55, 45+270,H-35-110+65, 45+290,H-35-110+60);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(45+50, H-35-110+90);
  ctx.bezierCurveTo(45+90,H-35-110+85, 45+170,H-35-110+80, 45+250,H-35-110+80);
  ctx.stroke();

  ctx.fillStyle = '#D32F2F';
  ctx.font = "bold 34px 'Times New Roman', serif";
  ctx.fillText('Managing Director', 45, H - 80);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 19px Arial';
  ctx.fillText('H.O.- Sahjanand Road, Shringar Hat, Ayodhya- Faizabad, U.P.- 224001', 45, H - 50);

  // ── QR Code
  const rollOrEnroll = studentData?.rollNumber || studentData?.enrollmentNumber || studentData?.formNo || '';
  const verifyUrl = `${window.location.origin}/verify-certificate?roll=${encodeURIComponent(rollOrEnroll)}`;
  let qrDataUri = null;
  try {
    qrDataUri = await QRCode.toDataURL(verifyUrl, { width: 270, margin: 1, color: { dark: '#0052CC', light: '#FFFFFF' } });
  } catch (e) {}

  if (qrDataUri) {
    const qrImg = await loadImg(qrDataUri);
    if (qrImg) {
      // Yellow border box
      ctx.strokeStyle = '#FFCC00';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      const qx = 815, qy = H - 45 - 135 - 4;
      ctx.roundRect ? ctx.roundRect(qx, qy, 135, 135, 14) : ctx.rect(qx, qy, 135, 135);
      ctx.fill(); ctx.stroke();
      ctx.drawImage(qrImg, qx + 4, qy + 4, 127, 127);
    }
  }
  ctx.fillStyle = '#FFCC00';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN TO VERIFY', 882, H - 30);
  ctx.textAlign = 'left';

  return cvs;
}

// ── Pure Vector / HTML CSS PVC ID Card Component ──
export function KCIIDCard({ student, settings = {}, forPrint = false }) {
  const [qrUrl, setQrUrl] = useState('');
  const photoUrl = getPhotoUrl(student?.photo);

  const websiteLogo = settings?.logo || settings?.websiteLogo || null;
  const logoUrl = websiteLogo ? getPhotoUrl(websiteLogo) : '/logo.png';

  // Preload photo & logos as Data URIs for bulletproof rendering
  const [studentPhotoUri, setStudentPhotoUri] = useState(null);
  const [logoUri, setLogoUri] = useState(logoUrl);

  useEffect(() => {
    if (photoUrl) {
      imageToDataUri(photoUrl).then((uri) => setStudentPhotoUri(uri));
    } else {
      setStudentPhotoUri(null);
    }
  }, [photoUrl]);

  useEffect(() => {
    if (logoUrl) {
      imageToDataUri(logoUrl).then((uri) => setLogoUri(uri));
    }
  }, [logoUrl]);

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
      {/* ── 1. VECTOR SVG BACKGROUND SHAPES (Solid colors for html2canvas compatibility) ── */}
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
        {/* White Base Card */}
        <rect width="1000" height="1625" fill="#FFFFFF" />

        {/* Top Diagonal Blue Header (Solid #0040B8) */}
        <polygon points="0,0 950,0 0,430" fill="#0040B8" />

        {/* Top Red Diagonal Accent Stripe */}
        <polygon points="0,430 950,0 968,0 0,448" fill="#D32F2F" />

        {/* Bottom Right Blue Corner Polygon */}
        <polygon points="1000,1625 1000,1228 538,1625" fill="#0040B8" />

        {/* Bottom Right Red Accent Stripe */}
        <polygon points="1000,1210 520,1625 538,1625 1000,1228" fill="#D32F2F" />
      </svg>

      {/* ── 2. TOP LEFT OFFICIAL KCI SEAL LOGO ── */}
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
            src={logoUri || logoUrl}
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
        <span
          style={{
            position: 'absolute',
            top: 20,
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

      {/* ── 3. TOP RIGHT OFFICIAL NIELIT LOGO IMAGE (EXPLICIT LEFT: 620 to prevent overlap) ── */}
      <div
        style={{
          position: 'absolute',
          top: 85,
          left: 620,
          width: 340,
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
        <div style={{ color: '#000000', fontSize: 24, fontWeight: 900, fontFamily: 'Arial, sans-serif', lineHeight: '1.3', whiteSpace: 'nowrap' }}>
          Office-6716159476
        </div>
        <div style={{ color: '#000000', fontSize: 24, fontWeight: 900, fontFamily: 'Arial, sans-serif', lineHeight: '1.3', whiteSpace: 'nowrap' }}>
          Mobile-9936384736
        </div>
      </div>

      {/* ── 4. CENTER HEADER CERTIFICATION & INSTITUTION TEXT ── */}
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
        <div style={{ color: '#000000', fontSize: 30, fontWeight: 900, fontFamily: "'Times New Roman', serif", marginBottom: 4, whiteSpace: 'nowrap' }}>
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
        <div style={{ fontSize: 48, fontWeight: 900, fontFamily: "'Times New Roman', serif", letterSpacing: 1, marginBottom: 4, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#D32F2F' }}>KEERTI </span>
          <span style={{ color: '#0052CC' }}>COMPUTER </span>
          <span style={{ color: '#D32F2F' }}>INSTITUTE</span>
        </div>

        {/* Sub-header Website & Soc Reg Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 23, fontWeight: 900, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#0052CC', whiteSpace: 'nowrap' }}>Website-www.kci.org.in</span>
          <span style={{ color: '#000000', whiteSpace: 'nowrap' }}>Soc. Reg. No.- 781</span>
          <span style={{ color: '#D32F2F', whiteSpace: 'nowrap' }}>The College of IT</span>
        </div>
      </div>

      {/* ── 5. VALIDITY PERIOD SECTION ── */}
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
          whiteSpace: 'nowrap',
          zIndex: 5,
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>Valid From-</span>
        <span style={{ color: '#0052CC', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{validFromYear} to {validToYear}</span>
      </div>

      {/* ── 6. STUDENT PHOTO FRAME ── */}
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
        {(studentPhotoUri || photoUrl) ? (
          <img
            src={studentPhotoUri || photoUrl}
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

      {/* ── 8. DYNAMIC FIELD VALUES ── */}
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

      {/* ── 9. BOTTOM LEFT MANAGING DIRECTOR SIGNATURE & ADDRESS ── */}
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
          left: 815,
          width: 145,
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
        <span style={{ color: '#FFCC00', fontSize: 13, fontWeight: 900, letterSpacing: 0.5, fontFamily: "'Arial', 'Helvetica', sans-serif", whiteSpace: 'nowrap' }}>
          🔒 SCAN TO VERIFY
        </span>
      </div>
    </div>
  );
}

// ── Responsive Scaled Card Wrapper (Proportional Canvas Scaling) ──
export function KCIIDCardWrapper({ student, settings = {}, className = '' }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.35);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    // Walk up to find the first ancestor with a real measured width
    let measuredW = 0;
    let node = el;
    while (node && measuredW < 50) {
      measuredW = node.getBoundingClientRect().width || node.clientWidth || 0;
      node = node.parentElement;
    }

    const screenW = window.innerWidth || document.documentElement.clientWidth || 360;

    // On mobile use screen width minus safe padding; on desktop cap at 720px
    let targetW;
    if (screenW < 640) {
      // Use the smaller of measured container width and screen width, with 16px padding each side
      targetW = Math.min(measuredW > 50 ? measuredW : screenW, screenW) - 32;
    } else {
      targetW = Math.min(measuredW > 50 ? measuredW : screenW - 48, 720);
    }

    // Clamp: never smaller than 260px, never larger than 850px
    const boundedW = Math.min(Math.max(targetW, 260), 850);
    setScale(boundedW / CARD_W);
  }, []);

  useEffect(() => {
    updateScale();
    const t1 = setTimeout(updateScale, 50);
    const t2 = setTimeout(updateScale, 150);
    const t3 = setTimeout(updateScale, 400);

    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(updateScale);
      if (containerRef.current) ro.observe(containerRef.current);
      // Also observe up to 3 ancestor levels for dashboard layout changes
      let ancestor = containerRef.current?.parentElement;
      for (let i = 0; i < 3 && ancestor; i++) {
        ro.observe(ancestor);
        ancestor = ancestor.parentElement;
      }
    }

    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [updateScale]);

  const scaledW = Math.round(CARD_W * scale);
  const scaledH = Math.round(CARD_H * scale);

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-center py-2 ${className}`}
      style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}
    >
      <div
        style={{
          width: scaledW,
          height: scaledH,
          maxWidth: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: Math.round(36 * scale),
          boxShadow: '0 16px 48px rgba(0, 51, 153, 0.25)',
          flexShrink: 0,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: CARD_W,
            height: CARD_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <KCIIDCard student={student} settings={settings} />
        </div>
      </div>
    </div>
  );
}

// ── Standalone Page Component ──────────────────────────────────────────
export default function IDCardPage() {
  const { user, refreshUser } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    refreshUser?.();
    api
      .get('/certificates/idcard-settings')
      .then((r) => setSettings(r.data.settings || {}))
      .catch(() => {});
  }, []);

  const handleDownload = async () => {
    if (!user) return toast.error('Please login first');
    setDownloading(true);
    try {
      const canvas = await captureIDCardCanvas(user, settings);
      if (!canvas) throw new Error('Capture failed');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86.5], compress: true });
      doc.addImage(imgData, 'JPEG', 0, 0, 54, 86.5, undefined, 'FAST');
      doc.save(`KCI_IDCard_${(user.rollNumber || user.enrollmentNumber || 'student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      toast.success('ID Card downloaded!');
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
      const canvas = await captureIDCardCanvas(user, settings);
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

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full flex justify-center items-start overflow-hidden my-4">
          <KCIIDCardWrapper student={user} settings={settings} />
        </div>

        <div className="flex gap-3 w-full max-w-md">
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
